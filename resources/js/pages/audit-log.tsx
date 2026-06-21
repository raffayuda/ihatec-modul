import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ClipboardList,
    CheckCircle2,
    Edit3,
    AlertTriangle,
    Search,
    Download,
    Calendar,
    Eye,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    ShieldAlert,
    HardDrive,
    Database,
    ShieldAlert as ShieldIcon,
    AlertCircle,
    UserCheck,
    History,
    RefreshCw
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Audit Log',
        href: '/audit-log',
    },
];

interface LogEvent {
    id: string;
    timestamp: string;
    userName: string;
    userEmail: string;
    activity: string;
    feature: string;
    ipAddress: string;
    severity: 'Success' | 'Info' | 'Warning' | 'Critical';
    status: 'Selesai' | 'Gagal';
}

interface ActivityLogItem {
    time: string;
    text: string;
    bulletColor: string;
}

interface TopUser {
    rank: number;
    name: string;
    count: number;
}

interface SecurityAlertItem {
    title: string;
    description: string;
    time: string;
}

const chartConfig = {
    info: {
        label: 'Info',
        color: '#3b82f6',
    },
    success: {
        label: 'Success',
        color: '#10b981',
    },
    warning: {
        label: 'Warning',
        color: '#f59e0b',
    },
    critical: {
        label: 'Critical',
        color: '#ef4444',
    },
};

const trendData = [
    { name: '10 Mei', info: 40, success: 20, warning: 10, critical: 5 },
    { name: '11 Mei', info: 60, success: 40, warning: 15, critical: 10 },
    { name: '12 Mei', info: 70, success: 50, warning: 25, critical: 12 },
    { name: '13 Mei', info: 55, success: 35, warning: 15, critical: 8 },
    { name: '14 Mei', info: 75, success: 55, warning: 30, critical: 15 },
    { name: '15 Mei', info: 85, success: 65, warning: 35, critical: 20 },
    { name: '16 Mei', info: 80, success: 60, warning: 30, critical: 15 },
    { name: '17 Mei', info: 90, success: 70, warning: 40, critical: 22 },
];

