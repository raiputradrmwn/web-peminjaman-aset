import * as React from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface Asset {
  id: number;
  name: string;
  type: string;
  status: string;
  stock: number;
}

interface Borrow {
  id: number;
  status: "pending" | "approved" | "rejected" | "returned";
  quantity: number;
  asset?: Asset | null;
  notes?: string;
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
  const [quantities, setQuantities] = React.useState<{ [key: number]: number }>({});
  const [availableAssetsState] = React.useState(availableAssets);
  const [myBorrowsState, setMyBorrowsState] = React.useState(myBorrows);

  // Add states for total borrow counts
  const [approvedBorrows, setApprovedBorrows] = React.useState(totalApprovedBorrows);
  const [pendingBorrows, setPendingBorrows] = React.useState(totalPendingBorrows);
  const [rejectedBorrows, setRejectedBorrows] = React.useState(totalRejectedBorrows);

  const handleLogout = () => {
    router.post("/logout");
  };

  // Hitung stok yang benar dengan mengurangi borrow pending/approved
  const getAvailableStock = (assetId: number) => {
    const borrowedQty = myBorrowsState
      .filter(
        (b) =>
          b.asset?.id === assetId &&
          (b.status === "pending" || b.status === "approved")
      )
      .reduce((sum, b) => sum + b.quantity, 0);

    const asset = availableAssetsState.find((a) => a.id === assetId);
    return asset ? asset.stock - borrowedQty : 0;
  };

  const handleBorrow = (assetId: number) => {
    const quantity = quantities[assetId] || 1;
    const availableStock = getAvailableStock(assetId);

    if (quantity > availableStock) {
      alert("Stok tidak mencukupi untuk melakukan peminjaman.");
      return;
    }

    const newBorrow: Borrow = {
      id: Date.now(), // sementara untuk optimistic UI
      status: "pending",
      quantity,
      asset: availableAssetsState.find((asset) => asset.id === assetId) ?? null,
    };

    setMyBorrowsState((prevBorrows) => [...prevBorrows, newBorrow]);
    setPendingBorrows((prev) => prev + 1);

    router.post(
      "/employee/borrows",
      {
        asset_id: assetId,
        quantity,
      },
      {
        onSuccess: () => {
          setMyBorrowsState((prevBorrows) =>
            prevBorrows.map((borrow) =>
              borrow.id === newBorrow.id ? { ...borrow, status: "approved" } : borrow
            )
          );
          setApprovedBorrows((prev) => prev + 1);
          setPendingBorrows((prev) => prev - 1);
        },
        onError: () => {
          // rollback kalau gagal
          setMyBorrowsState((prevBorrows) =>
            prevBorrows.filter((borrow) => borrow.id !== newBorrow.id)
          );
          setPendingBorrows((prev) => prev - 1);
        },
      }
    );
  };

  const handleQuantityChange = (assetId: number, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [assetId]: value,
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employee Dashboard</h1>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Approved Borrows</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{approvedBorrows}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Borrows</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{pendingBorrows}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rejected Borrows</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{rejectedBorrows}</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Assets & My Borrows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Available Assets */}
        <div>
          <h2 className="text-xl font-bold mb-3">Available Assets</h2>
          {availableAssetsState.length === 0 ? (
            <p className="text-gray-500">No available assets.</p>
          ) : (
            <ul className="space-y-2">
              {availableAssetsState.map((asset) => {
                const availableStock = getAvailableStock(asset.id);
                return (
                  <li
                    key={asset.id}
                    className="p-3 border shadow rounded flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold">{asset.name}</p>
                      <p className="text-sm text-gray-500">{asset.type}</p>
                      <p className="text-sm text-green-600">
                        Stock: {availableStock}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        min={1}
                        max={availableStock}
                        value={quantities[asset.id] || 1}
                        onChange={(e) =>
                          handleQuantityChange(asset.id, parseInt(e.target.value))
                        }
                        className="w-16 border rounded p-1 text-center"
                        disabled={availableStock <= 0}
                      />
                      <Button
                        onClick={() => handleBorrow(asset.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        disabled={availableStock <= 0}
                      >
                        Borrow
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* My Borrow History */}
        <div>
          <h2 className="text-xl font-bold mb-3">My Borrow History</h2>
          {myBorrowsState.length === 0 ? (
            <p className="text-gray-500">You have not borrowed any assets yet.</p>
          ) : (
            <ul className="space-y-2">
              {myBorrowsState.map((borrow) => (
                <li
                  key={borrow.id}
                  className="p-3 border shadow rounded flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold">{borrow.asset?.name ?? "Asset deleted"}</p>
                    <p className="text-sm text-gray-500">{borrow.asset?.type ?? "-"}</p>
                    <p className="text-sm text-blue-600">Quantity: {borrow.quantity}</p>
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
