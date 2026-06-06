<?php

use App\Models\Module;
use App\Models\User;
use App\Services\GoogleDriveOAuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

uses(RefreshDatabase::class);

test('authorized users can view database page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/database');

    $response->assertStatus(200);
});

test('authorized users can upload new module to database and google drive', function () {
    $user = User::factory()->create();

    // Mock GoogleDriveOAuthService
    $mockDrive = mock(GoogleDriveOAuthService::class);
    $mockDrive->shouldReceive('uploadFile')
        ->once()
        ->withAnyArgs()
        ->andReturn('fake-drive-id-123');

    $this->app->instance(GoogleDriveOAuthService::class, $mockDrive);

    $pdf = UploadedFile::fake()->create('modul-test.pdf', 500, 'application/pdf');

    $response = $this->actingAs($user)->post('/database', [
        'code' => 'TEST-001',
        'title' => 'Modul Test PDF',
        'program' => 'Regulasi & Kepatuhan',
        'language' => 'Indonesia',
        'description' => 'Deskripsi modul testing.',
        'file' => $pdf,
    ]);

    $response->assertRedirect('/database');

    $this->assertDatabaseHas('modules', [
        'code' => 'TEST-001',
        'title' => 'Modul Test PDF',
        'drive_file_id' => 'fake-drive-id-123',
    ]);

    $this->assertDatabaseHas('module_revisions', [
        'revision' => '1.0',
        'drive_file_id' => 'fake-drive-id-123',
    ]);
});

test('authorized users can download module from google drive proxy', function () {
    $user = User::factory()->create();

    $module = Module::create([
        'code' => 'DL-001',
        'title' => 'Download Test',
        'program' => 'Regulasi & Kepatuhan',
        'language' => 'Indonesia',
        'status' => 'Approved',
        'drive_file_id' => 'fake-download-id-999',
        'file_size' => '500 KB',
        'file_pages' => 1,
    ]);

    // Mock GoogleDriveOAuthService
    $mockDrive = mock(GoogleDriveOAuthService::class);
    $mockDrive->shouldReceive('downloadFile')
        ->once()
        ->with('fake-download-id-999')
        ->andReturn('fake PDF binary content');

    $this->app->instance(GoogleDriveOAuthService::class, $mockDrive);

    $response = $this->actingAs($user)->get('/database/DL-001/download');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/pdf');
    $response->assertHeader('Content-Disposition', 'attachment; filename="DL-001.pdf"');
    $this->assertEquals('fake PDF binary content', $response->getContent());
});

test('authorized users can preview module from google drive proxy', function () {
    $user = User::factory()->create();

    $module = Module::create([
        'code' => 'PV-001',
        'title' => 'Preview Test',
        'program' => 'Regulasi & Kepatuhan',
        'language' => 'Indonesia',
        'status' => 'Approved',
        'drive_file_id' => 'fake-preview-id-999',
        'file_size' => '500 KB',
        'file_pages' => 1,
    ]);

    // Mock GoogleDriveOAuthService
    $mockDrive = mock(GoogleDriveOAuthService::class);
    $mockDrive->shouldReceive('downloadFile')
        ->once()
        ->with('fake-preview-id-999')
        ->andReturn('fake PDF binary content');

    $this->app->instance(GoogleDriveOAuthService::class, $mockDrive);

    $response = $this->actingAs($user)->get('/database/PV-001/preview');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/pdf');
    $response->assertHeader('Content-Disposition', 'inline; filename="PV-001.pdf"');
    $this->assertEquals('fake PDF binary content', $response->getContent());
});

test('authorized users can archive module', function () {
    $user = User::factory()->create();

    $module = Module::create([
        'code' => 'ARC-001',
        'title' => 'Archive Test',
        'program' => 'Regulasi & Kepatuhan',
        'language' => 'Indonesia',
        'status' => 'Approved',
        'drive_file_id' => 'fake-archive-id',
        'file_size' => '500 KB',
        'file_pages' => 1,
    ]);

    $response = $this->actingAs($user)->post('/database/ARC-001/archive');

    $response->assertRedirect('/database');

    $this->assertDatabaseHas('modules', [
        'code' => 'ARC-001',
        'status' => 'Arsip',
    ]);
});

test('authorized users can upload new revision of a module', function () {
    $user = User::factory()->create();

    $module = Module::create([
        'code' => 'REV-001',
        'title' => 'Revision Test',
        'program' => 'Regulasi & Kepatuhan',
        'language' => 'Indonesia',
        'status' => 'Approved',
        'current_revision' => '1.0',
        'drive_file_id' => 'fake-rev-old-id',
        'file_size' => '500 KB',
        'file_pages' => 1,
    ]);

    // Mock GoogleDriveOAuthService
    $mockDrive = mock(GoogleDriveOAuthService::class);
    $mockDrive->shouldReceive('uploadFile')
        ->once()
        ->withAnyArgs()
        ->andReturn('fake-rev-new-id');

    $this->app->instance(GoogleDriveOAuthService::class, $mockDrive);

    $pdf = UploadedFile::fake()->create('modul-rev.pdf', 500, 'application/pdf');

    $response = $this->actingAs($user)->post('/database/REV-001/revision', [
        'revision' => '1.1',
        'note' => 'Perbaikan minor konten.',
        'file' => $pdf,
    ]);

    $response->assertRedirect('/database');

    $this->assertDatabaseHas('modules', [
        'code' => 'REV-001',
        'current_revision' => '1.1',
        'drive_file_id' => 'fake-rev-new-id',
    ]);

    $this->assertDatabaseHas('module_revisions', [
        'module_id' => $module->id,
        'revision' => '1.1',
        'note' => 'Perbaikan minor konten.',
        'drive_file_id' => 'fake-rev-new-id',
    ]);
});

test('authorized users can unarchive module', function () {
    $user = User::factory()->create();

    $module = Module::create([
        'code' => 'UNARC-001',
        'title' => 'Unarchive Test',
        'program' => 'Regulasi & Kepatuhan',
        'language' => 'Indonesia',
        'status' => 'Arsip',
        'drive_file_id' => 'fake-archive-id',
        'file_size' => '500 KB',
        'file_pages' => 1,
    ]);

    $response = $this->actingAs($user)->post('/database/UNARC-001/unarchive');

    $response->assertRedirect('/database');

    $this->assertDatabaseHas('modules', [
        'code' => 'UNARC-001',
        'status' => 'Approved',
    ]);
});



