import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Plus,
    Search,
    RefreshCw,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Users,
    Clock,
    AlertTriangle,
    ArrowLeft,
    ShieldCheck,
    UserMinus,
    UserCheck,
    Trash2,
    Edit3,
    Check,
    X,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Label, Tooltip } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manajemen User',
        href: '/manajemen-user',
    },
];

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'Aktif' | 'Pending' | 'Nonaktif';
    lastLogin: string;
    createdAt: string;
}

interface Metrics {
    total: number;
    active: number;
    pending: number;
    inactive: number;
}

interface RoleDistributionItem {
    name: string;
    value: number;
}

interface ManajemenUserProps extends SharedData {
    users: UserItem[];
    metrics: Metrics;
    roleDistribution: RoleDistributionItem[];
    flash?: {
        message?: string;
        error?: string;
    };
}

export default function ManajemenUser() {
    const { auth, users, metrics, roleDistribution, flash } = usePage<ManajemenUserProps>().props;
    const currentUser = auth?.user;
    const currentRole = currentUser?.role || 'User';
    const hasAccess = currentRole.toLowerCase() === 'admin';

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('Semua Role');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Dialog state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editUser, setEditUser] = useState<UserItem | null>(null);
    const [deleteUser, setDeleteUser] = useState<UserItem | null>(null);

    // Add user form
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'User' as string,
        status: 'Aktif' as string,
    });

    // Edit user form
    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'User' as string,
        status: 'Aktif' as string,
    });

    // Filter logic
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'Semua Role' || user.role === roleFilter;
            const matchesStatus = statusFilter === 'Semua Status' || user.status === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchQuery, roleFilter, statusFilter]);

    // Pagination
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const handleResetFilters = () => {
        setSearchQuery('');
        setRoleFilter('Semua Role');
        setStatusFilter('Semua Status');
        setCurrentPage(1);
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('manajemen-user.store'), {
            onSuccess: () => {
                reset();
                setIsAddOpen(false);
            },
        });
    };

    const handleEditUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editUser) return;
        editForm.put(route('manajemen-user.update', editUser.id), {
            onSuccess: () => {
                setEditUser(null);
            },
        });
    };

    const handleUpdateStatus = (user: UserItem, newStatus: 'Aktif' | 'Nonaktif' | 'Pending') => {
        router.post(route('manajemen-user.status', user.id), { status: newStatus });
    };

    const handleDeleteUser = () => {
        if (!deleteUser) return;
        router.delete(route('manajemen-user.destroy', deleteUser.id), {
            onSuccess: () => setDeleteUser(null),
        });
    };

    const openEditDialog = (user: UserItem) => {
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            status: user.status,
        });
        setEditUser(user);
    };

    const chartColors: Record<string, string> = {
        admin: '#3b82f6',
        'manager PD': '#8b5cf6',
        'Staf PD': '#f59e0b',
        'tim training': '#10b981',
        User: '#737373',
    };

    const userChartData = roleDistribution.map((item) => ({
        ...item,
        fill: chartColors[item.name] ?? '#94a3b8',
    }));

    const totalUsers = userChartData.reduce((acc, curr) => acc + curr.value, 0);

    const getRoleBadge = (role: string) => {
        const map: Record<string, string> = {
            admin: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
            'manager PD': 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300',
            'Staf PD': 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
            'tim training': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300',
            User: 'bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
        };
        return map[role] ?? 'bg-neutral-50 text-neutral-600';
    };

    if (!hasAccess) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Akses Ditolak" />
                <div className="flex h-[80vh] flex-col items-center justify-center p-6 text-center">
                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                        <AlertTriangle className="size-8" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                        Akses Halaman Ditolak
                    </h1>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                        Anda masuk sebagai <span className="font-semibold text-neutral-800 dark:text-neutral-200 capitalize">({currentRole})</span>. Hanya akun Administrator yang dapat mengakses halaman ini.
                    </p>
                    <Button asChild className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 size-4" />
                            Kembali ke Dashboard
                        </Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen User" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Manajemen User</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Kelola akun pengguna, status akses, dan aktivitas login.
                    </p>
                </div>

                {/* Flash Messages */}
                {flash?.message && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400 shadow-sm">
                        <UserCheck className="size-4.5" />
                        <span>{flash.message}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400 shadow-sm">
                        <AlertTriangle className="size-4.5" />
                        <span>{flash.error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Metrics */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                        <Users className="size-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Total User</span>
                                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{metrics.total}</span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                        <ShieldCheck className="size-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">User Aktif</span>
                                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{metrics.active}</span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                                        <Clock className="size-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">User Pending</span>
                                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{metrics.pending}</span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                                        <UserMinus className="size-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">User Nonaktif</span>
                                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{metrics.inactive}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Table + Filters */}
                        <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm overflow-hidden">
                            {/* Filter Bar */}
                            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                        placeholder="Cari nama atau email..."
                                        className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                    />
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }} className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none">
                                        <option value="Semua Role">Semua Role</option>
                                        <option value="admin">Administrator</option>
                                        <option value="manager PD">Manager PD</option>
                                        <option value="Staf PD">Staf PD</option>
                                        <option value="tim training">Tim Training</option>
                                        <option value="User">User</option>
                                    </select>
                                    <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none">
                                        <option value="Semua Status">Semua Status</option>
                                        <option value="Aktif">Aktif</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Nonaktif">Nonaktif</option>
                                    </select>
                                    <Button onClick={handleResetFilters} variant="outline" size="sm" className="h-9 px-3 rounded-lg border-neutral-200 text-xs text-neutral-600 font-semibold dark:border-neutral-800 dark:text-neutral-300">
                                        <RefreshCw className="mr-1.5 size-3.5" /> Reset
                                    </Button>
                                    <Button onClick={() => setIsAddOpen(true)} size="sm" className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg">
                                        <Plus className="mr-1.5 size-4" /> Tambah User
                                    </Button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px] text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                            <th className="px-6 py-3.5">Nama</th>
                                            <th className="px-6 py-3.5">Email</th>
                                            <th className="px-6 py-3.5">Role</th>
                                            <th className="px-6 py-3.5">Status</th>
                                            <th className="px-6 py-3.5">Last Login</th>
                                            <th className="px-6 py-3.5">Dibuat</th>
                                            <th className="px-6 py-3.5 text-center w-24">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {currentUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="text-center py-10 text-neutral-400 font-medium dark:text-neutral-500">
                                                    Tidak ada user yang cocok dengan filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            currentUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10 transition-colors">
                                                    <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-neutral-100">{user.name}</td>
                                                    <td className="px-6 py-4 font-medium text-neutral-500 dark:text-neutral-400">{user.email}</td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="secondary" className={`font-semibold rounded-md border-0 px-2.5 py-0.5 text-[10px] ${getRoleBadge(user.role)}`}>
                                                            {user.role}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge className={`font-semibold rounded-md border-0 px-2 py-0.5 text-[10px] ${
                                                            user.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                            : user.status === 'Pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300'
                                                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                                                        }`}>
                                                            {user.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-550 dark:text-neutral-500 font-medium">{user.lastLogin}</td>
                                                    <td className="px-6 py-4 text-neutral-450 dark:text-neutral-500 font-medium">{user.createdAt}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                onClick={() => openEditDialog(user)}
                                                                className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400 cursor-pointer"
                                                                title="Edit"
                                                            >
                                                                <Edit3 className="size-3.5" />
                                                            </button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400 cursor-pointer">
                                                                        <MoreVertical className="size-3.5" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-44 text-xs">
                                                                    {user.status !== 'Aktif' && (
                                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(user, 'Aktif')} className="cursor-pointer font-medium text-emerald-600">
                                                                            <Check className="mr-2 size-3.5" /> Aktifkan Akun
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {user.status !== 'Nonaktif' && (
                                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(user, 'Nonaktif')} className="cursor-pointer font-medium text-amber-600">
                                                                            <X className="mr-2 size-3.5" /> Nonaktifkan Akun
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {user.id !== currentUser?.id && (
                                                                        <DropdownMenuItem onClick={() => setDeleteUser(user)} className="cursor-pointer font-medium text-rose-600">
                                                                            <Trash2 className="mr-2 size-3.5" /> Hapus Permanen
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-neutral-500 dark:text-neutral-400">
                                <span className="font-medium text-xs">
                                    Menampilkan {indexOfFirst + 1}–{Math.min(indexOfLast, filteredUsers.length)} dari {filteredUsers.length} user
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                        <ChevronLeft className="size-3.5" />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button key={page} onClick={() => setCurrentPage(page)} className={`flex size-7 items-center justify-center rounded text-xs font-semibold border ${page === currentPage ? 'bg-blue-600 border-blue-600 text-white' : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400'}`}>
                                            {page}
                                        </button>
                                    ))}
                                    <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                        <ChevronRight className="size-3.5" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* Role Distribution Chart */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 flex flex-col">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Distribusi Role</h3>
                            </div>
                            <CardContent className="p-5 flex flex-col items-center gap-6">
                                <div className="h-36 w-36 flex-shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Tooltip />
                                            <Pie data={userChartData} dataKey="value" nameKey="name" innerRadius={34} outerRadius={50} strokeWidth={0}>
                                                {userChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                                <Label
                                                    content={({ viewBox }) => {
                                                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                                            return (
                                                                <g>
                                                                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-xl font-extrabold">{totalUsers}</text>
                                                                    <text x={viewBox.cx} y={(viewBox.cy || 0) + 14} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[8px] font-bold uppercase tracking-wider">Total</text>
                                                                </g>
                                                            );
                                                        }
                                                    }}
                                                />
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-full space-y-2 text-xs">
                                    {userChartData.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                                                <span className="text-neutral-500 dark:text-neutral-400 font-medium capitalize">{item.name}</span>
                                            </div>
                                            <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                                {item.value} <span className="text-neutral-400 font-normal text-[10px] ml-1">({totalUsers > 0 ? ((item.value / totalUsers) * 100).toFixed(0) : 0}%)</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* ADD USER DIALOG */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                        <DialogDescription>Isi data pengguna. Password default bisa diubah nanti.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddUser} className="space-y-4 mt-2">
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Nama Lengkap</label>
                            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" placeholder="Nama lengkap" required />
                            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Email</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" placeholder="email@domain.com" required />
                            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Password</label>
                            <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" placeholder="Min. 8 karakter" required />
                            {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Role</label>
                                <select value={data.role} onChange={(e) => setData('role', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                                    <option value="admin">Administrator</option>
                                    <option value="manager PD">Manager PD</option>
                                    <option value="Staf PD">Staf PD</option>
                                    <option value="tim training">Tim Training</option>
                                    <option value="User">User</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Status</label>
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                                    <option value="Aktif">Aktif</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Nonaktif">Nonaktif</option>
                                </select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { reset(); setIsAddOpen(false); }}>Batal</Button>
                            <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                                {processing ? 'Menyimpan...' : 'Simpan Pengguna'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* EDIT USER DIALOG */}
            <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) setEditUser(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Pengguna</DialogTitle>
                        <DialogDescription>Perbarui data pengguna. Kosongkan password jika tidak ingin mengubahnya.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditUser} className="space-y-4 mt-2">
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Nama Lengkap</label>
                            <input type="text" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" required />
                            {editForm.errors.name && <p className="text-xs text-rose-500 mt-1">{editForm.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Email</label>
                            <input type="email" value={editForm.data.email} onChange={(e) => editForm.setData('email', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" required />
                            {editForm.errors.email && <p className="text-xs text-rose-500 mt-1">{editForm.errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Password Baru (opsional)</label>
                            <input type="password" value={editForm.data.password} onChange={(e) => editForm.setData('password', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" placeholder="Kosongkan jika tidak berubah" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Role</label>
                                <select value={editForm.data.role} onChange={(e) => editForm.setData('role', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                                    <option value="admin">Administrator</option>
                                    <option value="manager PD">Manager PD</option>
                                    <option value="Staf PD">Staf PD</option>
                                    <option value="tim training">Tim Training</option>
                                    <option value="User">User</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Status</label>
                                <select value={editForm.data.status} onChange={(e) => editForm.setData('status', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                                    <option value="Aktif">Aktif</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Nonaktif">Nonaktif</option>
                                </select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Batal</Button>
                            <Button type="submit" disabled={editForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                                {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DELETE CONFIRMATION DIALOG */}
            <Dialog open={!!deleteUser} onOpenChange={(open) => { if (!open) setDeleteUser(null); }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Hapus Pengguna</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus akun <span className="font-bold text-neutral-900 dark:text-neutral-100">{deleteUser?.name}</span> secara permanen? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteUser(null)}>Batal</Button>
                        <Button onClick={handleDeleteUser} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                            Hapus Permanen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
