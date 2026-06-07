<?php

use App\Models\ModuleRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

uses(RefreshDatabase::class);

beforeEach(function () {
    \Illuminate\Support\Facades\Mail::fake();
    // Create users for each role
    $this->admin = User::factory()->create(['role' => 'admin', 'status' => 'Aktif', 'unit' => 'IT & Digital']);
    $this->manager = User::factory()->create(['role' => 'manager PD', 'status' => 'Aktif', 'unit' => 'Pengembangan SDM']);
    $this->staf = User::factory()->create(['role' => 'Staf PD', 'status' => 'Aktif', 'unit' => 'Pengembangan SDM']);
    $this->user = User::factory()->create(['role' => 'User', 'status' => 'Aktif', 'unit' => 'Operasional']);
});

// ---- DASHBOARD ----

it('admin can access dashboard and gets stats', function () {
    $response = $this->actingAs($this->admin)->get('/dashboard');
    $response->assertStatus(200);
    $response->assertInertia(
        fn ($page) => $page
            ->component('dashboard')
            ->has('stats')
            ->has('recentRequests')
            ->has('approvalSummary')
            ->has('roleDistribution')
    );
});

it('manager PD can access dashboard and gets stats', function () {
    $response = $this->actingAs($this->manager)->get('/dashboard');
    $response->assertStatus(200);
    $response->assertInertia(
        fn ($page) => $page
            ->component('dashboard')
            ->has('stats')
            ->has('recentRequests')
            ->has('approvalSummary')
    );
});

it('staf PD can access dashboard', function () {
    $response = $this->actingAs($this->staf)->get('/dashboard');
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('dashboard')->has('stats'));
});

it('user can access dashboard and sees their own requests', function () {
    ModuleRequest::factory()->create([
        'applicant_id' => $this->user->id,
        'status' => 'Baru',
    ]);

    $response = $this->actingAs($this->user)->get('/dashboard');
    $response->assertStatus(200);
    $response->assertInertia(
        fn ($page) => $page
            ->component('dashboard')
            ->has('stats.total')
    );
});

// ---- MANAJEMEN USER ----

it('admin can access manajemen user page', function () {
    $response = $this->actingAs($this->admin)->get('/manajemen-user');
    $response->assertStatus(200);
    $response->assertInertia(
        fn ($page) => $page
            ->component('manajemen-user')
            ->has('users')
            ->has('metrics')
            ->has('roleDistribution')
    );
});

it('non-admin cannot access manajemen user page', function () {
    $response = $this->actingAs($this->user)->get('/manajemen-user');
    $response->assertStatus(403);
});

it('admin can create a new user', function () {
    $response = $this->actingAs($this->admin)->post('/manajemen-user', [
        'name' => 'Test Baru',
        'email' => 'testbaru@example.com',
        'password' => 'password123',
        'role' => 'User',
        'unit' => 'Keuangan',
        'status' => 'Aktif',
    ]);
    $response->assertRedirect('/manajemen-user');
    $this->assertDatabaseHas('users', ['email' => 'testbaru@example.com']);
});

it('admin can update user status', function () {
    $response = $this->actingAs($this->admin)->post("/manajemen-user/{$this->user->id}/status", [
        'status' => 'Nonaktif',
    ]);
    $response->assertRedirect('/manajemen-user');
    $this->assertDatabaseHas('users', ['id' => $this->user->id, 'status' => 'Nonaktif']);
});

it('admin can delete a user', function () {
    $target = User::factory()->create(['role' => 'User', 'status' => 'Aktif']);
    $response = $this->actingAs($this->admin)->delete("/manajemen-user/{$target->id}");
    $response->assertRedirect('/manajemen-user');
    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});

it('admin cannot delete their own account', function () {
    $response = $this->actingAs($this->admin)->delete("/manajemen-user/{$this->admin->id}");
    $response->assertRedirect('/manajemen-user');
    $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
});

// ---- PENGAJUAN ----

it('any authenticated user can access pengajuan page', function () {
    $response = $this->actingAs($this->user)->get('/pengajuan');
    $response->assertStatus(200);
    $response->assertInertia(
        fn ($page) => $page
            ->component('pengajuan')
            ->has('submissions')
            ->has('stats')
            ->has('chartData')
    );
});

it('user can create a new pengajuan', function () {
    $response = $this->actingAs($this->user)->post('/pengajuan', [
        'type' => 'Modul Baru',
        'title' => 'Modul Test Baru',
        'unit' => 'Operasional',
        'description' => 'Deskripsi pengajuan modul test.',
        'deadline' => now()->addDays(14)->format('Y-m-d'),
        'priority' => 'Medium',
    ]);
    $response->assertRedirect('/pengajuan');
    $this->assertDatabaseHas('module_requests', ['title' => 'Modul Test Baru']);
});

it('user can delete their own pengajuan if status is Baru', function () {
    $req = ModuleRequest::factory()->create([
        'applicant_id' => $this->user->id,
        'status' => 'Baru',
    ]);
    $response = $this->actingAs($this->user)->delete("/pengajuan/{$req->id}");
    $response->assertRedirect('/pengajuan');
    $this->assertDatabaseMissing('module_requests', ['id' => $req->id]);
});

it('user cannot delete pengajuan that is not Baru', function () {
    $req = ModuleRequest::factory()->create([
        'applicant_id' => $this->user->id,
        'status' => 'Menunggu Approval',
    ]);
    $response = $this->actingAs($this->user)->delete("/pengajuan/{$req->id}");
    $response->assertRedirect('/pengajuan');
    $this->assertDatabaseHas('module_requests', ['id' => $req->id]);
});

it('user can submit pengajuan to approval queue', function () {
    $req = ModuleRequest::factory()->create([
        'applicant_id' => $this->user->id,
        'status' => 'Baru',
    ]);
    $response = $this->actingAs($this->user)->post("/pengajuan/{$req->id}/submit");
    $response->assertRedirect('/pengajuan');
    $this->assertDatabaseHas('module_requests', ['id' => $req->id, 'status' => 'Menunggu Approval']);
    \Illuminate\Support\Facades\Mail::assertSent(\App\Mail\ModuleRequestSubmittedMail::class);
});

it('user can create a new revision pengajuan with a file upload', function () {
    $pdf = UploadedFile::fake()->create('revisi.pdf', 500, 'application/pdf');
    $response = $this->actingAs($this->user)->post('/pengajuan', [
        'type' => 'Revisi Modul',
        'title' => 'Revisi Modul Test',
        'unit' => 'Operasional',
        'revision_reason' => 'Perbaikan materi bab 1.',
        'description' => 'Mengubah definisi dasar di halaman 5.',
        'deadline' => now()->addDays(14)->format('Y-m-d'),
        'priority' => 'Medium',
        'file' => $pdf,
    ]);
    $response->assertRedirect('/pengajuan');
    $this->assertDatabaseHas('module_requests', [
        'title' => 'Revisi Modul Test',
        'type' => 'Revisi Modul',
    ]);
});

it('user cannot create a new revision pengajuan without uploading a file', function () {
    $response = $this->actingAs($this->user)->post('/pengajuan', [
        'type' => 'Revisi Modul',
        'title' => 'Revisi Modul Test',
        'unit' => 'Operasional',
        'revision_reason' => 'Perbaikan materi bab 1.',
        'description' => 'Mengubah definisi dasar di halaman 5.',
        'deadline' => now()->addDays(14)->format('Y-m-d'),
        'priority' => 'Medium',
    ]);
    $response->assertSessionHasErrors('file');
});
