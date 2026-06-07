<?php

use App\Models\User;
use App\Models\Module;
use App\Models\ModuleRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'role' => 'Staf PD',
        'status' => 'Aktif',
        'unit' => 'Pengembangan SDM',
    ]);
});

test('guests are redirected to the login page when visiting report', function () {
    $this->get('/report')->assertRedirect('/login');
});

test('authenticated users can visit the report page and see inertia props', function () {
    // Seed some modules and requests
    Module::factory()->create([
        'code' => 'MOD-1',
        'title' => 'Test Modul',
        'program' => 'Pengembangan SDM',
        'status' => 'Approved',
    ]);

    ModuleRequest::factory()->create([
        'title' => 'Test Request',
        'unit' => 'Pengembangan SDM',
        'status' => 'Selesai',
        'applicant_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)->get('/report');
    $response->assertStatus(200);
    $response->assertInertia(
        fn ($page) => $page
            ->component('report')
            ->has('metrics')
            ->has('trendData')
            ->has('distributionData')
            ->has('statusData')
            ->has('activityData')
            ->has('filters')
    );
});

test('authenticated users can export modules as csv', function () {
    Module::factory()->create([
        'code' => 'MOD-1',
        'title' => 'Test Modul 1',
        'program' => 'Pengembangan SDM',
        'status' => 'Approved',
    ]);

    $response = $this->actingAs($this->user)->get('/report/export?type=modules');
    
    $response->assertStatus(200);
    $response->assertHeader('Content-Disposition', 'attachment; filename=modules_report_' . now()->format('YmdHis') . '.csv');
    
    $content = $response->streamedContent();
    expect($content)->toContain('Kode Modul,Judul Modul,Jenis Pelatihan,Bahasa,Status');
    expect($content)->toContain('MOD-1,Test Modul 1,Pengembangan SDM');
});

test('authenticated users can export requests as csv', function () {
    ModuleRequest::factory()->create([
        'request_number' => 'REQ-001',
        'title' => 'Test Request 1',
        'unit' => 'Pengembangan SDM',
        'status' => 'Selesai',
        'applicant_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)->get('/report/export?type=requests');
    
    $response->assertStatus(200);
    $response->assertHeader('Content-Disposition', 'attachment; filename=requests_report_' . now()->format('YmdHis') . '.csv');
    
    $content = $response->streamedContent();
    expect($content)->toContain('No. Pengajuan,Tipe,Judul Modul');
    expect($content)->toContain('REQ-001,');
    expect($content)->toContain('Test Request 1');
});
