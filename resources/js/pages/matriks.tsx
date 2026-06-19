import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    Search,
    Plus,
    Upload,
    Download,
    Edit2,
    Trash2,
    ExternalLink,
    FileText,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RefreshCw,
    FolderDown,
    DollarSign,
    BookOpen,
    ShieldCheck,
    Layers,
    UserCheck,
    Coins
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
import { useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Matriks Pelatihan',
        href: '/matriks',
    },
];

interface MatrixItem {
    id: string;
    kode: string;
    nama_pelatihan: string;
    link_modul: string | null;
    master_sa: string | null;
    master_sertifikat_name: string | null;
    master_sertifikat_url: string | null;
    tipe_pelatihan: string | null;
    jenis_sertifikat: string | null;
    keterangan: string | null;
    pic_periksa_lk: string | null;
    tipe_sertifikat_sihalal: string | null;
    harga_dasar_tte: number | null;
    status: string;
}

interface KodePelatihanOption {
    value: string;
    label: string;
    name: string;
}

interface MatriksPelatihanProps {
    matrixList: MatrixItem[];
    kodePelatihanOptions: KodePelatihanOption[];
    tipePelatihanOptions: string[];
    jenisSertifikatOptions: string[];
    picPeriksaLkOptions: string[];
    tipeSertifikatSihalalOptions: string[];
}

