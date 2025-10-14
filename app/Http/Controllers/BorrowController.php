<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Asset;
use App\Models\Borrow;
use App\Models\BorrowHistory;
use Illuminate\Support\Facades\Auth;

class BorrowController extends Controller
{
    /**
     * List aset yang masih available untuk dipinjam
     */
    public function availableAssets()
    {
        $assets = Asset::where('status', 'available')
            ->where('stock', '>', 0)
            ->get();

        return inertia('employee/Borrow/AvailableAssets', [
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

        return inertia('employee/Borrow/MyBorrows', [
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
            'quantity' => 'required|integer|min:1',
            'notes'    => 'nullable|string',
            'unit'    => 'nullable|string',
            'borrow_date' => 'nullable|date',
            'ended_at' => 'nullable|date',
        ]);

        $asset = Asset::findOrFail($request->asset_id);

        if ($asset->status !== 'available' || $asset->stock < $request->quantity) {
            return back()->with('error', 'Stok aset tidak mencukupi untuk dipinjam.');
        }

        $borrow = Borrow::create([
            'user_id'   => Auth::id(),
            'asset_id'  => $asset->id,
            'quantity'  => $request->quantity,
            'status'    => 'pending',
            'notes'     => $request->notes,
            'borrow_date'=> $request->borrow_date,
            'ended_at'  => $request->ended_at,
            'unit'      => $request->unit,
        ]);

        BorrowHistory::create([
            'borrow_id'   => $borrow->id,
            'changed_by'  => Auth::id(),
            'old_status'  => null,
            'new_status'  => 'pending',
            'notes'       => 'Peminjaman diajukan oleh user',
            'changed_at'  => now(),
        ]);

        return redirect()->route('employee.borrows.my')
            ->with('success', 'Peminjaman berhasil diajukan, menunggu persetujuan admin.');
    }

    /**
     * Admin menyetujui peminjaman
     */
    public function approve(Borrow $borrow)
    {
        if ($borrow->status !== 'pending') {
            return back()->with('error', 'Peminjaman ini sudah diproses.');
        }

        $asset = $borrow->asset;

        if ($asset->stock < $borrow->quantity) {
            return back()->with('error', 'Stok aset tidak mencukupi untuk disetujui.');
        }

        $borrow->update([
            'status'        => 'approved',
            'approved_by'   => Auth::id(),
            'approval_date' => now(),
        ]);

        $asset->decrement('stock', $borrow->quantity);

        BorrowHistory::create([
            'borrow_id'   => $borrow->id,
            'changed_by'  => Auth::id(),
            'old_status'  => 'pending',
            'new_status'  => 'approved',
            'notes'       => 'Disetujui oleh admin',
            'changed_at'  => now(),
        ]);

        return back()->with('success', 'Peminjaman berhasil disetujui.');
    }

    /**
     * Admin menolak peminjaman
     */
    public function reject(Borrow $borrow, Request $request)
    {
        if ($borrow->status !== 'pending') {
            return back()->with('error', 'Peminjaman ini sudah diproses.');
        }

        $borrow->update([
            'status'        => 'rejected',
            'approved_by'   => Auth::id(),
            'approval_date' => now(),
            'notes'         => $request->notes ?? 'Ditolak oleh admin',
        ]);

        BorrowHistory::create([
            'borrow_id'   => $borrow->id,
            'changed_by'  => Auth::id(),
            'old_status'  => 'pending',
            'new_status'  => 'rejected',
            'notes'       => $request->notes ?? 'Ditolak oleh admin',
            'changed_at'  => now(),
        ]);

        return back()->with('success', 'Peminjaman ditolak.');
    }

    /**
     * Admin menandai peminjaman sudah dikembalikan
     */
    public function returnBorrow(Borrow $borrow)
    {
        if ($borrow->status !== 'approved') {
            return back()->with('error', 'Peminjaman belum disetujui atau sudah dikembalikan.');
        }

        $borrow->update([
            'status'   => 'returned',
            'ended_at' => now(),
        ]);

        $asset = $borrow->asset;
        $asset->increment('stock', $borrow->quantity);

        BorrowHistory::create([
            'borrow_id'   => $borrow->id,
            'changed_by'  => Auth::id(),
            'old_status'  => 'approved',
            'new_status'  => 'returned',
            'notes'       => 'Aset dikembalikan',
            'changed_at'  => now(),
        ]);

        return back()->with('success', 'Aset berhasil dikembalikan.');
    }
}
