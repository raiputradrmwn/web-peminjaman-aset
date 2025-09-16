import React, { useState } from "react";
import { router } from "@inertiajs/react";

interface Asset {
  id: number;
  name: string;
  type: string;
  status: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: string;
  status?: string;
}

interface DashboardProps {
  totalAssets: number;
  totalAdmins: number;
  totalEmployees: number;
  assets: Asset[];
  pendingAdmins: User[];
}

export default function Dashboard({
  totalAssets,
  totalAdmins,
  totalEmployees,
  assets,
  pendingAdmins,
}: DashboardProps) {
  const handleLogout = () => {
    router.post("/logout");
  };

  const approve = (id: number) => {
    router.post(`/superadmin/approvals/${id}/approve`);
  };

  const deny = (id: number) => {
    router.post(`/superadmin/approvals/${id}/deny`);
  };

  // 🔹 State Asset
  const [showAddAssetForm, setShowAddAssetForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("room");
  const [status, setStatus] = useState("available");

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(
      "/superadmin/assets",
      { name, type, status },
      {
        onSuccess: () => {
          setName("");
          setType("room");
          setStatus("available");
          setShowAddAssetForm(false);
        },
      }
    );
  };

  // 🔹 State User
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(
      "/superadmin/users",
      { name: userName, email, role },
      {
        onSuccess: () => {
          setUserName("");
          setEmail("");
          setRole("employee");
          setShowAddUserForm(false);
        },
      }
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage Users, Assets, and Rentals
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white dark:bg-neutral-800 shadow rounded">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Total Assets
          </h2>
          <p className="text-3xl font-bold text-blue-600">{totalAssets}</p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-800 shadow rounded">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Active Admins
          </h2>
          <p className="text-3xl font-bold text-green-600">{totalAdmins}</p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-800 shadow rounded">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Total Employees
          </h2>
          <p className="text-3xl font-bold text-yellow-600">
            {totalEmployees}
          </p>
        </div>
      </div>

      {/* Konten 2 kolom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Kolom kiri - Assets */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Assets</h2>
            {!showAddAssetForm && (
              <button
                onClick={() => setShowAddAssetForm(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                + Tambah Asset
              </button>
            )}
          </div>

          {showAddAssetForm ? (
            <form onSubmit={handleAddAsset} className="space-y-3">
              <input
                type="text"
                placeholder="Nama Aset"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border px-3 py-2 rounded w-full"
                required
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border px-3 py-2 rounded w-full bg-black text-white"
              >
                <option value="room">Room</option>
                <option value="asset">Asset</option>
                <option value="vehicle">Vehicle</option>
                <option value="equipment">Equipment</option>
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border px-3 py-2 rounded w-full bg-black text-white"
              >
                <option value="available">Available</option>
                <option value="borrowed">Borrowed</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAssetForm(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : assets.length === 0 ? (
            <p className="text-gray-500">Belum ada asset</p>
          ) : (
            <ul className="space-y-2">
              {assets.map((asset) => (
                <li
                  key={asset.id}
                  className="p-3 border shadow rounded flex justify-between"
                >
                  <div>
                    <p className="font-bold">{asset.name}</p>
                    <p className="text-sm text-gray-500">{asset.type}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      asset.status === "available"
                        ? "bg-green-500"
                        : asset.status === "borrowed"
                        ? "bg-yellow-500"
                        : asset.status === "maintenance"
                        ? "bg-orange-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {asset.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Kolom kanan - Pending Approvals + Add User */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Pending Approvals</h2>
            {!showAddUserForm && (
              <button
                onClick={() => setShowAddUserForm(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                + Tambah User
              </button>
            )}
          </div>

          {showAddUserForm ? (
            <form onSubmit={handleAddUser} className="space-y-3">
              <input
                type="text"
                placeholder="Nama"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="border px-3 py-2 rounded w-full"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border px-3 py-2 rounded w-full"
                required
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border px-3 py-2 rounded w-full bg-black text-white"
              >
                <option value="superadmin">Superadmin</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUserForm(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : pendingAdmins.length === 0 ? (
            <p className="text-gray-500">Tidak ada admin/employee pending</p>
          ) : (
            <ul className="space-y-4">
              {pendingAdmins.map((admin) => (
                <li
                  key={admin.id}
                  className="p-4 border shadow rounded flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{admin.name}</p>
                    <p className="text-sm text-gray-600">{admin.email}</p>
                    <p className="text-xs text-gray-500">
                      Role: {admin.roles}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => approve(admin.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => deny(admin.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Deny
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
