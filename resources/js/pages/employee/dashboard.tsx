// resources/js/pages/employee/dashboard.tsx
import * as React from "react";
import { router } from "@inertiajs/react";
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
  asset?: Asset | null;
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
  const [quantities, setQuantities] = React.useState<{ [key: number]: number }>({});
  const [notes, setNotes] = React.useState<{ [key: number]: string }>({});
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
      .filter(
        (b) =>
          b.asset?.id === assetId &&
          (b.status === "pending" || b.status === "approved")
      )
      .reduce((sum, b) => sum + b.quantity, 0);

    const asset = availableAssetsState.find((a) => a.id === assetId);
    return asset ? asset.stock - borrowedQty : 0;
  };

  const handleBorrow = (assetId: number) => {
    const quantity = quantities[assetId] || 1;
    const note = (notes[assetId] || "").trim();
    const availableStock = getAvailableStock(assetId);

    if (quantity > availableStock) {
      alert("Stok tidak mencukupi untuk melakukan peminjaman.");
      return;
    }

    if (note === "") {
      alert("Mohon isi deskripsi peminjaman (digunakan untuk apa).");
      return;
    }

    // Optimistic UI: tambah ke daftar sementara dengan id sementara
    const newBorrow: Borrow = {
      id: Date.now(),
      status: "pending",
      quantity,
      notes: note,
      asset: availableAssetsState.find((asset) => asset.id === assetId) ?? null,
    };

    setMyBorrowsState((prevBorrows) => [...prevBorrows, newBorrow]);
    setPendingBorrows((prev) => prev + 1);

    // Kirim ke server
    router.post(
      "/employee/borrows",
      {
        asset_id: assetId,
        quantity,
        notes: note,
      },
      {
        onSuccess: () => {
          // pada sukses, reset input untuk asset tersebut
          setQuantities((prev) => ({ ...prev, [assetId]: 1 }));
          setNotes((prev) => ({ ...prev, [assetId]: "" }));
          // opsi: bisa refresh data dari server jika ingin data final (id, status actual, dll)
        },
        onError: () => {
          // revert optimistic UI
          setMyBorrowsState((prevBorrows) =>
            prevBorrows.filter((b) => b.id !== newBorrow.id)
          );
          setPendingBorrows((prev) => prev - 1);
        },
      }
    );
  };

  // typed event handlers
  const handleQuantityChange = (assetId: number, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [assetId]: value > 0 ? value : 1,
    }));
  };

  const handleNotesChange = (assetId: number, value: string) => {
    setNotes((prev) => ({
      ...prev,
      [assetId]: value,
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
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
              <Button onClick={closeModal} variant="secondary">Batal</Button>
              <Button onClick={handleLogout} variant="destructive">Ya, Logout</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2 inline" />
              Approved Borrows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{approvedBorrows}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <ClockIcon className="w-6 h-6 text-yellow-500 mr-2 inline" />
              Pending Borrows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{pendingBorrows}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <XCircleIcon className="w-6 h-6 text-red-500 mr-2 inline" />
              Rejected Borrows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{rejectedBorrows}</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Assets & My Borrows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Available Assets */}
        <div>
          <h2 className="text-2xl font-bold mb-3">Available Assets</h2>
          {availableAssetsState.length === 0 ? (
            <p className="text-gray-500">Tidak ada aset yang tersedia.</p>
          ) : (
            <ul className="space-y-4">
              {availableAssetsState.map((asset) => {
                const availableStock = getAvailableStock(asset.id);
                return (
                  <li key={asset.id} className="p-4 bg-gray-50 border rounded-lg shadow">
                    <div>
                      <p className="font-semibold">{asset.name}</p>
                      <p className="text-sm text-gray-500">{asset.type}</p>
                      <p className="text-sm text-green-600">Stock: {availableStock}</p>
                    </div>

                    <div className="mt-3 flex flex-col gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={availableStock}
                        value={quantities[asset.id] || 1}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleQuantityChange(asset.id, parseInt(e.target.value || "1", 10))
                        }
                        className="w-24"
                        disabled={availableStock <= 0}
                      />

                      {/* native textarea, styled with tailwind */}
                      <textarea
                        placeholder="Deskripsi peminjaman (digunakan untuk apa?)"
                        value={notes[asset.id] || ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          handleNotesChange(asset.id, e.target.value)
                        }
                        className="w-full border rounded p-2 min-h-[70px] resize-none"
                      />

                      <Button
                        onClick={() => handleBorrow(asset.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-3">My Borrow History</h2>
          {myBorrowsState.length === 0 ? (
            <p className="text-gray-500">Belum ada peminjaman aset.</p>
          ) : (
            <ul className="space-y-4">
              {myBorrowsState.map((borrow) => (
                <li key={borrow.id} className="p-4 bg-gray-50 border rounded-lg shadow">
                  <div>
                    <p className="font-semibold">{borrow.asset?.name ?? "Aset dihapus"}</p>
                    <p className="text-sm text-gray-500">{borrow.asset?.type ?? "-"}</p>
                    <p className="text-sm text-blue-600">Jumlah: {borrow.quantity}</p>
                    {borrow.notes && (
                      <p className="text-sm text-gray-600 italic mt-1">“{borrow.notes}”</p>
                    )}
                  </div>
                  <span
                    className={`mt-2 inline-block px-3 py-1 rounded text-white font-semibold ${
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
