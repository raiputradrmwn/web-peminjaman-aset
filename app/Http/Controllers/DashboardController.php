<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Asset;
use Inertia\Inertia;
use App\Models\Borrow;


class DashboardController extends Controller
{
    public function superadmin()
    {
        $totalAssets = Asset::count();
        $totalAdmins = User::where('role', 'admin')->count();
        $totalEmployees = User::where('role', 'employee')->count();
        $assets = Asset::all();
        $pendingAdmins = User::whereIn('role', ['admin', 'employee'])
                            ->where('status', 'pending')
                            ->get();

        return Inertia::render('superadmin/dashboard', [
            'totalAssets'    => $totalAssets,
            'totalAdmins'    => $totalAdmins,
            'totalEmployees' => $totalEmployees,
            'assets'         => $assets,
            'pendingAdmins'  => $pendingAdmins,
        ]);
    }

     public function employee()
    {
        $user = auth()->user();

        // Hitung peminjaman milik user yg sedang login
        $totalApprovedBorrows = Borrow::where('user_id', $user->id)
            ->where('status', 'approved')
            ->count();

        $totalPendingBorrows = Borrow::where('user_id', $user->id)
            ->where('status', 'pending')
            ->count();

        $totalRejectedBorrows = Borrow::where('user_id', $user->id)
            ->where('status', 'rejected')
            ->count();

        // Ambil semua asset yang available supaya bisa dipinjam
        $availableAssets = Asset::where('status', 'available')->get();

        // Ambil daftar borrow user agar bisa ditampilkan di dashboard
        $myBorrows = Borrow::with('asset')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return Inertia::render('employee/dashboard', [
            'totalApprovedBorrows' => $totalApprovedBorrows,
            'totalPendingBorrows' => $totalPendingBorrows,
            'totalRejectedBorrows' => $totalRejectedBorrows,
            'availableAssets' => $availableAssets,
            'myBorrows' => $myBorrows,
        ]);
    }

    public function admin()
    {
        return Inertia::render('admin/dashboard', [
            'totalAssets' => Asset::count(),
            'availableAssets' => Asset::where('status', 'available')->count(),
            'borrowedAssets' => Asset::where('status', 'borrowed')->count(),
            'pendingBorrows' => Borrow::where('status', 'pending')->count(),
            'borrows' => Borrow::with(['user', 'asset'])
                        ->latest()
                        ->take(10)
                        ->get(),
        ]);
    }
}
