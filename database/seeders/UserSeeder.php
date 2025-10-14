<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'superadmin',
            'status' => 'active',
            'division' => 'IT',
            'created_at' => now(),
        ]);

        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'status' => 'active',
            'division' => 'IT',
            'created_at' => now(),
        ]);

        User::create([
            'name' => 'Admin HR',
            'email' => 'adminhr@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'status' => 'active',
            'division' => 'HR',
            'created_at' => now(),
        ]);

        User::create([
            'name' => 'Employee User',
            'email' => 'employee@example.com',
            'password' => Hash::make('password123'),
            'role' => 'employee',
            'status' => 'active',
            'division' => 'IT',
            'created_at' => now(),
        ]);

        User::create([
            'name' => 'HR 1',
            'email' => 'hr1@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'employee',
            'status' => 'active',
            'division' => 'HR',
            'created_at' => now(),
        ]);
    }
}
