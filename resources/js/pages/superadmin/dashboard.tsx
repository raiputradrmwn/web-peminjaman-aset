import React from "react";
import { router, useForm, usePage } from "@inertiajs/react";

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
}

interface DashboardProps {
  activeEmployees?: number;
  pendingEmployees?: number;
  availableAssetsCount?: number;
  borrowedAssetsCount?: number;
  availableAssets?: Asset[];
  recentBorrows?: Borrow[];
  users?: User[];
  assets?: Asset[];
}

export default function SuperadminDashboard({
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

  // === Logout ===
  const handleLogout = () => {
    if (confirm("Yakin ingin logout?")) {
      router.post("/logout");
    }
  };

  // === Form tambah user ===
  const userForm = useForm({
    name: "",
    email: "",
    role: "employee",
    division: "",
  });

  const submitUser = () => {
    userForm.post("/superadmin/users", {
      onSuccess: () => userForm.reset(),
    });
  };

  const deleteUser = (id: number) => {
    if (confirm("Yakin hapus user ini?")) {
      router.delete(`/superadmin/users/${id}`);
    }
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
      onSuccess: () => assetForm.reset(),
    });
  };

  const deleteAsset = (id: number) => {
    if (confirm("Yakin hapus asset ini?")) {
      router.delete(`/superadmin/assets/${id}`);
    }
  };

  // === Borrow actions ===
  const approveBorrow = (id: number) =>
    router.post(`/superadmin/borrows/${id}/approve`);
  const rejectBorrow = (id: number) =>
    router.post(`/superadmin/borrows/${id}/reject`);
  const returnBorrow = (id: number) =>
    router.post(`/superadmin/borrows/${id}/return`);

  return (
    <div className="p-6 space-y-10 bg-gray-50 dark:bg-neutral-900 min-h-screen">
      {/* Header + Logout */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Superadmin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage Users, Assets, and Borrows
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
        <StatCard title="Available Asset" value={availableAssetsCount} color="blue" />
        <StatCard title="Borrowed Quantity" value={borrowedAssetsCount} color="red" />
      </div>

      {/* User Management */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Users
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitUser();
          }}
          className="bg-gray-50 dark:bg-neutral-800 p-4 rounded mb-6"
        >
          <h3 className="font-semibold mb-2">Tambah User</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              value={userForm.data.name}
              onChange={(e) => userForm.setData("name", e.target.value)}
              placeholder="Nama"
              className="border p-2 rounded dark:bg-neutral-900 bg-gray-50"
            />
            <input
              type="email"
              value={userForm.data.email}
              onChange={(e) => userForm.setData("email", e.target.value)}
              placeholder="Email"
              className="border p-2 rounded dark:bg-neutral-900 bg-gray-50"
            />
            <select
              value={userForm.data.role}
              onChange={(e) => userForm.setData("role", e.target.value)}
              className="border p-2 rounded dark:bg-neutral-900 bg-gray-50"
            >
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </select>
            <input
              type="text"
              value={userForm.data.division}
              onChange={(e) => userForm.setData("division", e.target.value)}
              placeholder="Division"
              className="border p-2 rounded dark:bg-neutral-900 bg-gray-50"
            />
          </div>
          <button
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
            disabled={userForm.processing}
          >
            Tambah User
          </button>
        </form>

        <table className="min-w-full border">
          <thead className="bg-gray-100 dark:bg-neutral-700">
            <tr>
              <th className="border px-3 py-2">Nama</th>
              <th className="border px-3 py-2">Email</th>
              <th className="border px-3 py-2">Role</th>
              <th className="border px-3 py-2">Division</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <tr key={u.id}>
                <td className="border px-3 py-2">{u.name}</td>
                <td className="border px-3 py-2">{u.email}</td>
                <td className="border px-3 py-2">{u.role}</td>
                <td className="border px-3 py-2">{u.division}</td>
                <td className="border px-3 py-2">{u.status}</td>
                <td className="border px-3 py-2">
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Asset Management */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Assets
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitAsset();
          }}
          className="bg-gray-50 dark:bg-neutral-800 p-4 rounded mb-6"
        >
          <h3 className="font-semibold mb-2">Tambah Asset</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              value={assetForm.data.name}
              onChange={(e) => assetForm.setData("name", e.target.value)}
              placeholder="Nama"
              className="border p-2 rounded dark:bg-neutral-900 bg-gray-50"
            />
            <select
              value={assetForm.data.type}
              onChange={(e) => assetForm.setData("type", e.target.value)}
              className="border p-2 rounded dark:bg-neutral-900 bg-gray-50"
            >
              <option value="asset">Asset</option>
              <option value="room">Room</option>
            </select>
            <select
              value={assetForm.data.status}
              onChange={(e) => assetForm.setData("status", e.target.value)}
              className="border p-2 rounded dark:bg-neutral-900 bg-gray-50"
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
              className="border p-2 rounded dark:bg-neutral-900 bg-gray-50"
            />
          </div>
          <button
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
            disabled={assetForm.processing}
          >
            Tambah Asset
          </button>
        </form>

        <table className="min-w-full border">
          <thead className="bg-gray-100 dark:bg-neutral-700">
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
            {(assets ?? []).map((a) => (
              <tr key={a.id}>
                <td className="border px-3 py-2">{a.serial_number}</td>
                <td className="border px-3 py-2">{a.name}</td>
                <td className="border px-3 py-2">{a.type}</td>
                <td className="border px-3 py-2">{a.status}</td>
                <td className="border px-3 py-2">{a.stock}</td>
                <td className="border px-3 py-2">
                  <button
                    onClick={() => deleteAsset(a.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Recent Borrows */}
      <section>
        <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800 dark:text-white">
          Recent Borrows
        </h2>
        {(recentBorrows ?? []).length === 0 ? (
          <p className="text-gray-500">Belum ada peminjaman.</p>
        ) : (
          <ul className="space-y-4">
            {(recentBorrows ?? []).map((borrow) => (
              <li
                key={borrow.id}
                className="p-4 border rounded shadow dark:bg-neutral-800"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{borrow.asset.name}</p>
                    <p className="text-sm text-gray-500">
                      Peminjam: {borrow.user.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      Jumlah: {borrow.quantity}
                    </p>
                    <p className="text-sm text-gray-400">
                      Status: {borrow.status}
                    </p>
                  </div>
                  <div className="space-x-2">
                    {borrow.status === "pending" && (
                      <>
                        <button
                          onClick={() => approveBorrow(borrow.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectBorrow(borrow.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded"
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// Reusable StatCard
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
    <div className="p-6 bg-white dark:bg-neutral-800 shadow rounded-lg">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
        {title}
      </h2>
      <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
    </div>
  );
}
