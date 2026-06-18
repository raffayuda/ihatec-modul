import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Search,
    Plus,
    Edit3,
    Trash2,
    AlertTriangle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Download,
    Upload,
    RefreshCw,
    Database,
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
import { SearchableSelect } from '@/components/ui/searchable-select';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface MasterItem {
    id: string;
    name: string;
    category: string;
    code: string | null;
    status: 'Aktif' | 'Nonaktif';
    updatedAt: string;
}

export interface CategoryConfig {
    /** The category value stored in the DB */
    category: string;
    /** Display title of the page (e.g. "Jenis Kebutuhan Modul") */
    title: string;
    /**
     * Column definitions for the table.
     * - For simple single-column: [{ key: 'name', label: 'Nama' }]
     * - For dual-column (Kode Pelatihan): [{ key: 'name', label: 'Nama Pelatihan' }, { key: 'code', label: 'Kode Pelatihan' }]
     * - For Kode Program (code first): [{ key: 'code', label: 'Kode Program' }, { key: 'name', label: 'Nama Program' }]
     */
    columns: Array<{ key: 'name' | 'code'; label: string }>;
    /** Whether to show the Download Template + Import CSV buttons */
    supportsImport?: boolean;
    /** URL slug for breadcrumb (e.g. 'master-data/jenis-kebutuhan') */
    routeSlug: string;
}

interface PageProps extends SharedData {
    dataList?: MasterItem[];
    flash?: { message?: string; error?: string };
}

// ──────────────────────────────────────────────
// Shared Component
// ──────────────────────────────────────────────

