// resources/js/pages/superadmin/dashboard.tsx
"use client";

import * as React from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { Toaster, toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Asset {
  id: number;
  serial_number: string;
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
  quantity: number;
  user: User;
  asset: Asset;
  approval_date?: string;
  created_at: string;
  notes: string;
  borrow_date?: string;
  ended_at?: string;
  unit?: string;
}

interface DashboardProps {
  authUser?: User;
  activeEmployees?: number;
  pendingEmployees?: number;
  availableAssetsCount?: number;
  borrowedAssetsCount?: number;
  availableAssets?: Asset[];
  recentBorrows?: Borrow[];
  users?: User[];
  assets?: Asset[];
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

export default function SuperadminDashboard({
  authUser,
  activeEmployees = 0,
  pendingEmployees = 0,
  availableAssetsCount = 0,
  borrowedAssetsCount = 0,
  availableAssets = [],
  recentBorrows = [],
  users = [],
  assets = [],
}: DashboardProps) {
  const { flash }: any = usePage().props;

  // === Toast flash dari server (success/error/warning/info) ===
  React.useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
    if (flash?.warning) toast.warning(flash.warning);
    if (flash?.info) toast.info(flash.info);
  }, [flash]);

  // === Logout ===
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);
  const openLogoutDialog = () => setIsLogoutDialogOpen(true);
  const closeLogoutDialog = () => setIsLogoutDialogOpen(false);

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

  // === Form tambah user ===
  const userForm = useForm({
    name: "",
    email: "",
    role: "",
    division: "",
  });

  const submitUser = () => {
    userForm.post("/superadmin/users", {
      onStart: () => toast.loading("Menyimpan user...", { id: "save-user" }),
      onSuccess: () => {
        toast.success("User berhasil ditambahkan.", { id: "save-user" });
        userForm.reset();
      },
      onError: (errs: any) => {
        toast.error("Gagal menambah user.", { id: "save-user" });
        // Opsional: tampilkan error field
        Object.values(errs || {}).forEach((msg: any) => msg && toast.error(String(msg)));
      },
    });
  };

  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = React.useState(false);
  const [deleteUserId, setDeleteUserId] = React.useState<number | null>(null);

  const deleteUser = (id: number) => {
    setDeleteUserId(id);
    setIsDeleteUserDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (deleteUserId === null) return;
    router.delete(`/superadmin/users/${deleteUserId}`, {
      onStart: () => toast.loading("Menghapus user...", { id: `del-user-${deleteUserId}` }),
      onSuccess: () => toast.success("User dihapus.", { id: `del-user-${deleteUserId}` }),
      onError: () => toast.error("Gagal menghapus user.", { id: `del-user-${deleteUserId}` }),
      onFinish: () => setIsDeleteUserDialogOpen(false),
    });
  };

  // === Form tambah asset ===
  const assetForm = useForm({
    name: "",
    type: "asset",
    status: "available",
    stock: 1,
  });

  const submitAsset = () => {
    assetForm.post("/superadmin/assets", {
      onStart: () => toast.loading("Menyimpan aset...", { id: "save-asset" }),
      onSuccess: () => {
        toast.success("Aset berhasil ditambahkan.", { id: "save-asset" });
        assetForm.reset();
      },
      onError: (errs: any) => {
        toast.error("Gagal menambah aset.", { id: "save-asset" });
        Object.values(errs || {}).forEach((msg: any) => msg && toast.error(String(msg)));
      },
    });
  };

  const [isDeleteAssetDialogOpen, setIsDeleteAssetDialogOpen] = React.useState(false);
  const [deleteAssetId, setDeleteAssetId] = React.useState<number | null>(null);

  const deleteAsset = (id: number) => {
    setDeleteAssetId(id);
    setIsDeleteAssetDialogOpen(true);
  };

  const confirmDeleteAsset = () => {
    if (deleteAssetId === null) return;
    router.delete(`/superadmin/assets/${deleteAssetId}`, {
      onStart: () => toast.loading("Menghapus aset...", { id: `del-asset-${deleteAssetId}` }),
      onSuccess: () => toast.success("Aset dihapus.", { id: `del-asset-${deleteAssetId}` }),
      onError: () => toast.error("Gagal menghapus aset.", { id: `del-asset-${deleteAssetId}` }),
      onFinish: () => setIsDeleteAssetDialogOpen(false),
    });
  };

  // === Borrow actions ===
  const approveBorrow = (id: number) =>
    router.post(
      `/superadmin/borrows/${id}/approve`,
      {},
      {
        onStart: () => toast.loading("Menyetujui peminjaman...", { id: `approve-${id}` }),
        onSuccess: () => toast.success("Peminjaman disetujui.", { id: `approve-${id}` }),
        onError: () => toast.error("Gagal menyetujui peminjaman.", { id: `approve-${id}` }),
      }
    );

  const rejectBorrow = (id: number) =>
    router.post(
      `/superadmin/borrows/${id}/reject`,
      {},
      {
        onStart: () => toast.loading("Menolak peminjaman...", { id: `reject-${id}` }),
        onSuccess: () => toast.success("Peminjaman ditolak.", { id: `reject-${id}` }),
        onError: () => toast.error("Gagal menolak peminjaman.", { id: `reject-${id}` }),
      }
    );

  const returnBorrow = (id: number) =>
    router.post(
      `/superadmin/borrows/${id}/return`,
      {},
      {
        onStart: () => toast.loading("Memproses pengembalian...", { id: `return-${id}` }),
        onSuccess: () => toast.success("Aset dikembalikan.", { id: `return-${id}` }),
        onError: () => toast.error("Gagal memproses pengembalian.", { id: `return-${id}` }),
      }
    );

  // === Search & Pagination utilities ===
  const usePaged = <T,>(source: T[], keys: (keyof T)[]) => {
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
    const pageItems = filtered.slice(start, start + pageSize);

    // reset ke page 1 kalau query/pageSize berubah
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
      items: pageItems,
      total: filtered.length,
    };
  };

  const usersPaged = usePaged(users, ["name", "email", "role", "division", "status"]);
  const assetsPaged = usePaged(assets, ["serial_number", "name", "type", "status"]);
  const borrowsPaged = usePaged(recentBorrows, ["status", "notes", "unit"]);

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Superadmin</h1>
          {authUser && (
            <p className="mt-1 text-gray-600">
              Selamat datang, <span className="font-semibold">{authUser.name}</span>{" "}
              (<span className="capitalize">{authUser.role}</span>
              {authUser.division && <span> - {authUser.division}</span>})
            </p>
          )}
        </div>

        <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" onClick={openLogoutDialog}>
              Logout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Logout</DialogTitle>
            </DialogHeader>
            <DialogDescription>Apakah Anda yakin ingin keluar?</DialogDescription>
            <div className="flex gap-4">
              <Button onClick={closeLogoutDialog} variant="secondary">
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard title="Karyawan Aktif" value={activeEmployees} color="green" />
        <StatCard title="Menunggu Persetujuan" value={pendingEmployees} color="yellow" />
        <StatCard title="Aset Tersedia" value={availableAssetsCount} color="blue" />
        <StatCard title="Aset Dipinjam" value={borrowedAssetsCount} color="red" />
      </div>

      {/* User Management */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Manajemen Pengguna</h2>

        {/* Tambah user */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitUser();
          }}
          className="mb-6 rounded bg-white p-4 shadow"
        >
          <h3 className="mb-2 font-semibold">Tambah User Baru</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Input
              value={userForm.data.name}
              onChange={(e) => userForm.setData("name", e.target.value)}
              placeholder="Nama"
            />
            <Input
              type="email"
              value={userForm.data.email}
              onChange={(e) => userForm.setData("email", e.target.value)}
              placeholder="Email"
            />
            <Select
              value={userForm.data.role}
              onValueChange={(value) => userForm.setData("role", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Role</SelectLabel>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Input
              type="text"
              value={userForm.data.division}
              onChange={(e) => userForm.setData("division", e.target.value)}
              placeholder="Divisi"
            />
          </div>
          <Button type="submit" className="mt-3" disabled={userForm.processing}>
            Tambah User
          </Button>
        </form>

        {/* Toolbar Users: Search + Page size */}
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <Input
            value={usersPaged.query}
            onChange={(e) => usersPaged.setQuery(e.target.value)}
            placeholder="Cari user (nama/email/role/divisi)"
            className="h-9 w-full sm:w-[320px]"
          />
          <Select
            value={String(usersPaged.pageSize)}
            onValueChange={(v) => usersPaged.setPageSize(Number(v))}
          >
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Per halaman" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} / halaman
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            Total: {usersPaged.total}
          </div>
        </div>

        {/* Tabel Users (paged) */}
        <div className="overflow-x-auto rounded bg-white shadow">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2">Nama</th>
                <th className="border px-3 py-2">Email</th>
                <th className="border px-3 py-2">Role</th>
                <th className="border px-3 py-2">Divisi</th>
                <th className="border px-3 py-2">Status</th>
                <th className="border px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {usersPaged.items.map((u) => (
                <tr key={u.id}>
                  <td className="border px-3 py-2">{u.name}</td>
                  <td className="border px-3 py-2">{u.email}</td>
                  <td className="border px-3 py-2 capitalize">{u.role}</td>
                  <td className="border px-3 py-2">{u.division ?? "-"}</td>
                  <td className="border px-3 py-2">{u.status}</td>
                  <td className="border px-3 py-2 text-center">
                    <Button variant="destructive" onClick={() => deleteUser(u.id)}>
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
              {usersPaged.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-muted-foreground">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pager Users simple */}
        {usersPaged.pageCount > 1 && (
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => usersPaged.setPage((p) => Math.max(1, p - 1))}
              disabled={usersPaged.page === 1}
            >
              Prev
            </Button>
            <div className="text-sm">
              Hal {usersPaged.page} / {usersPaged.pageCount}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                usersPaged.setPage((p) => Math.min(usersPaged.pageCount, p + 1))
              }
              disabled={usersPaged.page === usersPaged.pageCount}
            >
              Next
            </Button>
          </div>
        )}
      </section>

      {/* Asset Management */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Manajemen Aset</h2>

        {/* Tambah aset */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitAsset();
          }}
          className="mb-6 rounded bg-white p-4 shadow"
        >
          <h3 className="mb-2 font-semibold">Tambah Aset</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Input
              value={assetForm.data.name}
              onChange={(e) => assetForm.setData("name", e.target.value)}
              placeholder="Nama"
            />
            <Select
              value={assetForm.data.type}
              onValueChange={(value) => assetForm.setData("type", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipe Aset" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="room">Room</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={assetForm.data.status}
              onValueChange={(value) => assetForm.setData("status", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status Aset" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="borrowed">Borrowed</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={assetForm.data.stock}
              onChange={(e) =>
                assetForm.setData(
                  "stock",
                  Number(e.target.value.replace(/^0+/, "")) || 0
                )
              }
              placeholder="Stock"
            />
          </div>
          <Button type="submit" className="mt-3" disabled={assetForm.processing}>
            Tambah Aset
          </Button>
        </form>

        {/* Toolbar Assets */}
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <Input
            value={assetsPaged.query}
            onChange={(e) => assetsPaged.setQuery(e.target.value)}
            placeholder="Cari aset (serial/nama/tipe/status)"
            className="h-9 w-full sm:w-[320px]"
          />
          <Select
            value={String(assetsPaged.pageSize)}
            onValueChange={(v) => assetsPaged.setPageSize(Number(v))}
          >
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Per halaman" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} / halaman
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            Total: {assetsPaged.total}
          </div>
        </div>

        {/* Tabel Assets (paged) */}
        <div className="overflow-x-auto rounded bg-white shadow">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2">Serial</th>
                <th className="border px-3 py-2">Nama</th>
                <th className="border px-3 py-2">Tipe</th>
                <th className="border px-3 py-2">Status</th>
                <th className="border px-3 py-2">Stock</th>
                <th className="border px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {assetsPaged.items.map((a) => (
                <tr key={a.id}>
                  <td className="border px-3 py-2">{a.serial_number}</td>
                  <td className="border px-3 py-2">{a.name}</td>
                  <td className="border px-3 py-2">{a.type}</td>
                  <td className="border px-3 py-2 capitalize">{a.status}</td>
                  <td className="border px-3 py-2">{a.stock}</td>
                  <td className="border px-3 py-2 text-center">
                    <Button variant="destructive" onClick={() => deleteAsset(a.id)}>
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
              {assetsPaged.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-muted-foreground">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pager Assets */}
        {assetsPaged.pageCount > 1 && (
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => assetsPaged.setPage((p) => Math.max(1, p - 1))}
              disabled={assetsPaged.page === 1}
            >
              Prev
            </Button>
            <div className="text-sm">
              Hal {assetsPaged.page} / {assetsPaged.pageCount}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                assetsPaged.setPage((p) => Math.min(assetsPaged.pageCount, p + 1))
              }
              disabled={assetsPaged.page === assetsPaged.pageCount}
            >
              Next
            </Button>
          </div>
        )}
      </section>

      {/* Recent Borrows */}
      <section>
        <h2 className="mt-8 mb-4 text-xl font-semibold text-gray-800">Peminjaman Terbaru</h2>

        {/* Toolbar Borrows */}
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <Input
            value={borrowsPaged.query}
            onChange={(e) => borrowsPaged.setQuery(e.target.value)}
            placeholder="Cari (status/catatan/unit)"
            className="h-9 w-full sm:w-[320px]"
          />
          <Select
            value={String(borrowsPaged.pageSize)}
            onValueChange={(v) => borrowsPaged.setPageSize(Number(v))}
          >
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Per halaman" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} / halaman
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">Total: {borrowsPaged.total}</div>
        </div>

        {borrowsPaged.items.length === 0 ? (
          <p className="text-gray-500">Belum ada peminjaman.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {borrowsPaged.items.map((borrow) => (
              <Card key={borrow.id} className="space-y-4 p-4 shadow-lg">
                <CardHeader className="p-0">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-800">{borrow.asset.name}</p>
                    <p className="text-sm text-gray-500">Peminjam: {borrow.user.name}</p>
                    <p className="text-sm text-gray-400">Jumlah: {borrow.quantity}</p>
                    <p className="text-sm">
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
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 p-0 pt-2">
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
                </CardContent>

                <div className="flex items-center justify-between">
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
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pager Borrows */}
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

      {/* Delete Dialog: User */}
      <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pengguna</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus pengguna ini?
          </DialogDescription>
          <div className="flex gap-4">
            <Button onClick={() => setIsDeleteUserDialogOpen(false)} variant="secondary">
              Batal
            </Button>
            <Button onClick={confirmDeleteUser} variant="destructive">
              Ya, Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog: Asset */}
      <Dialog open={isDeleteAssetDialogOpen} onOpenChange={setIsDeleteAssetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Aset</DialogTitle>
          </DialogHeader>
          <DialogDescription>Apakah Anda yakin ingin menghapus aset ini?</DialogDescription>
          <div className="flex gap-4">
            <Button onClick={() => setIsDeleteAssetDialogOpen(false)} variant="secondary">
              Batal
            </Button>
            <Button onClick={confirmDeleteAsset} variant="destructive">
              Ya, Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Reusable StatCard
function StatCard({ title, value, color }: { title: string; value: number; color: "blue"|"green"|"yellow"|"red" }) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
  };
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
