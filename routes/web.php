<?php

use App\Http\Controllers\GoogleDriveOAuthController;
use App\Http\Controllers\ModuleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('approval', function () {
        return Inertia::render('approval');
    })->name('approval');

    Route::get('manajemen-user', function () {
        return Inertia::render('manajemen-user');
    })->name('manajemen-user');

    Route::get('pengajuan', function () {
        return Inertia::render('pengajuan');
    })->name('pengajuan');

    Route::get('database', [ModuleController::class, 'index'])->name('database');
    Route::post('database', [ModuleController::class, 'store'])->name('database.store');
    Route::get('database/{code}/download', [ModuleController::class, 'download'])->name('database.download');
    Route::get('database/{code}/preview', [ModuleController::class, 'preview'])->name('database.preview');
    Route::post('database/{code}/archive', [ModuleController::class, 'archive'])->name('database.archive');
    Route::post('database/{code}/unarchive', [ModuleController::class, 'unarchive'])->name('database.unarchive');
    Route::post('database/{code}/revision', [ModuleController::class, 'revision'])->name('database.revision');
    Route::delete('database/{code}', [ModuleController::class, 'destroy'])->name('database.destroy');

    Route::get('google-drive/connect', [GoogleDriveOAuthController::class, 'connect'])->name('google-drive.connect');
    Route::get('google-drive/callback', [GoogleDriveOAuthController::class, 'callback'])->name('google-drive.callback');

    Route::get('matriks', function () {
        return Inertia::render('matriks');
    })->name('matriks');

    Route::get('master-data', function () {
        return Inertia::render('master-data');
    })->name('master-data');

    Route::get('audit-log', function () {
        return Inertia::render('audit-log');
    })->name('audit-log');

    Route::get('report', function () {
        return Inertia::render('report');
    })->name('report');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