export default function MasterDataCategoryPage({ config }: { config: CategoryConfig }) {
    const { props } = usePage<PageProps>();
    const { auth, dataList: initialDataList = [], flash } = props;
    const user = auth?.user;
    const role = user?.role || 'User';
    const hasAccess = role.toLowerCase() === 'admin';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Role & Master Data', href: '/master-data' },
        { title: config.title, href: `/${config.routeSlug}` },
    ];

    // ── Data ──────────────────────────────────
    const [dataList, setDataList] = useState<MasterItem[]>(initialDataList);
    React.useEffect(() => { setDataList(initialDataList); }, [initialDataList]);

    // ── Filters ───────────────────────────────
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua Status');

    // ── Add modal ─────────────────────────────
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addFields, setAddFields] = useState<Record<string, string>>({});
    const [addStatus, setAddStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

    // ── Edit modal ────────────────────────────
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
    const [editFields, setEditFields] = useState<Record<string, string>>({});
    const [editStatus, setEditStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

    // ── Bulk delete ───────────────────────────
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

    // ── Toast ─────────────────────────────────
    const [localToast, setLocalToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    React.useEffect(() => {
        if (flash?.message) {
            setLocalToast({ message: flash.message, type: 'success' });
            const t = setTimeout(() => setLocalToast(null), 4000);
            return () => clearTimeout(t);
        } else if (flash?.error) {
            setLocalToast({ message: flash.error, type: 'error' });
            const t = setTimeout(() => setLocalToast(null), 4000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    // ── Filtered data ─────────────────────────
    const filteredData = useMemo(() => {
        return dataList.filter((item) => {
            const q = searchQuery.toLowerCase();
            const matchesSearch =
                item.name.toLowerCase().includes(q) ||
                (item.code && item.code.toLowerCase().includes(q));
            const matchesStatus = statusFilter === 'Semua Status' || item.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [dataList, searchQuery, statusFilter]);

    const activeCount = useMemo(() => dataList.filter((i) => i.status === 'Aktif').length, [dataList]);

    // ── Helpers ───────────────────────────────
    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('Semua Status');
        setSelectedIds([]);
    };

    const toggleSelectAll = () =>
        setSelectedIds(selectedIds.length > 0 ? [] : filteredData.map((i) => i.id));

    const toggleSelect = (id: string) =>
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

    // ── Build payload from field map ──────────
    const buildPayload = (fields: Record<string, string>, status: 'Aktif' | 'Nonaktif') => {
        const name = fields['name'] ?? '';
        const code = fields['code'] ? fields['code'].toUpperCase() : null;
        return { name, category: config.category, code, status };
    };

    // ── CRUD handlers ─────────────────────────
    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/master-data', buildPayload(addFields, addStatus), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                setAddFields({});
                setAddStatus('Aktif');
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        router.put(`/master-data/${editingItem.id}`, buildPayload(editFields, editStatus), {
            onSuccess: () => setIsEditModalOpen(false),
        });
    };

    const handleOpenEdit = (item: MasterItem) => {
        setEditingItem(item);
        setEditFields({ name: item.name, code: item.code ?? '' });
        setEditStatus(item.status);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: string) => router.delete(`/master-data/${id}`);

    const handleBulkDelete = () => {
        router.delete('/master-data/bulk', {
            data: { ids: selectedIds },
            onSuccess: () => {
                setSelectedIds([]);
                setIsBulkDeleteModalOpen(false);
            },
        });
    };

    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        router.post('/master-data/import', formData as any, {
            onError: () =>
                setLocalToast({ message: 'Gagal mengimpor file. Pastikan format CSV benar.', type: 'error' }),
        });
    };

    // ── Access denied view ────────────────────
    if (!hasAccess) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={config.title} />
                <div className="flex h-[80vh] flex-col items-center justify-center p-6 text-center">
                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                        <AlertTriangle className="size-8" />
                    </div>
                    <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
                        Akses Halaman Ditolak
                    </h1>
                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
                        Hanya Administrator yang dapat mengakses halaman konfigurasi ini.
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

    // ── Render ────────────────────────────────
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`DATABASE ${config.title.toUpperCase()}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                            DATABASE {config.title.toUpperCase()}
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Kelola data referensi <span className="font-semibold text-neutral-700 dark:text-neutral-300">{config.title}</span> untuk modul pelatihan.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                        {/* Tambah Data button */}
                        <Button
                            onClick={() => { setAddFields({}); setAddStatus('Aktif'); setIsAddModalOpen(true); }}
                            size="sm"
                            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                        >
                            <Plus className="size-4" />
                            <span>Tambah Data</span>
                        </Button>
                        {/* Import / Template buttons */}
                        {config.supportsImport && (
                            <>
                                <a
                                    href="/master-data/template"
                                    className="inline-flex h-9 items-center gap-1.5 px-3 rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 shadow-sm"
                                >
                                    <Download className="size-3.5" />
                                    <span>Template</span>
                                </a>
                                <button
                                    onClick={() => document.getElementById('csv-import-input')?.click()}
                                    className="inline-flex h-9 items-center gap-1.5 px-3 rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 shadow-sm cursor-pointer"
                                >
                                    <Upload className="size-3.5" />
                                    <span>Import</span>
                                </button>
                                <input id="csv-import-input" type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
                            </>
                        )}
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <Database className="size-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Total Data</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{dataList.length}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <CheckCircle2 className="size-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Data Aktif</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{activeCount}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex size-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                                <AlertTriangle className="size-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Nonaktif</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{dataList.length - activeCount}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Toast */}
                {localToast && (
                    <div className={`fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-xl border p-4 text-sm font-semibold shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300 ${
                        localToast.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300'
                            : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300'
                    }`}>
                        {localToast.type === 'success'
                            ? <CheckCircle2 className="size-4.5 text-emerald-600" />
                            : <AlertTriangle className="size-4.5 text-rose-600" />}
                        <span>{localToast.message}</span>
                    </div>
                )}

                {/* Table card */}
                <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm overflow-hidden">
                    {/* Filter bar */}
                    <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/10 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Cari ${config.title}...`}
                                className="h-10 w-full rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 pl-10 pr-4 text-xs text-neutral-900 dark:text-neutral-100 outline-none placeholder:text-neutral-400 focus:border-blue-500 dark:border-neutral-800 shadow-sm transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {selectedIds.length > 0 && (
                                <Button
                                    onClick={() => setIsBulkDeleteModalOpen(true)}
                                    variant="destructive"
                                    size="sm"
                                    className="h-9 px-3.5 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                                >
                                    <Trash2 className="size-3.5" />
                                    <span>Hapus ({selectedIds.length})</span>
                                </Button>
                            )}
                             <div className="w-40">
                                 <SearchableSelect
                                     value={statusFilter}
                                     onChange={(val) => setStatusFilter(val)}
                                     options={['Semua Status', 'Aktif', 'Nonaktif']}
                                 />
                             </div>
                            <Button onClick={resetFilters} variant="outline" size="sm" className="h-9 px-3 rounded-lg text-xs font-semibold shadow-sm">
                                <RefreshCw className="mr-1.5 size-3.5" /> Reset
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px] border-collapse text-xs text-left">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                    <th className="px-5 py-3.5 w-10">
                                        <input
                                            type="checkbox"
                                            checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                                            onChange={toggleSelectAll}
                                            className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 size-3.5 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-5 py-3.5 w-14">No</th>
                                    {config.columns.map((col) => (
                                        <th key={col.key} className="px-5 py-3.5">{col.label}</th>
                                    ))}
                                    <th className="px-5 py-3.5 w-24">Status</th>
                                    <th className="px-5 py-3.5 w-36">Updated At</th>
                                    <th className="px-5 py-3.5 text-center w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={4 + config.columns.length} className="text-center py-12 text-neutral-400 font-medium dark:text-neutral-500">
                                            Tidak ada data ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className={`hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10 transition-colors ${selectedIds.includes(item.id) ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                        >
                                            <td className="px-5 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(item.id)}
                                                    onChange={() => toggleSelect(item.id)}
                                                    className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 size-3.5 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-5 py-4 font-medium text-neutral-500">{index + 1}</td>
                                            {config.columns.map((col) => (
                                                <td key={col.key} className="px-5 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                                                    {col.key === 'name' ? item.name : (item.code ?? '-')}
                                                </td>
                                            ))}
                                            <td className="px-5 py-4">
                                                <Badge className={`font-semibold rounded-md border-0 px-2 py-0.5 text-[9px] ${
                                                    item.status === 'Aktif'
                                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                                                }`}>
                                                    {item.status}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4 text-neutral-500 dark:text-neutral-500 font-medium">{item.updatedAt}</td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenEdit(item)}
                                                        className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400 cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <Edit3 className="size-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="flex size-7 items-center justify-center rounded hover:bg-rose-50 text-rose-600 dark:hover:bg-neutral-800 dark:text-rose-400 cursor-pointer"
                                                        title="Hapus"
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

                    {/* Footer */}
                    <div className="p-4 border-t border-neutral-100 bg-neutral-50/20 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-500">
                        <span className="font-medium">Menampilkan {filteredData.length} dari {dataList.length} data</span>
                        <div className="flex items-center gap-1.5">
                            <button className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                                <ChevronLeft className="size-3.5" />
                            </button>
                            <button className="flex size-7 items-center justify-center rounded text-xs font-semibold border bg-blue-600 border-blue-600 text-white">1</button>
                            <button className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                                <ChevronRight className="size-3.5" />
                            </button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* ── Modal: Tambah Data ── */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Plus className="size-5 text-blue-600 dark:text-blue-400" />
                            Tambah {config.title}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400">
                            Masukkan data baru untuk kategori <strong>{config.title}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAdd} className="space-y-4 py-2">
                        {config.columns.map((col) => (
                            <div key={col.key} className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                    {col.label} *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={addFields[col.key] ?? ''}
                                    onChange={(e) => setAddFields((prev) => ({ ...prev, [col.key]: e.target.value }))}
                                    placeholder={`Masukkan ${col.label}...`}
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                                />
                            </div>
                        ))}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Status</label>
                            <SearchableSelect
                                value={addStatus}
                                onChange={(val) => setAddStatus(val as 'Aktif' | 'Nonaktif')}
                                options={['Aktif', 'Nonaktif']}
                            />
                        </div>
                        <DialogFooter className="gap-2 mt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="h-9 px-4 text-xs font-semibold rounded-lg">
                                Batal
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-xs font-semibold rounded-lg">
                                Simpan Data
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Modal: Edit Data ── */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Edit3 className="size-5 text-blue-600 dark:text-blue-400" />
                            Edit {config.title}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400">
                            Perbarui data referensi <strong>{config.title}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4 py-2">
                        {config.columns.map((col) => (
                            <div key={col.key} className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                    {col.label} *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editFields[col.key] ?? ''}
                                    onChange={(e) => setEditFields((prev) => ({ ...prev, [col.key]: e.target.value }))}
                                    placeholder={`Masukkan ${col.label}...`}
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                                />
                            </div>
                        ))}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Status</label>
                            <SearchableSelect
                                value={editStatus}
                                onChange={(val) => setEditStatus(val as 'Aktif' | 'Nonaktif')}
                                options={['Aktif', 'Nonaktif']}
                            />
                        </div>
                        <DialogFooter className="gap-2 mt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="h-9 px-4 text-xs font-semibold rounded-lg">
                                Batal
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-xs font-semibold rounded-lg">
                                Perbarui Data
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Modal: Bulk Delete ── */}
            <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Hapus Masal</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus <span className="font-bold text-neutral-900 dark:text-neutral-100">{selectedIds.length}</span> data yang dipilih? Tindakan ini tidak dapat dibatalkan.
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
