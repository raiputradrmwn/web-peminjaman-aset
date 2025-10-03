<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // daftar semua user
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'division', 'role', 'status')->get();

        return inertia('superadmin/users/index', [
            'users' => $users
        ]);
    }

    // tambah user baru (admin / employee)
    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'role'     => 'required|in:admin,employee',
            'division' => 'nullable|string|max:255',
        ]);

        User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make('default123!'), // default password
            'role'     => $request->role,
            'division' => $request->division,
            'status'   => 'active',
        ]);

        return redirect()->back()->with('success', 'User berhasil ditambahkan.');
    }

    // update user
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role'  => 'required|in:admin,employee',
            'status'=> 'required|in:active,pending,suspended',
        ]);

        $user->update($request->all());

        return redirect()->back()->with('success', 'User berhasil diupdate.');
    }

    // hapus user
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->back()->with('success', 'User berhasil dihapus.');
    }

    public function storeIsAdmin(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'role'  => 'required|in:employee', // admin hanya boleh tambah employee
        ]);

        $admin = auth()->user();

        User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make('default123!'),
            'role'     => $request->role,
            'division' => $admin->division, // ikut division admin
            'status'   => 'active',
        ]);

        return redirect()->back()->with('success', 'User berhasil ditambahkan.');
    }
}
