import * as React from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
}

interface Borrow {
  id: number;
  status: string;
  user: User;
  asset: Asset;
  approval_date?: string;
  created_at: string;
  quantity: number;
}

interface DashboardProps {
  activeEmployees: number;
  pendingEmployees: number;
  availableAssetsCount: number;
  borrowedAssetsCount: number;
  availableAssets: Asset[];
  recentBorrows: Borrow[];
  users?: User[];
  assets?: Asset[];
}

// Helper untuk format tanggal & waktu
const formatDateTime = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // 24 jam
  });
};

export default function AdminDashboard({
  activeEmployees,
  pendingEmployees,
  availableAssetsCount,
  borrowedAssetsCount,
  availableAssets,
  recentBorrows,
  users = [],
  assets = [],
}: DashboardProps) {
  const { flash }: any = usePage().props;

  // Logout
  const handleLogout = () => {
    router.post("/logout");
  };

  // Form to add user (admin can only add employee)
  const userForm = useForm({
    name: "",
    email: "",
    role: "employee",
  });

  const submitUser = () => {
    userForm.post("/admin/users", {
      onSuccess: () => userForm.reset(),
    });
  };

  // Form to add asset
  const assetForm = useForm({
    name: "",
    type: "asset",
    status: "available",
    stock: 1,
  });

  const submitAsset = () => {
    assetForm.post("/admin/assets", {
      onSuccess: () => assetForm.reset(),
    });
  };

  // Approval actions for borrow
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
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {flash?.success && (
        <div className="bg-green-100 text-green-700 p-3 rounded">
          {flash.success}
        </div>
      )}

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {activeEmployees}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">
              {pendingEmployees}
            </p>
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

      {/* Recent Borrows */}
      {/* Recent Borrows */}
        <section>
        <h2 className="text-xl font-semibold mt-6 mb-4">Recent Borrows</h2>
        {recentBorrows.length === 0 ? (
            <p className="text-gray-500">Belum ada peminjaman.</p>
        ) : (
            <ul className="space-y-4">
            {recentBorrows.map((borrow) => (
                <li
                key={borrow.id}
                className="p-4 border rounded shadow flex justify-between items-center"
                >
                <div>
                    <p className="font-semibold">{borrow.asset?.name}</p>
                    <p className="text-sm text-gray-500">
                    Peminjam: {borrow.user.name}
                    </p>
                    <p className="text-sm text-gray-400">
                    Jumlah: {borrow.quantity}
                    </p>

                    {/* Status dengan badge */}
                    <p className="text-sm mt-1">
                    Status:{' '}
                    <span
                        className={`font-bold px-2 py-1 rounded text-white ${
                        borrow.status === 'approved'
                            ? 'bg-green-600'
                            : borrow.status === 'pending'
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }`}
                    >
                        {borrow.status}
                    </span>
                    </p>

                    {/* Tanggal pinjam */}
                    <p className="text-sm text-gray-400">
                    Tanggal Pinjam:{' '}
                    {new Date(borrow.created_at).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                    }).replace(' pukul', ' pukul')}
                    </p>

                    {/* Approval date kalau ada */}
                    {borrow.approval_date && (
                    <p className="text-sm text-gray-400">
                        Approval At:{' '}
                        {new Date(borrow.approval_date).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                        })}
                    </p>
                    )}
                </div>

                {/* Actions */}
                <div className="space-x-2">
                    {borrow.status === 'pending' && (
                    <>
                        <Button
                        variant="outline"
                        onClick={() => approveBorrow(borrow.id)}
                        >
                        Approve
                        </Button>
                        <Button
                        variant="outline"
                        onClick={() => rejectBorrow(borrow.id)}
                        >
                        Reject
                        </Button>
                    </>
                    )}
                    {borrow.status === 'approved' && (
                    <Button
                        variant="outline"
                        onClick={() => returnBorrow(borrow.id)}
                    >
                        Return
                    </Button>
                    )}
                </div>
                </li>
            ))}
            </ul>
        )}
        </section>
    </div>
  );
}
