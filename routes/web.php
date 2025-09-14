<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\ApprovalController;

// ===================
// Home
// ===================
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// ===================
// Redirect ke dashboard sesuai role
// ===================
Route::get('/dashboard', function () {
    $user = auth()->user();

    return match ($user?->role) {
        'superadmin' => redirect()->route('superadmin.dashboard'),
        'admin'      => redirect()->route('admin.dashboard'),
        'employee'   => redirect()->route('employee.dashboard'),
        default      => redirect()->route('login'),
    };
})->middleware(['auth', 'verified'])->name('dashboard');

// ===================
// Superadmin Routes
// ===================
Route::middleware(['auth', 'role:superadmin'])->prefix('superadmin')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'superadmin'])
        ->name('superadmin.dashboard');

    // User Management
    Route::resource('users', UserController::class)->except(['create', 'edit']);

    // Asset Management
    Route::resource('assets', AssetController::class)->except(['create', 'edit']);

    // Approvals
    Route::get('approvals', [ApprovalController::class, 'index'])->name('approvals.index');
    Route::post('approvals/{user}/approve', [ApprovalController::class, 'approve'])->name('approvals.approve');
    Route::post('approvals/{user}/deny', [ApprovalController::class, 'deny'])->name('approvals.deny');
});

// ===================
// Admin Routes
// ===================
Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('admin/dashboard'))
        ->name('admin.dashboard');
});

// ===================
// Employee Routes
// ===================
Route::middleware(['auth', 'role:employee'])->prefix('employee')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('employee/dashboard'))
        ->name('employee.dashboard');
});

// ===================
// Logout
// ===================
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

// Extra routes
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
