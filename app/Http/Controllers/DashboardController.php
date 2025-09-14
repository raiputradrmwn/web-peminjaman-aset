<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Asset;
use Inertia\Inertia;

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
}
