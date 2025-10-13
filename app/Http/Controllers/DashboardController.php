<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Asset;
use Inertia\Inertia;
use App\Models\Borrow;
use Illuminate\Support\Facades\Auth;


class DashboardController extends Controller
{
    /**
     * Dashboard untuk Superadmin
     */
    public function superadmin()
    {
        return Inertia::render('superadmin/dashboard', [
            'authUser' => Auth::user(),
            'users'  => User::select('id', 'name', 'email', 'role', 'status', 'division')->get(),
            'assets' => Asset::select('id', 'serial_number', 'name', 'type', 'status', 'stock')->get(),
            'activeEmployees'          => User::where('role', 'employee')->where('status', 'active')->count(),
            'pendingEmployees'         => User::where('role', 'employee')->where('status', 'pending')->count(),
            'availableAssetsCount'     => Asset::where('status', 'available')->count(),
            'borrowedAssetsCount'      => Asset::where('status', 'borrowed')->count(),
            'availableAssets'          => Asset::where('status', 'available') ->whereNull('deleted_at')->get(),
            'pendingApprovalEmployees' => User::where('status', 'pending')->get(),
            'recentBorrows'            => Borrow::with(['user','asset'])->latest()->take(10)->get(),
        ]);
    }

    /**
     * Dashboard untuk Admin
     */
    public function admin()
    {
        $admin = auth()->user();

        return Inertia::render('admin/dashboard', [
            'authUser' => Auth::user(),
            // Statistik karyawan di divisi admin
            'activeEmployees'  => User::where('role', 'employee')
                                      ->where('status', 'active')
                                      ->where('division', $admin->division)
                                      ->count(),

            'pendingEmployees' => User::where('role', 'employee')
                                      ->where('status', 'pending')
                                      ->where('division', $admin->division)
                                      ->count(),

            // Statistik aset (opsional: kalau asset juga ada kolom division bisa difilter pakai ->where('division', $admin->division))
            'availableAssetsCount' => Asset::where('status', 'available')->count(),
            'borrowedAssetsCount'  => Borrow::where('status', 'approved')->sum('quantity'),

            // List aset yang masih tersedia
            'availableAssets' => Asset::where('status', 'available')
                                      ->where('stock', '>', 0)
                                      ->get(),

            // Daftar employee pending approval (hanya divisi admin)
            'pendingApprovalEmployees' => User::where('role', 'employee')
                                              ->where('status', 'pending')
                                              ->where('division', $admin->division)
                                              ->get(),

            // Peminjaman terbaru
            'recentBorrows' => Borrow::with(['user', 'asset'])
                                     ->latest()
                                     ->take(10)
                                     ->get(),

            // Semua employee di divisi admin
            'users'  => User::where('division', $admin->division)->get(),

            // Semua assets (bisa difilter per divisi kalau ada kolom division di tabel assets)
            'assets' => Asset::all(),
        ]);
    }

    /**
     * Dashboard untuk Employee
     */
    public function employee()
    {
        $user = auth()->user();

        return Inertia::render('employee/dashboard', [
            'authUser' => Auth::user(),
            // statistik pinjaman user
            'totalApprovedBorrows' => $user->borrows()->where('status', 'approved')->count(),
            'totalPendingBorrows'  => $user->borrows()->where('status', 'pending')->count(),
            'totalRejectedBorrows' => $user->borrows()->where('status', 'rejected')->count(),

            // aset yang masih tersedia
            'availableAssets' => Asset::where('status', 'available')
                ->where('stock', '>', 0)
                ->get(),

            // histori peminjaman milik user login
            'myBorrows' => $user->borrows()
                ->with('asset')
                ->latest()
                ->get(),
        ]);
    }
}
