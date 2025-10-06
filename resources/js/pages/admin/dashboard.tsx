import * as React from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  division: string;
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
  authUser?: User;
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
  users = [],
  assets = [],
}: DashboardProps) {
  const { flash }: any = usePage().props;

  
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);

  const handleLogout = () => {
    router.post("/logout");
  };

  const openLogoutDialog = () => {
    setIsLogoutDialogOpen(true);
  };

  const closeLogoutDialog = () => {
    setIsLogoutDialogOpen(false);
  };

  
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
          {authUser && (
            <p className="mt-1 text-gray-600">
              Selamat datang, <span className="font-semibold">{authUser.name}</span> (
              <span className="capitalize">{authUser.role}</span>
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
              <DialogTitle>Logout Confirmation</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Are you sure you want to log out?
            </DialogDescription>
            <div className="flex gap-4">
              <Button onClick={closeLogoutDialog} variant="secondary">
                Cancel
              </Button>
              <Button onClick={handleLogout} variant="destructive">
                Yes, Logout
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {flash?.success && (
        <div className="bg-green-100 text-green-700 p-3 rounded">
          {flash.success}
        </div>
      )}
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
                  <p className="text-sm text-gray-500">Peminjam: {borrow.user.name}</p>
                  <p className="text-sm text-gray-400">Jumlah: {borrow.quantity}</p>

                  {/* Status with badge */}
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
                          : "bg-gray-500" // Default color for unexpected statuses
                      }`}
                    >
                      {borrow.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Tanggal Pinjam:{" "}
                    {new Date(borrow.created_at).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </p>

                  {/* Approval date if available */}
                  {borrow.approval_date && (
                    <p className="text-sm text-gray-400">
                      Approval At:{" "}
                      {new Date(borrow.approval_date).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })}
                    </p>
                  )}
                </div>

                {/* Actions */}
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
                    <Button variant="outline" onClick={() => returnBorrow(borrow.id)}>
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
