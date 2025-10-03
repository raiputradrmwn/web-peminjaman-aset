import * as React from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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

      {/* Add Employee Form */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">Add Employee</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitUser();
          }}
          className="bg-white p-4 rounded shadow"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={userForm.data.name}
              onChange={(e) => userForm.setData("name", e.target.value)}
              placeholder="Name"
              required
            />
            <Input
              type="email"
              value={userForm.data.email}
              onChange={(e) => userForm.setData("email", e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <Button type="submit" className="mt-3" disabled={userForm.processing}>
            Add Employee
          </Button>
        </form>
      </section>

      {/* Add Asset Form */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">Add Asset</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitAsset();
          }}
          className="bg-white p-4 rounded shadow"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              value={assetForm.data.name}
              onChange={(e) => assetForm.setData("name", e.target.value)}
              placeholder="Asset Name"
              required
            />
            <Select value={assetForm.data.type} onValueChange={(value) => assetForm.setData("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asset">Asset</SelectItem>
                <SelectItem value="room">Room</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assetForm.data.status} onValueChange={(value) => assetForm.setData("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="borrowed">Borrowed</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={assetForm.data.stock}
              onChange={(e) => assetForm.setData("stock", Number(e.target.value))}
              placeholder="Stock"
              required
            />
          </div>
          <Button type="submit" className="mt-3" disabled={assetForm.processing}>
            Add Asset
          </Button>
        </form>
      </section>

      {/* Available Assets */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-4">Available Assets</h2>
        {availableAssets.length === 0 ? (
          <p>No available assets</p>
        ) : (
          <ul className="space-y-4">
            {availableAssets.map((asset) => (
              <li key={asset.id} className="p-4 border rounded shadow">
                <div>
                  <p className="font-semibold">{asset.name}</p>
                  <p className="text-sm text-gray-500">{asset.type}</p>
                  <p className="text-sm text-green-600">Stock: {asset.stock}</p>
                </div>
                <span className="px-2 py-1 text-white bg-green-600 rounded">{asset.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent Borrows */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-4">Recent Borrows</h2>
        {recentBorrows.length === 0 ? (
          <p>No recent borrows</p>
        ) : (
          <ul className="space-y-4">
            {recentBorrows.map((borrow) => (
              <li key={borrow.id} className="p-4 border rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold">{borrow.asset?.name}</p>
                  <p className="text-sm text-gray-500">Borrowed by: {borrow.user?.name}</p>
                  {borrow.approval_date && (
                    <p className="text-xs text-gray-400">Approved at: {borrow.approval_date}</p>
                  )}
                </div>
                <div className="space-x-2">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      borrow.status === "approved"
                        ? "bg-green-600"
                        : borrow.status === "pending"
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    }`}
                  >
                    {borrow.status}
                  </span>
                  {borrow.status === "pending" && (
                    <>
                      <Button variant="outline" onClick={() => approveBorrow(borrow.id)}>
                        Approve
                      </Button>
                      <Button variant="outline" onClick={() => rejectBorrow(borrow.id)}>
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
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
