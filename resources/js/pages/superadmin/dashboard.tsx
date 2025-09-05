// resources/js/pages/superadmin/dashboard.tsx
import React from "react";
import { router } from "@inertiajs/react";

export default function Dashboard() {
  const handleLogout = () => {
    router.post("/logout"); // ini akan memanggil AuthenticatedSessionController@destroy
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Superadmin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
      <p className="mt-4">Selamat datang Superadmin 🎉</p>
    </div>
  );
}
