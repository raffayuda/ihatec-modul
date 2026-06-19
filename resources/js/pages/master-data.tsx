import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
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
    Globe,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Download,
    Upload,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import React, { useState, useMemo, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manajemen Modul',
        href: '/master-data',
    },
];

interface MasterItem {
    id: string;
    name: string;
    category:
        | 'Jenis Kebutuhan Modul'
        | 'Kode Pelatihan'
        | 'Jenis Modul'
        | 'Bahasa Pengantar'
        | 'Tipe Pelatihan'
        | 'Tipe Sertifikat di Sihalal'
        | 'Jenis Sertifikat'
        | 'PIC Periksa LK'
        | 'Kode Program'
        | 'Jenis Perubahan';
    code: string | null;
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
    flash?: {
        message?: string;
        error?: string;
    };
}

export default function MasterData() {
    const { props } = usePage<MasterDataProps>();
    const { auth, dataList: initialDataList = [], flash } = props;
    const user = auth?.user;
    const role = user?.role || 'User';

    // Access control: only admin can access this page
    const hasAccess = role.toLowerCase() === 'admin';

    const [dataList, setDataList] = useState<MasterItem[]>(initialDataList);

    React.useEffect(() => {
        setDataList(initialDataList);
    }, [initialDataList]);

    // Active Category Filter Tab — read from URL ?tab= param
    const getInitialTab = () => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            const tabMap: Record<string, string> = {
                'jenis-kebutuhan': 'Jenis Kebutuhan Modul',
                'kode-pelatihan': 'Kode Pelatihan',
                'jenis-modul': 'Jenis Modul',
                'bahasa-pengantar': 'Bahasa Pengantar',
                'tipe-pelatihan': 'Tipe Pelatihan',
                'tipe-sertifikat-sihalal': 'Tipe Sertifikat di Sihalal',
                'jenis-sertifikat': 'Jenis Sertifikat',
                'pic-periksa-lk': 'PIC Periksa LK',
                'kode-program': 'Kode Program',
                'jenis-perubahan': 'Jenis Perubahan',
            };
            if (tabParam && tabMap[tabParam]) return tabMap[tabParam];
        }
        return 'Jenis Kebutuhan Modul';
    };
    const [selectedTab, setSelectedTab] = useState<string>(getInitialTab);

    // Search and filter fields
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Semua Kategori');
    const [statusFilter, setStatusFilter] = useState('Semua Status');

    // Dialog Modal Add State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] = useState<MasterItem['category']>('Jenis Kebutuhan Modul');
    const [newCode, setNewCode] = useState('');
    const [newCode2, setNewCode2] = useState(''); // for Kode Program: second field = Nama Program
    const [newStatus, setNewStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

    // Dialog Modal Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
    const [editName, setEditName] = useState('');
    const [editCategory, setEditCategory] = useState<MasterItem['category']>('Jenis Kebutuhan Modul');
    const [editCode, setEditCode] = useState('');
    const [editCode2, setEditCode2] = useState(''); // for Kode Program: second field = Nama Program
    const [editStatus, setEditStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [pageSize, setPageSize] = useState('10');

    const [localToast, setLocalToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    React.useEffect(() => {
        if (flash?.message) {
            setLocalToast({ message: flash.message, type: 'success' });
            const timer = setTimeout(() => setLocalToast(null), 4000);
            return () => clearTimeout(timer);
        } else if (flash?.error) {
            setLocalToast({ message: flash.error, type: 'error' });
            const timer = setTimeout(() => setLocalToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Dynamic category counts — all 9 categories
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {
            'Jenis Kebutuhan Modul': 0,
            'Kode Pelatihan': 0,
            'Jenis Modul': 0,
            'Bahasa Pengantar': 0,
            'Tipe Pelatihan': 0,
            'Tipe Sertifikat di Sihalal': 0,
            'Jenis Sertifikat': 0,
            'PIC Periksa LK': 0,
            'Kode Program': 0,
            'Jenis Perubahan': 0,
        };
        dataList.forEach((item) => {
            if (counts[item.category] !== undefined) {
                counts[item.category]++;
            }
        });
        return counts;
    }, [dataList]);

    const activeCount = useMemo(() => {
        return dataList.filter((item) => item.status === 'Aktif').length;
    }, [dataList]);

    // Whether current tab has a 'code' column (Kode column shown for these)
    const hasCodeColumn = ['Kode Pelatihan', 'Kode Program'].includes(selectedTab);
    // Label for columns
    const getColumnLabels = () => {
        if (selectedTab === 'Kode Pelatihan') return { col1: 'Nama Pelatihan', col2: 'Kode Pelatihan' };
        if (selectedTab === 'Kode Program') return { col1: 'Kode Program', col2: 'Nama Program' };
        return { col1: selectedTab, col2: null };
    };
    const colLabels = getColumnLabels();

    // Whether current tab supports CSV import/export
    const supportsImport = ['Kode Pelatihan', 'Kode Program'].includes(selectedTab);

    // Filter dataList
    const filteredData = useMemo(() => {
        return dataList.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase()));
            
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
        setSelectedIds([]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredData.map(item => item.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = () => {
        router.delete('/master-data/bulk', {
            data: { ids: selectedIds },
            onSuccess: () => {
                setSelectedIds([]);
                setIsBulkDeleteModalOpen(false);
            },
        });
    };

    // Add item submit handler
    const handleAddData = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        // For Kode Program: name = Nama Program, code = Kode Program
        const payload = selectedTab === 'Kode Program'
            ? { name: newCode2.trim(), category: newCategory, code: newName.trim().toUpperCase() || null, status: newStatus }
            : { name: newName, category: newCategory, code: newCode.trim().toUpperCase() || null, status: newStatus };

        router.post('/master-data', payload, {
            onSuccess: () => {
                setIsAddModalOpen(false);
                const newHistoryLog: ChangeHistoryItem = {
                    id: String(Date.now()),
                    text: `Tambah data "${newCategory} — ${newName}"`,
                    author: user?.name?.split(' ')[0] || 'Admin',
                    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                };
                setHistory((prev) => [newHistoryLog, ...prev]);
                setNewName('');
                setNewCode('');
                setNewCode2('');
            },
        });
    };

    // Edit item submit handler
    const handleEditData = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem || !editName.trim()) return;

        const payload = selectedTab === 'Kode Program'
            ? { name: editCode2.trim(), category: editCategory, code: editName.trim().toUpperCase() || null, status: editStatus }
            : { name: editName, category: editCategory, code: editCode.trim().toUpperCase() || null, status: editStatus };

        router.put(`/master-data/${editingItem.id}`, payload, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                const newHistoryLog: ChangeHistoryItem = {
                    id: String(Date.now()),
                    text: `Edit data "${editCategory} — ${editName}"`,
                    author: user?.name?.split(' ')[0] || 'Admin',
                    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                };
                setHistory((prev) => [newHistoryLog, ...prev]);
            },
        });
    };

    // Open Edit modal
    const handleOpenEdit = (item: MasterItem) => {
        setEditingItem(item);
        // For Kode Program: code field = Kode Program, name field = Nama Program
        if (selectedTab === 'Kode Program') {
            setEditName(item.code || '');
            setEditCode2(item.name);
        } else {
            setEditName(item.name);
            setEditCode(item.code || '');
        }
        setEditCategory(item.category);
        setEditStatus(item.status);
        setIsEditModalOpen(true);
    };

    // Delete item handler
    const handleDeleteItem = (id: string) => {
        const item = dataList.find(i => i.id === id);
        if (!item) return;

        router.delete(`/master-data/${id}`, {
            onSuccess: () => {
                // Flash message will be shown
            }
        });
    };

    // Handle CSV Import
    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        router.post('/master-data/import', formData, {
            onSuccess: () => {
                // Flash message will be shown
            },
            onError: (errors) => {
                setLocalToast({ message: 'Gagal mengimpor file: ' + (errors.file || 'Format tidak valid.'), type: 'error' });
                setTimeout(() => setLocalToast(null), 4000);
            }
        });
    };

    // Mock synchronization log
    const [syncLogs] = useState<SyncItem[]>([
        { id: '1', task: 'Sinkronisasi Manajemen Modul', status: 'Berhasil', date: '07 Jun 2026', time: '14:21', author: 'System' },
        { id: '2', task: 'Update Status Modul', status: 'Berhasil', date: '07 Jun 2026', time: '16:45', author: 'Admin' },
        { id: '3', task: 'Import Data Kode Pelatihan', status: 'Berhasil', date: '07 Jun 2026', time: '15:20', author: 'Admin' }
    ]);

    // Mock change history
    const [history, setHistory] = useState<ChangeHistoryItem[]>([
        { id: '1', text: 'Update data "Kode Pelatihan — ISO 17025"', author: 'Admin', date: '07 Jun 2026', time: '14:24' },
        { id: '2', text: 'Tambah data "Bahasa Pengantar — Mandarin"', author: 'Admin', date: '07 Jun 2026', time: '11:15' },
        { id: '3', text: 'Tambah data "Jenis Kebutuhan — Pelatihan Inhouse"', author: 'Admin', date: '07 Jun 2026', time: '10:05' }
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
                        Anda masuk sebagai <span className="font-semibold text-neutral-800 dark:text-neutral-200 capitalize">({role})</span>. Hanya akun Administrator yang diperbolehkan mengakses halaman konfigurasi Manajemen Modul ini.
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

    // Tab config (used for category counts in sidebar — tabs themselves removed from UI)
    const ALL_CATEGORIES = [
        'Jenis Kebutuhan Modul',
        'Kode Pelatihan',
        'Jenis Modul',
        'Bahasa Pengantar',
        'Tipe Pelatihan',
        'Tipe Sertifikat di Sihalal',
        'Jenis Sertifikat',
        'PIC Periksa LK',
        'Kode Program',
        'Jenis Perubahan',
    ] as const;

    return (
        <AppLayout breadcrumbs={[{ title: selectedTab, href: `/master-data?tab=${selectedTab.toLowerCase().replace(/ /g, '-')}` }]}>
            <Head title={selectedTab} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                        DATABASE {selectedTab.toUpperCase()}
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Kelola data referensi <span className="font-semibold text-neutral-700 dark:text-neutral-300">{selectedTab}</span> untuk modul pelatihan.
                    </p>
                </div>

                {/* Success/Error Toast */}
                {localToast && (
                    <div className={`fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-xl border p-4 text-sm font-semibold shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300 ${
                        localToast.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300'
                            : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300'
                    }`}>
                        {localToast.type === 'success' ? (
                            <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <AlertTriangle className="size-4.5 text-rose-600 dark:text-rose-450" />
                        )}
                        <span>{localToast.message}</span>
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
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">4</span>
                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold mt-0.5">Total kategori manajemen modul</span>
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
                                    <span>Aktif dalam kategori</span>
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
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">0</span>
                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold mt-0.5">Semua data up-to-date</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Update Hari Ini */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                                <Calendar className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Update Hari Ini</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">3</span>
                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold mt-0.5">Perubahan data hari ini</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Tab bar removed — navigation via sidebar ── */}


                {/* Split Column Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    
                    {/* Main content Area (Left 3 columns) */}
                    <div className="lg:col-span-3 space-y-6">
                        
                        {/* Filter Bar and Grid table card */}
                        <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm overflow-hidden">
                            {/* Filter items */}
                            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/10 space-y-4">
                                {/* Top Row: Search & Actions */}
                                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                                    <div className="relative w-full lg:max-w-md xl:max-w-lg flex-1">
                                        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Cari nama data..."
                                            className="h-10 w-full rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 pl-10 pr-4 text-xs text-neutral-900 dark:text-neutral-100 outline-none placeholder:text-neutral-400 focus:border-blue-500 dark:border-neutral-800 shadow-sm transition-all"
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:justify-end">
                                        {selectedIds.length > 0 && (
                                            <Button
                                                onClick={() => setIsBulkDeleteModalOpen(true)}
                                                variant="destructive"
                                                size="sm"
                                                className="h-9 px-3.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                                            >
                                                <Trash2 className="size-4" />
                                                <span>Hapus ({selectedIds.length})</span>
                                            </Button>
                                        )}

                                        <Button
                                            onClick={() => {
                                                setNewCategory(selectedTab as MasterItem['category']);
                                                setNewName('');
                                                setNewCode('');
                                                setNewCode2('');
                                                setIsAddModalOpen(true);
                                            }}
                                            size="sm"
                                            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                                        >
                                            <Plus className="size-4" />
                                            <span>Tambah Data</span>
                                        </Button>

                                        {/* Excel Template & Import actions for supported tabs */}
                                        {supportsImport && (
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href="/master-data/template"
                                                    className="inline-flex h-9 items-center gap-1.5 px-3 rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-neutral-650 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-850 shadow-sm"
                                                >
                                                    <Download className="size-3.5" />
                                                    <span>Template</span>
                                                </a>
                                                <button
                                                    onClick={() => document.getElementById('csv-file-input')?.click()}
                                                    className="inline-flex h-9 items-center gap-1.5 px-3 rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-neutral-650 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-850 shadow-sm cursor-pointer"
                                                >
                                                    <Upload className="size-3.5" />
                                                    <span>Import</span>
                                                </button>
                                                <input
                                                    type="file"
                                                    id="csv-file-input"
                                                    accept=".csv"
                                                    className="hidden"
                                                    onChange={handleImportCSV}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Row: Filters */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <SearchableSelect
                                            value={statusFilter}
                                            onChange={val => setStatusFilter(val)}
                                            options={['Semua Status', 'Aktif', 'Nonaktif']}
                                        />
                                    </div>

                                    <Button
                                        onClick={handleResetFilters}
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-3 rounded-lg border border-neutral-200 bg-white dark:bg-neutral-900 text-xs text-neutral-600 dark:text-neutral-300 font-semibold shadow-sm"
                                    >
                                        <RefreshCw className="mr-1.5 size-3.5" />
                                        Reset Filter
                                    </Button>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px] border-collapse text-xs text-left">
                                    <thead>
                                        <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                            <th className="px-6 py-3.5 w-10">
                                                <input 
                                                    type="checkbox"
                                                    checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                                                    onChange={toggleSelectAll}
                                                    className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 size-3.5 cursor-pointer"
                                                />
                                            </th>
                                            <th className="px-6 py-3.5 w-16">No</th>
                                            {hasCodeColumn ? (
                                                <>
                                                    <th className="px-6 py-3.5">{colLabels.col1}</th>
                                                    <th className="px-6 py-3.5">{colLabels.col2}</th>
                                                </>
                                            ) : (
                                                <th className="px-6 py-3.5">{selectedTab}</th>
                                            )}
                                            <th className="px-6 py-3.5 w-24">Status</th>
                                            <th className="px-6 py-3.5 w-36">Updated At</th>
                                            <th className="px-6 py-3.5 text-center w-24">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {filteredData.length === 0 ? (
                                            <tr>
                                                <td colSpan={selectedTab === 'Kode Pelatihan' ? 7 : 6} className="text-center py-10 text-neutral-400 font-medium dark:text-neutral-500">
                                                    Tidak ada data yang cocok.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredData.map((item, index) => (
                                                <tr key={item.id} className={`hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10 transition-colors ${selectedIds.includes(item.id) ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <input 
                                                            type="checkbox"
                                                            checked={selectedIds.includes(item.id)}
                                                            onChange={() => toggleSelect(item.id)}
                                                            className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 size-3.5 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-neutral-500">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                                                        {selectedTab === 'Kode Program' ? item.code : item.name}
                                                    </td>
                                                    {hasCodeColumn && (
                                                        <td className="px-6 py-4 text-neutral-700 dark:text-neutral-300 font-medium">
                                                            {selectedTab === 'Kode Program' ? item.name : (item.code || '-')}
                                                        </td>
                                                    )}
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
                                                            <button
                                                                onClick={() => handleOpenEdit(item)}
                                                                className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400 cursor-pointer"
                                                            >
                                                                <Edit3 className="size-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteItem(item.id)}
                                                                className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-rose-600 dark:hover:bg-neutral-800 dark:text-rose-400 cursor-pointer"
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
                                    Menampilkan {filteredData.length > 0 ? 1 : 0}-{filteredData.length} dari {filteredData.length} data
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
                                            <span className="font-bold text-neutral-850 dark:text-neutral-200">Data Terintegrasi</span>
                                            <span className="text-neutral-450 dark:text-neutral-500">Seluruh data referensi tersinkronisasi sempurna dengan modul.</span>
                                        </div>
                                    </div>

                                    {/* Alert Active status */}
                                    <div className="flex gap-3 text-xs items-center p-3.5 border border-emerald-250 bg-emerald-50/20 rounded-xl dark:border-emerald-900/30">
                                        <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                                            <CheckCircle2 className="size-4.5" />
                                        </div>
                                        <div className="flex-1 flex flex-col gap-0.5">
                                            <span className="font-bold text-neutral-850 dark:text-neutral-200">Kondisi Sistem Sehat</span>
                                            <span className="text-neutral-450 dark:text-neutral-500">Tidak ditemukan kode pelatihan duplikat atau bentrok.</span>
                                        </div>
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
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Overview Manajemen Modul</h3>
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

                    </div>

                </div>

            </div>

            {/* Modal: Tambah Data */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Plus className="size-5 text-blue-600 dark:text-blue-400" />
                            <span>Tambah Data Referensi</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Masukkan data baru pada kategori referensi modul aplikasi.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddData} className="space-y-4 py-2 text-xs">

                        {/* Kode Program: dual-field */}
                        {newCategory === 'Kode Program' ? (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Kode Program *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="Contoh: PD-001, TR-2026..."
                                        className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Nama Program *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newCode2}
                                        onChange={(e) => setNewCode2(e.target.value)}
                                        placeholder="Contoh: Program Pelatihan Halal..."
                                        className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                    {newCategory === 'Kode Pelatihan' ? 'Nama Pelatihan' : newCategory} *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder={newCategory === 'Kode Pelatihan' ? 'Contoh: Interpretasi Sistem ISO 17025...' : `Contoh: ${newCategory}...`}
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                                />
                            </div>
                        )}

                        {/* Kode field: shown only for Kode Pelatihan */}
                        {newCategory === 'Kode Pelatihan' && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Kode Pelatihan *</label>
                                <input
                                    type="text"
                                    required
                                    value={newCode}
                                    onChange={(e) => setNewCode(e.target.value)}
                                    placeholder="Contoh: ILN.1.8, SJPH..."
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                                />
                            </div>
                        )}

                        {/* Status */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Status</label>
                            <SearchableSelect
                                value={newStatus}
                                onChange={val => setNewStatus(val as 'Aktif' | 'Nonaktif')}
                                options={['Aktif', 'Nonaktif']}
                            />
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="rounded-lg h-9 px-4 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400">
                                Batal
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg h-9 px-4 text-xs font-semibold">
                                Simpan Data
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: Edit Data */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Edit3 className="size-5 text-blue-600 dark:text-blue-400" />
                            <span>Edit Data Referensi</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Perbarui data referensi modul aplikasi.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditData} className="space-y-4 py-2 text-xs">

                        {/* Kode Program: dual-field */}
                        {editCategory === 'Kode Program' ? (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Kode Program *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Contoh: PD-001, TR-2026..."
                                        className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Nama Program *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editCode2}
                                        onChange={(e) => setEditCode2(e.target.value)}
                                        placeholder="Contoh: Program Pelatihan Halal..."
                                        className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                    {editCategory === 'Kode Pelatihan' ? 'Nama Pelatihan' : editCategory} *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder={editCategory === 'Kode Pelatihan' ? 'Contoh: Interpretasi Sistem ISO 17025...' : `Contoh: ${editCategory}...`}
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                                />
                            </div>
                        )}

                        {/* Kode field: shown only for Kode Pelatihan */}
                        {editCategory === 'Kode Pelatihan' && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Kode Pelatihan *</label>
                                <input
                                    type="text"
                                    required
                                    value={editCode}
                                    onChange={(e) => setEditCode(e.target.value)}
                                    placeholder="Contoh: ILN.1.8, SJPH..."
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                                />
                            </div>
                        )}

                        {/* Status */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Status</label>
                            <SearchableSelect
                                value={editStatus}
                                onChange={val => setEditStatus(val as 'Aktif' | 'Nonaktif')}
                                options={['Aktif', 'Nonaktif']}
                            />
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="rounded-lg h-9 px-4 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400">
                                Batal
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg h-9 px-4 text-xs font-semibold">
                                Perbarui Data
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: Bulk Delete Confirmation */}
            <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Hapus Masal Data Referensi</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus <span className="font-bold text-neutral-900 dark:text-neutral-100">{selectedIds.length}</span> data referensi yang dipilih secara permanen? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBulkDeleteModalOpen(false)}>Batal</Button>
                        <Button onClick={handleBulkDelete} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                            Hapus Semua Terpilih
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
