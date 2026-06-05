import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    FileText,
    Clock,
    Edit3,
    CheckCircle2,
    XCircle,
    Search,
    RefreshCw,
    Plus,
    Eye,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Upload,
    Download,
    Calendar,
    Check,
    ClipboardList,
    AlertCircle,
    User,
    CheckCircle
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
        title: 'Pengajuan Modul',
        href: '/pengajuan',
    },
];

interface SubmissionItem {
    id: string;
    type: 'Modul Baru' | 'Revisi Modul';
    title: string;
    applicant: string;
    unit: string;
    submissionDate: string;
    deadline: string;
    status: 'Baru' | 'Drafting' | 'Menunggu Approval' | 'Selesai' | 'Ditolak';
    description: string;
}

export default function Pengajuan() {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;
    const role = user?.role || 'User';

    // Dummy initial submissions dataset matching the user's screenshot
    const [submissions, setSubmissions] = useState<SubmissionItem[]>([
        {
            id: 'PMD-2024-0064',
            type: 'Modul Baru',
            title: 'Manajemen Risiko Operasional',
            applicant: 'Andi Pratama',
            unit: 'Operasional',
            submissionDate: '12 Mei 2024',
            deadline: '28 Mei 2024',
            status: 'Baru',
            description: 'Panduan lengkap mengenai tata cara mitigasi risiko operasional, deteksi dini kerugian, dan kepatuhan prosedur internal.'
        },
        {
            id: 'PMD-2024-0063',
            type: 'Revisi Modul',
            title: 'Kepemimpinan Situasional',
            applicant: 'Dewi Lestari',
            unit: 'SDM',
            submissionDate: '10 Mei 2024',
            deadline: '27 Mei 2024',
            status: 'Drafting',
            description: 'Pembaruan modul kepemimpinan dengan pendekatan model situasional Blanchard terbaru untuk level supervisor.'
        },
        {
            id: 'PMD-2024-0062',
            type: 'Modul Baru',
            title: 'Analisis Data untuk Non Data Scientist',
            applicant: 'Budi Santoso',
            unit: 'IT & Digital',
            submissionDate: '09 Mei 2024',
            deadline: '30 Mei 2024',
            status: 'Menunggu Approval',
            description: 'Materi dasar interpretasi data, visualisasi menggunakan BI tools, dan penggunaan formula tingkat menengah.'
        },
        {
            id: 'PMD-2024-0061',
            type: 'Modul Baru',
            title: 'Customer Experience Excellence',
            applicant: 'Rina Anjayani',
            unit: 'Pemasaran',
            submissionDate: '08 Mei 2024',
            deadline: '29 Mei 2024',
            status: 'Selesai',
            description: 'Modul pelatihan standarisasi layanan pelanggan prima untuk garda depan pelayanan ritel.'
        },
        {
            id: 'PMD-2024-0060',
            type: 'Revisi Modul',
            title: 'Microsoft Excel Intermediate',
            applicant: 'Agus Setiawan',
            unit: 'Keuangan',
            submissionDate: '07 Mei 2024',
            deadline: '24 Mei 2024',
            status: 'Ditolak',
            description: 'Revisi modul excel menambahkan bab VLOOKUP/HLOOKUP serta dasar Pivot Table, ditolak karena format tidak sesuai standar.'
        },
        {
            id: 'PMD-2024-0059',
            type: 'Modul Baru',
            title: 'Cyber Security Awareness',
            applicant: 'Mega Kusuma',
            unit: 'IT & Digital',
            submissionDate: '06 Mei 2024',
            deadline: '26 Mei 2024',
            status: 'Baru',
            description: 'Edukasi keamanan siber mendasar bagi seluruh karyawan untuk menghindari celah phising dan kebocoran sandi.'
        },
        {
            id: 'PMD-2024-0058',
            type: 'Revisi Modul',
            title: 'Komunikasi Efektif',
            applicant: 'Yusuf Setiawan',
            unit: 'Operasional',
            submissionDate: '05 Mei 2024',
            deadline: '23 Mei 2024',
            status: 'Drafting',
            description: 'Revisi materi komunikasi persuasif dengan tambahan studi kasus negosiasi klien luar negeri.'
        },
        {
            id: 'PMD-2024-0057',
            type: 'Modul Baru',
            title: 'Design Thinking Fundamentals',
            applicant: 'Nita Fadilah',
            unit: 'IT & Digital',
            submissionDate: '03 Mei 2024',
            deadline: '20 Mei 2024',
            status: 'Menunggu Approval',
            description: 'Pelatihan kerangka kerja inovasi design thinking mencakup tahapan Empathize hingga Prototype.'
        },
        {
            id: 'PMD-2024-0056',
            type: 'Modul Baru',
            title: 'Presentasi yang Persuasif',
            applicant: 'Bambang Hadiyanto',
            unit: 'Pengembangan SDM',
            submissionDate: '02 Mei 2024',
            deadline: '21 Mei 2024',
            status: 'Selesai',
            description: 'Pelatihan teknik penyusunan slide presentasi yang memikat audiens dan manajemen intonasi suara.'
        },
        {
            id: 'PMD-2024-0055',
            type: 'Revisi Modul',
            title: 'Manajemen Proyek Agil',
            applicant: 'Siti Lestari',
            unit: 'IT & Digital',
            submissionDate: '01 Mei 2024',
            deadline: '17 Mei 2024',
            status: 'Ditolak',
            description: 'Penambahan kerangka kerja Kanban dan Scrum pada modul manajemen proyek IT.'
        }
    ]);

    // Checkbox and multi-selection state
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [typeFilter, setTypeFilter] = useState('Semua Jenis');
    const [unitFilter, setUnitFilter] = useState('Semua Unit');
    const [dateRangeText, setDateRangeText] = useState('01 Mei 2024 - 31 Mei 2024');

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<SubmissionItem | null>(null);

    // Form inputs for new submission
    const [newTitle, setNewTitle] = useState('');
    const [newType, setNewType] = useState<'Modul Baru' | 'Revisi Modul'>('Modul Baru');
    const [newUnit, setNewUnit] = useState('Operasional');
    const [newDeadline, setNewDeadline] = useState('');
    const [newDescription, setNewDescription] = useState('');

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Dynamic stats computation based on current list state
    const stats = useMemo(() => {
        const total = submissions.length;
        const waiting = submissions.filter(s => s.status === 'Menunggu Approval').length;
        const drafting = submissions.filter(s => s.status === 'Drafting').length;
        const finished = submissions.filter(s => s.status === 'Selesai').length;
        const baru = submissions.filter(s => s.status === 'Baru').length;
        const ditolak = submissions.filter(s => s.status === 'Ditolak').length;

        return { total, waiting, drafting, finished, baru, ditolak };
    }, [submissions]);

    // Reset filters handler
    const handleResetFilters = () => {
        setSearchQuery('');
        setStatusFilter('Semua Status');
        setTypeFilter('Semua Jenis');
        setUnitFilter('Semua Unit');
        setDateRangeText('01 Mei 2024 - 31 Mei 2024');
    };

    // Filtered items logic
    const filteredSubmissions = useMemo(() => {
        return submissions.filter((sub) => {
            const matchesSearch = 
                sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.id.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = statusFilter === 'Semua Status' || sub.status === statusFilter;
            const matchesType = typeFilter === 'Semua Jenis' || sub.type === typeFilter;
            const matchesUnit = unitFilter === 'Semua Unit' || sub.unit === unitFilter;

            return matchesSearch && matchesStatus && matchesType && matchesUnit;
        });
    }, [submissions, searchQuery, statusFilter, typeFilter, unitFilter]);

    // Handle check all
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedItems(filteredSubmissions.map(s => s.id));
        } else {
            setSelectedItems([]);
        }
    };

    // Handle check single row
    const handleSelectRow = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedItems(prev => [...prev, id]);
        } else {
            setSelectedItems(prev => prev.filter(item => item !== id));
        }
    };

    // Submit new submission handler
    const handleAddSubmission = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newDeadline) return;

        const newIdNumber = 64 + submissions.length - 9; // simple dynamic increment matching format
        const nextId = `PMD-2024-00${newIdNumber}`;

        const newSub: SubmissionItem = {
            id: nextId,
            type: newType,
            title: newTitle,
            applicant: user?.name || 'Raffa Yuda Pratama',
            unit: newUnit,
            submissionDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            deadline: new Date(newDeadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: 'Baru',
            description: newDescription || 'Deskripsi pengajuan modul baru.'
        };

        setSubmissions(prev => [newSub, ...prev]);
        setIsAddModalOpen(false);
        setNewTitle('');
        setNewDescription('');
        setNewDeadline('');
        
        setToastMessage(`Pengajuan ${nextId} berhasil diajukan dengan status Baru.`);
        setTimeout(() => setToastMessage(null), 4000);
    };

    const chartConfig = {
        baru: { label: 'Baru', color: '#3b82f6' },
        drafting: { label: 'Drafting', color: '#a3a3a3' },
        menunggu: { label: 'Menunggu Approval', color: '#a855f7' },
        selesai: { label: 'Selesai', color: '#10b981' },
        ditolak: { label: 'Ditolak', color: '#f43f5e' },
    } satisfies ChartConfig;

    const statusChartData = useMemo(() => [
        { name: 'Baru', value: 22, fill: '#3b82f6' },
        { name: 'Drafting', value: 24, fill: '#a3a3a3' },
        { name: 'Menunggu Approval', value: 18, fill: '#a855f7' },
        { name: 'Selesai', value: 54, fill: '#10b981' },
        { name: 'Ditolak', value: 8, fill: '#f43f5e' },
    ], []);

    const totalStatusSubmissions = useMemo(() => {
        return statusChartData.reduce((acc, curr) => acc + curr.value, 0);
    }, [statusChartData]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengajuan Modul" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                        Pengajuan Modul
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Kelola permintaan modul baru, revisi, dan kebutuhan khusus dari unit kerja.
                    </p>
                </div>

                {/* Success Toast */}
                {toastMessage && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400 shadow-sm animate-in fade-in duration-300">
                        <Check className="size-4.5" />
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* Metrics row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {/* Total Pengajuan */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <FileText className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Total Pengajuan</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{stats.total}</span>
                                <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 mt-0.5">Semua permintaan modul</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Menunggu Proses */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                                <Clock className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Menunggu Proses</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{stats.waiting}</span>
                                <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 mt-0.5">Perlu diproses lebih lanjut</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dalam Drafting */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                                <Edit3 className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Dalam Drafting</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{stats.drafting}</span>
                                <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 mt-0.5">Sedang disusun/direvisi</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Selesai */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <CheckCircle2 className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Selesai</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{stats.finished}</span>
                                <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 mt-0.5">Pengajuan telah selesai</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Dashboard Grid split into Main Content and Right Side Column */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    
                    {/* Main content Area (Left 3 columns) */}
                    <div className="lg:col-span-3 space-y-6">
                        
                        {/* Filter Bar and Data Table card */}
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
                                        placeholder="Cari judul modul, pengaju, unit..."
                                        className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                    />
                                </div>

                                {/* Selection Dropdowns */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Status Filter */}
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Status">Semua Status</option>
                                        <option value="Baru">Baru</option>
                                        <option value="Drafting">Drafting</option>
                                        <option value="Menunggu Approval">Menunggu Approval</option>
                                        <option value="Selesai">Selesai</option>
                                        <option value="Ditolak">Ditolak</option>
                                    </select>

                                    {/* Type Filter */}
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Jenis">Semua Jenis</option>
                                        <option value="Modul Baru">Modul Baru</option>
                                        <option value="Revisi Modul">Revisi Modul</option>
                                    </select>

                                    {/* Unit Filter */}
                                    <select
                                        value={unitFilter}
                                        onChange={(e) => setUnitFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Unit">Semua Unit</option>
                                        <option value="Operasional">Operasional</option>
                                        <option value="SDM">SDM</option>
                                        <option value="IT & Digital">IT & Digital</option>
                                        <option value="Pemasaran">Pemasaran</option>
                                        <option value="Keuangan">Keuangan</option>
                                        <option value="Pengembangan SDM">Pengembangan SDM</option>
                                    </select>

                                    {/* Date range picker selector */}
                                    <div className="relative flex items-center h-9 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 px-3 text-xs text-neutral-600 dark:text-neutral-400 gap-1.5 cursor-pointer">
                                        <Calendar className="size-3.5" />
                                        <span>{dateRangeText}</span>
                                    </div>

                                    {/* Reset Filters button */}
                                    <Button
                                        onClick={handleResetFilters}
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 font-semibold"
                                    >
                                        <RefreshCw className="mr-1.5 size-3.5" />
                                        Reset Filter
                                    </Button>

                                    {/* Add Submission Button */}
                                    <Button
                                        onClick={() => setIsAddModalOpen(true)}
                                        size="sm"
                                        className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                                    >
                                        <Plus className="size-4" />
                                        <span>Buat Pengajuan</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[950px] text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                            <th className="px-6 py-3 text-center w-12">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                                    checked={selectedItems.length > 0 && selectedItems.length === filteredSubmissions.length}
                                                    className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 size-3.5"
                                                />
                                            </th>
                                            <th className="px-6 py-3.5">No Pengajuan</th>
                                            <th className="px-6 py-3.5">Jenis</th>
                                            <th className="px-6 py-3.5">Judul Modul / Kebutuhan</th>
                                            <th className="px-6 py-3.5">Pengaju</th>
                                            <th className="px-6 py-3.5">Unit</th>
                                            <th className="px-6 py-3.5">Tanggal Pengajuan</th>
                                            <th className="px-6 py-3.5">Deadline</th>
                                            <th className="px-6 py-3.5">Status</th>
                                            <th className="px-6 py-3.5 text-center w-24">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {filteredSubmissions.length === 0 ? (
                                            <tr>
                                                <td colSpan={10} className="text-center py-10 text-neutral-400 font-medium dark:text-neutral-500">
                                                    Tidak ada data pengajuan yang cocok dengan filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredSubmissions.map((sub) => (
                                                <tr key={sub.id} className="hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10 transition-colors">
                                                    <td className="px-6 py-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItems.includes(sub.id)}
                                                            onChange={(e) => handleSelectRow(sub.id, e.target.checked)}
                                                            className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 size-3.5"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400 text-xs">
                                                        {sub.id}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge
                                                            variant="secondary"
                                                            className={`font-semibold rounded-md border-0 px-2.5 py-0.5 text-[10px] ${
                                                                sub.type === 'Modul Baru'
                                                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                                                                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300'
                                                            }`}
                                                        >
                                                            {sub.type}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-neutral-800 dark:text-neutral-200">
                                                        {sub.title}
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300 font-medium">
                                                        {sub.applicant}
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 font-medium">
                                                        {sub.unit}
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 font-medium text-xs">
                                                        {sub.submissionDate}
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 font-medium text-xs">
                                                        {sub.deadline}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge
                                                            className={`font-semibold rounded-md border-0 px-2 py-0.5 text-[10px] ${
                                                                sub.status === 'Baru'
                                                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                                                                    : sub.status === 'Drafting'
                                                                    ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                                                    : sub.status === 'Menunggu Approval'
                                                                    ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300'
                                                                    : sub.status === 'Selesai'
                                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                                                            }`}
                                                        >
                                                            {sub.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedItem(sub);
                                                                    setIsDetailModalOpen(true);
                                                                }}
                                                                className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400"
                                                            >
                                                                <Eye className="size-3.5" />
                                                            </button>
                                                            <button className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400">
                                                                <Edit3 className="size-3.5" />
                                                            </button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400">
                                                                        <MoreVertical className="size-3.5" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-40 text-xs">
                                                                    <DropdownMenuItem className="cursor-pointer font-medium">Ubah Status</DropdownMenuItem>
                                                                    <DropdownMenuItem className="cursor-pointer font-medium">Lihat Detail Alur</DropdownMenuItem>
                                                                    <DropdownMenuItem className="cursor-pointer font-medium text-rose-600">Hapus Pengajuan</DropdownMenuItem>
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

                            {/* Pagination footer */}
                            <div className="p-4 border-t border-neutral-100 bg-neutral-50/20 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-neutral-500 dark:text-neutral-400">
                                <span className="font-medium">
                                    Menampilkan 1-{filteredSubmissions.length} dari {stats.total} pengajuan
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
                                        <button className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                            <ChevronLeft className="size-3.5" />
                                        </button>
                                        <button className="flex size-7 items-center justify-center rounded text-xs font-semibold border bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500">1</button>
                                        <button className="flex size-7 items-center justify-center rounded text-xs font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">2</button>
                                        <button className="flex size-7 items-center justify-center rounded text-xs font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">3</button>
                                        <span className="text-neutral-400">...</span>
                                        <button className="flex size-7 items-center justify-center rounded text-xs font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">10</button>
                                        <button className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                            <ChevronRight className="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Bottom Grid for Catatan, SLA, and Aktivitas */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            
                            {/* Left Side: Catatan Proses & SLA */}
                            <div className="space-y-6">
                                {/* Catatan Proses */}
                                <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm">
                                    <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Catatan Proses</h3>
                                    </div>
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex gap-3 text-xs items-start">
                                            <div className="flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 mt-0.5">
                                                <ClipboardList className="size-3.5" />
                                            </div>
                                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                                Pengajuan modul akan diverifikasi kelengkapan data dalam 1-2 hari kerja.
                                            </p>
                                        </div>
                                        <div className="flex gap-3 text-xs items-start">
                                            <div className="flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mt-0.5">
                                                <Edit3 className="size-3.5" />
                                            </div>
                                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                                Proses drafting dilakukan oleh Tim Pengembangan Modul dalam 3-5 hari kerja.
                                            </p>
                                        </div>
                                        <div className="flex gap-3 text-xs items-start">
                                            <div className="flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 mt-0.5">
                                                <CheckCircle className="size-3.5" />
                                            </div>
                                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                                Persetujuan akhir dilakukan oleh Approver sesuai alur yang ditentukan.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* SLA Proses */}
                                <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm">
                                    <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">SLA Proses</h3>
                                    </div>
                                    <CardContent className="p-5 space-y-3.5 text-xs">
                                        <div className="flex justify-between items-center">
                                            <span className="text-neutral-500 font-medium dark:text-neutral-400">Verifikasi</span>
                                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-900 border px-2 py-0.5 rounded-md text-[10px]">1-2 hari kerja</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-neutral-500 font-medium dark:text-neutral-400">Drafting</span>
                                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-900 border px-2 py-0.5 rounded-md text-[10px]">3-5 hari kerja</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-neutral-500 font-medium dark:text-neutral-400">Approval</span>
                                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-900 border px-2 py-0.5 rounded-md text-[10px]">2-3 hari kerja</span>
                                        </div>
                                        <div className="border-t pt-3 flex justify-between items-center font-bold text-neutral-900 dark:text-neutral-100">
                                            <span>Total SLA</span>
                                            <span className="text-blue-600 dark:text-blue-400">6-10 hari kerja</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Side: Aktivitas Pengajuan Terbaru */}
                            <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm flex flex-col justify-between">
                                <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Aktivitas Pengajuan Terbaru</h3>
                                </div>
                                <CardContent className="p-5 flex-1 space-y-4">
                                    <div className="relative pl-5 border-l border-neutral-100 dark:border-neutral-800 space-y-4 text-xs">
                                        <div className="relative">
                                            <span className="absolute -left-[26px] top-1 flex size-3 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white dark:ring-neutral-950"></span>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-neutral-800 dark:text-neutral-200">PMD-2024-0064 — Manajemen Risiko Operasional</span>
                                                <span className="text-neutral-500 dark:text-neutral-400">Diajukan oleh Andi Pratama (Operasional)</span>
                                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">12 Mei 2024 • 10:30</span>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute -left-[26px] top-1 flex size-3 items-center justify-center rounded-full bg-zinc-400 ring-4 ring-white dark:ring-neutral-950"></span>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-neutral-800 dark:text-neutral-200">PMD-2024-0063 — Kepemimpinan Situasional</span>
                                                <span className="text-neutral-500 dark:text-neutral-400">Diajukan oleh Dewi Lestari (SDM)</span>
                                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">10 Mei 2024 • 14:15</span>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute -left-[26px] top-1 flex size-3 items-center justify-center rounded-full bg-purple-500 ring-4 ring-white dark:ring-neutral-950"></span>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-neutral-800 dark:text-neutral-200">PMD-2024-0062 — Analisis Data untuk Non Data Scientist</span>
                                                <span className="text-neutral-500 dark:text-neutral-400">Diajukan oleh Budi Santoso (IT & Digital)</span>
                                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">09 Mei 2024 • 09:45</span>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute -left-[26px] top-1 flex size-3 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white dark:ring-neutral-950"></span>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-neutral-800 dark:text-neutral-200">PMD-2024-0061 — Customer Experience Excellence</span>
                                                <span className="text-neutral-500 dark:text-neutral-400">Diajukan oleh Rina Anjayani (Pemasaran)</span>
                                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">08 Mei 2024 • 16:20</span>
                                            </div>
                                        </div>
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

                    {/* Right Hand Sidebar (Left 1 column space) */}
                    <div className="space-y-6 lg:col-span-1">
                        
                        {/* 1. Donut Chart Box */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Distribusi Status</h3>
                            </div>
                            <CardContent className="p-5 flex flex-col items-center justify-center gap-6">
                                {/* SVG Donut Chart */}
                                <div className="relative flex h-28 w-28 items-center justify-center flex-shrink-0">
                                    <ChartContainer config={chartConfig} className="h-28 w-28 flex-shrink-0">
                                        <PieChart>
                                            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                            <Pie
                                                data={statusChartData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={28}
                                                outerRadius={38}
                                                strokeWidth={0}
                                            >
                                                {statusChartData.map((entry, index) => (
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
                                                                        {totalStatusSubmissions}
                                                                    </text>
                                                                    <text
                                                                        x={viewBox.cx}
                                                                        y={(viewBox.cy || 0) + 12}
                                                                        textAnchor="middle"
                                                                        dominantBaseline="middle"
                                                                        className="fill-muted-foreground text-[7px] font-bold text-neutral-400 dark:fill-neutral-500 uppercase tracking-wider"
                                                                    >
                                                                        Total
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
                                            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Baru</span>
                                        </div>
                                        <span className="font-bold text-neutral-800 dark:text-neutral-200">22 <span className="text-neutral-400 font-normal text-[10px] ml-1">({((22 / totalStatusSubmissions) * 100).toFixed(1)}%)</span></span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2.5 rounded-full bg-zinc-400"></span>
                                            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Drafting</span>
                                        </div>
                                        <span className="font-bold text-neutral-800 dark:text-neutral-200">24 <span className="text-neutral-400 font-normal text-[10px] ml-1">({((24 / totalStatusSubmissions) * 100).toFixed(1)}%)</span></span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2.5 rounded-full bg-purple-500"></span>
                                            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Menunggu Approval</span>
                                        </div>
                                        <span className="font-bold text-neutral-800 dark:text-neutral-200">18 <span className="text-neutral-400 font-normal text-[10px] ml-1">({((18 / totalStatusSubmissions) * 100).toFixed(1)}%)</span></span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2.5 rounded-full bg-emerald-500"></span>
                                            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Selesai</span>
                                        </div>
                                        <span className="font-bold text-neutral-800 dark:text-neutral-200">54 <span className="text-neutral-400 font-normal text-[10px] ml-1">({((54 / totalStatusSubmissions) * 100).toFixed(1)}%)</span></span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2.5 rounded-full bg-rose-500"></span>
                                            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Ditolak</span>
                                        </div>
                                        <span className="font-bold text-neutral-800 dark:text-neutral-200">8 <span className="text-neutral-400 font-normal text-[10px] ml-1">({((8 / totalStatusSubmissions) * 100).toFixed(1)}%)</span></span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Prioritas Pengajuan */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Prioritas Pengajuan</h3>
                            </div>
                            <CardContent className="p-5 space-y-4">
                                <div className="space-y-3.5">
                                    {/* Item 1 */}
                                    <div className="flex items-start gap-2.5 text-xs">
                                        <div className="flex size-5 items-center justify-center rounded bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex-shrink-0 mt-0.5 font-bold">!</div>
                                        <div className="flex flex-col flex-1">
                                            <span className="font-bold text-neutral-800 dark:text-neutral-200 leading-snug">Microsoft Excel Intermediate</span>
                                            <span className="text-neutral-400 dark:text-neutral-500 text-[10px] mt-0.5">Revisi Modul • Agus Setiawan (Keuangan)</span>
                                            <span className="text-rose-600 dark:text-rose-400 text-[10px] font-bold mt-1">Deadline terdekat: 24 Mei 2024</span>
                                        </div>
                                    </div>

                                    {/* Item 2 */}
                                    <div className="flex items-start gap-2.5 text-xs">
                                        <div className="flex size-5 items-center justify-center rounded bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex-shrink-0 mt-0.5 font-bold">!</div>
                                        <div className="flex flex-col flex-1">
                                            <span className="font-bold text-neutral-800 dark:text-neutral-200 leading-snug">Komunikasi Efektif</span>
                                            <span className="text-neutral-400 dark:text-neutral-500 text-[10px] mt-0.5">Revisi Modul • Yusuf Setiawan (Operasional)</span>
                                            <span className="text-rose-600 dark:text-rose-400 text-[10px] font-bold mt-1">Deadline terdekat: 23 Mei 2024</span>
                                        </div>
                                    </div>

                                    {/* Item 3 */}
                                    <div className="flex items-start gap-2.5 text-xs">
                                        <div className="flex size-5 items-center justify-center rounded bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex-shrink-0 mt-0.5 font-bold">!</div>
                                        <div className="flex flex-col flex-1">
                                            <span className="font-bold text-neutral-800 dark:text-neutral-200 leading-snug">Design Thinking Fundamentals</span>
                                            <span className="text-neutral-400 dark:text-neutral-500 text-[10px] mt-0.5">Modul Baru • Nita Fadilah (IT & Digital)</span>
                                            <span className="text-amber-600 dark:text-amber-400 text-[10px] font-bold mt-1">Deadline terdekat: 20 Mei 2024</span>
                                        </div>
                                    </div>

                                    {/* Item 4 */}
                                    <div className="flex items-start gap-2.5 text-xs">
                                        <div className="flex size-5 items-center justify-center rounded bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex-shrink-0 mt-0.5 font-bold">!</div>
                                        <div className="flex flex-col flex-1">
                                            <span className="font-bold text-neutral-800 dark:text-neutral-200 leading-snug">Manajemen Proyek Agil</span>
                                            <span className="text-neutral-400 dark:text-neutral-500 text-[10px] mt-0.5">Revisi Modul • Siti Lestari (IT & Digital)</span>
                                            <span className="text-rose-600 dark:text-rose-400 text-[10px] font-bold mt-1">Deadline terdekat: 17 Mei 2024</span>
                                        </div>
                                    </div>

                                    {/* Item 5 */}
                                    <div className="flex items-start gap-2.5 text-xs">
                                        <div className="flex size-5 items-center justify-center rounded bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex-shrink-0 mt-0.5 font-bold">!</div>
                                        <div className="flex flex-col flex-1">
                                            <span className="font-bold text-neutral-800 dark:text-neutral-200 leading-snug">Customer Experience Excellence</span>
                                            <span className="text-neutral-400 dark:text-neutral-500 text-[10px] mt-0.5">Modul Baru • Rina Anjayani (Pemasaran)</span>
                                            <span className="text-amber-600 dark:text-amber-400 text-[10px] font-bold mt-1">Deadline terdekat: 29 Mei 2024</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-2 border-t">
                                    <Button variant="ghost" className="w-full text-center hover:bg-neutral-50 text-neutral-500 text-xs font-semibold dark:hover:bg-neutral-900 dark:text-neutral-400 h-8">
                                        Lihat Semua Prioritas
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. Aksi Cepat */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Aksi Cepat</h3>
                            </div>
                            <CardContent className="p-5 grid grid-cols-3 gap-2 text-center text-[10px]">
                                {/* Ajukan Modul Baru */}
                                <button
                                    onClick={() => {
                                        setNewType('Modul Baru');
                                        setIsAddModalOpen(true);
                                    }}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/20 hover:bg-neutral-50 dark:hover:bg-neutral-900 gap-2 font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
                                >
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                        <Plus className="size-4" />
                                    </div>
                                    <span>Ajukan Modul Baru</span>
                                </button>
                                
                                {/* Upload Dokumen */}
                                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/20 hover:bg-neutral-50 dark:hover:bg-neutral-900 gap-2 font-semibold text-neutral-700 dark:text-neutral-300 transition-colors">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                                        <Upload className="size-4" />
                                    </div>
                                    <span>Upload Dokumen</span>
                                </button>

                                {/* Import CSV */}
                                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/20 hover:bg-neutral-50 dark:hover:bg-neutral-900 gap-2 font-semibold text-neutral-700 dark:text-neutral-300 transition-colors">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                                        <Download className="size-4" />
                                    </div>
                                    <span>Import CSV</span>
                                </button>
                            </CardContent>
                        </Card>

                    </div>

                </div>

            </div>

            {/* Modal: Detail Pengajuan */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <FileText className="size-5 text-blue-600 dark:text-blue-400" />
                            <span>Detail Pengajuan Modul</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Informasi lengkap pengajuan modul pelatihan.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedItem && (
                        <div className="space-y-4 py-2 text-xs">
                            <div className="rounded-xl bg-neutral-50 p-4 space-y-2.5 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-neutral-400">No Pengajuan</span>
                                    <span className="font-bold text-neutral-800 dark:text-neutral-200">{selectedItem.id}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-neutral-400">Jenis Modul</span>
                                    <Badge variant="secondary" className="font-semibold rounded-md border-0 px-2 py-0.5 text-[9px] bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                                        {selectedItem.type}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-start gap-4">
                                    <span className="font-semibold text-neutral-400 flex-shrink-0">Judul Modul</span>
                                    <span className="font-bold text-neutral-800 text-right dark:text-neutral-200">{selectedItem.title}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-neutral-400">Pengaju</span>
                                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">{selectedItem.applicant}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-neutral-400">Unit</span>
                                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">{selectedItem.unit}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-neutral-400">Tanggal Pengajuan</span>
                                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">{selectedItem.submissionDate}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-neutral-400">Deadline</span>
                                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">{selectedItem.deadline}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-neutral-400">Status</span>
                                    <Badge className="font-semibold rounded-md border-0 px-2.5 py-0.5 text-[9px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                                        {selectedItem.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Deskripsi / Kebutuhan</span>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed bg-neutral-50/40 p-3 rounded-lg border border-neutral-100/50 dark:bg-neutral-900/40 dark:border-neutral-800/50">
                                    {selectedItem.description}
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-4">
                        <Button
                            onClick={() => setIsDetailModalOpen(false)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-9 text-xs font-semibold"
                        >
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Buat Pengajuan */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Plus className="size-5 text-blue-600 dark:text-blue-400" />
                            <span>Buat Pengajuan Modul</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Isi detail formulir pengajuan kebutuhan modul kerja Anda.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddSubmission} className="space-y-4 py-2 text-xs">
                        {/* Judul Modul */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                Judul Modul / Kebutuhan Pelatihan
                            </label>
                            <input
                                type="text"
                                required
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Contoh: Pelatihan Customer Service Level 2"
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                        </div>

                        {/* Jenis & Unit Row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                    Jenis Pengajuan
                                </label>
                                <select
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value as 'Modul Baru' | 'Revisi Modul')}
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                >
                                    <option value="Modul Baru">Modul Baru</option>
                                    <option value="Revisi Modul">Revisi Modul</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                    Unit Kerja
                                </label>
                                <select
                                    value={newUnit}
                                    onChange={(e) => setNewUnit(e.target.value)}
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                >
                                    <option value="Operasional">Operasional</option>
                                    <option value="SDM">SDM</option>
                                    <option value="IT & Digital">IT & Digital</option>
                                    <option value="Pemasaran">Pemasaran</option>
                                    <option value="Keuangan">Keuangan</option>
                                    <option value="Pengembangan SDM">Pengembangan SDM</option>
                                </select>
                            </div>
                        </div>

                        {/* Target Deadline */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                Target Tanggal Dibutuhkan (Deadline)
                            </label>
                            <input
                                type="date"
                                required
                                value={newDeadline}
                                onChange={(e) => setNewDeadline(e.target.value)}
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                            />
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                Deskripsi Permintaan / Alasan Pengajuan
                            </label>
                            <textarea
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder="Jelaskan secara singkat latar belakang kebutuhan dan ruang lingkup modul..."
                                className="w-full h-20 rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
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
                                Ajukan Permintaan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
