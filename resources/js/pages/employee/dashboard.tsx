
"use client";

import * as React from "react";
import { router } from "@inertiajs/react";
import { format } from "date-fns";
import { toast } from "sonner"; 

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


import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input as TextInput } from "@/components/ui/input";

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
  const [borrowDateTimes, setBorrowDateTimes] = React.useState<
    Record<number, Date | undefined>
  >({});
  const [borrowEndDateTimes, setBorrowEndDateTimes] = React.useState<
    Record<number, Date | undefined>
  >({});

  
  const [availableAssetsState] = React.useState(availableAssets);
  const [myBorrowsState, setMyBorrowsState] = React.useState(myBorrows);

  
  const [approvedBorrows, setApprovedBorrows] = React.useState(totalApprovedBorrows);
  const [pendingBorrows, setPendingBorrows] = React.useState(totalPendingBorrows);
  const [rejectedBorrows, setRejectedBorrows] = React.useState(totalRejectedBorrows);

  
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const handleLogoutClick = () => setIsLogoutModalOpen(true);
  const handleLogout = () => {
    router.post("/logout", {}, {
      onStart: () => toast.loading("Keluar dari akun...", { id: "logout" }),
      onSuccess: () => toast.success("Berhasil logout.", { id: "logout" }),
      onError: () => toast.error("Logout gagal.", { id: "logout" })
    });
    setIsLogoutModalOpen(false);
  };
  const closeModal = () => setIsLogoutModalOpen(false);

  
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  const [query, setQuery] = React.useState("");

  const filteredAssets = React.useMemo(() => {
    if (!query.trim()) return availableAssetsState;
    const q = query.toLowerCase();
    return availableAssetsState.filter(
      (a) => a.name.toLowerCase().includes(q) || a.type.toLowerCase().includes(q)
    );
  }, [availableAssetsState, query]);

  const pageCount = Math.max(1, Math.ceil(filteredAssets.length / pageSize));

  const paginatedAssets = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAssets.slice(start, start + pageSize);
  }, [filteredAssets, page, pageSize]);

  React.useEffect(() => {
    setPage(1);
  }, [query, pageSize]);

  
  const getAvailableStock = (assetId: number) => {
    const borrowedQty = myBorrowsState
      .filter(
        (b) => b.asset?.id === assetId && (b.status === "pending" || b.status === "approved")
      )
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

    if (quantity > availableStock) {
      toast.error("Stok tidak mencukupi untuk melakukan peminjaman.");
      return;
    }
    if (!startDt) {
      toast.warning("Mohon pilih waktu mulai peminjaman.");
      return;
    }
    if (!endDt) {
      toast.warning("Mohon pilih waktu pengembalian.");
      return;
    }
    if (endDt <= startDt) {
      toast.error("Waktu pengembalian harus setelah waktu peminjaman.");
      return;
    }
    if (!unit) {
      toast.info("Mohon isi satuan barang (misal: pcs, box, dll).");
      return;
    }
    if (!note) {
      toast.info("Mohon isi deskripsi peminjaman (digunakan untuk apa).");
      return;
    }

    const borrow_iso = format(startDt, "yyyy-MM-dd'T'HH:mm:ssxxx");
    const end_iso = format(endDt, "yyyy-MM-dd'T'HH:mm:ssxxx");

    
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

const toastId = `borrow-${assetId}`

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
    onStart: () => toast.loading("Mengajukan peminjaman...", { id: toastId }),
    onSuccess: () => {
      toast.success("Pengajuan peminjaman terkirim.", {
        id: toastId,
        duration: 1000, 
      });
      setQuantities((prev) => ({ ...prev, [assetId]: 1 }));
      setUnits((prev) => ({ ...prev, [assetId]: "" }));
      setNotes((prev) => ({ ...prev, [assetId]: "" }));
      setBorrowDateTimes((prev) => ({ ...prev, [assetId]: undefined }));
      setBorrowEndDateTimes((prev) => ({ ...prev, [assetId]: undefined }));
    },
    onError: () => {
      toast.error("Gagal mengajukan peminjaman. Coba lagi.", {
        id: toastId,
        duration: 1000, 
      });
      setMyBorrowsState((prev) => prev.filter((b) => b.id !== newBorrow.id));
      setPendingBorrows((prev) => prev - 1);
    },
    onFinish: () => {
      
      setTimeout(() => toast.dismiss(toastId), 500);
    },
  }
);

  };

  return (
    <div className="space-y-6 p-6">
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
              <CheckCircleIcon className="mr-2 inline h-6 w-6 text-green-500" />
              Peminjaman Disetujui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{approvedBorrows}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <ClockIcon className="mr-2 inline h-6 w-6 text-yellow-500" />
              Peminjaman Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{pendingBorrows}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <XCircleIcon className="mr-2 inline h-6 w-6 text-red-500" />
              Peminjaman Ditolak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{rejectedBorrows}</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Assets + History */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Available Assets - COMPACT + PAGINATION */}
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold">Aset Tersedia</h2>

            <div className="grow" />

            {/* Search */}
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari aset..."
              className="h-9 w-[220px]"
            />

            {/* Page size */}
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="h-9 w-[110px]">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {paginatedAssets.length === 0 ? (
            <p className="text-gray-500">Tidak ada aset yang tersedia.</p>
          ) : (
            <ul className="space-y-3">
              {paginatedAssets.map((asset) => {
                const availableStock = getAvailableStock(asset.id);
                return (
                  <li key={asset.id} className="rounded-xl border bg-white p-3 shadow-sm">
                    {/* header mini */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{asset.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          Tipe: {asset.type} • Stock:{" "}
                          <span className="text-green-600">{availableStock}</span>
                        </p>
                      </div>

                      {/* jumlah mini */}
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
                        className="h-9 w-20"
                        disabled={availableStock <= 0}
                      />
                    </div>

                    {/* grid form */}
                    <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Waktu Mulai
                        </label>
                        <DateTimePicker
                          value={borrowDateTimes[asset.id]}
                          onChange={(d: any) =>
                            setBorrowDateTimes((prev) => ({ ...prev, [asset.id]: d }))
                          }
                          placeholder="Pilih waktu mulai"
                          buttonClassName="h-9 text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Waktu Pengembalian
                        </label>
                        <DateTimePicker
                          value={borrowEndDateTimes[asset.id]}
                          onChange={(d: any) =>
                            setBorrowEndDateTimes((prev) => ({ ...prev, [asset.id]: d }))
                          }
                          placeholder="Pilih waktu pengembalian"
                          buttonClassName="h-9 text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Unit Peminjam
                        </label>
                        <Input
                          type="text"
                          placeholder="Dari Unit Kerja apa?"
                          value={units[asset.id] || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setUnits((prev) => ({ ...prev, [asset.id]: e.target.value }))
                          }
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Deskripsi
                        </label>
                        <textarea
                          placeholder="Digunakan untuk apa?"
                          value={notes[asset.id] || ""}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setNotes((prev) => ({ ...prev, [asset.id]: e.target.value }))
                          }
                          className="min-h-[38px] w-full resize-y rounded-md border p-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button
                        onClick={() => handleBorrow(asset.id)}
                        className="rounded-lg bg-blue-600 text-white hover:bg-blue-700"
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

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent className="gap-10">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.max(1, p - 1));
                      }}
                    />
                  </PaginationItem>

                  {page > 2 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(1);
                          }}
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationLink isActive>{page}</PaginationLink>
                  </PaginationItem>

                  {page < pageCount - 1 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(pageCount);
                          }}
                        >
                          {pageCount}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.min(pageCount, p + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>

        {/* My Borrow History */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-3 text-2xl font-bold">Riwayat Peminjaman</h2>
          {myBorrowsState.length === 0 ? (
            <p className="text-gray-500">Belum ada peminjaman aset.</p>
          ) : (
            <ul className="space-y-4">
              {myBorrowsState.map((borrow) => (
                <li key={borrow.id} className="rounded-lg border bg-gray-50 p-4 shadow">
                  <div>
                    <p className="font-semibold">{borrow.asset?.name ?? "Aset dihapus"}</p>
                    <p className="text-sm text-gray-500">{borrow.asset?.type ?? "-"}</p>
                    <p className="text-sm text-blue-600">Jumlah: {borrow.quantity}</p>
                    <p className="text-sm text-gray-500">
                      Unit Peminjam: {borrow.unit ? <span>{borrow.unit}</span> : "-"}
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
                      <p className="mt-1 text-sm italic text-gray-600">“{borrow.notes}”</p>
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
