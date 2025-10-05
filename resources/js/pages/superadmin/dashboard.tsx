import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router, useForm, usePage } from '@inertiajs/react';
import * as React from 'react';
// Import Dialog components from ShadCN UI

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
    approval_date?: string;
    created_at: string;
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

    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);
    // === Logout ===
    const handleLogout = () => {
        router.post('/logout');
    };

    const openLogoutDialog = () => {
        setIsLogoutDialogOpen(true);
    };

    const closeLogoutDialog = () => {
        setIsLogoutDialogOpen(false);
    };
    // === Form tambah user ===
    const userForm = useForm({
        name: '',
        email: '',
        role: 'employee',
        division: '',
    });

    const submitUser = () => {
        userForm.post('/superadmin/users', {
            onSuccess: () => userForm.reset(),
        });
    };

    const deleteUser = (id: number) => {
        setDeleteUserId(id);
        setIsDeleteUserDialogOpen(true);
    };

    // === Form tambah asset ===
    const assetForm = useForm({
        name: '',
        type: 'asset',
        status: 'available',
        stock: 1,
    });

    const submitAsset = () => {
        assetForm.post('/superadmin/assets', {
            onSuccess: () => assetForm.reset(),
        });
    };

    const deleteAsset = (id: number) => {
        setDeleteAssetId(id);
        setIsDeleteAssetDialogOpen(true);
    };

    // === Borrow actions ===
    const approveBorrow = (id: number) => router.post(`/superadmin/borrows/${id}/approve`);
    const rejectBorrow = (id: number) => router.post(`/superadmin/borrows/${id}/reject`);
    const returnBorrow = (id: number) => router.post(`/superadmin/borrows/${id}/return`);

    // === Dialog States ===
    const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = React.useState(false);
    const [deleteUserId, setDeleteUserId] = React.useState<number | null>(null);

    const [isDeleteAssetDialogOpen, setIsDeleteAssetDialogOpen] = React.useState(false);
    const [deleteAssetId, setDeleteAssetId] = React.useState<number | null>(null);

    const confirmDeleteUser = () => {
        if (deleteUserId !== null) {
            router.delete(`/superadmin/users/${deleteUserId}`);
            setIsDeleteUserDialogOpen(false);
        }
    };

    const confirmDeleteAsset = () => {
        if (deleteAssetId !== null) {
            router.delete(`/superadmin/assets/${deleteAssetId}`);
            setIsDeleteAssetDialogOpen(false);
        }
    };

    return (
        <div className="min-h-screen space-y-6 bg-white p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
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
                        <DialogDescription>Are you sure you want to log out?</DialogDescription>
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

            {flash?.success && <div className="rounded bg-green-100 p-3 text-green-700">{flash.success}</div>}

            {/* Statistik */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <StatCard title="Active Employees" value={activeEmployees} color="green" />
                <StatCard title="Pending Employees" value={pendingEmployees} color="yellow" />
                <StatCard title="Available Asset" value={availableAssetsCount} color="blue" />
                <StatCard title="Borrowed Quantity" value={borrowedAssetsCount} color="red" />
            </div>

            {/* User Management */}
            <section>
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Users</h2>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        submitUser();
                    }}
                    className="mb-6 rounded bg-gray-50 p-4"
                >
                    <h3 className="mb-2 font-semibold">Tambah User</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Input value={userForm.data.name} onChange={(e) => userForm.setData('name', e.target.value)} placeholder="Nama" />
                        <Input
                            type="email"
                            value={userForm.data.email}
                            onChange={(e) => userForm.setData('email', e.target.value)}
                            placeholder="Email"
                        />
                        <Select value={userForm.data.role} onValueChange={(value) => userForm.setData('role', value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Role</SelectLabel>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="employee">Employee</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <Input
                            type="text"
                            value={userForm.data.division}
                            onChange={(e) => userForm.setData('division', e.target.value)}
                            placeholder="Division"
                        />
                    </div>
                    <Button type="submit" className="mt-3" disabled={userForm.processing}>
                        Tambah User
                    </Button>
                </form>

                <div className="overflow-x-auto">
                    <table className="min-w-full border">
                        <thead className="bg-gray-100">
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
                                        <Button variant="destructive" onClick={() => deleteUser(u.id)}>
                                            Hapus
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Asset Management */}
            <section>
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Assets</h2>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        submitAsset();
                    }}
                    className="mb-6 rounded bg-gray-50 p-4"
                >
                    <h3 className="mb-2 font-semibold">Tambah Asset</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Input value={assetForm.data.name} onChange={(e) => assetForm.setData('name', e.target.value)} placeholder="Nama" />
                        <Select value={assetForm.data.type} onValueChange={(value) => assetForm.setData('type', value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Asset Type</SelectLabel>
                                    <SelectItem value="asset">Asset</SelectItem>
                                    <SelectItem value="room">Room</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {/* Status Select */}
                        <Select value={assetForm.data.status} onValueChange={(value) => assetForm.setData('status', value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Asset Status</SelectLabel>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="borrowed">Borrowed</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="retired">Retired</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <Input
                            type="number"
                            value={assetForm.data.stock}
                            onChange={(e) => {
                                const value = e.target.value.replace(/^0+/, '');
                                if (value === '' || Number(value) >= 0) {
                                    assetForm.setData('stock', value ? Number(value) : 0);
                                }
                            }}
                            placeholder="Stock"
                        />
                    </div>
                    <Button type="submit" className="mt-3" disabled={assetForm.processing}>
                        Tambah Asset
                    </Button>
                </form>
                <div className="overflow-x-auto">
                    <table className="min-w-full border">
                        <thead className="bg-gray-100">
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
                                        <Button variant="destructive" onClick={() => deleteAsset(a.id)}>
                                            Hapus
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Recent Borrows */}
            <section>
                <h2 className="mt-8 mb-4 text-xl font-semibold text-gray-800">Recent Borrows</h2>
                {(recentBorrows ?? []).length === 0 ? (
                    <p className="text-gray-500">Belum ada peminjaman.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {(recentBorrows ?? []).map((borrow) => (
                            <Card key={borrow.id} className="space-y-4 p-4 shadow-lg">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="font-semibold">{borrow.asset.name}</p>
                                            <p className="text-sm text-gray-500">Peminjam: {borrow.user.name}</p>
                                            <p className="text-sm text-gray-400">Jumlah: {borrow.quantity}</p>
                                            <p className="text-sm">
                                                Status:{' '}
                                                <span
                                                    className={`rounded px-2 py-1 font-bold text-white ${
                                                        borrow.status === 'approved'
                                                            ? 'bg-green-500'
                                                            : borrow.status === 'pending'
                                                              ? 'bg-yellow-500'
                                                              : borrow.status === 'rejected'
                                                                ? 'bg-red-500'
                                                                : borrow.status === 'returned'
                                                                  ? 'bg-blue-500'
                                                                  : 'bg-gray-500'
                                                    }`}
                                                >
                                                    {borrow.status}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    {/* Tanggal Pinjam */}
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
                                        })}
                                    </p>

                                    {/* Approval At (jika ada) */}
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
                                </CardContent>

                                <div className="flex items-center justify-between">
                                    <div className="space-x-2">
                                        {borrow.status === 'pending' && (
                                            <>
                                                <Button variant="outline" onClick={() => approveBorrow(borrow.id)}>
                                                    Approve
                                                </Button>
                                                <Button variant="destructive" onClick={() => rejectBorrow(borrow.id)}>
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                        {borrow.status === 'approved' && (
                                            <Button variant="outline" onClick={() => returnBorrow(borrow.id)}>
                                                Return
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
            <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>Are you sure you want to delete this user?</DialogDescription>
                    <div className="flex gap-4">
                        <Button onClick={() => setIsDeleteUserDialogOpen(false)} variant="secondary">
                            Cancel
                        </Button>
                        <Button onClick={confirmDeleteUser} variant="destructive">
                            Yes, Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Asset Dialog */}
            <Dialog open={isDeleteAssetDialogOpen} onOpenChange={setIsDeleteAssetDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Asset</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>Are you sure you want to delete this asset?</DialogDescription>
                    <div className="flex gap-4">
                        <Button onClick={() => setIsDeleteAssetDialogOpen(false)} variant="secondary">
                            Cancel
                        </Button>
                        <Button onClick={confirmDeleteAsset} variant="destructive">
                            Yes, Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Reusable StatCard
function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
    const colorMap: Record<string, string> = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        yellow: 'text-yellow-600',
        red: 'text-red-600',
    };
    return (
        <Card>
            <CardContent>
                <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
                <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
            </CardContent>
        </Card>
    );
}
