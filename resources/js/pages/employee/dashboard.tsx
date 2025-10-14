"use client";

import * as React from "react";
import { router } from "@inertiajs/react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DateTimePicker from "@/components/date-picker";

interface Asset {
  id: number;
  name: string;
  type: string;
  status: string;
  stock: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  division?: string;
}

interface Borrow {
  id: number;
  status: "pending" | "approved" | "rejected" | "returned";
  quantity: number;
  notes?: string;
  unit?: string;
  asset?: Asset | null;
  borrow_date?: string;
  ended_at?: string;
}

interface EmployeeDashboardProps {
  totalApprovedBorrows: number;
  totalPendingBorrows: number;
  totalRejectedBorrows: number;
  availableAssets: Asset[];
  myBorrows: Borrow[];
  authUser?: User;
}

export default function Dashboard({
  authUser,
  totalApprovedBorrows,
  totalPendingBorrows,
  totalRejectedBorrows,
  availableAssets,
  myBorrows,
}: EmployeeDashboardProps) {
  const [quantities, setQuantities] = React.useState<Record<number, number>>({});
  const [notes, setNotes] = React.useState<Record<number, string>>({});
  const [units, setUnits] = React.useState<Record<number, string>>({});
  const [borrowDateTimes, setBorrowDateTimes] = React.useState<Record<number, Date | undefined>>({});
  const [borrowEndDateTimes, setBorrowEndDateTimes] = React.useState<Record<number, Date | undefined>>({});

  const [availableAssetsState] = React.useState(availableAssets);
  const [myBorrowsState, setMyBorrowsState] = React.useState(myBorrows);

  const [approvedBorrows, setApprovedBorrows] = React.useState(totalApprovedBorrows);
  const [pendingBorrows, setPendingBorrows] = React.useState(totalPendingBorrows);
  const [rejectedBorrows, setRejectedBorrows] = React.useState(totalRejectedBorrows);

  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);

  const handleLogoutClick = () => setIsLogoutModalOpen(true);
  const handleLogout = () => {
    router.post("/logout");
    setIsLogoutModalOpen(false);
  };
  const closeModal = () => setIsLogoutModalOpen(false);

  const getAvailableStock = (assetId: number) => {
    const borrowedQty = myBorrowsState
      .filter((b) => b.asset?.id === assetId && (b.status === "pending" || b.status === "approved"))
      .reduce((sum, b) => sum + b.quantity, 0);
    const asset = availableAssetsState.find((a) => a.id === assetId);
    return asset ? asset.stock - borrowedQty : 0;
  };

  const handleBorrow = (assetId: number) => {
    const quantity = quantities[assetId] || 1;
    const note = (notes[assetId] || "").trim();
    const unit = (units[assetId] || "").trim();
    const startDt = borrowDateTimes[assetId];
    const endDt = borrowEndDateTimes[assetId];
    const availableStock = getAvailableStock(assetId);

    if (quantity > availableStock)
      return alert("Stok tidak mencukupi untuk melakukan peminjaman.");
    if (!startDt) return alert("Mohon pilih waktu mulai peminjaman.");
    if (!endDt) return alert("Mohon pilih waktu pengembalian.");
    if (endDt <= startDt)
      return alert("Waktu pengembalian harus setelah waktu peminjaman.");
    if (!unit)
      return alert("Mohon isi satuan barang (misalnya: pcs, box, liter).");
    if (!note)
      return alert("Mohon isi deskripsi peminjaman (digunakan untuk apa).");

    const borrow_iso = format(startDt, "yyyy-MM-dd'T'HH:mm:ssxxx");
    const end_iso = format(endDt, "yyyy-MM-dd'T'HH:mm:ssxxx");

    // Optimistic UI
    const newBorrow: Borrow = {
      id: Date.now(),
      status: "pending",
      quantity,
      unit,
      notes: note,
      borrow_date: borrow_iso,
      ended_at: end_iso,
      asset: availableAssetsState.find((a) => a.id === assetId) ?? null,
    };
    setMyBorrowsState((prev) => [...prev, newBorrow]);
    setPendingBorrows((prev) => prev + 1);

    router.post(
      "/employee/borrows",
      {
        asset_id: assetId,
        quantity,
        unit,
        notes: note,
        borrow_date: borrow_iso,
        ended_at: end_iso,
      },
      {
        onSuccess: () => {
          setQuantities((prev) => ({ ...prev, [assetId]: 1 }));
          setUnits((prev) => ({ ...prev, [assetId]: "" }));
          setNotes((prev) => ({ ...prev, [assetId]: "" }));
          setBorrowDateTimes((prev) => ({ ...prev, [assetId]: undefined }));
          setBorrowEndDateTimes((prev) => ({ ...prev, [assetId]: undefined }));
        },
        onError: () => {
          setMyBorrowsState((prev) => prev.filter((b) => b.id !== newBorrow.id));
          setPendingBorrows((prev) => prev - 1);
        },
      }
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Employee</h1>
          {authUser && (
            <p className="mt-1 text-gray-600">
              Selamat datang, <span className="font-semibold">{authUser.name}</span>{" "}
              (<span className="capitalize">{authUser.role}</span>
              {authUser.division && <span> - {authUser.division}</span>})
            </p>
          )}
        </div>

        {/* Logout */}
        <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" onClick={handleLogoutClick}>
              Logout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Logout</DialogTitle>
            </DialogHeader>
            <DialogDescription>Apakah Anda yakin ingin keluar dari akun?</DialogDescription>
            <div className="flex gap-4">
              <Button onClick={closeModal} variant="secondary">
                Batal
              </Button>
              <Button onClick={handleLogout} variant="destructive">
                Ya, Logout
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>
              <CheckCircleIcon className="mr-2 inline h-6 w-6 text-green-500" /> Approved Borrows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{approvedBorrows}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <ClockIcon className="mr-2 inline h-6 w-6 text-yellow-500" /> Pending Borrows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{pendingBorrows}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <XCircleIcon className="mr-2 inline h-6 w-6 text-red-500" /> Rejected Borrows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{rejectedBorrows}</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Assets & History */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Available Assets */}
        <div>
          <h2 className="mb-3 text-2xl font-bold">Available Assets</h2>
          {availableAssetsState.length === 0 ? (
            <p className="text-gray-500">Tidak ada aset yang tersedia.</p>
          ) : (
            <ul className="space-y-4">
              {availableAssetsState.map((asset) => {
                const availableStock = getAvailableStock(asset.id);
                return (
                  <li key={asset.id} className="rounded-lg border bg-gray-50 p-4 shadow">
                    <div>
                      <p className="font-semibold">Nama: {asset.name}</p>
                      <p className="text-sm text-gray-500">Tipe: {asset.type}</p>
                      <p className="text-sm text-green-600">Stock: {availableStock}</p>
                    </div>

                    <div className="mt-3 flex flex-col gap-3">
                      {/* Tanggal & Waktu Pinjam */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Waktu Mulai Peminjaman</label>
                        <DateTimePicker
                          value={borrowDateTimes[asset.id]}
                          onChange={(d: any) =>
                            setBorrowDateTimes((prev) => ({ ...prev, [asset.id]: d }))
                          }
                          placeholder="Pilih waktu mulai"
                          buttonClassName="w-full"
                        />
                      </div>

                      {/* Tanggal & Waktu Selesai */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Waktu Pengembalian</label>
                        <DateTimePicker
                          value={borrowEndDateTimes[asset.id]}
                          onChange={(d: any) =>
                            setBorrowEndDateTimes((prev) => ({ ...prev, [asset.id]: d }))
                          }
                          placeholder="Pilih waktu pengembalian"
                          buttonClassName="w-full"
                        />
                      </div>

                      {/* Jumlah */}
                      <label className="text-sm font-medium text-gray-700">Jumlah Peminjaman</label>
                      <Input
                        type="number"
                        min={1}
                        max={availableStock}
                        value={quantities[asset.id] || 1}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [asset.id]: Math.max(1, parseInt(e.target.value || "1", 10)),
                          }))
                        }
                        className="w-28"
                        disabled={availableStock <= 0}
                      />

                      {/* Unit */}
                      <label className="text-sm font-medium text-gray-700">Unit Peminjam</label>
                      <Input
                        type="text"
                        placeholder="Contoh: UKM Badminton, Kantor, dll"
                        value={units[asset.id] || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setUnits((prev) => ({ ...prev, [asset.id]: e.target.value }))
                        }
                        className="w-full"
                      />

                      {/* Catatan */}
                      <label className="text-sm font-medium text-gray-700">Deskripsi Peminjaman</label>
                      <textarea
                        placeholder="Deskripsi peminjaman (digunakan untuk apa?)"
                        value={notes[asset.id] || ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setNotes((prev) => ({ ...prev, [asset.id]: e.target.value }))
                        }
                        className="min-h-[70px] w-full resize-none rounded border p-2"
                      />

                      <Button
                        onClick={() => handleBorrow(asset.id)}
                        className="w-full bg-blue-600 text-white hover:bg-blue-700"
                        disabled={availableStock <= 0}
                      >
                        Ajukan Peminjaman
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* My Borrow History */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-3 text-2xl font-bold">My Borrow History</h2>
          {myBorrowsState.length === 0 ? (
            <p className="text-gray-500">Belum ada peminjaman aset.</p>
          ) : (
            <ul className="space-y-4">
              {myBorrowsState.map((borrow) => (
                <li key={borrow.id} className="rounded-lg border bg-gray-50 p-4 shadow">
                  <div>
                    <p className="font-semibold">{borrow.asset?.name ?? "Aset dihapus"}</p>
                    <p className="text-sm text-gray-500">{borrow.asset?.type ?? "-"}</p>
                    <p className="text-sm text-blue-600">
                      Jumlah: {borrow.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Unit Peminjam: {borrow.unit && <span>{borrow.unit}</span>}
                    </p>
                    {borrow.borrow_date && (
                      <p className="text-sm text-gray-500">
                        Mulai:{" "}
                        {new Date(borrow.borrow_date).toLocaleString("id-ID", {
                          dateStyle: "long",
                          timeStyle: "short",
                        })}
                      </p>
                    )}
                    {borrow.ended_at && (
                      <p className="text-sm text-gray-500">
                        Selesai:{" "}
                        {new Date(borrow.ended_at).toLocaleString("id-ID", {
                          dateStyle: "long",
                          timeStyle: "short",
                        })}
                      </p>
                    )}
                    {borrow.notes && (
                      <p className="mt-1 text-sm italic text-gray-600">
                        “{borrow.notes}”
                      </p>
                    )}
                  </div>
                  <span
                    className={`mt-2 inline-block rounded px-3 py-1 font-semibold text-white ${
                      borrow.status === "approved"
                        ? "bg-green-600"
                        : borrow.status === "pending"
                        ? "bg-yellow-600"
                        : borrow.status === "returned"
                        ? "bg-blue-600"
                        : "bg-red-600"
                    }`}
                  >
                    {borrow.status.toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
