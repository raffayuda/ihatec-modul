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
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
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
    Route::delete('manajemen-user/{id}', [UserController::class, 'destroy'])->name('manajemen-user.destroy');

    // Pengajuan Modul
    Route::get('pengajuan', [PengajuanController::class, 'index'])->name('pengajuan');
    Route::post('pengajuan', [PengajuanController::class, 'store'])->name('pengajuan.store');
    Route::put('pengajuan/{id}', [PengajuanController::class, 'update'])->name('pengajuan.update');
    Route::delete('pengajuan/{id}', [PengajuanController::class, 'destroy'])->name('pengajuan.destroy');
    Route::post('pengajuan/{id}/submit', [PengajuanController::class, 'submit'])->name('pengajuan.submit');
    Route::post('pengajuan/{id}/upload', [PengajuanController::class, 'uploadFile'])->name('pengajuan.upload');

    // Database Modul
    Route::get('database', [ModuleController::class, 'index'])->name('database');
    Route::post('database', [ModuleController::class, 'store'])->name('database.store');
    Route::get('database/{code}/download', [ModuleController::class, 'download'])->name('database.download');
    Route::get('database/{code}/preview', [ModuleController::class, 'preview'])->name('database.preview');
    Route::post('database/{code}/archive', [ModuleController::class, 'archive'])->name('database.archive');
    Route::post('database/{code}/unarchive', [ModuleController::class, 'unarchive'])->name('database.unarchive');
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

    // Static pages (data still being migrated)
    Route::get('matriks', function () {
        return Inertia::render('matriks');
    })->name('matriks');

    Route::get('formula', function () {
        return Inertia::render('formula');
    })->name('formula');

    Route::get('master-data', [MasterDataController::class, 'index'])->name('master-data');
    Route::post('master-data', [MasterDataController::class, 'store'])->name('master-data.store');
    Route::put('master-data/{id}', [MasterDataController::class, 'update'])->name('master-data.update');
    Route::get('master-data/template', [MasterDataController::class, 'downloadTemplate'])->name('master-data.template');
    Route::post('master-data/import', [MasterDataController::class, 'import'])->name('master-data.import');
    Route::delete('master-data/{id}', [MasterDataController::class, 'destroy'])->name('master-data.destroy');

    Route::get('audit-log', function () {
        return Inertia::render('audit-log');
    })->name('audit-log');

    Route::get('report', [ReportController::class, 'index'])->name('report');
    Route::get('report/export', [ReportController::class, 'export'])->name('report.export');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
