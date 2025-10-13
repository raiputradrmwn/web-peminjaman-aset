import * as React from "react";
import { router, usePage } from "@inertiajs/react";
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
  notes: string;
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
  });
};

export default function AdminDashboard({
  authUser,
  activeEmployees,
  pendingEmployees,
  availableAssetsCount,
  borrowedAssetsCount,
  availableAssets,
  recentBorrows,
}: DashboardProps) {
  const { flash }: any = usePage().props;
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);

  const handleLogout = () => router.post("/logout");

  const approveBorrow = (id: number) => {
    router.post(`/admin/borrows/${id}/approve`);
  };

  const rejectBorrow = (id: number) => {
    router.post(`/admin/borrows/${id}/reject`);
  };

  const returnBorrow = (id: number) => {
    router.post(`/admin/borrows/${id}/return`);
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
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

        {/* Tombol Logout */}
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
            <div className="flex gap-4 mt-4">
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

      {/* Flash Message */}
      {flash?.success && (
        <div className="bg-green-100 text-green-700 p-3 rounded">
          {flash.success}
        </div>
      )}

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <p className="text-3xl font-bold text-blue-600">
              {availableAssetsCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assets Borrowed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {borrowedAssetsCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Peminjaman Terbaru */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-4">Recent Borrows</h2>
        {recentBorrows.length === 0 ? (
          <p className="text-gray-500">Belum ada peminjaman.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentBorrows.map((borrow) => (
              <Card key={borrow.id} className="space-y-4 p-4 shadow-lg">
                <div className="space-y-1">
                  <p className="font-semibold">{borrow.asset?.name}</p>
                  <p className="text-sm text-gray-500">
                    Peminjam: {borrow.user?.name}
                  </p>
                  <p className="text-sm text-gray-400">Jumlah: {borrow.quantity}</p>

                  {/* ✅ Catatan Peminjaman */}
                  {borrow.notes && (
                    <p className="text-sm text-gray-600 italic">
                      Catatan: “{borrow.notes}”
                    </p>
                  )}

                  {/* Status */}
                  <p className="text-sm mt-1">
                    Status:{" "}
                    <span
                      className={`font-bold px-2 py-1 rounded text-white ${
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

                  {/* Tanggal */}
                  <p className="text-sm text-gray-400">
                    Tanggal Pinjam: {formatDateTime(borrow.created_at)}
                  </p>
                  {borrow.approval_date && (
                    <p className="text-sm text-gray-400">
                      Approval At: {formatDateTime(borrow.approval_date)}
                    </p>
                  )}
                </div>

                {/* Aksi Admin */}
                <div className="space-x-2">
                  {borrow.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => approveBorrow(borrow.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => rejectBorrow(borrow.id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {borrow.status === "approved" && (
                    <Button
                      variant="outline"
                      onClick={() => returnBorrow(borrow.id)}
                    >
                      Return
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
