<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Asset;

class AssetController extends Controller
{
    public function index()
    {
        $assets = Asset::select('id', 'serial_number', 'name', 'type', 'status', 'stock')->get();

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
            'stock'  => 'required|integer|min:1',
        ]);

        $prefix = match ($request->type) {
            'asset'   => strtok($request->name, ' '),
            'room'    => str_replace(' ', '-', $request->name),
            default   => ucfirst($request->type),
        };

        $count = Asset::where('serial_number', 'LIKE', $prefix . '-%')->count();
        $serialNumber = $prefix . '-' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);

        Asset::create([
            'serial_number' => $serialNumber,
            'name'          => $request->name,
            'type'          => $request->type,
            'status'        => $request->status,
            'stock'         => (int) $request->stock, // pastikan integer
        ]);

        return redirect()->back()->with(
            'success',
            'Aset berhasil ditambahkan dengan Serial Number: ' . $serialNumber
        );
    }

    public function update(Request $request, Asset $asset)
    {
        $request->validate([
            'name'   => 'required|string|max:255',
            'type'   => 'required|string',
            'status' => 'required|in:available,borrowed,maintenance,retired',
            'stock'  => 'required|integer|min:0',
        ]);

        $asset->update([
            'name'   => $request->name,
            'type'   => $request->type,
            'status' => $request->status,
            'stock'  => (int) $request->stock,
        ]);

        return redirect()->back()->with('success', 'Aset berhasil diperbarui.');
    }

    public function destroy(Asset $asset)
    {
        $asset->forceDelete();
        return back()->with('success', 'Asset berhasil dihapus.');
    }
}
