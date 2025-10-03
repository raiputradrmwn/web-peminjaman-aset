import React from "react";
import { router, useForm, usePage } from "@inertiajs/react";

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

  // Form tambah user (admin hanya bisa tambah employee)
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

  // Form tambah asset
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

  // Approval untuk borrow
  const approveBorrow = (id: number) => {
    router.post(`/admin/borrows/${id}/approve`);
  };

  const rejectBorrow = (id: number) => {
    router.post(`/admin/borrows/${id}/reject`);
  };
    const returnBorrow = (id: number) =>{
    router.post(`/admin/borrows/${id}/return`);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-neutral-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor assets, employees, and borrows
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {flash?.success && (
        <div className="bg-green-100 text-green-700 p-3 rounded">
          {flash.success}
        </div>
      )}

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Active Employees" value={activeEmployees} color="green" />
        <StatCard title="Pending Employees" value={pendingEmployees} color="yellow" />
        <StatCard title="Assets Available" value={availableAssetsCount} color="blue" />
        <StatCard title="Assets Borrowed" value={borrowedAssetsCount} color="red" />
      </div>

      {/* Tambah Employee */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">Tambah Employee</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitUser();
          }}
          className="bg-white dark:bg-neutral-800 p-4 rounded shadow"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={userForm.data.name}
              onChange={(e) => userForm.setData("name", e.target.value)}
              placeholder="Nama"
              className="border p-2 rounded dark:bg-neutral-900"
            />
            <input
              type="email"
              value={userForm.data.email}
              onChange={(e) => userForm.setData("email", e.target.value)}
              placeholder="Email"
              className="border p-2 rounded dark:bg-neutral-900"
            />
          </div>
          <button
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
            disabled={userForm.processing}
          >
            Tambah Employee
          </button>
        </form>
      </section>

      {/* Tambah Asset */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">Tambah Asset</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitAsset();
          }}
          className="bg-white dark:bg-neutral-800 p-4 rounded shadow"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              value={assetForm.data.name}
              onChange={(e) => assetForm.setData("name", e.target.value)}
              placeholder="Nama"
              className="border p-2 rounded dark:bg-neutral-900"
            />
            <select
              value={assetForm.data.type}
              onChange={(e) => assetForm.setData("type", e.target.value)}
              className="border p-2 rounded dark:bg-neutral-900"
            >
              <option value="asset">Asset</option>
              <option value="room">Room</option>
            </select>
            <select
              value={assetForm.data.status}
              onChange={(e) => assetForm.setData("status", e.target.value)}
              className="border p-2 rounded dark:bg-neutral-900"
            >
              <option value="available">Available</option>
              <option value="borrowed">Borrowed</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
            <input
              type="number"
              value={assetForm.data.stock}
              onChange={(e) =>
                assetForm.setData("stock", Number(e.target.value))
              }
              placeholder="Stock"
              className="border p-2 rounded dark:bg-neutral-900"
            />
          </div>
          <button
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
            disabled={assetForm.processing}
          >
            Tambah Asset
          </button>
        </form>
      </section>

      {/* Available Assets */}
      <div>
        <h2 className="text-xl font-bold mt-6 mb-4">Available Assets</h2>
        {availableAssets.length === 0 ? (
          <p className="text-gray-500">No available assets</p>
        ) : (
          <ul className="space-y-2">
            {availableAssets.map((asset) => (
              <li
                key={asset.id}
                className="p-3 border shadow rounded flex justify-between"
              >
                <div>
                  <p className="font-bold">{asset.name}</p>
                  <p className="text-sm text-gray-500">{asset.type}</p>
                </div>
                <span className="px-2 py-1 rounded text-white bg-green-600">
                  {asset.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Semua Employee Sesuai Divisi */}
      <div>
        <h2 className="text-xl font-bold mt-6 mb-4">All Employees (My Division)</h2>
        {users.length === 0 ? (
          <p className="text-gray-500">No employees in your division</p>
        ) : (
          <table className="w-full border-collapse bg-white dark:bg-neutral-800 shadow rounded">
            <thead>
              <tr className="bg-gray-100 dark:bg-neutral-700 text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((emp) => (
                <tr key={emp.id} className="border-t">
                  <td className="p-3">{emp.name}</td>
                  <td className="p-3">{emp.email}</td>
                  <td className="p-3">{emp.role}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        emp.status === "active"
                          ? "bg-green-600"
                          : emp.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-600"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Borrows (dengan Approval) */}
      <div>
        <h2 className="text-xl font-bold mt-6 mb-4">Recent Borrows</h2>
        {recentBorrows.length === 0 ? (
          <p className="text-gray-500">No recent borrows</p>
        ) : (
          <ul className="space-y-2">
            {recentBorrows.map((borrow) => (
              <li
                key={borrow.id}
                className="p-3 border shadow rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{borrow.asset?.name}</p>
                  <p className="text-sm text-gray-500">
                    Borrowed by: {borrow.user?.name}
                  </p>
                  {borrow.approval_date && (
                    <p className="text-xs text-gray-400">
                      Approved at: {borrow.approval_date}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      borrow.status === "approved"
                        ? "bg-green-600"
                        : borrow.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-red-600"
                    }`}
                  >
                    {borrow.status}
                  </span>
                  {borrow.status === "pending" && (
                    <>
                      <button
                        onClick={() => approveBorrow(borrow.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectBorrow(borrow.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {borrow.status === "approved" && (
                      <button
                        onClick={() => returnBorrow(borrow.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Return
                      </button>
                    )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
  };
  return (
    <div className="p-4 bg-white dark:bg-neutral-800 shadow rounded">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
    </div>
  );
}
