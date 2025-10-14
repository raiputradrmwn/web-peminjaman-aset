<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Asset;

class AsetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Asset::create([
            'name' => 'Laptop Dell XPS 13',
            'type' => 'Laptop',
            'serial_number' => 'DLXPS13-001',
            'stock' => 10,
            'status' => 'available',
            'created_at' => now(),
        ]);

        Asset::create([
            'name' => 'Monitor Samsung 24"',
            'type' => 'Monitor',
            'serial_number' => 'SMS24-001',
            'stock' => 15,
            'status' => 'available',
            'created_at' => now(),
        ]);

        Asset::create([
            'name' => 'Keyboard Logitech K120',
            'type' => 'Keyboard',
            'serial_number' => 'LGK120-001',
            'stock' => 25,
            'status' => 'available',
            'created_at' => now(),
        ]);
    }
}
