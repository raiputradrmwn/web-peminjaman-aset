<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Asset;
use App\Models\Borrow;
use App\Models\BorrowHistory;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BorrowController extends Controller
{
    /**
     * List aset yang masih available untuk dipinjam
     */
    public function availableAssets()
    {
        $assets = Asset::where('status', 'available')->get();

        return Inertia::render('employee/Borrow/AvailableAssets', [
            'assets' => $assets,
        ]);
    }

    /**
     * List peminjaman milik user login
     */
    public function myBorrows()
    {
        $borrows = Borrow::with('asset')
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        return Inertia::render('employee/Borrow/MyBorrows', [
            'borrows' => $borrows,
        ]);
    }

    /**
     * Ajukan peminjaman aset
     */
    public function store(Request $request)
    {
        $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'notes' => 'nullable|string',
        ]);

        $asset = Asset::findOrFail($request->asset_id);

        if ($asset->status !== 'available') {
            return back()->with('error', 'Aset tidak tersedia untuk dipinjam.');
        }

        // Buat peminjaman
        $borrow = Borrow::create([
            'user_id' => Auth::id(),
            'asset_id' => $asset->id,
            'status' => 'pending', // default menunggu persetujuan admin
            'notes' => $request->notes,
        ]);

        // Catat history
        BorrowHistory::create([
            'borrow_id' => $borrow->id,
            'changed_by' => Auth::id(),
            'old_status' => 'pending',
            'new_status' => 'pending',
            'notes' => 'Peminjaman diajukan oleh user',
            'changed_at' => now(),
        ]);

        return redirect()->route('employee.borrows.my')->with('success', 'Peminjaman berhasil diajukan, menunggu persetujuan admin.');
    }

    /**
     * Admin menyetujui peminjaman
     */
    public function approve(Borrow $borrow)
    {
        $borrow->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approval_date' => now(),
        ]);

        // update status asset
        $borrow->asset->update(['status' => 'borrowed']);

        // history
        BorrowHistory::create([
            'borrow_id' => $borrow->id,
            'changed_by' => Auth::id(),
            'old_status' => 'pending',
            'new_status' => 'approved',
            'notes' => 'Disetujui oleh admin',
            'changed_at' => now(),
        ]);

        return back()->with('success', 'Peminjaman berhasil disetujui.');
    }

    /**
     * Admin menolak peminjaman
     */
    public function reject(Borrow $borrow, Request $request)
    {
        $borrow->update([
            'status' => 'rejected',
            'approved_by' => Auth::id(),
            'approval_date' => now(),
            'notes' => $request->notes ?? 'Ditolak oleh admin',
        ]);

        // history
        BorrowHistory::create([
            'borrow_id' => $borrow->id,
            'changed_by' => Auth::id(),
            'old_status' => 'pending',
            'new_status' => 'rejected',
            'notes' => $request->notes,
            'changed_at' => now(),
        ]);

        return back()->with('success', 'Peminjaman ditolak.');
    }

    /**
     * Admin menandai peminjaman sudah dikembalikan
     */
    public function returnBorrow(Borrow $borrow)
    {
        $borrow->update([
            'status' => 'returned',
            'ended_at' => now(),
        ]);

        // update status asset
        $borrow->asset->update(['status' => 'available']);

        // history
        BorrowHistory::create([
            'borrow_id' => $borrow->id,
            'changed_by' => Auth::id(),
            'old_status' => 'approved',
            'new_status' => 'returned',
            'notes' => 'Aset dikembalikan',
            'changed_at' => now(),
        ]);

        return back()->with('success', 'Aset berhasil dikembalikan.');
    }
}
