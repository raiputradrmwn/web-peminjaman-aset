<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Asset;

class AssetController extends Controller
{
    public function index()
    {
        $assets = Asset::select('id', 'name', 'type', 'status')->get();

        return inertia('superadmin/assets/index', [
            'assets' => $assets
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'   => 'required|string|max:255',
            'type'   => 'required|string|in:asset,room,vehicle,equipment',
            'status' => 'required|in:available,borrowed,maintenance,retired',
        ]);

        // Generate serial number
        $prefix = '';

        if ($request->type === 'asset') {
            // ambil kata pertama dari nama
            $prefix = strtok($request->name, ' ');
        } elseif ($request->type === 'room') {
            // ambil nama room full tanpa spasi terakhir
            $prefix = str_replace(' ', '-', $request->name);
        } else {
            // default → pakai type
            $prefix = ucfirst($request->type);
        }

        // Hitung jumlah serial number yang sudah ada dengan prefix tsb
        $count = Asset::where('serial_number', 'LIKE', $prefix . '-%')->count();
        $serialNumber = $prefix . '-' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);

        // Simpan ke database
        Asset::create([
            'serial_number' => $serialNumber,
            'name'          => $request->name,
            'type'          => $request->type,
            'status'        => $request->status,
        ]);

        return redirect()->back()->with('success', 'Aset berhasil ditambahkan dengan Serial Number: ' . $serialNumber);
    }


    public function update(Request $request, Asset $asset)
    {
        $request->validate([
            'name'   => 'required|string|max:255',
            'type'   => 'required|string',
            'status' => 'required|in:available,borrowed,maintenance,retired',
        ]);

        $asset->update($request->all());

        return redirect()->back()->with('success', 'Aset berhasil diperbarui.');
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();

        return redirect()->back()->with('success', 'Aset berhasil dihapus.');
    }
}
