import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Layers,
    Database,
    RefreshCw,
    Calendar,
    Search,
    Plus,
    Edit3,
    Trash2,
    BookOpen,
    GraduationCap,
    Building2,
    Globe,
    Award,
    Users,
    CheckCircle,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Download,
    Upload,
    FileSpreadsheet
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import React, { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Master Data',
        href: '/master-data',
    },
];

interface MasterItem {
    id: string;
    name: string;
    category: 'Jenis Pelatihan' | 'Kategori Pelatihan' | 'Metode' | 'Penyelenggara' | 'Bahasa' | 'Jenis Sertifikat' | 'Unit Kerja' | 'Status Modul';
    code: string;
    status: 'Aktif' | 'Nonaktif';
    updatedAt: string;
}

interface ChangeHistoryItem {
    id: string;
    text: string;
    author: string;
    date: string;
    time: string;
}

interface SyncItem {
    id: string;
    task: string;
    status: 'Berhasil' | 'Gagal';
    date: string;
    time: string;
    author: string;
}

interface MasterDataProps extends SharedData {
    dataList?: MasterItem[];
}

export default function MasterData() {
    const { props } = usePage<MasterDataProps>();
    const user = props.auth?.user;
    const role = user?.role || 'User';

    // Access control: only admin can access this page
    const hasAccess = role === 'admin';

    const initialDataList = props.dataList || [];
    const [dataList, setDataList] = useState<MasterItem[]>(initialDataList);

    React.useEffect(() => {
        setDataList(initialDataList);
    }, [initialDataList]);

    // Active Category Filter Tab
    const [selectedTab, setSelectedTab] = useState<string>('Jenis Pelatihan');

    // Search and filter fields
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Semua Kategori');
    const [statusFilter, setStatusFilter] = useState('Semua Status');

    // Dialog Modal Add State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] = useState<MasterItem['category']>('Jenis Pelatihan');
    const [newCode, setNewCode] = useState('');
    const [newStatus, setNewStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Dynamic category counts
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {
            'Jenis Pelatihan': 0,
            'Kategori Pelatihan': 0,
            'Metode': 0,
            'Penyelenggara': 0,
            'Bahasa': 0,
            'Jenis Sertifikat': 0,
            'Unit Kerja': 0,
            'Status Modul': 0
        };
        dataList.forEach(item => {
            if (counts[item.category] !== undefined) {
                counts[item.category]++;
            }
        });
        return counts;
    }, [dataList]);

    const activeCount = useMemo(() => {
        return dataList.filter(item => item.status === 'Aktif').length;
    }, [dataList]);

    // Filter dataList
    const filteredData = useMemo(() => {
        return dataList.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.code.toLowerCase().includes(searchQuery.toLowerCase());
            
            // If the user selects a sub-tab, we filter by it. If not, fallback to dropdown filter
            const matchesTab = item.category === selectedTab;
            
            const matchesCategorySelect = categoryFilter === 'Semua Kategori' || item.category === categoryFilter;
            const matchesStatusSelect = statusFilter === 'Semua Status' || item.status === statusFilter;

            return matchesSearch && matchesTab && matchesCategorySelect && matchesStatusSelect;
        });
    }, [dataList, searchQuery, selectedTab, categoryFilter, statusFilter]);

    // Reset filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setCategoryFilter('Semua Kategori');
        setStatusFilter('Semua Status');
    };

    // Add item submit handler
    const handleAddData = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newCode.trim()) return;

        router.post('/master-data', {
            name: newName,
            category: newCategory,
            code: newCode.toUpperCase(),
            status: newStatus,
        }, {
            onSuccess: () => {
                setIsAddModalOpen(false);

                // Append to history log
                const newHistoryLog: ChangeHistoryItem = {
                    id: String(Date.now()),
                    text: `Tambah data "${newCategory} — ${newName}"`,
                    author: user?.name?.split(' ')[0] || 'Raffa',
                    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                };
                setHistory(prev => [newHistoryLog, ...prev]);

                setNewName('');
                setNewCode('');
                setToastMessage(`Data ${newName} berhasil ditambahkan ke kategori ${newCategory}.`);
                setTimeout(() => setToastMessage(null), 4000);
            }
        });
    };

    // Delete item handler
    const handleDeleteItem = (id: string) => {
        const item = dataList.find(i => i.id === id);
        if (!item) return;

        router.delete(`/master-data/${id}`, {
            onSuccess: () => {
                setToastMessage(`Data ${item.name} berhasil dihapus.`);
                setTimeout(() => setToastMessage(null), 4000);
            }
        });
    };

    // Mock synchronization log
    const [syncLogs, setSyncLogs] = useState<SyncItem[]>([
        { id: '1', task: 'Sinkronisasi Kategori Pelatihan', status: 'Berhasil', date: '20 Mei 2024', time: '10:21', author: 'System' },
        { id: '2', task: 'Update Status Modul', status: 'Berhasil', date: '19 Mei 2024', time: '16:45', author: 'Raffa' },
        { id: '3', task: 'Import Data Unit Kerja', status: 'Gagal', date: '19 Mei 2024', time: '15:20', author: 'Raffa' }
    ]);

    // Mock change history
    const [history, setHistory] = useState<ChangeHistoryItem[]>([
        { id: '1', text: 'Update data "Kategori Pelatihan — Digital Leadership"', author: 'Raffa', date: '20 Mei 2024', time: '10:21' },
        { id: '2', text: 'Tambah data "Metode — Webinar"', author: 'Raffa', date: '17 Mei 2024', time: '09:15' },
        { id: '3', text: 'Nonaktifkan data "Penyelenggara — Lembaga Sertifikasi Nasional"', author: 'Raffa', date: '15 Mei 2024', time: '13:05' }
    ]);

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
                        Anda masuk sebagai <span className="font-semibold text-neutral-800 dark:text-neutral-200 capitalize">({role})</span>. Hanya akun Administrator yang diperbolehkan mengakses halaman konfigurasi Master Data ini.
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

    // Tab items matching screenshot
    const tabItems = [
        { name: 'Jenis Pelatihan', icon: BookOpen },
        { name: 'Kategori Pelatihan', icon: Layers },
        { name: 'Metode', icon: GraduationCap },
        { name: 'Penyelenggara', icon: Building2 },
        { name: 'Bahasa', icon: Globe },
        { name: 'Jenis Sertifikat', icon: Award },
        { name: 'Unit Kerja', icon: Users },
        { name: 'Status Modul', icon: CheckCircle }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Data" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                        Master Data
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Kelola data referensi utama yang digunakan pada seluruh modul aplikasi.
                    </p>
                </div>

                {/* Success Toast */}
                {toastMessage && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400 shadow-sm animate-in fade-in duration-300">
                        <CheckCircle2 className="size-4.5" />
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* Metrics Indicator Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {/* Kategori Master */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <Layers className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Kategori Master</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">8</span>
                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold mt-0.5">Total kategori master data</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Data Aktif */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <Database className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Total Data Aktif</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{activeCount}</span>
                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-500 mt-0.5 flex items-center gap-0.5">
                                    <span>↑ 18 dari bulan lalu</span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Perlu Sinkronisasi */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                                <RefreshCw className="size-6 animate-spin-slow" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Perlu Sinkronisasi</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">2</span>
                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold mt-0.5">Data perlu disinkronkan</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Update Bulan Ini */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                                <Calendar className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Update Bulan Ini</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">14</span>
                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold mt-0.5">Perubahan data bulan ini</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sub-menu Tabs Selection */}
                <div className="flex flex-wrap items-center gap-2 border-b pb-3 border-neutral-200 dark:border-neutral-800 text-xs font-semibold">
                    {tabItems.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.name}
                                onClick={() => setSelectedTab(tab.name)}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all border ${
                                    selectedTab === tab.name
                                        ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500'
                                        : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-600 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-850'
                                }`}
                            >
                                <Icon className="size-3.5" />
                                <span>{tab.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Split Column Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    
                    {/* Main content Area (Left 3 columns) */}
                    <div className="lg:col-span-3 space-y-6">
                        
                        {/* Filter Bar and Grid table card */}
                        <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm overflow-hidden">
                            {/* Filters */}
                            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/10 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                                
                                {/* Search input */}
                                <div className="relative flex-1 max-w-xs">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari nama data..."
                                        className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                    />
                                </div>

                                {/* Select filter group */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Kategori">Semua Kategori</option>
                                        <option value="Jenis Pelatihan">Jenis Pelatihan</option>
                                        <option value="Kategori Pelatihan">Kategori Pelatihan</option>
                                        <option value="Metode">Metode</option>
                                        <option value="Penyelenggara">Penyelenggara</option>
                                        <option value="Bahasa">Bahasa</option>
                                        <option value="Jenis Sertifikat">Jenis Sertifikat</option>
                                        <option value="Unit Kerja">Unit Kerja</option>
                                        <option value="Status Modul">Status Modul</option>
                                    </select>

                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Status">Semua Status</option>
                                        <option value="Aktif">Aktif</option>
                                        <option value="Nonaktif">Nonaktif</option>
                                    </select>

                                    <Button
                                        onClick={handleResetFilters}
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 font-semibold"
                                    >
                                        <RefreshCw className="mr-1.5 size-3.5" />
                                        Reset Filter
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            setNewCategory(selectedTab as MasterItem['category']);
                                            setIsAddModalOpen(true);
                                        }}
                                        size="sm"
                                        className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Plus className="size-4" />
                                        <span>Tambah Data</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px] border-collapse text-xs text-left">
                                    <thead>
                                        <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                            <th className="px-6 py-3.5">Nama Data</th>
                                            <th className="px-6 py-3.5">Kategori</th>
                                            <th className="px-6 py-3.5">Kode</th>
                                            <th className="px-6 py-3.5">Status</th>
                                            <th className="px-6 py-3.5">Updated At</th>
                                            <th className="px-6 py-3.5 text-center w-24">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {filteredData.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-10 text-neutral-400 font-medium dark:text-neutral-500">
                                                    Tidak ada master data yang cocok.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredData.map((item) => (
                                                <tr key={item.id} className="hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10 transition-colors">
                                                    <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                                                        {item.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 font-medium">
                                                        {item.category}
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-700 dark:text-neutral-300 font-bold">
                                                        {item.code}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge
                                                            className={`font-semibold rounded-md border-0 px-2 py-0.5 text-[9px] ${
                                                                item.status === 'Aktif'
                                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                                                            }`}
                                                        >
                                                            {item.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-550 dark:text-neutral-500 font-medium">
                                                        {item.updatedAt}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400">
                                                                <Edit3 className="size-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteItem(item.id)}
                                                                className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-rose-600 dark:hover:bg-neutral-800 dark:text-rose-400"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </button>
                                                        </div>
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
                                    Menampilkan 1-{filteredData.length} dari 286 data
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
                                        <button className="flex size-7 items-center justify-center rounded text-xs font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">29</button>
                                        <button className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"><ChevronRight className="size-3.5" /></button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Bottom Grid for Validasi Data & Riwayat Perubahan */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            
                            {/* Validasi Data */}
                            <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm flex flex-col justify-between">
                                <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Validasi Data</h3>
                                </div>
                                <CardContent className="p-5 space-y-4">
                                    {/* Alert Duplicate */}
                                    <div className="flex gap-3 text-xs items-center p-3.5 border border-amber-250 bg-amber-50/20 rounded-xl dark:border-amber-900/30">
                                        <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40">
                                            <AlertTriangle className="size-4.5" />
                                        </div>
                                        <div className="flex-1 flex flex-col gap-0.5">
                                            <span className="font-bold text-neutral-850 dark:text-neutral-200">Data Duplikat</span>
                                            <span className="text-neutral-450 dark:text-neutral-500">Terdapat 3 data duplikat yang perlu ditinjau.</span>
                                        </div>
                                        <Button size="sm" variant="outline" className="h-8 font-semibold text-[10px] border-neutral-200 dark:border-neutral-800 text-neutral-600">
                                            Lihat Detail
                                        </Button>
                                    </div>

                                    {/* Alert Nonaktif */}
                                    <div className="flex gap-3 text-xs items-center p-3.5 border border-rose-250 bg-rose-50/20 rounded-xl dark:border-rose-900/30">
                                        <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40">
                                            <XCircle className="size-4.5" />
                                        </div>
                                        <div className="flex-1 flex flex-col gap-0.5">
                                            <span className="font-bold text-neutral-850 dark:text-neutral-200">Data Nonaktif</span>
                                            <span className="text-neutral-450 dark:text-neutral-500">Terdapat 7 data nonaktif yang dapat diarsipkan.</span>
                                        </div>
                                        <Button size="sm" variant="outline" className="h-8 font-semibold text-[10px] border-neutral-200 dark:border-neutral-800 text-neutral-600">
                                            Lihat Detail
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Riwayat Perubahan */}
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 flex flex-col justify-between">
                                <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Riwayat Perubahan</h3>
                                </div>
                                <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                                    <div className="relative pl-5 border-l border-neutral-100 dark:border-neutral-800 space-y-4.5 text-xs">
                                        {history.map((log) => (
                                            <div key={log.id} className="relative">
                                                <span className="absolute -left-[26px] top-1 flex size-3 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white dark:ring-neutral-950"></span>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{log.text}</span>
                                                    <span className="text-[10px] text-neutral-400 mt-0.5">Oleh {log.author} • {log.date} {log.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-2 border-t text-center">
                                        <button className="text-blue-600 hover:text-blue-700 text-xs font-semibold dark:text-blue-400 dark:hover:text-blue-300">
                                            Lihat Semua Riwayat
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                    </div>

                    {/* Right column (1/3 width) - Overview, Sinkronisasi, Quick Action */}
                    <div className="space-y-6 lg:col-span-1">
                        
                        {/* Overview Master Data */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Overview Master Data</h3>
                            </div>
                            <CardContent className="p-5 space-y-3">
                                {Object.entries(categoryCounts).map(([cat, count]) => (
                                    <div key={cat} className="flex justify-between items-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 border-b pb-2 last:border-0 last:pb-0 dark:border-neutral-800">
                                        <span>{cat}</span>
                                        <span className="font-bold text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-900 px-2 py-0.5 rounded border text-[10px]">{count}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Aktivitas Sinkronisasi */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Aktivitas Sinkronisasi</h3>
                            </div>
                            <CardContent className="p-5 space-y-4.5">
                                <div className="space-y-3 text-xs">
                                    {syncLogs.map((log) => (
                                        <div key={log.id} className="flex justify-between items-start border-b pb-2.5 last:border-0 last:pb-0 dark:border-neutral-850">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-neutral-850 dark:text-neutral-200">{log.task}</span>
                                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{log.date} {log.time} oleh {log.author}</span>
                                            </div>
                                            <Badge
                                                className={`font-semibold rounded border-0 px-2 py-0.2 text-[8px] ${
                                                    log.status === 'Berhasil'
                                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                                                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                                                }`}
                                            >
                                                {log.status}
                                            </Badge>
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

                        {/* Quick Actions Grid */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Aksi Cepat</h3>
                            </div>
                            <CardContent className="p-5 grid grid-cols-3 gap-2 text-center text-[10px]">
                                {/* Kelola Kategori */}
                                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/20 hover:bg-neutral-50 dark:hover:bg-neutral-900 gap-2 font-semibold text-neutral-700 dark:text-neutral-300 transition-colors">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                        <Layers className="size-4" />
                                    </div>
                                    <span>Kelola Kategori</span>
                                </button>
                                
                                {/* Import Data */}
                                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/20 hover:bg-neutral-50 dark:hover:bg-neutral-900 gap-2 font-semibold text-neutral-700 dark:text-neutral-300 transition-colors">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                                        <Upload className="size-4" />
                                    </div>
                                    <span>Import Data</span>
                                </button>

                                {/* Export Master */}
                                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/20 hover:bg-neutral-50 dark:hover:bg-neutral-900 gap-2 font-semibold text-neutral-700 dark:text-neutral-300 transition-colors">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                                        <Download className="size-4" />
                                    </div>
                                    <span>Export Master</span>
                                </button>
                            </CardContent>
                        </Card>

                    </div>

                </div>

            </div>

            {/* Modal: Tambah Data */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Plus className="size-5 text-blue-600 dark:text-blue-400" />
                            <span>Tambah Master Data</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Masukkan data baru pada kategori master data referensi aplikasi.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddData} className="space-y-4 py-2 text-xs">
                        {/* Nama Data */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                Nama Data
                            </label>
                            <input
                                type="text"
                                required
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Contoh: Teknis, Manajerial, Indonesia..."
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                        </div>

                        {/* Kategori & Kode */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                    Kategori
                                </label>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value as MasterItem['category'])}
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                >
                                    <option value="Jenis Pelatihan">Jenis Pelatihan</option>
                                    <option value="Kategori Pelatihan">Kategori Pelatihan</option>
                                    <option value="Metode">Metode</option>
                                    <option value="Penyelenggara">Penyelenggara</option>
                                    <option value="Bahasa">Bahasa</option>
                                    <option value="Jenis Sertifikat">Jenis Sertifikat</option>
                                    <option value="Unit Kerja">Unit Kerja</option>
                                    <option value="Status Modul">Status Modul</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                    Kode Data
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newCode}
                                    onChange={(e) => setNewCode(e.target.value)}
                                    placeholder="Contoh: JP-004, MD-005..."
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                Status
                            </label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                            >
                                <option value="Aktif">Aktif</option>
                                <option value="Nonaktif">Nonaktif</option>
                            </select>
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsAddModalOpen(false)}
                                className="rounded-lg h-9 px-4 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg h-9 px-4 text-xs font-semibold"
                            >
                                Simpan Data
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
