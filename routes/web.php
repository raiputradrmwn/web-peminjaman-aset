<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Default dashboard route (bisa diarahkan ke role masing-masing)
Route::get('/dashboard', function () {
    $user = auth()->user();
    if (!$user) {
        return redirect()->route('login');
    }

    return match ($user->roles) {
        'superadmin' => redirect()->route('superadmin.dashboard'),
        'admin'      => redirect()->route('admin.dashboard'),
        'employee'   => redirect()->route('employee.dashboard'),
        default      => redirect()->route('login'),
    };
})->middleware(['auth', 'verified'])->name('dashboard');

// Superadmin
Route::middleware(['auth', 'role:superadmin'])->group(function () {
    Route::get('/superadmin/dashboard', fn () => Inertia::render('superadmin/dashboard'))
        ->name('superadmin.dashboard');
});

// Admin
Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin/dashboard', fn () => Inertia::render('admin/dashboard'))
        ->name('admin.dashboard');
});

// Employee
Route::middleware(['auth', 'role:employee'])->group(function () {
    Route::get('/employee/dashboard', fn () => Inertia::render('employee/dashboard'))
        ->name('employee.dashboard');
});

// Logout
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
