// resources/js/pages/admin/dashboard.tsx
"use client";

import * as React from "react";
import { router, usePage } from "@inertiajs/react";
import { Toaster, toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  status: string;
  user: User;
  asset: Asset;
  quantity: number;
  approval_date?: string;
  created_at: string;
  borrow_date?: string;
  ended_at?: string;
  notes: string;
  unit?: string;
}

interface DashboardProps {
  authUser: User;
  activeEmployees: number;
  pendingEmployees: number;
  availableAssetsCount: number;
  borrowedAssetsCount: number;
  availableAssets: Asset[];
  recentBorrows: Borrow[];
  pendingApprovalEmployees: User[];
  users: User[];
  assets: Asset[];
}

const formatDateTime = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });
};

// util kecil untuk search + pagination
function usePaged<T>(source: T[], keys: (keyof T)[]) {
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  const filtered = React.useMemo(() => {
    if (!q.trim()) return source;
    const s = q.toLowerCase();
    return source.filter((row) =>
      keys.some((k) => String(row[k] ?? "").toLowerCase().includes(s))
    );
  }, [source, q, keys]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  React.useEffect(() => {
    setPage(1);
  }, [q, pageSize]);

  return {
    query: q,
    setQuery: setQ,
    page,
    setPage,
    pageSize,
    setPageSize,
    pageCount,
    items,
    total: filtered.length,
  };
}

export default function AdminDashboard({
  authUser,
  activeEmployees,
  pendingEmployees,
  availableAssetsCount,
  borrowedAssetsCount,
  recentBorrows,
}: DashboardProps) {
  const { flash }: any = usePage().props;
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);

  // Flash -> toast
  React.useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
    if (flash?.warning) toast.warning(flash.warning);
    if (flash?.info) toast.info(flash.info);
  }, [flash]);

  const handleLogout = () => {
    router.post(
      "/logout",
      {},
      {
        onStart: () => toast.loading("Keluar dari akun...", { id: "logout" }),
        onSuccess: () => toast.success("Berhasil logout.", { id: "logout" }),
        onError: () => toast.error("Logout gagal.", { id: "logout" }),
        onFinish: () => setIsLogoutDialogOpen(false),
      }
    );
  };

  const approveBorrow = (id: number) => {
    router.post(
      `/admin/borrows/${id}/approve`,
      {},
      {
        onStart: () => toast.loading("Menyetujui peminjaman...", { id: `approve-${id}` }),
        onSuccess: () => toast.success("Peminjaman disetujui.", { id: `approve-${id}` }),
        onError: () => toast.error("Gagal menyetujui peminjaman.", { id: `approve-${id}` }),
      }
    );
  };

  const rejectBorrow = (id: number) => {
    router.post(
      `/admin/borrows/${id}/reject`,
      {},
      {
        onStart: () => toast.loading("Menolak peminjaman...", { id: `reject-${id}` }),
        onSuccess: () => toast.success("Peminjaman ditolak.", { id: `reject-${id}` }),
        onError: () => toast.error("Gagal menolak peminjaman.", { id: `reject-${id}` }),
      }
    );
  };

  const returnBorrow = (id: number) => {
    router.post(
      `/admin/borrows/${id}/return`,
      {},
      {
        onStart: () => toast.loading("Memproses pengembalian...", { id: `return-${id}` }),
        onSuccess: () => toast.success("Aset berhasil dikembalikan.", { id: `return-${id}` }),
        onError: () => toast.error("Gagal memproses pengembalian.", { id: `return-${id}` }),
      }
    );
  };

  // Search + Pagination utk recent borrows
  // Kunci pencarian: status, notes, unit, asset.name, user.name
  const borrowsPaged = usePaged(
    recentBorrows.map((b) => ({
      ...b,
      assetName: b.asset?.name ?? "",
      userName: b.user?.name ?? "",
    })),
    ["status", "notes", "unit", "assetName", "userName"]
  );

  return (
    <div className="min-h-screen space-y-6 bg-white p-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
          {authUser && (
            <p className="mt-1 text-gray-600">
              Selamat datang, <span className="font-semibold">{authUser.name}</span>{" "}
              (<span className="capitalize">{authUser.role}</span>
              {authUser.division && <span> - {authUser.division}</span>})
            </p>
          )}
        </div>

        {/* Logout */}
        <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" onClick={() => setIsLogoutDialogOpen(true)}>
              Logout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Logout</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin keluar dari akun ini?
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex gap-4">
              <Button onClick={() => setIsLogoutDialogOpen(false)} variant="secondary">
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Employees</CardTitle>
          </CardHeader>
        <CardContent>
            <p className="text-3xl font-bold text-green-600">{activeEmployees}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{pendingEmployees}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assets Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{availableAssetsCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assets Borrowed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{borrowedAssetsCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Borrows */}
      <section>
        <div className="mb-4 mt-6 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold">Recent Borrows</h2>
          <div className="grow" />
          <Input
            value={borrowsPaged.query}
            onChange={(e) => borrowsPaged.setQuery(e.target.value)}
            placeholder="Cari (status/catatan/unit/nama aset/nama peminjam)"
            className="h-9 w-full sm:w-[360px]"
          />
          <Select
            value={String(borrowsPaged.pageSize)}
            onValueChange={(v) => borrowsPaged.setPageSize(Number(v))}
          >
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Per halaman" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 25, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} / halaman
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            Total: {borrowsPaged.total}
          </div>
        </div>

        {borrowsPaged.items.length === 0 ? (
          <p className="text-gray-500">Belum ada peminjaman.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {borrowsPaged.items.map((borrow) => (
              <Card key={borrow.id} className="space-y-4 p-4 shadow-lg">
                <div className="space-y-1">
                  <p className="font-semibold">{borrow.asset?.name}</p>
                  <p className="text-sm text-gray-500">Peminjam: {borrow.user?.name}</p>
                  <p className="text-sm text-gray-400">Jumlah: {borrow.quantity}</p>

                  <p className="mt-1 text-sm">
                    Status:{" "}
                    <span
                      className={`rounded px-2 py-1 font-bold text-white ${
                        borrow.status === "approved"
                          ? "bg-green-500"
                          : borrow.status === "pending"
                          ? "bg-yellow-500"
                          : borrow.status === "rejected"
                          ? "bg-red-500"
                          : borrow.status === "returned"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {borrow.status}
                    </span>
                  </p>

                  {borrow.borrow_date && (
                    <p className="text-sm text-gray-400">
                      🕒 Meminjam Pada: {formatDateTime(borrow.borrow_date)}
                    </p>
                  )}
                  {borrow.ended_at && (
                    <p className="text-sm text-gray-400">
                      ⏳ Pengembalian Pada: {formatDateTime(borrow.ended_at)}
                    </p>
                  )}
                  {borrow.approval_date && (
                    <p className="text-sm text-gray-400">
                      ✅ Disetujui Pada: {formatDateTime(borrow.approval_date)}
                    </p>
                  )}

                  {borrow.unit && (
                    <div className="rounded bg-gray-100 p-2 text-sm text-gray-700">
                      <strong>Unit Peminjam:</strong> {borrow.unit}
                    </div>
                  )}

                  {borrow.notes && (
                    <div className="rounded bg-gray-100 p-2 text-sm text-gray-700">
                      <strong>Catatan:</strong> {borrow.notes}
                    </div>
                  )}
                </div>

                <div className="space-x-2">
                  {borrow.status === "pending" && (
                    <>
                      <Button variant="outline" onClick={() => approveBorrow(borrow.id)}>
                        Approve
                      </Button>
                      <Button variant="destructive" onClick={() => rejectBorrow(borrow.id)}>
                        Reject
                      </Button>
                    </>
                  )}
                  {borrow.status === "approved" && (
                    <Button variant="outline" onClick={() => returnBorrow(borrow.id)}>
                      Return
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pager */}
        {borrowsPaged.pageCount > 1 && (
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => borrowsPaged.setPage((p) => Math.max(1, p - 1))}
              disabled={borrowsPaged.page === 1}
            >
              Prev
            </Button>
            <div className="text-sm">
              Hal {borrowsPaged.page} / {borrowsPaged.pageCount}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                borrowsPaged.setPage((p) => Math.min(borrowsPaged.pageCount, p + 1))
              }
              disabled={borrowsPaged.page === borrowsPaged.pageCount}
            >
              Next
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