export default function MatriksPelatihan({
    matrixList = [],
    kodePelatihanOptions = [],
    tipePelatihanOptions = [],
    jenisSertifikatOptions = [],
    picPeriksaLkOptions = [],
    tipeSertifikatSihalalOptions = [],
}: MatriksPelatihanProps) {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;
    const role = user?.role || 'User';
    const isPdUser = ['admin', 'manager pd', 'staf pd'].includes(role.toLowerCase());

    // Search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [tipeFilter, setTipeFilter] = useState('Semua Tipe');

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Forms
    const addForm = useForm({
        kode: '',
        nama_pelatihan: '',
        link_modul: '',
        master_sa: '',
        master_sertifikat: null as File | null,
        tipe_pelatihan: '',
        jenis_sertifikat: '',
        keterangan: '',
        pic_periksa_lk: '',
        tipe_sertifikat_sihalal: '',
        harga_dasar_tte: '',
        status: 'Aktif',
    });

    const editForm = useForm({
        kode: '',
        nama_pelatihan: '',
        link_modul: '',
        master_sa: '',
        master_sertifikat: null as File | null,
        tipe_pelatihan: '',
        jenis_sertifikat: '',
        keterangan: '',
        pic_periksa_lk: '',
        tipe_sertifikat_sihalal: '',
        harga_dasar_tte: '',
        status: 'Aktif',
        _method: 'POST', // method spoofing if needed, but we call POST route
    });

    const importForm = useForm({
        file: null as File | null,
    });

    const deleteForm = useForm({});

    // Filtered data
    const filteredList = useMemo(() => {
        return matrixList.filter((item) => {
            const matchesSearch =
                item.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.nama_pelatihan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.keterangan || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                statusFilter === 'Semua Status' || item.status === statusFilter;

            const matchesTipe =
                tipeFilter === 'Semua Tipe' || item.tipe_pelatihan === tipeFilter;

            return matchesSearch && matchesStatus && matchesTipe;
        });
    }, [matrixList, searchQuery, statusFilter, tipeFilter]);

    // Summary statistics
    const stats = useMemo(() => {
        const total = matrixList.length;
        const active = matrixList.filter((i) => i.status === 'Aktif').length;
        const nonActive = total - active;
        const totalTte = matrixList
            .filter((i) => i.status === 'Aktif' && i.harga_dasar_tte)
            .reduce((sum, item) => sum + (item.harga_dasar_tte || 0), 0);

        return { total, active, nonActive, totalTte };
    }, [matrixList]);

    // Handle Kode Change to autopopulate Nama Pelatihan
    const handleAddKodeChange = (val: string) => {
        const found = kodePelatihanOptions.find((opt) => opt.value === val);
        addForm.setData((d) => ({
            ...d,
            kode: val,
            nama_pelatihan: found ? found.name : val,
        }));
    };

    const handleEditKodeChange = (val: string) => {
        const found = kodePelatihanOptions.find((opt) => opt.value === val);
        editForm.setData((d) => ({
            ...d,
            kode: val,
            nama_pelatihan: found ? found.name : val,
        }));
    };

    // Submissions
    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route('matriks.store'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                addForm.reset();
            },
        });
    };

    const handleEditClick = (item: MatrixItem) => {
        setSelectedId(item.id);
        editForm.setData({
            kode: item.kode,
            nama_pelatihan: item.nama_pelatihan,
            link_modul: item.link_modul || '',
            master_sa: item.master_sa || '',
            master_sertifikat: null,
            tipe_pelatihan: item.tipe_pelatihan || '',
            jenis_sertifikat: item.jenis_sertifikat || '',
            keterangan: item.keterangan || '',
            pic_periksa_lk: item.pic_periksa_lk || '',
            tipe_sertifikat_sihalal: item.tipe_sertifikat_sihalal || '',
            harga_dasar_tte: item.harga_dasar_tte ? String(item.harga_dasar_tte) : '',
            status: item.status,
            _method: 'POST',
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedId) return;

        editForm.post(route('matriks.update', selectedId), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                editForm.reset();
                setSelectedId(null);
            },
        });
    };

    const handleStatusToggle = (id: string) => {
        deleteForm.post(route('matriks.status', id));
    };

    const handleDeleteClick = (id: string) => {
        setSelectedId(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedId) return;

        deleteForm.delete(route('matriks.destroy', selectedId), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedId(null);
            },
        });
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        importForm.post(route('matriks.import'), {
            onSuccess: () => {
                setIsImportModalOpen(false);
                importForm.reset();
            },
        });
    };

    // Currency Formatter Helper
    const formatRupiah = (value: number | null) => {
        if (value === null || value === undefined) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Database Matriks Pelatihan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10 min-w-0 w-full">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                            Matriks Pelatihan
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-semibold border-blue-200 dark:border-blue-800">
                                Role: {role}
                            </Badge>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                {isPdUser 
                                    ? 'Akses PD: Manajemen penuh diaktifkan' 
                                    : 'Akses Read-Only: Hanya dapat melihat dan mengunduh berkas'}
                            </span>
                        </div>
                    </div>

                    {/* PD Action Buttons (Top Left in Mockup) */}
                    {isPdUser && (
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                onClick={() => setIsImportModalOpen(true)}
                                variant="outline"
                                size="sm"
                                className="h-9 rounded-lg border-neutral-200 dark:border-neutral-800 bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-350 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                            >
                                <Upload className="size-3.5 text-neutral-500" />
                                <span>Import</span>
                            </Button>
                            
                            <a
                                href={route('matriks.template')}
                                className="inline-flex items-center justify-center h-9 px-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-350 text-xs font-semibold gap-1.5 shadow-xs transition-colors"
                            >
                                <FolderDown className="size-3.5 text-neutral-500" />
                                <span>Download Template</span>
                            </a>

                            <Button
                                onClick={() => setIsAddModalOpen(true)}
                                size="sm"
                                className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                            >
                                <Plus className="size-4" />
                                <span>Tambah Matriks</span>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Dashboard Stats Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-10.5 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <BookOpen className="size-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-550">Total Matriks</span>
                                <span className="text-xl font-extrabold text-neutral-900 dark:text-neutral-50 mt-0.5">{stats.total}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-10.5 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <ShieldCheck className="size-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-550">Matriks Aktif</span>
                                <span className="text-xl font-extrabold text-neutral-900 dark:text-neutral-50 mt-0.5">{stats.active}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-10.5 items-center justify-center rounded-xl bg-neutral-100 text-neutral-550 dark:bg-neutral-900 dark:text-neutral-400">
                                <Layers className="size-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-550">Non-Aktif</span>
                                <span className="text-xl font-extrabold text-neutral-900 dark:text-neutral-50 mt-0.5">{stats.nonActive}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-10.5 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                                <Coins className="size-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-550">Total Harga TTE</span>
                                <span className="text-xl font-extrabold text-neutral-900 dark:text-neutral-50 mt-0.5">
                                    {formatRupiah(stats.totalTte)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter and Table Card */}
                <Card className="w-full min-w-0 border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm overflow-hidden flex flex-col flex-1">
                    {/* Filters & Actions Bar */}
                    <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            {/* Search */}
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari kode, nama pelatihan, keterangan..."
                                    className="h-9 w-full rounded-lg border border-neutral-200 bg-white dark:bg-neutral-900 pl-9 pr-4 text-xs text-neutral-900 dark:text-neutral-100 outline-none placeholder:text-neutral-400 focus:border-blue-500 dark:border-neutral-800 shadow-xs font-sans"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="w-40">
                                <SearchableSelect
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    options={['Semua Status', 'Aktif', 'Nonaktif']}
                                    placeholder="Status"
                                />
                            </div>

                            {/* Tipe Pelatihan Filter */}
                            <div className="w-48">
                                <SearchableSelect
                                    value={tipeFilter}
                                    onChange={setTipeFilter}
                                    options={['Semua Tipe', ...tipePelatihanOptions]}
                                    placeholder="Tipe Pelatihan"
                                />
                            </div>

                            {/* Reset Button */}
                            {(searchQuery || statusFilter !== 'Semua Status' || tipeFilter !== 'Semua Tipe') && (
                                <Button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setStatusFilter('Semua Status');
                                        setTipeFilter('Semua Tipe');
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 px-2 text-xs font-semibold text-neutral-500 hover:text-neutral-700"
                                >
                                    <RefreshCw className="mr-1.5 size-3.5" />
                                    Reset
                                </Button>
                            )}
                        </div>

                        {/* Export Button */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                            <a
                                href={route('matriks.export')}
                                className="inline-flex items-center justify-center h-9 px-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-350 text-xs font-semibold gap-1.5 shadow-xs transition-colors"
                            >
                                <Download className="size-3.5 text-neutral-500" />
                                <span>Export Excel</span>
                            </a>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full min-w-[1400px] border-collapse text-left font-sans text-xs">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-450 dark:border-neutral-800 dark:bg-neutral-900/30">
                                    <th className="px-4 py-3.5 w-32">Kode</th>
                                    <th className="px-4 py-3.5 w-60">Nama Pelatihan</th>
                                    <th className="px-4 py-3.5 w-32">Link Modul</th>
                                    <th className="px-4 py-3.5 w-32">Master SA</th>
                                    <th className="px-4 py-3.5 w-44">Master Sertifikat</th>
                                    <th className="px-4 py-3.5 w-36">Tipe Pelatihan</th>
                                    <th className="px-4 py-3.5 w-40">Jenis Sertifikat</th>
                                    <th className="px-4 py-3.5 w-56">Keterangan</th>
                                    <th className="px-4 py-3.5 w-40">PIC Periksa LK</th>
                                    <th className="px-4 py-3.5 w-48">Tipe Sertifikat di Sihalal</th>
                                    <th className="px-4 py-3.5 w-40">Harga Dasar TTE</th>
                                    <th className="px-4 py-3.5 w-32">Status</th>
                                    {isPdUser && <th className="px-4 py-3.5 text-center w-36">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                                {filteredList.length === 0 ? (
                                    <tr>
                                        <td colSpan={isPdUser ? 13 : 12} className="px-6 py-10 text-center text-neutral-450 dark:text-neutral-500 font-semibold">
                                            Tidak ada data matriks pelatihan ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredList.map((item) => (
                                        <tr key={item.id} className="hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10 transition-colors">
                                            <td className="px-4 py-3.5 font-semibold text-neutral-800 dark:text-neutral-300 truncate">
                                                {item.kode}
                                            </td>
                                            <td className="px-4 py-3.5 font-semibold text-neutral-900 dark:text-neutral-100 max-w-xs truncate" title={item.nama_pelatihan}>
                                                {item.nama_pelatihan}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {item.link_modul ? (
                                                    <a
                                                        href={item.link_modul}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                                    >
                                                        <span>Buka Link</span>
                                                        <ExternalLink className="size-3" />
                                                    </a>
                                                ) : (
                                                    <span className="text-neutral-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {item.master_sa ? (
                                                    <a
                                                        href={item.master_sa}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                                    >
                                                        <span>Buka Link</span>
                                                        <ExternalLink className="size-3" />
                                                    </a>
                                                ) : (
                                                    <span className="text-neutral-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {item.master_sertifikat_url ? (
                                                    <a
                                                        href={item.master_sertifikat_url}
                                                        className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline truncate max-w-[150px]"
                                                        title={item.master_sertifikat_name || 'Download'}
                                                    >
                                                        <FileText className="size-3.5 flex-shrink-0" />
                                                        <span className="truncate">{item.master_sertifikat_name}</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-neutral-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 font-medium text-neutral-600 dark:text-neutral-400">
                                                {item.tipe_pelatihan || <span className="text-neutral-400">-</span>}
                                            </td>
                                            <td className="px-4 py-3.5 font-medium text-neutral-600 dark:text-neutral-400">
                                                {item.jenis_sertifikat || <span className="text-neutral-400">-</span>}
                                            </td>
                                            <td className="px-4 py-3.5 text-neutral-550 dark:text-neutral-450 max-w-xs truncate" title={item.keterangan || ''}>
                                                {item.keterangan || <span className="text-neutral-400">-</span>}
                                            </td>
                                            <td className="px-4 py-3.5 font-medium text-neutral-600 dark:text-neutral-400">
                                                {item.pic_periksa_lk || <span className="text-neutral-400">-</span>}
                                            </td>
                                            <td className="px-4 py-3.5 font-medium text-neutral-600 dark:text-neutral-400">
                                                {item.tipe_sertifikat_sihalal || <span className="text-neutral-400">-</span>}
                                            </td>
                                            <td className="px-4 py-3.5 font-bold text-neutral-800 dark:text-neutral-200">
                                                {formatRupiah(item.harga_dasar_tte)}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        item.status === 'Aktif'
                                                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 font-semibold'
                                                            : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-450 border-neutral-200 dark:border-neutral-800 font-semibold'
                                                    }
                                                >
                                                    {item.status}
                                                </Badge>
                                            </td>
                                            {isPdUser && (
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <Button
                                                            onClick={() => handleEditClick(item)}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="size-3.5" />
                                                        </Button>

                                                        <Button
                                                            onClick={() => handleStatusToggle(item.id)}
                                                            variant="ghost"
                                                            size="sm"
                                                            className={`h-7.5 px-2.5 text-[10px] font-bold rounded-md transition-colors ${
                                                                item.status === 'Aktif'
                                                                    ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30'
                                                                    : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                                            }`}
                                                        >
                                                            {item.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                                                        </Button>

                                                        <Button
                                                            onClick={() => handleDeleteClick(item.id)}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Modal: Tambah Matriks */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Plus className="size-5 text-blue-600" />
                            <span>Tambah Database Matriks Pelatihan</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Masukkan data pemetaan pelatihan baru ke dalam tabel matriks.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddSubmit} className="space-y-4 py-2 text-xs">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Kode Pelatihan */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    Kode Pelatihan *
                                </label>
                                <SearchableSelect
                                    value={addForm.data.kode}
                                    onChange={handleAddKodeChange}
                                    options={kodePelatihanOptions}
                                    placeholder="Pilih Kode Pelatihan"
                                    required
                                />
                                {addForm.errors.kode && (
                                    <span className="text-[10px] text-rose-600 block">{addForm.errors.kode}</span>
                                )}
                            </div>

                            {/* Nama Pelatihan (Auto) */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    Nama Pelatihan
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={addForm.data.nama_pelatihan}
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-800 px-3 text-xs text-neutral-500 cursor-not-allowed outline-none"
                                    placeholder="Auto-populated dari Kode"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Link Modul */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    Link Modul (URL)
                                </label>
                                <input
                                    type="url"
                                    value={addForm.data.link_modul}
                                    onChange={(e) => addForm.setData('link_modul', e.target.value)}
                                    placeholder="https://example.com/modul"
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3 text-xs outline-none focus:border-blue-500 dark:text-neutral-100 placeholder:text-neutral-400 font-sans"
                                />
                                {addForm.errors.link_modul && (
                                    <span className="text-[10px] text-rose-600 block">{addForm.errors.link_modul}</span>
                                )}
                            </div>

                            {/* Master SA */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    Master SA (URL)
                                </label>
                                <input
                                    type="url"
                                    value={addForm.data.master_sa}
                                    onChange={(e) => addForm.setData('master_sa', e.target.value)}
                                    placeholder="https://example.com/sa"
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3 text-xs outline-none focus:border-blue-500 dark:text-neutral-100 placeholder:text-neutral-400 font-sans"
                                />
                                {addForm.errors.master_sa && (
                                    <span className="text-[10px] text-rose-600 block">{addForm.errors.master_sa}</span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Tipe Pelatihan */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    Tipe Pelatihan
                                </label>
                                <SearchableSelect
                                    value={addForm.data.tipe_pelatihan}
                                    onChange={(val) => addForm.setData('tipe_pelatihan', val)}
                                    options={tipePelatihanOptions}
                                    placeholder="Pilih Tipe Pelatihan"
                                />
                            </div>

                            {/* Jenis Sertifikat */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    Jenis Sertifikat
                                </label>
                                <SearchableSelect
                                    value={addForm.data.jenis_sertifikat}
                                    onChange={(val) => addForm.setData('jenis_sertifikat', val)}
                                    options={jenisSertifikatOptions}
                                    placeholder="Pilih Jenis Sertifikat"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* PIC Periksa LK */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    PIC Periksa LK
                                </label>
                                <SearchableSelect
                                    value={addForm.data.pic_periksa_lk}
                                    onChange={(val) => addForm.setData('pic_periksa_lk', val)}
                                    options={picPeriksaLkOptions}
                                    placeholder="Pilih PIC"
                                />
                            </div>

                            {/* Tipe Sertifikat Sihalal */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    Tipe Sertifikat di Sihalal
                                </label>
                                <SearchableSelect
                                    value={addForm.data.tipe_sertifikat_sihalal}
                                    onChange={(val) => addForm.setData('tipe_sertifikat_sihalal', val)}
                                    options={tipeSertifikatSihalalOptions}
                                    placeholder="Pilih Tipe Sertifikat"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Harga Dasar TTE */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    Harga Dasar TTE (IDR)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={addForm.data.harga_dasar_tte}
                                    onChange={(e) => addForm.setData('harga_dasar_tte', e.target.value)}
                                    placeholder="Contoh: 150000"
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3 text-xs outline-none focus:border-blue-500 dark:text-neutral-100 placeholder:text-neutral-400 font-sans"
                                />
                                {addForm.errors.harga_dasar_tte && (
                                    <span className="text-[10px] text-rose-600 block">{addForm.errors.harga_dasar_tte}</span>
                                )}
                            </div>

                            {/* Master Sertifikat File */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    Master Sertifikat (Upload)
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const files = e.target.files;
                                        if (files && files.length > 0) {
                                            addForm.setData('master_sertifikat', files[0]);
                                        }
                                    }}
                                    className="w-full text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-neutral-800 dark:file:text-neutral-300"
                                />
                                {addForm.errors.master_sertifikat && (
                                    <span className="text-[10px] text-rose-600 block">{addForm.errors.master_sertifikat}</span>
                                )}
                            </div>
                        </div>

                        {/* Keterangan */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                Keterangan (Format Long Text)
                            </label>
                            <textarea
                                value={addForm.data.keterangan}
                                onChange={(e) => addForm.setData('keterangan', e.target.value)}
                                placeholder="Masukkan keterangan detail matriks..."
                                rows={3}
                                className="w-full rounded-lg border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:text-neutral-100 placeholder:text-neutral-400 font-sans"
                            />
                            {addForm.errors.keterangan && (
                                <span className="text-[10px] text-rose-600 block">{addForm.errors.keterangan}</span>
                            )}
                        </div>

                        <DialogFooter className="flex justify-end gap-2 mt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsAddModalOpen(false)}
                                className="h-9 rounded-lg text-neutral-550 hover:bg-neutral-100 font-semibold text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={addForm.processing}
                                className="h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 font-semibold text-xs shadow-xs"
                            >
                                {addForm.processing ? 'Menyimpan...' : 'Simpan Matriks'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: Edit Matriks */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Edit2 className="size-5 text-blue-600" />
                            <span>Edit Database Matriks Pelatihan</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Perbarui data pemetaan pelatihan terpilih.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2 text-xs">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Kode Pelatihan */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    Kode Pelatihan *
                                </label>
                                <SearchableSelect
                                    value={editForm.data.kode}
                                    onChange={handleEditKodeChange}
                                    options={kodePelatihanOptions}
                                    placeholder="Pilih Kode Pelatihan"
                                    required
                                />
                                {editForm.errors.kode && (
                                    <span className="text-[10px] text-rose-600 block">{editForm.errors.kode}</span>
                                )}
                            </div>

                            {/* Nama Pelatihan (Auto) */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    Nama Pelatihan
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={editForm.data.nama_pelatihan}
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-800 px-3 text-xs text-neutral-500 cursor-not-allowed outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Link Modul */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    Link Modul (URL)
                                </label>
                                <input
                                    type="url"
                                    value={editForm.data.link_modul}
                                    onChange={(e) => editForm.setData('link_modul', e.target.value)}
                                    placeholder="https://example.com/modul"
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3 text-xs outline-none focus:border-blue-500 dark:text-neutral-100 placeholder:text-neutral-400 font-sans"
                                />
                                {editForm.errors.link_modul && (
                                    <span className="text-[10px] text-rose-600 block">{editForm.errors.link_modul}</span>
                                )}
                            </div>

                            {/* Master SA */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    Master SA (URL)
                                </label>
                                <input
                                    type="url"
                                    value={editForm.data.master_sa}
                                    onChange={(e) => editForm.setData('master_sa', e.target.value)}
                                    placeholder="https://example.com/sa"
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3 text-xs outline-none focus:border-blue-500 dark:text-neutral-100 placeholder:text-neutral-400 font-sans"
                                />
                                {editForm.errors.master_sa && (
                                    <span className="text-[10px] text-rose-600 block">{editForm.errors.master_sa}</span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Tipe Pelatihan */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    Tipe Pelatihan
                                </label>
                                <SearchableSelect
                                    value={editForm.data.tipe_pelatihan}
                                    onChange={(val) => editForm.setData('tipe_pelatihan', val)}
                                    options={tipePelatihanOptions}
                                    placeholder="Pilih Tipe Pelatihan"
                                />
                            </div>

                            {/* Jenis Sertifikat */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    Jenis Sertifikat
                                </label>
                                <SearchableSelect
                                    value={editForm.data.jenis_sertifikat}
                                    onChange={(val) => editForm.setData('jenis_sertifikat', val)}
                                    options={jenisSertifikatOptions}
                                    placeholder="Pilih Jenis Sertifikat"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* PIC Periksa LK */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    PIC Periksa LK
                                </label>
                                <SearchableSelect
                                    value={editForm.data.pic_periksa_lk}
                                    onChange={(val) => editForm.setData('pic_periksa_lk', val)}
                                    options={picPeriksaLkOptions}
                                    placeholder="Pilih PIC"
                                />
                            </div>

                            {/* Tipe Sertifikat Sihalal */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    Tipe Sertifikat di Sihalal
                                </label>
                                <SearchableSelect
                                    value={editForm.data.tipe_sertifikat_sihalal}
                                    onChange={(val) => editForm.setData('tipe_sertifikat_sihalal', val)}
                                    options={tipeSertifikatSihalalOptions}
                                    placeholder="Pilih Tipe Sertifikat"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Harga Dasar TTE */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    Harga Dasar TTE (IDR)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editForm.data.harga_dasar_tte}
                                    onChange={(e) => editForm.setData('harga_dasar_tte', e.target.value)}
                                    placeholder="Contoh: 150000"
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3 text-xs outline-none focus:border-blue-500 dark:text-neutral-100 placeholder:text-neutral-400 font-sans"
                                />
                                {editForm.errors.harga_dasar_tte && (
                                    <span className="text-[10px] text-rose-600 block">{editForm.errors.harga_dasar_tte}</span>
                                )}
                            </div>

                            {/* Master Sertifikat File */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                    Ganti Master Sertifikat (Optional)
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const files = e.target.files;
                                        if (files && files.length > 0) {
                                            editForm.setData('master_sertifikat', files[0]);
                                        }
                                    }}
                                    className="w-full text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-neutral-800 dark:file:text-neutral-300"
                                />
                                {editForm.errors.master_sertifikat && (
                                    <span className="text-[10px] text-rose-600 block">{editForm.errors.master_sertifikat}</span>
                                )}
                            </div>
                        </div>

                        {/* Keterangan */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider block">
                                Keterangan (Format Long Text)
                            </label>
                            <textarea
                                value={editForm.data.keterangan}
                                onChange={(e) => editForm.setData('keterangan', e.target.value)}
                                placeholder="Masukkan keterangan detail matriks..."
                                rows={3}
                                className="w-full rounded-lg border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:text-neutral-100 placeholder:text-neutral-400 font-sans"
                            />
                            {editForm.errors.keterangan && (
                                <span className="text-[10px] text-rose-600 block">{editForm.errors.keterangan}</span>
                            )}
                        </div>

                        <DialogFooter className="flex justify-end gap-2 mt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    editForm.reset();
                                    setSelectedId(null);
                                }}
                                className="h-9 rounded-lg text-neutral-555 hover:bg-neutral-100 font-semibold text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 font-semibold text-xs shadow-xs"
                            >
                                {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: Import Excel */}
            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Upload className="size-5 text-blue-600" />
                            <span>Import Database Matriks Pelatihan</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Unggah berkas Excel (`.xlsx` atau `.xls`) untuk memperbarui atau menambahkan baris matriks secara massal.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleImportSubmit} className="space-y-4 py-2 text-xs">
                        <div className="space-y-2 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-neutral-50/50 dark:bg-neutral-900/10 text-center">
                            <input
                                type="file"
                                required
                                accept=".xlsx, .xls"
                                onChange={(e) => {
                                    const files = e.target.files;
                                    if (files && files.length > 0) {
                                        importForm.setData('file', files[0]);
                                    }
                                }}
                                className="mx-auto block text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-neutral-800 dark:file:text-neutral-300"
                            />
                            <p className="text-[10px] text-neutral-400">
                                Pastikan berkas Anda sesuai dengan susunan kolom template.
                            </p>
                        </div>

                        {importForm.errors.file && (
                            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-250 dark:border-rose-900 p-3 text-[10px] text-rose-600 flex gap-2">
                                <AlertCircle className="size-3.5 flex-shrink-0 mt-0.5" />
                                <span>{importForm.errors.file}</span>
                            </div>
                        )}

                        <DialogFooter className="flex justify-end gap-2 mt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsImportModalOpen(false);
                                    importForm.reset();
                                }}
                                className="h-9 rounded-lg text-neutral-555 hover:bg-neutral-100 font-semibold text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={importForm.processing}
                                className="h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 font-semibold text-xs shadow-xs"
                            >
                                {importForm.processing ? 'Mengimpor...' : 'Mulai Import'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: Konfirmasi Hapus */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Trash2 className="size-5 text-rose-600" />
                            <span>Konfirmasi Hapus Matriks</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-450">
                            Apakah Anda yakin ingin menghapus baris matriks pelatihan ini? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleDeleteSubmit} className="flex justify-end gap-2 mt-4 text-xs">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setIsDeleteModalOpen(false);
                                setSelectedId(null);
                            }}
                            className="h-9 rounded-lg text-neutral-555 hover:bg-neutral-100 font-semibold text-xs"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={deleteForm.processing}
                            className="h-9 bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-4 font-semibold text-xs shadow-xs"
                        >
                            {deleteForm.processing ? 'Menghapus...' : 'Ya, Hapus'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
