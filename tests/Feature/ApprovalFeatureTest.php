<?php

use App\Models\Module;
use App\Models\ModuleRequest;
use App\Models\User;
use App\Services\GoogleDriveOAuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    \Illuminate\Support\Facades\Mail::fake();
    $this->admin = User::factory()->create(['role' => 'admin', 'status' => 'Aktif']);
    $this->manager = User::factory()->create(['role' => 'manager PD', 'status' => 'Aktif']);
    $this->user = User::factory()->create(['role' => 'User', 'status' => 'Aktif']);
});

test('authorized users can view approval page', function () {
    $response = $this->actingAs($this->manager)->get('/approval');
    $response->assertStatus(200);
    $response->assertInertia(
        fn ($page) => $page
            ->component('approval')
            ->has('queue')
            ->has('history')
            ->has('stats')
    );
});

test('regular users cannot view approval page', function () {
    $response = $this->actingAs($this->user)->get('/approval');
    $response->assertStatus(403);
});

test('manager can approve a new module request', function () {
    // Mock Google Drive upload
    $mockDrive = mock(GoogleDriveOAuthService::class);
    $mockDrive->shouldReceive('uploadFile')->andReturn('fake-google-drive-id');
    $this->app->instance(GoogleDriveOAuthService::class, $mockDrive);

    $req = ModuleRequest::factory()->waitingApproval()->create([
        'type' => 'Modul Baru',
        'title' => 'Sistem ISO Terbaru',
        'program' => 'Regulasi & Kepatuhan',
        'language' => 'Indonesia',
        'training_days' => 3,
        'applicant_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->manager)->post("/approval/{$req->id}/approve");

    $response->assertRedirect('/approval');

    $this->assertDatabaseHas('module_requests', [
        'id' => $req->id,
        'status' => 'Selesai',
        'processed_by' => $this->manager->id,
    ]);

    $this->assertDatabaseHas('modules', [
        'title' => 'Sistem ISO Terbaru',
        'program' => 'Regulasi & Kepatuhan',
        'language' => 'Indonesia',
        'current_revision' => '1.0',
        'source_request_id' => $req->id,
    ]);

    $this->assertDatabaseHas('module_revisions', [
        'revision' => '1.0',
        'reason' => $req->description,
    ]);

    \Illuminate\Support\Facades\Mail::assertSent(\App\Mail\ModuleRequestProcessedMail::class);
    \Illuminate\Support\Facades\Mail::assertSent(\App\Mail\ModuleApprovedMail::class);
});

test('manager can approve a revision module request', function () {
    // Mock Google Drive upload
    $mockDrive = mock(GoogleDriveOAuthService::class);
    $mockDrive->shouldReceive('uploadFile')->andReturn('fake-google-drive-id-rev');
    $this->app->instance(GoogleDriveOAuthService::class, $mockDrive);

    $existingModule = Module::create([
        'code' => 'MOD-2026-001',
        'title' => 'Sistem ISO Terbaru',
        'program' => 'Regulasi & Kepatuhan',
        'language' => 'Indonesia',
        'status' => 'Approved',
        'current_revision' => '1.0',
        'approved_by' => $this->manager->id,
        'approved_at' => now(),
    ]);

    $req = ModuleRequest::factory()->waitingApproval()->create([
        'type' => 'Revisi Modul',
        'title' => 'Sistem ISO Terbaru',
        'related_module_id' => $existingModule->id,
        'revision_reason' => 'Perubahan regulasi pemerintah.',
        'description' => 'Menambahkan bab 5 tentang kepatuhan.',
        'applicant_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->manager)->post("/approval/{$req->id}/approve");

    $response->assertRedirect('/approval');

    $this->assertDatabaseHas('module_requests', [
        'id' => $req->id,
        'status' => 'Selesai',
        'processed_by' => $this->manager->id,
    ]);

    $this->assertDatabaseHas('modules', [
        'id' => $existingModule->id,
        'current_revision' => '1.1',
    ]);

    $this->assertDatabaseHas('module_revisions', [
        'module_id' => $existingModule->id,
        'revision' => '1.1',
        'reason' => 'Perubahan regulasi pemerintah.',
        'note' => 'Revisi approved oleh '.$this->manager->name,
    ]);

    \Illuminate\Support\Facades\Mail::assertSent(\App\Mail\ModuleRequestProcessedMail::class);
    \Illuminate\Support\Facades\Mail::assertSent(\App\Mail\ModuleApprovedMail::class);
});

test('manager can reject a module request', function () {
    $req = ModuleRequest::factory()->waitingApproval()->create([
        'applicant_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->manager)->post("/approval/{$req->id}/reject", [
        'reject_reason' => 'Dokumen pendukung kurang lengkap.',
    ]);

    $response->assertRedirect('/approval');

    $this->assertDatabaseHas('module_requests', [
        'id' => $req->id,
        'status' => 'Ditolak',
        'reject_reason' => 'Dokumen pendukung kurang lengkap.',
        'processed_by' => $this->manager->id,
    ]);

    \Illuminate\Support\Facades\Mail::assertSent(\App\Mail\ModuleRequestProcessedMail::class);
});
