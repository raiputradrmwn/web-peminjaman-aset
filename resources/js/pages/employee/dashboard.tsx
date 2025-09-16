import React from "react";
import { router } from "@inertiajs/react";

interface Asset {
  id: number;
  name: string;
  type: string;
  status: string;
}

interface Borrow {
  id: number;
  status: string;
  asset: Asset;
}

interface EmployeeDashboardProps {
  totalApprovedBorrows: number;
  totalPendingBorrows: number;
  totalRejectedBorrows: number;
  availableAssets: Asset[];
  myBorrows: Borrow[];
}

export default function Dashboard({
  totalApprovedBorrows,
  totalPendingBorrows,
  totalRejectedBorrows,
  availableAssets,
  myBorrows,
}: EmployeeDashboardProps) {
  const handleLogout = () => {
    router.post("/logout");
  };

  const handleBorrow = (assetId: number) => {
    router.post("/employee/borrows", { asset_id: assetId } as any);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employee Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white dark:bg-neutral-800 shadow rounded">
          <h2 className="text-lg font-semibold">Approved Borrows</h2>
          <p className="text-3xl font-bold text-green-600">
            {totalApprovedBorrows}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-800 shadow rounded">
          <h2 className="text-lg font-semibold">Pending Borrows</h2>
          <p className="text-3xl font-bold text-yellow-600">
            {totalPendingBorrows}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-800 shadow rounded">
          <h2 className="text-lg font-semibold">Rejected Borrows</h2>
          <p className="text-3xl font-bold text-red-600">
            {totalRejectedBorrows}
          </p>
        </div>
      </div>

      {/* Available Assets & My Borrows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Daftar Available Assets */}
        <div>
          <h2 className="text-xl font-bold mb-3">Available Assets</h2>
          {availableAssets.length === 0 ? (
            <p className="text-gray-500">No available assets.</p>
          ) : (
            <ul className="space-y-2">
              {availableAssets.map((asset) => (
                <li
                  key={asset.id}
                  className="p-3 border shadow rounded flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold">{asset.name}</p>
                    <p className="text-sm text-gray-500">{asset.type}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="px-2 py-1 rounded text-white bg-green-500">
                      {asset.status}
                    </span>
                    <button
                      onClick={() => handleBorrow(asset.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Borrow
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Daftar Borrow Saya */}
        <div>
          <h2 className="text-xl font-bold mb-3">My Borrow History</h2>
          {myBorrows.length === 0 ? (
            <p className="text-gray-500">
              You have not borrowed any assets yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {myBorrows.map((borrow) => (
                <li
                  key={borrow.id}
                  className="p-3 bg-white shadow rounded flex justify-between"
                >
                  <div>
                    <p className="font-bold">{borrow.asset?.name}</p>
                    <p className="text-sm text-gray-500">
                      {borrow.asset?.type}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      borrow.status === "approved"
                        ? "bg-green-500"
                        : borrow.status === "pending"
                        ? "bg-yellow-500"
                        : borrow.status === "returned"
                        ? "bg-blue-500"
                        : "bg-red-500"
                    }`}
                  >
                    {borrow.status}
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
