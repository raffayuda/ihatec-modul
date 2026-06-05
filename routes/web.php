<?php

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

    Route::get('database', function () {
        return Inertia::render('database');
    })->name('database');

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
