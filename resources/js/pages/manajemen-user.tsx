import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Users,
    ShieldCheck,
    Clock,
    UserMinus,
    Search,
    RefreshCw,
    Plus,
    Eye,
    Edit3,
    Key,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    FileSpreadsheet,
    Download,
    AlertTriangle,
    ArrowLeft,
    UserCheck,
    History
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
import { PieChart, Pie, Cell, Label } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manajemen User',
        href: '/manajemen-user',
    },
];

interface UserItem {
    id: string;
    name: string;
    email: string;
    role: 'Administrator' | 'Manager PD' | 'Staf PD' | 'User';
    unit: string;
    status: 'Aktif' | 'Pending' | 'Nonaktif';
    lastLogin: string;
    createdAt: string;
}

export default function ManajemenUser() {
    const page = usePage<SharedData>();
    const currentUser = page.props.auth?.user;
    const currentRole = currentUser?.role || 'User';

    // Access control: only admin can access this page
    const hasAccess = currentRole === 'admin';

    // User mock dataset (10 rows)
    const [usersList, setUsersList] = useState<UserItem[]>([
        { id: '1', name: 'Andi Pratama', email: 'andi.pratama@company.co.id', role: 'Administrator', unit: 'IT & Digital', status: 'Aktif', lastLogin: '10 menit lalu', createdAt: '12 Jan 2024' },
        { id: '2', name: 'Dewi Lestari', email: 'dewi.lestari@company.co.id', role: 'Manager PD', unit: 'Pengembangan SDM', status: 'Aktif', lastLogin: '2 jam lalu', createdAt: '05 Feb 2024' },
        { id: '3', name: 'Budi Santoso', email: 'budi.santoso@company.co.id', role: 'Staf PD', unit: 'Pengembangan SDM', status: 'Aktif', lastLogin: '1 jam lalu', createdAt: '18 Mar 2024' },
        { id: '4', name: 'Rina Apriyani', email: 'rina.apriyani@company.co.id', role: 'User', unit: 'Operasional', status: 'Pending', lastLogin: '-', createdAt: '20 Mei 2024' },
        { id: '5', name: 'Agus Setiawan', email: 'agus.setiawan@company.co.id', role: 'User', unit: 'Keuangan', status: 'Nonaktif', lastLogin: '7 hari lalu', createdAt: '11 Jan 2024' },
        { id: '6', name: 'Mega Kusuma', email: 'mega.kusuma@company.co.id', role: 'Manager PD', unit: 'Keuangan', status: 'Aktif', lastLogin: '3 jam lalu', createdAt: '02 Apr 2024' },
        { id: '7', name: 'Yusuf Setiawan', email: 'yusuf.setiawan@company.co.id', role: 'Staf PD', unit: 'Operasional', status: 'Aktif', lastLogin: '25 menit lalu', createdAt: '15 Feb 2024' },
        { id: '8', name: 'Nita Fadilah', email: 'nita.fadilah@company.co.id', role: 'User', unit: 'IT & Digital', status: 'Aktif', lastLogin: '5 jam lalu', createdAt: '08 Mar 2024' },
        { id: '9', name: 'Bambang Hariyanto', email: 'bambang.hariyanto@company.co.id', role: 'User', unit: 'Pengembangan SDM', status: 'Nonaktif', lastLogin: '30 hari lalu', createdAt: '22 Des 2023' },
        { id: '10', name: 'Siti Lestari', email: 'siti.lestari@company.co.id', role: 'User', unit: 'Keuangan', status: 'Aktif', lastLogin: '1 jam lalu', createdAt: '03 Jan 2024' },
    ]);

    // Checkbox selections
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    
    // Filter values
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('Semua Role');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [unitFilter, setUnitFilter] = useState('Semua Unit');

    // Dialog Modal State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState<'Administrator' | 'Manager PD' | 'Staf PD' | 'User'>('User');
    const [newUnit, setNewUnit] = useState('IT & Digital');
    const [newStatus, setNewStatus] = useState<'Aktif' | 'Pending' | 'Nonaktif'>('Aktif');
    const [successToast, setSuccessToast] = useState<string | null>(null);

    // Compute dynamic user counts for metric cards
    const totalCount = 238 + usersList.length; // baseline 238 + local additions
    const activeCount = 176 + usersList.filter(u => u.status === 'Aktif').length;
    const pendingCount = 24 + usersList.filter(u => u.status === 'Pending').length;
    const nonActiveCount = 30 + usersList.filter(u => u.status === 'Nonaktif').length;

    // Reset filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setRoleFilter('Semua Role');
        setStatusFilter('Semua Status');
        setUnitFilter('Semua Unit');
    };

    // Filter logic
    const filteredUsers = usersList.filter((user) => {
        const matchesSearch = 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'Semua Role' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'Semua Status' || user.status === statusFilter;
        const matchesUnit = unitFilter === 'Semua Unit' || user.unit === unitFilter;
        return matchesSearch && matchesRole && matchesStatus && matchesUnit;
    });

    // Checkbox actions
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUsers(filteredUsers.map(u => u.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedUsers(prev => [...prev, id]);
        } else {
            setSelectedUsers(prev => prev.filter(item => item !== id));
        }
    };

    // Form submit for adding a user
    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newEmail) return;

        const newUser: UserItem = {
            id: String(usersList.length + 1),
            name: newName,
            email: newEmail,
            role: newRole,
            unit: newUnit,
            status: newStatus,
            lastLogin: '-',
            createdAt: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
        };

        setUsersList(prev => [newUser, ...prev]);
        setIsAddOpen(false);
        setNewName('');
        setNewEmail('');

        setSuccessToast(`Akun pengguna ${newName} berhasil ditambahkan!`);
        setTimeout(() => setSuccessToast(null), 4000);
    };

    const chartConfig = {
        admin: { label: 'Administrator', color: '#3b82f6' },
        manager: { label: 'Manager PD', color: '#8b5cf6' },
        staf: { label: 'Staf PD', color: '#f59e0b' },
        user: { label: 'User', color: '#10b981' },
    } satisfies ChartConfig;

    const userChartData = useMemo(() => [
        { name: 'Administrator', value: 12, fill: '#3b82f6' },
        { name: 'Manager PD', value: 28, fill: '#8b5cf6' },
        { name: 'Staf PD', value: 68, fill: '#f59e0b' },
        { name: 'User', value: 140, fill: '#10b981' },
    ], []);

    const totalUsers = useMemo(() => {
        return userChartData.reduce((acc, curr) => acc + curr.value, 0);
    }, [userChartData]);

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
                    <p className="mt-2 text-sm text-neutral-500 max-w-sm leading-relaxed dark:text-neutral-400">
                        Anda masuk sebagai <span className="font-semibold text-neutral-800 dark:text-neutral-200 capitalize">({currentRole})</span>. Hanya akun Administrator yang diperbolehkan mengakses halaman Manajemen User ini.
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
                {/* Header Section */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                        Manajemen User
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Kelola akun pengguna, status akses, unit kerja, dan aktivitas login.
                    </p>
                </div>

                {/* Toast message */}
                {successToast && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400 shadow-sm animate-in fade-in duration-300">
                        <UserCheck className="size-4.5" />
                        <span>{successToast}</span>
                    </div>
                )}

                {/* Dashboard Grid (Main & Right Column) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    
                    {/* LEFT COLUMN: Metrics & User Data Table */}
                    <div className="lg:col-span-3 space-y-6">
                        
                        {/* 1. Metrics Grid */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {/* Total User */}
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                        <Users className="size-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Total User</span>
                                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{totalCount}</span>
                                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-500 mt-1">
                                            <span>↑ 12 dari bulan lalu</span>
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* User Aktif */}
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                        <ShieldCheck className="size-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">User Aktif</span>
                                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{activeCount}</span>
                                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-500 mt-1">
                                            <span>↑ 9 dari bulan lalu</span>
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* User Pending */}
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                                        <Clock className="size-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">User Pending</span>
                                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{pendingCount}</span>
                                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-500 mt-1">
                                            <span>↑ 4 dari bulan lalu</span>
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* User Nonaktif */}
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                                        <UserMinus className="size-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">User Nonaktif</span>
                                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{nonActiveCount}</span>
                                        <span className="flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-500 mt-1">
                                            <span>↓ 3 dari bulan lalu</span>
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 2. Filter & Data Table Section */}
                        <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm overflow-hidden">
                            {/* Filter Bar */}
                            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                
                                {/* Search input */}
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari nama, email, atau username..."
                                        className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                    />
                                </div>

                                {/* Select filter group */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Role Filter */}
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Role">Semua Role</option>
                                        <option value="Administrator">Administrator</option>
                                        <option value="Manager PD">Manager PD</option>
                                        <option value="Staf PD">Staf PD</option>
                                        <option value="User">User</option>
                                    </select>

                                    {/* Status Filter */}
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Status">Semua Status</option>
                                        <option value="Aktif">Aktif</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Nonaktif">Nonaktif</option>
                                    </select>

                                    {/* Unit Filter */}
                                    <select
                                        value={unitFilter}
                                        onChange={(e) => setUnitFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Unit">Semua Unit</option>
                                        <option value="IT & Digital">IT & Digital</option>
                                        <option value="Keuangan">Keuangan</option>
                                        <option value="Operasional">Operasional</option>
                                        <option value="Pengembangan SDM">Pengembangan SDM</option>
                                    </select>

                                    {/* Reset Filter Button */}
                                    <Button
                                        onClick={handleResetFilters}
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 font-semibold"
                                    >
                                        <RefreshCw className="mr-1.5 size-3.5" />
                                        Reset Filter
                                    </Button>

                                    {/* Tambah User Trigger Button */}
                                    <Button
                                        onClick={() => setIsAddOpen(true)}
                                        size="sm"
                                        className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 text-xs font-semibold rounded-lg"
                                    >
                                        <Plus className="mr-1.5 size-4" />
                                        Tambah User
                                    </Button>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                            <th className="px-6 py-3 text-center w-12">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                                    checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                                                    className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 size-3.5"
                                                />
                                            </th>
                                            <th className="px-6 py-3.5">Nama</th>
                                            <th className="px-6 py-3.5">Email</th>
                                            <th className="px-6 py-3.5">Role</th>
                                            <th className="px-6 py-3.5">Unit</th>
                                            <th className="px-6 py-3.5">Status</th>
                                            <th className="px-6 py-3.5">Last Login</th>
                                            <th className="px-6 py-3.5">Created At</th>
                                            <th className="px-6 py-3.5 text-center w-28">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="text-center py-10 text-neutral-400 font-medium dark:text-neutral-500">
                                                    Tidak ada data user yang cocok dengan filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10 transition-colors">
                                                    <td className="px-6 py-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedUsers.includes(user.id)}
                                                            onChange={(e) => handleSelectRow(user.id, e.target.checked)}
                                                            className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 size-3.5"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                                                        {user.name}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-neutral-500 dark:text-neutral-400">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge
                                                            variant="secondary"
                                                            className={`font-semibold rounded-md border-0 px-2.5 py-0.5 text-[10px] ${
                                                                user.role === 'Administrator'
                                                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                                                                    : user.role === 'Manager PD'
                                                                    ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300'
                                                                    : user.role === 'Staf PD'
                                                                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300'
                                                                    : 'bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                                            }`}
                                                        >
                                                            {user.role}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300 font-medium">
                                                        {user.unit}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge
                                                            className={`font-semibold rounded-md border-0 px-2 py-0.5 text-[10px] ${
                                                                user.status === 'Aktif'
                                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                    : user.status === 'Pending'
                                                                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300'
                                                                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                                                            }`}
                                                        >
                                                            {user.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 font-medium">
                                                        {user.lastLogin}
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-400 dark:text-neutral-500 font-medium">
                                                        {user.createdAt}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400">
                                                                <Eye className="size-3.5" />
                                                            </button>
                                                            <button className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400">
                                                                <Edit3 className="size-3.5" />
                                                            </button>
                                                            <button className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400">
                                                                <Key className="size-3.5" />
                                                            </button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400">
                                                                        <MoreVertical className="size-3.5" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-40 text-xs">
                                                                    <DropdownMenuItem className="cursor-pointer font-medium">Aktifkan Akun</DropdownMenuItem>
                                                                    <DropdownMenuItem className="cursor-pointer font-medium">Nonaktifkan Akun</DropdownMenuItem>
                                                                    <DropdownMenuItem className="cursor-pointer font-medium text-rose-600">Hapus Permanen</DropdownMenuItem>
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

                            {/* Table Pagination footer */}
                            <div className="p-4 border-t border-neutral-100 bg-neutral-50/20 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-neutral-500 dark:text-neutral-400">
                                <span className="font-medium">
                                    Menampilkan 1-{filteredUsers.length} dari {totalCount} user
                                </span>
                                <div className="flex items-center gap-4">
                                    <select
                                        className="h-8 rounded-lg border border-neutral-200 bg-white px-2 text-xs outline-none text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                                        defaultValue="10"
                                    >
                                        <option value="10">10 / halaman</option>
                                        <option value="20">20 / halaman</option>
                                        <option value="50">50 / halaman</option>
                                    </select>
                                    <div className="flex items-center gap-1.5">
                                        <button className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"><ChevronLeft className="size-3.5" /></button>
                                        <button className="flex size-7 items-center justify-center rounded text-xs font-semibold border bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500">1</button>
                                        <button className="flex size-7 items-center justify-center rounded text-xs font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">2</button>
                                        <button className="flex size-7 items-center justify-center rounded text-xs font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">3</button>
                                        <span className="text-neutral-400">...</span>
                                        <button className="flex size-7 items-center justify-center rounded text-xs font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">25</button>
                                        <button className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"><ChevronRight className="size-3.5" /></button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                    </div>

                    {/* RIGHT COLUMN: Distribution Chart, Activity Logs, Quick Actions */}
                    <div className="space-y-6 lg:col-span-1">
                        
                        {/* 1. Distribusi Role Donut Chart */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 flex flex-col justify-between">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Distribusi Role</h3>
                            </div>
                            <CardContent className="p-5 flex flex-col items-center justify-center gap-6">
                                {/* SVG Donut Chart */}
                                <div className="relative flex h-28 w-28 items-center justify-center flex-shrink-0">
                                    <ChartContainer config={chartConfig} className="h-28 w-28 flex-shrink-0">
                                        <PieChart>
                                            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                            <Pie
                                                data={userChartData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={28}
                                                outerRadius={38}
                                                strokeWidth={0}
                                            >
                                                {userChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                                <Label
                                                    content={({ viewBox }) => {
                                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                            return (
                                                                <g>
                                                                    <text
                                                                        x={viewBox.cx}
                                                                        y={viewBox.cy}
                                                                        textAnchor="middle"
                                                                        dominantBaseline="middle"
                                                                        className="fill-foreground text-lg font-extrabold text-neutral-800 dark:fill-neutral-100"
                                                                    >
                                                                        {totalUsers}
                                                                    </text>
                                                                    <text
                                                                        x={viewBox.cx}
                                                                        y={(viewBox.cy || 0) + 12}
                                                                        textAnchor="middle"
                                                                        dominantBaseline="middle"
                                                                        className="fill-muted-foreground text-[7px] font-bold text-neutral-400 dark:fill-neutral-500 uppercase tracking-wider"
                                                                    >
                                                                        Total User
                                                                    </text>
                                                                </g>
                                                            )
                                                        }
                                                    }}
                                                />
                                            </Pie>
                                        </PieChart>
                                    </ChartContainer>
                                </div>

                                {/* Chart Legends */}
                                <div className="w-full space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2.5 rounded-full bg-blue-500"></span>
                                            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Administrator</span>
                                        </div>
                                        <span className="font-bold text-neutral-800 dark:text-neutral-200">12 <span className="text-neutral-400 font-normal text-[10px] ml-1">({((12 / totalUsers) * 100).toFixed(1)}%)</span></span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2.5 rounded-full bg-violet-500"></span>
                                            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Manager PD</span>
                                        </div>
                                        <span className="font-bold text-neutral-800 dark:text-neutral-200">28 <span className="text-neutral-400 font-normal text-[10px] ml-1">({((28 / totalUsers) * 100).toFixed(1)}%)</span></span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2.5 rounded-full bg-amber-500"></span>
                                            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Staf PD</span>
                                        </div>
                                        <span className="font-bold text-neutral-800 dark:text-neutral-200">68 <span className="text-neutral-400 font-normal text-[10px] ml-1">({((68 / totalUsers) * 100).toFixed(1)}%)</span></span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2.5 rounded-full bg-emerald-500"></span>
                                            <span className="text-neutral-500 dark:text-neutral-400 font-medium">User</span>
                                        </div>
                                        <span className="font-bold text-neutral-800 dark:text-neutral-200">140 <span className="text-neutral-400 font-normal text-[10px] ml-1">({((140 / totalUsers) * 100).toFixed(1)}%)</span></span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Aktivitas User Terbaru */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 flex flex-col">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Aktivitas User Terbaru</h3>
                            </div>
                            <CardContent className="p-5 space-y-4 flex-1">
                                <div className="relative pl-5 border-l border-neutral-100 dark:border-neutral-800 space-y-5 text-xs">
                                    {/* Act 1 */}
                                    <div className="relative">
                                        <span className="absolute -left-[26px] top-1.5 flex size-3 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white dark:ring-neutral-950"></span>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Andi Pratama</span>
                                            <span className="text-neutral-500 dark:text-neutral-400">Membuat user baru: Rina Apriyani</span>
                                            <span className="text-[10px] text-neutral-400 mt-0.5">10 menit lalu</span>
                                        </div>
                                    </div>
                                    {/* Act 2 */}
                                    <div className="relative">
                                        <span className="absolute -left-[26px] top-1.5 flex size-3 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white dark:ring-neutral-950"></span>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Dewi Lestari</span>
                                            <span className="text-neutral-500 dark:text-neutral-400">Mengubah role user: Budi Santoso</span>
                                            <span className="text-[10px] text-neutral-400 mt-0.5">2 jam lalu</span>
                                        </div>
                                    </div>
                                    {/* Act 3 */}
                                    <div className="relative">
                                        <span className="absolute -left-[26px] top-1.5 flex size-3 items-center justify-center rounded-full bg-red-500 ring-4 ring-white dark:ring-neutral-950"></span>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">System</span>
                                            <span className="text-neutral-500 dark:text-neutral-400">Login gagal untuk user: rina.apriyani</span>
                                            <span className="text-[10px] text-neutral-400 mt-0.5">3 jam lalu</span>
                                        </div>
                                    </div>
                                    {/* Act 4 */}
                                    <div className="relative">
                                        <span className="absolute -left-[26px] top-1.5 flex size-3 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white dark:ring-neutral-950"></span>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Agus Setiawan</span>
                                            <span className="text-neutral-500 dark:text-neutral-400">Reset password untuk: Mega Kusuma</span>
                                            <span className="text-[10px] text-neutral-400 mt-0.5">5 jam lalu</span>
                                        </div>
                                    </div>
                                    {/* Act 5 */}
                                    <div className="relative">
                                        <span className="absolute -left-[26px] top-1.5 flex size-3 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white dark:ring-neutral-950"></span>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Raffa</span>
                                            <span className="text-neutral-500 dark:text-neutral-400">Mengaktifkan user: Yusuf Setiawan</span>
                                            <span className="text-[10px] text-neutral-400 mt-0.5">1 hari lalu</span>
                                        </div>
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full text-xs font-semibold rounded-lg h-9 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300">
                                    Lihat Semua Aktivitas
                                </Button>
                            </CardContent>
                        </Card>

                        {/* 3. Aksi Cepat */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Aksi Cepat</h3>
                            </div>
                            <CardContent className="p-5">
                                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">
                                    {/* Action 1 */}
                                    <button 
                                        onClick={() => setIsAddOpen(true)}
                                        className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                                    >
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                            <UserPlus className="size-5" />
                                        </div>
                                        <span>Tambah User</span>
                                    </button>
                                    {/* Action 2 */}
                                    <button className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                                            <FileSpreadsheet className="size-5" />
                                        </div>
                                        <span>Import CSV</span>
                                    </button>
                                    {/* Action 3 */}
                                    <button className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                                            <Download className="size-5" />
                                        </div>
                                        <span>Export Data</span>
                                    </button>
                                    {/* Action 4 */}
                                    <button className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                                            <Key className="size-5" />
                                        </div>
                                        <span>Reset Massal</span>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                </div>
            </div>

            {/* Tambah User Modal Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <UserPlus className="size-5 text-blue-600 dark:text-blue-400" />
                            <span>Tambah Akun Pengguna</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Masukkan detail untuk membuat akun pengguna baru di dalam platform.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddUser} className="space-y-4 py-2">
                        {/* Name input */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 block">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                required
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Masukkan nama lengkap..."
                                className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                        </div>

                        {/* Email input */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 block">
                                Alamat Email
                            </label>
                            <input
                                type="email"
                                required
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="nama.pengguna@company.co.id..."
                                className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                        </div>

                        {/* Role selection */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 block">
                                Peran / Role
                            </label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value as any)}
                                className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-xs outline-none text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                            >
                                <option value="Administrator">Administrator</option>
                                <option value="Manager PD">Manager PD</option>
                                <option value="Staf PD">Staf PD</option>
                                <option value="User">User</option>
                            </select>
                        </div>

                        {/* Unit selection */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 block">
                                Unit Kerja
                            </label>
                            <select
                                value={newUnit}
                                onChange={(e) => setNewUnit(e.target.value)}
                                className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-xs outline-none text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                            >
                                <option value="IT & Digital">IT & Digital</option>
                                <option value="Keuangan">Keuangan</option>
                                <option value="Operasional">Operasional</option>
                                <option value="Pengembangan SDM">Pengembangan SDM</option>
                            </select>
                        </div>

                        {/* Status selection */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 block">
                                Status Akun
                            </label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value as any)}
                                className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-xs outline-none text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                            >
                                <option value="Aktif">Aktif</option>
                                <option value="Pending">Pending</option>
                                <option value="Nonaktif">Nonaktif</option>
                            </select>
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsAddOpen(false)}
                                className="rounded-lg h-9 px-4 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg h-9 px-4 text-xs font-semibold"
                            >
                                Simpan Akun
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
