<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class ApprovalController extends Controller
{
    // daftar admin yang pending
    public function index()
    {
        $pendingAdmins = User::where('role', 'admin')->where('status', 'pending')->get();

        return inertia('superadmin/approvals/index', [
            'pendingAdmins' => $pendingAdmins
        ]);
    }

    public function approve(User $user)
    {
        $user->update(['status' => 'active']);

        return redirect()->back()->with('success', 'User berhasil di-approve.');
    }

    public function deny(User $user)
    {
        $user->update(['status' => 'denied']);

        return redirect()->back()->with('success', 'User berhasil ditolak.');
    }
}