export default function AuditLog() {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;
    const role = user?.role || 'User';

    // Access control: only admin can access this page
    const hasAccess = role === 'admin';

    // Mock dataset matching the user's screenshot
    const [events, setEvents] = useState<LogEvent[]>([
        { id: '1', timestamp: '17 Mei 2024 14:32:11', userName: 'Andi Pratama', userEmail: 'andi.pratama@company.co.id', activity: 'Login berhasil', feature: 'Authentifikasi', ipAddress: '192.168.1.10', severity: 'Success', status: 'Selesai' },
        { id: '2', timestamp: '17 Mei 2024 14:21:45', userName: 'Dewi Lestari', userEmail: 'dewi.lestari@company.co.id', activity: 'Mengubah data user', feature: 'Manajemen User', ipAddress: '192.168.1.25', severity: 'Warning', status: 'Selesai' },
        { id: '3', timestamp: '17 Mei 2024 14:18:02', userName: 'Rudi Santoso', userEmail: 'rudi.santoso@company.co.id', activity: 'Update modul pelatihan', feature: 'Database Modul', ipAddress: '192.168.1.18', severity: 'Info', status: 'Selesai' },
        { id: '4', timestamp: '17 Mei 2024 14:07:33', userName: 'Rina Asriyani', userEmail: 'rina.asriyani@company.co.id', activity: 'Export laporan user', feature: 'Report', ipAddress: '192.168.1.12', severity: 'Info', status: 'Selesai' },
        { id: '5', timestamp: '17 Mei 2024 13:58:19', userName: 'Agus Setiawan', userEmail: 'agus.setiawan@company.co.id', activity: 'Login gagal (password salah)', feature: 'Authentifikasi', ipAddress: '192.168.1.99', severity: 'Warning', status: 'Selesai' },
        { id: '6', timestamp: '17 Mei 2024 13:47:02', userName: 'Mega Kusuma', userEmail: 'mega.kusuma@company.co.id', activity: 'Menghapus data role', feature: 'Role & Permission', ipAddress: '192.168.1.30', severity: 'Critical', status: 'Selesai' },
        { id: '7', timestamp: '17 Mei 2024 13:31:56', userName: 'Yudi Setiawan', userEmail: 'yudi.setiawan@company.co.id', activity: 'Approve pengajuan modul', feature: 'Approval Modul', ipAddress: '192.168.1.16', severity: 'Success', status: 'Selesai' },
        { id: '8', timestamp: '17 Mei 2024 13:20:44', userName: 'Nita Fadilah', userEmail: 'nita.fadilah@company.co.id', activity: 'Reset password user', feature: 'Manajemen User', ipAddress: '192.168.1.21', severity: 'Info', status: 'Selesai' },
        { id: '9', timestamp: '17 Mei 2024 13:12:10', userName: 'Bambang Indriyanto', userEmail: 'bambang.indriyanto@company.co.id', activity: 'Perubahan role user', feature: 'Role & Permission', ipAddress: '192.168.1.27', severity: 'Critical', status: 'Selesai' },
        { id: '10', timestamp: '17 Mei 2024 13:01:05', userName: 'Siti Lestari', userEmail: 'siti.lestari@company.co.id', activity: 'Download data master', feature: 'Master Data', ipAddress: '192.168.1.14', severity: 'Info', status: 'Selesai' }
    ]);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [userFilter, setUserFilter] = useState('Semua User');
    const [featureFilter, setFeatureFilter] = useState('Semua Modul / Fitur');
    const [severityFilter, setSeverityFilter] = useState('Semua Severity');
    const [dateRangeText, setDateRangeText] = useState('10 Mei 2024 - 17 Mei 2024');
    const [pageSize, setPageSize] = useState('10');

    const [selectedEvent, setSelectedEvent] = useState<LogEvent | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Filtered events
    const filteredEvents = useMemo(() => {
        return events.filter((e) => {
            const matchesSearch = 
                e.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.feature.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.ipAddress.includes(searchQuery);

            const matchesUser = userFilter === 'Semua User' || e.userName === userFilter;
            const matchesFeature = featureFilter === 'Semua Modul / Fitur' || e.feature === featureFilter;
            const matchesSeverity = severityFilter === 'Semua Severity' || e.severity === severityFilter;

            return matchesSearch && matchesUser && matchesFeature && matchesSeverity;
        });
    }, [events, searchQuery, userFilter, featureFilter, severityFilter]);

    // Mock details
    const activityToday: ActivityLogItem[] = [
        { time: '14:32', text: 'Login berhasil (Andi Pratama log in dari 192.168.1.10)', bulletColor: 'bg-emerald-500' },
        { time: '14:21', text: 'Mengubah data user (Dewi Lestari mengubah data user "Budi Santoso")', bulletColor: 'bg-amber-500' },
        { time: '14:07', text: 'Export laporan user (Rina Asriyani mengekspor laporan user)', bulletColor: 'bg-blue-500' },
        { time: '13:58', text: 'Login gagal (3x) (Percobaan login gagal dari IP 192.168.1.99)', bulletColor: 'bg-amber-500' },
        { time: '13:47', text: 'Menghapus data role (Mega Kusuma menghapus role "Trainer")', bulletColor: 'bg-rose-500' }
    ];

    const topUsers: TopUser[] = [
        { rank: 1, name: 'Dewi Lestari', count: 32 },
        { rank: 2, name: 'Andi Pratama', count: 28 },
        { rank: 3, name: 'Rina Asriyani', count: 24 },
        { rank: 4, name: 'Mega Kusuma', count: 18 },
        { rank: 5, name: 'Yudi Setiawan', count: 15 }
    ];

    const securityAlerts: SecurityAlertItem[] = [
        { title: 'Multiple Failed Login', description: '5 percobaan gagal dari IP 192.168.1.99', time: '13:58' },
        { title: 'Perubahan Role Sensitif', description: 'Role "Administrator" diubah oleh Bambang Indriyanto', time: '13:12' },
        { title: 'Login dari Lokasi Tidak Dikenal', description: 'Login berhasil dari IP 103.92.45.67 (Jakarta)', time: '12:41' }
    ];

    // If access is denied (Staf PD or basic User)
    if (!hasAccess) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Akses Ditolak" />
                <div className="flex h-[80vh] flex-col items-center justify-center p-6 text-center">
                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                        <AlertTriangle className="size-8" />
                    </div>
                    <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
                        Akses Halaman Ditolak
                    </h1>
                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
                        Anda masuk sebagai <span className="font-semibold text-neutral-800 dark:text-neutral-200 capitalize">({role})</span>. Hanya akun Administrator yang memiliki wewenang untuk memeriksa log audit sistem.
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
            <Head title="Audit Log" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                        Audit Log
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Pantau seluruh aktivitas user, perubahan data, dan event sistem secara terpusat.
                    </p>
                </div>

                {/* Metrics Indicator Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {/* Total Event */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <ClipboardList className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Total Event Hari Ini</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">324</span>
                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-500 mt-0.5 flex items-center gap-0.5">
                                    <span>↑ 18% dari kemarin</span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Login Berhasil */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <CheckCircle2 className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Login Berhasil</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">188</span>
                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-500 mt-0.5 flex items-center gap-0.5">
                                    <span>↑ 12% dari kemarin</span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Perubahan Data */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                                <Edit3 className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Perubahan Data</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">76</span>
                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-500 mt-0.5 flex items-center gap-0.5">
                                    <span>↑ 8% dari kemarin</span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Warning / Error */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                                <AlertTriangle className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Warning / Error</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">12</span>
                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-500 mt-0.5 flex items-center gap-0.5">
                                    <span>↓ 14% dari kemarin</span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Dashboard Grid split into Table Area and Right Sidebar Column */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    
                    {/* Main Table area (Left 3 columns) */}
                    <div className="lg:col-span-3 space-y-6">
                        
                        {/* Filter Bar and Data Table card */}
                        <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm overflow-hidden">
                            {/* Filter items */}
                            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/10 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                                
                                {/* Search input */}
                                <div className="relative flex-1 max-w-xs">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari user, aktivitas, modul..."
                                        className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                    />
                                </div>

                                {/* Select filter group */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="w-40">
                                        <SearchableSelect
                                            value={userFilter}
                                            onChange={(val) => setUserFilter(val)}
                                            options={[
                                                "Semua User",
                                                "Andi Pratama",
                                                "Dewi Lestari",
                                                "Rudi Santoso",
                                                "Rina Asriyani"
                                            ]}
                                        />
                                    </div>

                                    <div className="w-48">
                                        <SearchableSelect
                                            value={featureFilter}
                                            onChange={(val) => setFeatureFilter(val)}
                                            options={[
                                                "Semua Modul / Fitur",
                                                "Authentifikasi",
                                                "Manajemen User",
                                                "Database Modul",
                                                "Report",
                                                "Role & Permission"
                                            ]}
                                        />
                                    </div>

                                    <div className="w-40">
                                        <SearchableSelect
                                            value={severityFilter}
                                            onChange={(val) => setSeverityFilter(val)}
                                            options={[
                                                "Semua Severity",
                                                "Success",
                                                "Info",
                                                "Warning",
                                                "Critical"
                                            ]}
                                        />
                                    </div>

                                    <div className="relative flex items-center h-9 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 px-3 text-xs text-neutral-600 dark:text-neutral-400 gap-1.5 cursor-pointer">
                                        <Calendar className="size-3.5" />
                                        <span>{dateRangeText}</span>
                                    </div>

                                    <Button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setUserFilter('Semua User');
                                            setFeatureFilter('Semua Modul / Fitur');
                                            setSeverityFilter('Semua Severity');
                                        }}
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 font-semibold"
                                    >
                                        <RefreshCw className="mr-1.5 size-3.5" />
                                        Reset Filter
                                    </Button>

                                    <Button
                                        size="sm"
                                        className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Download className="size-3.5" />
                                        <span>Export Log</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[950px] text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                            <th className="px-6 py-3.5">Timestamp</th>
                                            <th className="px-6 py-3.5">User</th>
                                            <th className="px-6 py-3.5">Aktivitas</th>
                                            <th className="px-6 py-3.5">Modul</th>
                                            <th className="px-6 py-3.5">IP Address</th>
                                            <th className="px-6 py-3.5">Severity</th>
                                            <th className="px-6 py-3.5">Status</th>
                                            <th className="px-6 py-3.5 text-center w-16">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {filteredEvents.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="text-center py-10 text-neutral-400 font-medium dark:text-neutral-500">
                                                    Tidak ada data log audit yang cocok.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredEvents.map((item) => (
                                                <tr key={item.id} className="hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-neutral-450 dark:text-neutral-500">
                                                        {item.timestamp}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="flex size-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-white font-extrabold text-[10px]">
                                                                {item.userName.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{item.userName}</span>
                                                                <span className="text-[10px] text-neutral-400 dark:text-neutral-550 leading-none">{item.userEmail}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-neutral-800 dark:text-neutral-200">
                                                        {item.activity}
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-350 font-medium">
                                                        {item.feature}
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 font-semibold font-mono">
                                                        {item.ipAddress}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge
                                                            variant="secondary"
                                                            className={`font-semibold rounded-md border-0 px-2.5 py-0.5 text-[9px] ${
                                                                item.severity === 'Success'
                                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450'
                                                                    : item.severity === 'Info'
                                                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                                                                    : item.severity === 'Warning'
                                                                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                                                                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                                                            }`}
                                                        >
                                                            {item.severity}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                                                        {item.status}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedEvent(item);
                                                                setIsDetailOpen(true);
                                                            }}
                                                            className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400 mx-auto"
                                                        >
                                                            <Eye className="size-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination footer */}
                            <div className="p-4 border-t border-neutral-100 bg-neutral-50/20 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-neutral-500 dark:text-neutral-400">
                                <span className="font-medium">
                                    Menampilkan 1-{filteredEvents.length} dari 324 event
                                </span>
                                <div className="flex items-center gap-4">
                                    <div className="w-32">
                                        <SearchableSelect
                                            value={pageSize}
                                            onChange={(val) => setPageSize(val)}
                                            options={[
                                                { value: '10', label: '10 / halaman' },
                                                { value: '20', label: '20 / halaman' },
                                                { value: '50', label: '50 / halaman' }
                                            ]}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"><ChevronLeft className="size-3.5" /></button>
                                        <button className="flex size-7 items-center justify-center rounded text-xs font-semibold border bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500">1</button>
                                        <button className="flex size-7 items-center justify-center rounded text-xs font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">2</button>
                                        <button className="flex size-7 items-center justify-center rounded text-xs font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">3</button>
                                        <span className="text-neutral-400">...</span>
                                        <button className="flex size-7 items-center justify-center rounded text-xs font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">33</button>
                                        <button className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"><ChevronRight className="size-3.5" /></button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Bottom Grid for Area line chart & Retention Policy */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            
                            {/* Distribusi Event Graph */}
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 flex flex-col justify-between">
                                <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/10">
                                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Distribusi Event</h3>
                                    <Badge variant="outline" className="text-[9px] font-semibold">7 Hari Terakhir</Badge>
                                </div>
                                <CardContent className="p-5 space-y-4">
                                    {/* SVG Line/Area graph */}
                                    <div className="relative w-full h-40">
                                        <ChartContainer config={chartConfig} className="h-40 w-full">
                                            <LineChart
                                                data={trendData}
                                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-neutral-100 dark:stroke-neutral-800" />
                                                <XAxis
                                                    dataKey="name"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    dy={8}
                                                    className="text-[10px] fill-neutral-400 dark:fill-neutral-500 font-bold"
                                                />
                                                <YAxis
                                                    tickLine={false}
                                                    axisLine={false}
                                                    dx={-8}
                                                    className="text-[10px] fill-neutral-400 dark:fill-neutral-500 font-bold"
                                                />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="info"
                                                    stroke="var(--color-info)"
                                                    strokeWidth={2.5}
                                                    dot={false}
                                                    activeDot={{ r: 4 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="success"
                                                    stroke="var(--color-success)"
                                                    strokeWidth={2.5}
                                                    dot={false}
                                                    activeDot={{ r: 4 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="warning"
                                                    stroke="var(--color-warning)"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    activeDot={{ r: 4 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="critical"
                                                    stroke="var(--color-critical)"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    activeDot={{ r: 4 }}
                                                />
                                            </LineChart>
                                        </ChartContainer>
                                    </div>

                                    {/* Legends indicators */}
                                    <div className="flex justify-center gap-4 text-[9px] font-bold text-neutral-400">
                                        <div className="flex items-center gap-1"><span className="size-2 rounded bg-blue-500"></span><span>Info</span></div>
                                        <div className="flex items-center gap-1"><span className="size-2 rounded bg-emerald-500"></span><span>Success</span></div>
                                        <div className="flex items-center gap-1"><span className="size-2 rounded bg-amber-500"></span><span>Warning</span></div>
                                        <div className="flex items-center gap-1"><span className="size-2 rounded bg-rose-500"></span><span>Critical</span></div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Retention & Backup */}
                            <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm flex flex-col justify-between">
                                <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Retention & Backup</h3>
                                </div>
                                <CardContent className="p-5 space-y-4 text-xs font-semibold">
                                    {/* Retention */}
                                    <div className="flex justify-between items-center border-b pb-3 dark:border-neutral-800">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-neutral-850 dark:text-neutral-200">Retention Policy</span>
                                            <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-medium">Log akan disimpan selama 90 hari</span>
                                        </div>
                                        <span className="bg-neutral-50 dark:bg-neutral-900 border px-2 py-0.5 rounded text-[10px]">90 hari</span>
                                    </div>

                                    {/* Backup */}
                                    <div className="flex justify-between items-start border-b pb-3 dark:border-neutral-800">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-neutral-850 dark:text-neutral-200">Backup Terakhir</span>
                                            <span className="text-[10px] text-neutral-400 dark:text-neutral-550 font-medium">17 Mei 2024 02:00 WIB</span>
                                        </div>
                                        <div className="text-right flex flex-col gap-0.5">
                                            <span className="text-neutral-450 dark:text-neutral-500 font-medium">Berikutnya</span>
                                            <span className="text-[10px] text-neutral-700 dark:text-neutral-300">18 Mei 2024 02:00 WIB</span>
                                        </div>
                                    </div>

                                    {/* Storage */}
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-neutral-450 dark:text-neutral-500">Storage Usage</span>
                                            <span className="font-bold text-neutral-800 dark:text-neutral-200">3.2 GB / 100 GB (3.2%)</span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                            <div className="h-full bg-blue-600 rounded-full" style={{ width: '3.2%' }}></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                    </div>

                    {/* Right column (1/3 width) - Activity feed, rank list, alerts */}
                    <div className="space-y-6 lg:col-span-1">
                        
                        {/* Aktivitas Hari Ini */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 flex flex-col justify-between">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Aktivitas Hari Ini</h3>
                            </div>
                            <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                                <div className="relative pl-5 space-y-4 text-xs">
                                    {activityToday.map((act, index) => (
                                        <div key={index} className="relative">
                                            {index < activityToday.length - 1 && (
                                                <div className="absolute left-[-21px] top-4 bottom-[-24px] w-0.5 bg-neutral-100 dark:bg-neutral-800" />
                                            )}
                                            <span className={`absolute -left-[26px] top-1 flex size-3 items-center justify-center rounded-full ring-4 ring-white dark:ring-neutral-950 ${act.bulletColor}`}></span>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{act.text}</span>
                                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">{act.time} WIB</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-2 border-t text-center">
                                    <button className="text-blue-600 hover:text-blue-700 text-xs font-semibold dark:text-blue-400 dark:hover:text-blue-300">
                                        Lihat Semua Aktivitas
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top User Activity */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10 flex justify-between items-center">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Top User Activity</h3>
                                <Badge variant="outline" className="text-[8px] font-semibold">Hari Ini</Badge>
                            </div>
                            <CardContent className="p-5 space-y-3">
                                {topUsers.map((item) => (
                                    <div key={item.rank} className="flex justify-between items-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 border-b pb-2 last:border-0 last:pb-0 dark:border-neutral-800">
                                        <div className="flex items-center gap-2.5">
                                            <span className={`flex size-5 items-center justify-center rounded font-extrabold text-[10px] ${
                                                item.rank === 1
                                                    ? 'bg-amber-500 text-white'
                                                    : item.rank === 2
                                                    ? 'bg-neutral-400 text-white'
                                                    : item.rank === 3
                                                    ? 'bg-amber-700 text-white'
                                                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-850 dark:text-neutral-450'
                                            }`}>{item.rank}</span>
                                            <span>{item.name}</span>
                                        </div>
                                        <span className="font-bold text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-900 px-2 py-0.5 rounded border text-[10px]">{item.count} event</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Security Alert */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 flex flex-col justify-between">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10 flex justify-between items-center">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm flex items-center gap-1.5">
                                    <ShieldAlert className="size-4.5 text-rose-500" />
                                    <span>Security Alert</span>
                                </h3>
                                <Badge className="bg-rose-500 text-white hover:bg-rose-600 rounded-full font-bold text-[10px] size-5 flex items-center justify-center border-0">3</Badge>
                            </div>
                            <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                                <div className="space-y-3.5">
                                    {securityAlerts.map((alert, idx) => (
                                        <div key={idx} className="flex gap-2.5 text-xs items-start border-b pb-3.5 last:border-0 last:pb-0 dark:border-neutral-800">
                                            <div className="flex size-5 flex-shrink-0 items-center justify-center rounded bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-450 mt-0.5 font-bold">!</div>
                                            <div className="flex-1 flex flex-col">
                                                <span className="font-bold text-neutral-800 dark:text-neutral-200">{alert.title}</span>
                                                <span className="text-[10px] text-neutral-450 dark:text-neutral-500 mt-0.5">{alert.description}</span>
                                                <span className="text-[9px] text-rose-500 font-semibold mt-1">{alert.time} WIB</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-2 border-t text-center">
                                    <button className="text-rose-600 hover:text-rose-700 text-xs font-semibold dark:text-rose-400 dark:hover:text-rose-300">
                                        Lihat Semua Alert
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                </div>

            </div>

            {/* Modal: Detail Log */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <ClipboardList className="size-5 text-blue-600 dark:text-blue-400" />
                            <span>Detail Event Log Audit</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Rincian detail audit log aktivitas pengguna.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEvent && (
                        <div className="space-y-4 py-2 text-xs">
                            <div className="rounded-xl bg-neutral-50 p-4 space-y-2.5 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-neutral-400">Timestamp</span>
                                    <span className="font-bold text-neutral-800 dark:text-neutral-200">{selectedEvent.timestamp}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-neutral-400">User</span>
                                    <span className="font-bold text-neutral-800 dark:text-neutral-200">{selectedEvent.userName} ({selectedEvent.userEmail})</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-neutral-400">Aktivitas</span>
                                    <span className="font-bold text-neutral-800 dark:text-neutral-200">{selectedEvent.activity}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-neutral-400">Modul / Fitur</span>
                                    <span className="font-bold text-neutral-850 dark:text-neutral-350">{selectedEvent.feature}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-neutral-400">IP Address</span>
                                    <span className="font-semibold text-neutral-700 dark:text-neutral-350 font-mono">{selectedEvent.ipAddress}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-neutral-400">Severity</span>
                                    <Badge className="font-semibold rounded px-2.5 py-0.5 text-[9px] bg-blue-50 text-blue-600 border-0">
                                        {selectedEvent.severity}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-neutral-400">Status</span>
                                    <Badge className="font-semibold rounded px-2.5 py-0.5 text-[9px] bg-emerald-50 text-emerald-600 border-0">
                                        {selectedEvent.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-4">
                        <Button
                            onClick={() => setIsDetailOpen(false)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-9 text-xs font-semibold"
                        >
                            Tutup Detail Log
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
