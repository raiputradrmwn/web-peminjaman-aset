import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router, useForm, usePage } from '@inertiajs/react';

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

    // === Logout ===
    const handleLogout = () => {
        if (confirm('Yakin ingin logout?')) {
            router.post('/logout');
        }
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
        if (confirm('Yakin hapus user ini?')) {
            router.delete(`/superadmin/users/${id}`);
        }
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
        if (confirm('Yakin hapus asset ini?')) {
            router.delete(`/superadmin/assets/${id}`);
        }
    };

    // === Borrow actions ===
    const approveBorrow = (id: number) => router.post(`/superadmin/borrows/${id}/approve`);
    const rejectBorrow = (id: number) => router.post(`/superadmin/borrows/${id}/reject`);
    const returnBorrow = (id: number) => router.post(`/superadmin/borrows/${id}/return`);

    return (
        <div className="min-h-screen space-y-10 bg-white p-6">
            {/* Header + Logout */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Superadmin Dashboard</h1>
                    <p className="text-gray-600">Manage Users, Assets, and Borrows</p>
                </div>
                <Button variant="destructive" onClick={handleLogout}>
                    Logout
                </Button>
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
                                // Get the value from the input field and remove leading zeros
                                const value = e.target.value.replace(/^0+/, ''); // Remove leading zeros
                                // Ensure that the value is a valid number and not negative
                                if (value === '' || Number(value) >= 0) {
                                    assetForm.setData('stock', value ? Number(value) : 0); // Set the stock value, default to 0 if empty
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
                    <ul className="space-y-4">
                        {(recentBorrows ?? []).map((borrow) => (
                            <li key={borrow.id} className="rounded border p-4 shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">{borrow.asset.name}</p>
                                        <p className="text-sm text-gray-500">Peminjam: {borrow.user.name}</p>
                                        <p className="text-sm text-gray-400">Jumlah: {borrow.quantity}</p>
                                        <p className="text-sm">
                                            Status:{' '}
                                            <span
                                                className={`font-bold px-2 py-1 rounded text-white ${
                                                borrow.status === 'approved'
                                                    ? 'bg-green-600'
                                                    : borrow.status === 'pending'
                                                    ? 'bg-yellow-600'
                                                    : 'bg-red-600'
                                                }`}
                                            >
                                                {borrow.status}
                                            </span>
                                        </p>
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

                                        {/* Approval At (hanya tampil kalau ada) */}
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
                                    </div>

                                    {/* Action Button */}
                                    <div className="space-x-2">
                                        {borrow.status === 'pending' && (
                                            <>
                                                <Button variant="outline" onClick={() => approveBorrow(borrow.id)}>
                                                    Approve
                                                </Button>
                                                <Button variant="outline" onClick={() => rejectBorrow(borrow.id)}>
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
                            </li>
                        ))}
                    </ul>
                )}
            </section>
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
