<?php

use App\Models\Module;
use App\Models\User;
use App\Services\GoogleDriveOAuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Clear PDF cache before each test to ensure consistency
    $cachePath = storage_path('app/pdf_cache');
    if (File::exists($cachePath)) {
        File::cleanDirectory($cachePath);
    }
});

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

test('archive module route has been removed', function () {
    $user = User::factory()->create();

    Module::create([
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

    $response->assertNotFound();
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

test('unarchive module route has been removed', function () {
    $user = User::factory()->create();

    Module::create([
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

    $response->assertNotFound();
});

test('authorized users can export modules to excel-ready xlsx', function () {
    $user = User::factory()->create();

    Module::create([
        'code' => 'EXP-001',
        'title' => 'Export Test',
        'program' => 'Regulasi & Kepatuhan',
        'language' => 'Indonesia',
        'status' => 'Approved',
        'current_revision' => '1.0',
        'file_size' => '500 KB',
        'file_pages' => 12,
    ]);

    $response = $this->actingAs($user)->get('/database/export');

    $response->assertDownload();
    $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

test('authorized users can download module import template xlsx', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/database/template');

    $response->assertDownload('template-import-database-modul.xlsx');
    $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

test('authorized users can import modules from excel template xlsx', function () {
    $user = User::factory()->create([
        'role' => 'admin',
    ]);

    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setCellValue('A1', 'Kode Modul');
    $sheet->setCellValue('B1', 'Judul Modul');
    $sheet->setCellValue('C1', 'Program / Jenis Pelatihan');
    $sheet->setCellValue('D1', 'Revisi');
    $sheet->setCellValue('E1', 'Bahasa');
    $sheet->setCellValue('F1', 'Status');
    $sheet->setCellValue('G1', 'Ukuran File');
    $sheet->setCellValue('H1', 'Deskripsi');
    
    $sheet->setCellValue('A2', 'IMP-001');
    $sheet->setCellValue('B2', 'Import Excel Test');
    $sheet->setCellValue('C2', 'Teknis Laboratorium');
    $sheet->setCellValue('D2', '1.2');
    $sheet->setCellValue('E2', 'Indonesia');
    $sheet->setCellValue('F2', 'Approved');
    $sheet->setCellValue('G2', '2 MB');
    $sheet->setCellValue('H2', 'Deskripsi dari file Excel.');

    $tempFile = tempnam(sys_get_temp_dir(), 'test_import');
    $writer = new Xlsx($spreadsheet);
    $writer->save($tempFile);

    $file = new UploadedFile($tempFile, 'database-modul.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);

    $response = $this->actingAs($user)->post('/database/import', [
        'file' => $file,
    ]);

    $response->assertRedirect('/database');

    $this->assertDatabaseHas('modules', [
        'code' => 'IMP-001',
        'title' => 'Import Excel Test',
        'program' => 'Teknis Laboratorium',
        'language' => 'Indonesia',
        'status' => 'Approved',
        'current_revision' => '1.2',
        'file_size' => '2 MB',
        'file_pages' => 0,
    ]);

    $this->assertDatabaseHas('module_revisions', [
        'revision' => '1.2',
        'note' => 'Diimpor dari file Excel.',
    ]);

    if (file_exists($tempFile)) {
        @unlink($tempFile);
    }
});
