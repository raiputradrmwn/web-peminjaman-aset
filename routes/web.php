<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\BorrowController;

// ===================
// Home
// ===================
Route::get('/', function () {
    return redirect()->route('login');
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
Route::middleware(['auth', 'role:superadmin'])->prefix('superadmin')->name('superadmin.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'superadmin'])->name('dashboard');

    // User Management
    Route::resource('users', UserController::class)->except(['create', 'edit']);

    // Asset Management
    Route::resource('assets', AssetController::class)->except(['create', 'edit']);

    // Approvals
    Route::get('approvals', [ApprovalController::class, 'index'])->name('approvals.index');
    Route::post('users/{user}/approve', [ApprovalController::class, 'approve'])->name('users.approve');
    Route::post('users/{user}/deny', [ApprovalController::class, 'deny'])->name('users.deny');

    // Borrow Management (tambahan)
    Route::post('/borrows/{borrow}/approve', [BorrowController::class, 'approve'])->name('borrows.approve');
    Route::post('/borrows/{borrow}/reject', [BorrowController::class, 'reject'])->name('borrows.reject');
    Route::post('/borrows/{borrow}/return', [BorrowController::class, 'returnBorrow'])->name('borrows.return');
});

// ===================
// Admin Routes
// ===================
Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    // Dashboard Admin (pakai controller, bukan langsung inertia)
    Route::get('/dashboard', [DashboardController::class, 'admin'])
        ->name('admin.dashboard');

    // Borrow Management
    Route::post('/borrows/{borrow}/approve', [BorrowController::class, 'approve'])
        ->name('admin.borrows.approve');
    Route::post('/borrows/{borrow}/reject', [BorrowController::class, 'reject'])
        ->name('admin.borrows.reject');
    Route::post('/borrows/{borrow}/return', [BorrowController::class, 'returnBorrow'])
        ->name('admin.borrows.return');

    // User Management (hanya create oleh admin untuk divisi sendiri)
    Route::post('/users', [UserController::class, 'storeIsAdmin'])
        ->name('admin.users.storeIsAdmin');
});

// ===================
// Employee Routes
// ===================
Route::middleware(['auth', 'role:employee'])->prefix('employee')->name('employee.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'employee'])
        ->name('dashboard');

    // Borrow Routes
    Route::get('/borrows/available', [BorrowController::class, 'availableAssets'])
        ->name('borrows.available');
    Route::get('/borrows/my', [BorrowController::class, 'myBorrows'])
        ->name('borrows.my');
    Route::post('/borrows', [BorrowController::class, 'store'])
        ->name('borrows.store');
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
