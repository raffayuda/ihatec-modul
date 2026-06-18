<?php

use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GoogleDriveOAuthController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\PengajuanController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\DriveIntegrationController;
use App\Http\Controllers\FormulaController;
use App\Http\Controllers\TrainingMatrixController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return \Illuminate\Support\Facades\Auth::check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    // Dashboard — dynamic per role
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Approval (admin + manager PD)
    Route::get('approval', [ApprovalController::class, 'index'])->name('approval');
    Route::post('approval/{id}/approve', [ApprovalController::class, 'approve'])->name('approval.approve');
    Route::post('approval/{id}/reject', [ApprovalController::class, 'reject'])->name('approval.reject');

    // Manajemen User (admin only — enforced in controller)
    Route::get('manajemen-user', [UserController::class, 'index'])->name('manajemen-user');
    Route::post('manajemen-user', [UserController::class, 'store'])->name('manajemen-user.store');
    Route::put('manajemen-user/{id}', [UserController::class, 'update'])->name('manajemen-user.update');
    Route::post('manajemen-user/{id}/status', [UserController::class, 'updateStatus'])->name('manajemen-user.status');
    Route::delete('manajemen-user/bulk', [UserController::class, 'bulkDestroy'])->name('manajemen-user.bulk-destroy');
    Route::delete('manajemen-user/{id}', [UserController::class, 'destroy'])->name('manajemen-user.destroy');

    // Permintaan Modul Khusus
    Route::get('pengajuan', [PengajuanController::class, 'index'])->name('pengajuan');
    Route::post('pengajuan', [PengajuanController::class, 'store'])->name('pengajuan.store');
    Route::put('pengajuan/{id}', [PengajuanController::class, 'update'])->name('pengajuan.update');
    Route::delete('pengajuan/{id}', [PengajuanController::class, 'destroy'])->name('pengajuan.destroy');
    Route::post('pengajuan/{id}/submit', [PengajuanController::class, 'submit'])->name('pengajuan.submit');
    Route::post('pengajuan/{id}/upload', [PengajuanController::class, 'uploadFile'])->name('pengajuan.upload');

    // Perubahan Modul (Modul Baru + Revisi Modul)
    Route::get('perubahan-modul', [PengajuanController::class, 'indexPerubahan'])->name('perubahan-modul');
    Route::post('perubahan-modul', [PengajuanController::class, 'storePerubahan'])->name('perubahan-modul.store');
    Route::put('perubahan-modul/{id}', [PengajuanController::class, 'updatePerubahan'])->name('perubahan-modul.update');
    Route::delete('perubahan-modul/{id}', [PengajuanController::class, 'destroyPerubahan'])->name('perubahan-modul.destroy');
    Route::post('perubahan-modul/{id}/submit', [PengajuanController::class, 'submitPerubahan'])->name('perubahan-modul.submit');
    Route::post('perubahan-modul/{id}/approve', [PengajuanController::class, 'approvePerubahan'])->name('perubahan-modul.approve');
    Route::post('perubahan-modul/{id}/reject', [PengajuanController::class, 'rejectPerubahan'])->name('perubahan-modul.reject');
    Route::post('perubahan-modul/{id}/upload', [PengajuanController::class, 'uploadFile'])->name('perubahan-modul.upload');

    // Database Modul
    Route::get('database', [ModuleController::class, 'index'])->name('database');
    Route::post('database', [ModuleController::class, 'store'])->name('database.store');
    Route::get('database/export', [ModuleController::class, 'export'])->name('database.export');
    Route::get('database/template', [ModuleController::class, 'template'])->name('database.template');
    Route::post('database/import', [ModuleController::class, 'import'])->name('database.import');
    Route::delete('database/bulk', [ModuleController::class, 'bulkDestroy'])->name('database.bulk-destroy');
    Route::get('database/revision/{id}/download', [ModuleController::class, 'downloadRevision'])->name('database.revision.download');
    Route::get('database/revision/{id}/preview', [ModuleController::class, 'previewRevision'])->name('database.revision.preview');
    Route::get('database/{code}/download', [ModuleController::class, 'download'])->name('database.download');
    Route::get('database/{code}/preview', [ModuleController::class, 'preview'])->name('database.preview');
    Route::post('database/{code}/revision', [ModuleController::class, 'revision'])->name('database.revision');
    Route::post('database/{code}/update', [ModuleController::class, 'update'])->name('database.update');
    Route::delete('database/{code}', [ModuleController::class, 'destroy'])->name('database.destroy');

    // Google Drive OAuth
    Route::get('google-drive/connect', [GoogleDriveOAuthController::class, 'connect'])->name('google-drive.connect');
    Route::get('google-drive/callback', [GoogleDriveOAuthController::class, 'callback'])->name('google-drive.callback');

    // Google Drive Dynamic Settings (admin only)
    Route::get('admin/drive-integration', [DriveIntegrationController::class, 'index'])->name('admin.drive-integration');
    Route::post('admin/drive-integration/disconnect', [DriveIntegrationController::class, 'disconnect'])->name('admin.drive-integration.disconnect');
    Route::post('admin/drive-integration/save-folder', [DriveIntegrationController::class, 'saveFolder'])->name('admin.drive-integration.save-folder');
    Route::post('admin/drive-integration/create-folder', [DriveIntegrationController::class, 'createFolder'])->name('admin.drive-integration.create-folder');

    // Matriks Pelatihan
    Route::get('matriks', [TrainingMatrixController::class, 'index'])->name('matriks');
    Route::post('matriks', [TrainingMatrixController::class, 'store'])->name('matriks.store');
    Route::post('matriks/{id}/update', [TrainingMatrixController::class, 'update'])->name('matriks.update');
    Route::post('matriks/{id}/status', [TrainingMatrixController::class, 'toggleStatus'])->name('matriks.status');
    Route::delete('matriks/{id}', [TrainingMatrixController::class, 'destroy'])->name('matriks.destroy');
    Route::get('matriks/export', [TrainingMatrixController::class, 'export'])->name('matriks.export');
    Route::post('matriks/import', [TrainingMatrixController::class, 'import'])->name('matriks.import');
    Route::get('matriks/template', [TrainingMatrixController::class, 'downloadTemplate'])->name('matriks.template');
    Route::get('matriks/{id}/download', [TrainingMatrixController::class, 'downloadFile'])->name('matriks.download');

    Route::get('formula', [FormulaController::class, 'index'])->name('formula');
    Route::post('formula', [FormulaController::class, 'store'])->name('formula.store');

    Route::get('master-data', [MasterDataController::class, 'index'])->name('master-data');

    // Master Data — individual category pages (must be before {id} wildcard)
    Route::get('master-data/jenis-kebutuhan', [MasterDataController::class, 'jenisKebutuhan'])->name('master-data.jenis-kebutuhan');
    Route::get('master-data/kode-pelatihan', [MasterDataController::class, 'kodePelatihan'])->name('master-data.kode-pelatihan');
    Route::get('master-data/jenis-modul', [MasterDataController::class, 'jenisModul'])->name('master-data.jenis-modul');
    Route::get('master-data/bahasa-pengantar', [MasterDataController::class, 'bahasaPengantar'])->name('master-data.bahasa-pengantar');
    Route::get('master-data/tipe-pelatihan', [MasterDataController::class, 'tipePelatihan'])->name('master-data.tipe-pelatihan');
    Route::get('master-data/tipe-sertifikat-sihalal', [MasterDataController::class, 'tipeSertifikatSihalal'])->name('master-data.tipe-sertifikat-sihalal');
    Route::get('master-data/jenis-sertifikat', [MasterDataController::class, 'jenisSertifikat'])->name('master-data.jenis-sertifikat');
    Route::get('master-data/pic-periksa-lk', [MasterDataController::class, 'picPeriksaLk'])->name('master-data.pic-periksa-lk');
    Route::get('master-data/kode-program', [MasterDataController::class, 'kodeProgram'])->name('master-data.kode-program');

    // Master Data — shared CRUD endpoints (must be after named category routes)
    Route::get('master-data/template', [MasterDataController::class, 'downloadTemplate'])->name('master-data.template');
    Route::post('master-data/import', [MasterDataController::class, 'import'])->name('master-data.import');
    Route::delete('master-data/bulk', [MasterDataController::class, 'bulkDestroy'])->name('master-data.bulk-destroy');
    Route::post('master-data', [MasterDataController::class, 'store'])->name('master-data.store');
    Route::put('master-data/{id}', [MasterDataController::class, 'update'])->name('master-data.update');
    Route::delete('master-data/{id}', [MasterDataController::class, 'destroy'])->name('master-data.destroy');

    Route::get('audit-log', function () {
        return Inertia::render('audit-log');
    })->name('audit-log');

    // Notifikasi
    Route::get('notifikasi', function () {
        return Inertia::render('notifikasi');
    })->name('notifikasi');

    Route::get('report', [ReportController::class, 'index'])->name('report');
    Route::get('report/export', [ReportController::class, 'export'])->name('report.export');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
