import * as React from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "lucide-react";


import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

  
  const [approvedBorrows, setApprovedBorrows] = React.useState(totalApprovedBorrows);
  const [pendingBorrows, setPendingBorrows] = React.useState(totalPendingBorrows);
  const [rejectedBorrows, setRejectedBorrows] = React.useState(totalRejectedBorrows);

  
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);

  const handleLogoutClick = () => {
    
    setIsLogoutModalOpen(true);
  };

  const handleLogout = () => {
    
    router.post("/logout");
    setIsLogoutModalOpen(false); 
  };

  const closeModal = () => {
    
    setIsLogoutModalOpen(false);
  };

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
      id: Date.now(),
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Employee Dashboard</h1>
        <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" onClick={handleLogoutClick}>
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
              <Button onClick={closeModal} variant="secondary">
                Cancel
              </Button>
              <Button onClick={handleLogout} variant="destructive">
                Yes, Logout
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>
              <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2 inline" />
              Approved Borrows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{approvedBorrows}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>
              <ClockIcon className="w-6 h-6 text-yellow-500 mr-2 inline" />
              Pending Borrows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{pendingBorrows}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>
              <XCircleIcon className="w-6 h-6 text-red-500 mr-2 inline" />
              Rejected Borrows
            </CardTitle>
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
          <h2 className="text-2xl font-bold mb-3">Available Assets</h2>
          {availableAssetsState.length === 0 ? (
            <p className="text-gray-500">No available assets.</p>
          ) : (
            <ul className="space-y-4">
              {availableAssetsState.map((asset) => {
                const availableStock = getAvailableStock(asset.id);
                return (
                  <li
                    key={asset.id}
                    className="flex justify-between items-center p-4 bg-gray-50 border rounded-lg shadow hover:shadow-md transition-shadow duration-300"
                  >
                    <div>
                      <p className="font-semibold">{asset.name}</p>
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
                        className="w-16 border rounded p-2 text-center"
                        disabled={availableStock <= 0}
                      />
                      <Button
                        onClick={() => handleBorrow(asset.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold mb-3">My Borrow History</h2>
          {myBorrowsState.length === 0 ? (
            <p className="text-gray-500">You have not borrowed any assets yet.</p>
          ) : (
            <ul className="space-y-4">
              {myBorrowsState.map((borrow) => (
                <li
                  key={borrow.id}
                  className="flex justify-between items-center p-4 bg-gray-50 border rounded-lg shadow hover:shadow-md transition-shadow duration-300"
                >
                  <div>
                    <p className="font-semibold">{borrow.asset?.name ?? "Asset deleted"}</p>
                    <p className="text-sm text-gray-500">{borrow.asset?.type ?? "-"}</p>
                    <p className="text-sm text-blue-600">Quantity: {borrow.quantity}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-white ${
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
