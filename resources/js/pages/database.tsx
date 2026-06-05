import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    BookOpen,
    ShieldAlert,
    RefreshCw,
    Archive,
    Search,
    Plus,
    Download,
    Eye,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    FileText,
    TrendingUp,
    CheckCircle2,
    Clock,
    Lock,
    ExternalLink,
    ShieldCheck,
    Briefcase,
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
        title: 'Database Modul',
        href: '/database',
    },
];

interface ModuleItem {
    id: string;
    title: string;
    program: string;
    revision: string;
    language: string;
    updatedAt: string;
    status: 'Approved' | 'Revisi' | 'Arsip';
    fileSize: string;
    filePages: number;
    description: string;
    revisionsHistory: Array<{
        version: string;
        date: string;
        author: string;
        note: string;
        status: 'Approved' | 'Minta Revisi' | 'Rejected' | 'Draft';
    }>;
}

export default function DatabaseModul() {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;
    const role = user?.role || 'User';

    // Mock dataset matching the user's screenshot
    const [modules, setModules] = useState<ModuleItem[]>([
        {
            id: 'ILN.1.8',
            title: 'Interpretasi Sistem dan Implementasi ISO 17025',
            program: 'Manajerial & Kepemimpinan',
            revision: '2.1',
            language: 'Indonesia',
            updatedAt: '12 Jun 2024 09:21',
            status: 'Approved',
            fileSize: '2.45 MB',
            filePages: 24,
            description: 'Panduan teknis dan implementasi persyaratan umum kompetensi laboratorium pengujian dan kalibrasi sesuai standar ISO/IEC 17025:2017.',
            revisionsHistory: [
                { version: '2.1', date: '12 Jun 2024 09:21 WIB', author: 'Raffa (Administrator)', note: 'Perbaikan minor pada materi dan update referensi.', status: 'Approved' },
                { version: '2.0', date: '30 Mei 2024 11:28 WIB', author: 'Dewi Lestari', note: 'Penyesuaian prosedur dan penambahan studi kasus.', status: 'Approved' },
                { version: '1.1', date: '15 Mei 2024 14:05 WIB', author: 'Budi Santoso', note: 'Penambahan materi pada bab 3 dan 4.', status: 'Approved' },
                { version: '1.0', date: '01 Mei 2024 09:00 WIB', author: 'Budi Santoso', note: 'Versi awal modul.', status: 'Approved' }
            ]
        },
        {
            id: 'SJPH',
            title: 'Sistem Jaminan Produk Halal (SJPH)',
            program: 'Regulasi & Kepatuhan',
            revision: '1.3',
            language: 'Indonesia',
            updatedAt: '07 Jun 2024 14:35',
            status: 'Approved',
            fileSize: '3.12 MB',
            filePages: 35,
            description: 'Acuan standard implementasi jaminan produk halal di industri pangan, farmasi, dan kosmetika berdasarkan regulasi BPJPH.',
            revisionsHistory: [
                { version: '1.3', date: '07 Jun 2024 14:35 WIB', author: 'Dewi Lestari', note: 'Sinkronisasi kriteria SJPH Kemenag terbaru.', status: 'Approved' },
                { version: '1.2', date: '12 Apr 2024 10:15 WIB', author: 'Budi Santoso', note: 'Penambahan diagram alir proses sertifikasi.', status: 'Approved' },
                { version: '1.0', date: '02 Jan 2024 09:00 WIB', author: 'Budi Santoso', note: 'Rilis pertama modul panduan SJPH.', status: 'Approved' }
            ]
        },
        {
            id: 'AUD.HALAL',
            title: 'Auditor Halal',
            program: 'Sertifikasi & Auditor',
            revision: '3.0',
            language: 'Indonesia',
            updatedAt: '04 Jun 2024 10:12',
            status: 'Approved',
            fileSize: '4.80 MB',
            filePages: 48,
            description: 'Kurikulum standar kompetensi kerja auditor halal mencakup teknik pemeriksaan dokumen, audit lapangan, dan pelaporan.',
            revisionsHistory: [
                { version: '3.0', date: '04 Jun 2024 10:12 WIB', author: 'Mega Kusuma', note: 'Pembaruan materi checklist bahan kritis.', status: 'Approved' },
                { version: '2.0', date: '18 Nov 2023 15:40 WIB', author: 'Dewi Lestari', note: 'Penambahan simulasi kasus audit pabrik skala besar.', status: 'Approved' }
            ]
        },
        {
            id: 'PPH.01',
            title: 'Pemeriksaan Bahan PPH',
            program: 'Teknis Laboratorium',
            revision: '1.2',
            language: 'Indonesia',
            updatedAt: '02 Jun 2024 16:47',
            status: 'Revisi',
            fileSize: '1.95 MB',
            filePages: 18,
            description: 'Tata cara pemeriksaan bahan baku, bahan tambahan, dan bahan penolong dalam Proses Produk Halal.',
            revisionsHistory: [
                { version: '1.2', date: '02 Jun 2024 16:47 WIB', author: 'Budi Santoso', note: 'Draft usulan revisi tabel titik kritis bahan hewani.', status: 'Draft' },
                { version: '1.0', date: '10 Feb 2024 11:20 WIB', author: 'Budi Santoso', note: 'Rilis pertama.', status: 'Approved' }
            ]
        },
        {
            id: 'CPPOB.02',
            title: 'Cara Produksi Pangan Olahan yang Baik',
            program: 'Teknis Produksi',
            revision: '2.0',
            language: 'Indonesia',
            updatedAt: '30 Mei 2024 11:28',
            status: 'Approved',
            fileSize: '2.70 MB',
            filePages: 26,
            description: 'Pedoman industri pengolahan pangan untuk menghasilkan produk pangan yang aman, bermutu, dan layak dikonsumsi.',
            revisionsHistory: [
                { version: '2.0', date: '30 Mei 2024 11:28 WIB', author: 'Yusuf Setiawan', note: 'Pembaruan panduan sanitasi peralatan pabrik.', status: 'Approved' },
                { version: '1.0', date: '15 Okt 2023 09:30 WIB', author: 'Yusuf Setiawan', note: 'Versi awal.', status: 'Approved' }
            ]
        },
        {
            id: 'TRACE.01',
            title: 'Traceability Rantai Pasok Halal',
            program: 'Supply Chain & Logistik',
            revision: '1.0',
            language: 'Indonesia',
            updatedAt: '28 Mei 2024 08:55',
            status: 'Revisi',
            fileSize: '1.60 MB',
            filePages: 15,
            description: 'Prinsip ketertelusuran produk dari bahan baku hingga produk sampai ke konsumen untuk menjamin integritas halal.',
            revisionsHistory: [
                { version: '1.0', date: '28 Mei 2024 08:55 WIB', author: 'Mega Kusuma', note: 'Draft usulan modul baru ketertelusuran logistik.', status: 'Draft' }
            ]
        },
        {
            id: 'HALAL.AWARE',
            title: 'Halal Awareness',
            program: 'Pengembangan SDM',
            revision: '1.1',
            language: 'English',
            updatedAt: '24 Mei 2024 15:32',
            status: 'Approved',
            fileSize: '1.40 MB',
            filePages: 14,
            description: 'Basic introduction to halal and haram concepts for general staff and third-party contractors.',
            revisionsHistory: [
                { version: '1.1', date: '24 Mei 2024 15:32 WIB', author: 'Nita Fadilah', note: 'English translation review & grammar adjustments.', status: 'Approved' },
                { version: '1.0', date: '01 Apr 2024 09:30 WIB', author: 'Nita Fadilah', note: 'First release.', status: 'Approved' }
            ]
        },
        {
            id: 'MGMT.RISK',
            title: 'Manajemen Risiko',
            program: 'Manajerial & Kepemimpinan',
            revision: '2.2',
            language: 'Indonesia',
            updatedAt: '22 Mei 2024 09:10',
            status: 'Arsip',
            fileSize: '2.10 MB',
            filePages: 22,
            description: 'Kerangka manajemen risiko perusahaan secara korporat, metode identifikasi risiko dan penyusunan risk register.',
            revisionsHistory: [
                { version: '2.2', date: '22 Mei 2024 09:10 WIB', author: 'Andi Pratama', note: 'Modul diarsipkan karena digantikan oleh versi terintegrasi.', status: 'Approved' }
            ]
        },
        {
            id: 'SAMPL.01',
            title: 'Teknik Pengambilan Sampel',
            program: 'Teknis Laboratorium',
            revision: '1.0',
            language: 'Indonesia',
            updatedAt: '20 Mei 2024 13:41',
            status: 'Approved',
            fileSize: '2.15 MB',
            filePages: 20,
            description: 'Pedoman pengambilan contoh uji di lapangan guna menjaga validitas hasil pengujian laboratorium kimia dan mikrobiologi.',
            revisionsHistory: [
                { version: '1.0', date: '20 Mei 2024 13:41 WIB', author: 'Budi Santoso', note: 'Rilis pertama.', status: 'Approved' }
            ]
        },
        {
            id: 'LAB.SAFE',
            title: 'Keselamatan dan Kesehatan Kerja Laboratorium',
            program: 'K3 & Keamanan',
            revision: '1.3',
            language: 'Indonesia',
            updatedAt: '18 Mei 2024 10:05',
            status: 'Revisi',
            fileSize: '2.50 MB',
            filePages: 25,
            description: 'Pedoman keselamatan penggunaan bahan kimia berbahaya, penanganan kecelakaan kerja, dan penggunaan alat pelindung diri.',
            revisionsHistory: [
                { version: '1.3', date: '18 Mei 2024 10:05 WIB', author: 'Budi Santoso', note: 'Penambahan panduan MSDS format GHS terbaru.', status: 'Draft' }
            ]
        }
    ]);

    // Selection check boxes
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('Semua Jenis');
    const [langFilter, setLangFilter] = useState('Semua Bahasa');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [revFilter, setRevFilter] = useState('Semua Revisi');

    // Selected Module for Right Column Preview
    const [selectedModuleId, setSelectedModuleId] = useState<string>('ILN.1.8');

    // Add module form modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newId, setNewId] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newProgram, setNewProgram] = useState('Regulasi & Kepatuhan');
    const [newLanguage, setNewLanguage] = useState('Indonesia');
    const [newDescription, setNewDescription] = useState('');

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Active item matching
    const selectedModule = useMemo(() => {
        return modules.find(m => m.id === selectedModuleId) || modules[0] || null;
    }, [modules, selectedModuleId]);

    // Handle check all
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedModules(filteredModules.map(m => m.id));
        } else {
            setSelectedModules([]);
        }
    };

    // Handle check row
    const handleSelectRow = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedModules(prev => [...prev, id]);
        } else {
            setSelectedModules(prev => prev.filter(m => m !== id));
        }
    };

    // Filter logic
    const filteredModules = useMemo(() => {
        return modules.filter((m) => {
            const matchesSearch = 
                m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.program.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = typeFilter === 'Semua Jenis' || m.program === typeFilter;
            const matchesLang = langFilter === 'Semua Bahasa' || m.language === langFilter;
            const matchesStatus = statusFilter === 'Semua Status' || m.status === statusFilter;
            const matchesRev = revFilter === 'Semua Revisi' || m.revision === revFilter;

            return matchesSearch && matchesType && matchesLang && matchesStatus && matchesRev;
        });
    }, [modules, searchQuery, typeFilter, langFilter, statusFilter, revFilter]);

    // Reset Filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setTypeFilter('Semua Jenis');
        setLangFilter('Semua Bahasa');
        setStatusFilter('Semua Status');
        setRevFilter('Semua Revisi');
    };

    // Add module submit handler
    const handleAddModule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newId || !newTitle) return;

        const newMod: ModuleItem = {
            id: newId.toUpperCase(),
            title: newTitle,
            program: newProgram,
            revision: '1.0',
            language: newLanguage,
            updatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            status: 'Approved',
            fileSize: '1.50 MB',
            filePages: 15,
            description: newDescription || 'Deskripsi modul pelatihan.',
            revisionsHistory: [
                { version: '1.0', date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ' WIB', author: user?.name || 'Raffa Yuda Pratama', note: 'Rilis pertama modul baru.', status: 'Approved' }
            ]
        };

        setModules(prev => [newMod, ...prev]);
        setIsAddModalOpen(false);
        setNewId('');
        setNewTitle('');
        setNewDescription('');

        setToastMessage(`Modul ${newId.toUpperCase()} berhasil ditambahkan ke database.`);
        setTimeout(() => setToastMessage(null), 4000);
    };

    const chartConfig = {
        regulasi: { label: 'Regulasi & Kepatuhan', color: '#3b82f6' },
        teknisLab: { label: 'Teknis Laboratorium', color: '#a855f7' },
        sertifikasi: { label: 'Sertifikasi & Auditor', color: '#ec4899' },
        manajerial: { label: 'Manajerial & Kepemimpinan', color: '#f59e0b' },
        teknisProd: { label: 'Teknis Produksi', color: '#10b981' },
        lainnya: { label: 'Lainnya', color: '#38bdf8' },
    } satisfies ChartConfig;

    const categoryChartData = useMemo(() => [
        { name: 'Regulasi & Kepatuhan', value: 108, fill: '#3b82f6' },
        { name: 'Teknis Laboratorium', value: 92, fill: '#a855f7' },
        { name: 'Sertifikasi & Auditor', value: 68, fill: '#ec4899' },
        { name: 'Manajerial & Kepemimpinan', value: 55, fill: '#f59e0b' },
        { name: 'Teknis Produksi', value: 38, fill: '#10b981' },
        { name: 'Lainnya', value: 25, fill: '#38bdf8' },
    ], []);

    const totalCategoryModules = useMemo(() => {
        return categoryChartData.reduce((acc, curr) => acc + curr.value, 0);
    }, [categoryChartData]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Database Modul" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                        Database Modul
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Pusat data modul pelatihan, dokumen approved, dan riwayat revisi.
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
                    {/* Total Modul */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <BookOpen className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Total Modul</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">386</span>
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-500 mt-1">
                                    <span>↑ 18 dari bulan lalu</span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Modul Approved */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <ShieldCheck className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Modul Approved</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">312</span>
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-500 mt-1">
                                    <span>↑ 22 dari bulan lalu</span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Revisi Aktif */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                                <Clock className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Revisi Aktif</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">50</span>
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-500 mt-1">
                                    <span>↑ 6 dari bulan lalu</span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Arsip */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600 dark:bg-neutral-850 dark:text-neutral-400">
                                <Archive className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Arsip</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">24</span>
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-500 mt-1">
                                    <span>↑ 2 dari bulan lalu</span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Dashboard Split Column Area */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    
                    {/* Main content Area (Left 3 columns) */}
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
                                        placeholder="Cari kode modul, judul, program..."
                                        className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                    />
                                </div>

                                {/* Select filter group */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Jenis / Program Filter */}
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Jenis">Semua Jenis</option>
                                        <option value="Regulasi & Kepatuhan">Regulasi & Kepatuhan</option>
                                        <option value="Teknis Laboratorium">Teknis Laboratorium</option>
                                        <option value="Sertifikasi & Auditor">Sertifikasi & Auditor</option>
                                        <option value="Manajerial & Kepemimpinan">Manajerial & Kepemimpinan</option>
                                        <option value="Teknis Produksi">Teknis Produksi</option>
                                        <option value="Supply Chain & Logistik">Supply Chain & Logistik</option>
                                        <option value="K3 & Keamanan">K3 & Keamanan</option>
                                        <option value="Pengembangan SDM">Pengembangan SDM</option>
                                    </select>

                                    {/* Language Filter */}
                                    <select
                                        value={langFilter}
                                        onChange={(e) => setLangFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Bahasa">Semua Bahasa</option>
                                        <option value="Indonesia">Indonesia</option>
                                        <option value="English">English</option>
                                    </select>

                                    {/* Status Filter */}
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Status">Semua Status</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Revisi">Revisi</option>
                                        <option value="Arsip">Arsip</option>
                                    </select>

                                    {/* Revision filter */}
                                    <select
                                        value={revFilter}
                                        onChange={(e) => setRevFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Revisi">Semua Revisi</option>
                                        <option value="1.0">Revisi 1.0</option>
                                        <option value="1.1">Revisi 1.1</option>
                                        <option value="1.2">Revisi 1.2</option>
                                        <option value="1.3">Revisi 1.3</option>
                                        <option value="2.0">Revisi 2.0</option>
                                        <option value="2.1">Revisi 2.1</option>
                                        <option value="2.2">Revisi 2.2</option>
                                        <option value="3.0">Revisi 3.0</option>
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
                                        onClick={() => setIsAddModalOpen(true)}
                                        size="sm"
                                        className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Plus className="size-4" />
                                        <span>Tambah Modul</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-3.5 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 font-semibold rounded-lg flex items-center gap-1.5"
                                    >
                                        <Download className="size-3.5" />
                                        <span>Export</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[950px] text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                            <th className="px-5 py-3.5 w-12 text-center">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                                    checked={selectedModules.length > 0 && selectedModules.length === filteredModules.length}
                                                    className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 size-3.5"
                                                />
                                            </th>
                                            <th className="px-4 py-3.5">Kode Modul</th>
                                            <th className="px-4 py-3.5">Judul Modul</th>
                                            <th className="px-4 py-3.5">Program / Jenis Pelatihan</th>
                                            <th className="px-4 py-3.5">Revisi</th>
                                            <th className="px-4 py-3.5">Bahasa</th>
                                            <th className="px-4 py-3.5">Updated At</th>
                                            <th className="px-4 py-3.5">Status</th>
                                            <th className="px-4 py-3.5 text-center w-24">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {filteredModules.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="text-center py-10 text-neutral-400 font-medium dark:text-neutral-500">
                                                    Tidak ada data modul yang cocok dengan filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredModules.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    onClick={() => setSelectedModuleId(item.id)}
                                                    className={`cursor-pointer transition-colors ${
                                                        selectedModuleId === item.id
                                                            ? 'bg-blue-50/30 hover:bg-blue-50/40 dark:bg-blue-950/10 dark:hover:bg-blue-950/15'
                                                            : 'hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10'
                                                    }`}
                                                >
                                                    <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedModules.includes(item.id)}
                                                            onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                                                            className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 size-3.5"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4 font-semibold text-neutral-800 dark:text-neutral-300">
                                                        {item.id}
                                                    </td>
                                                    <td className="px-4 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                                                        {item.title}
                                                    </td>
                                                    <td className="px-4 py-4 text-neutral-500 dark:text-neutral-400 font-medium">
                                                        {item.program}
                                                    </td>
                                                    <td className="px-4 py-4 text-neutral-700 dark:text-neutral-300 font-bold">
                                                        {item.revision}
                                                    </td>
                                                    <td className="px-4 py-4 text-neutral-600 dark:text-neutral-400 font-medium">
                                                        {item.language}
                                                    </td>
                                                    <td className="px-4 py-4 text-neutral-450 dark:text-neutral-500 font-medium">
                                                        {item.updatedAt}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Badge
                                                            className={`font-semibold rounded-md border-0 px-2 py-0.5 text-[9px] ${
                                                                item.status === 'Approved'
                                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                    : item.status === 'Revisi'
                                                                    ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300'
                                                                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                                            }`}
                                                        >
                                                            {item.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedModuleId(item.id);
                                                                }}
                                                                className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400"
                                                            >
                                                                <Eye className="size-3.5" />
                                                            </button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400">
                                                                        <MoreVertical className="size-3.5" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-40 text-xs">
                                                                    <DropdownMenuItem className="cursor-pointer font-medium">Unduh PDF</DropdownMenuItem>
                                                                    <DropdownMenuItem className="cursor-pointer font-medium">Buat Revisi</DropdownMenuItem>
                                                                    <DropdownMenuItem className="cursor-pointer font-medium">Arsipkan Modul</DropdownMenuItem>
                                                                    <DropdownMenuItem className="cursor-pointer font-medium text-rose-600">Hapus Modul</DropdownMenuItem>
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
                                    Menampilkan 1-{filteredModules.length} dari 386 modul
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
                                        <button className="flex size-7 items-center justify-center rounded text-xs font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">39</button>
                                        <button className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"><ChevronRight className="size-3.5" /></button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Bottom Grid for Kategori & Popular lists */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            
                            {/* Kategori Modul Donut */}
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                                <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/10">
                                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Kategori Modul</h3>
                                    <button className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                        Lihat Semua
                                    </button>
                                </div>
                                <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-center gap-6">
                                    <div className="relative flex h-28 w-28 flex-shrink-0 items-center justify-center">
                                        <ChartContainer config={chartConfig} className="h-28 w-28 flex-shrink-0">
                                            <PieChart>
                                                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                                <Pie
                                                    data={categoryChartData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    innerRadius={28}
                                                    outerRadius={38}
                                                    strokeWidth={0}
                                                >
                                                    {categoryChartData.map((entry, index) => (
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
                                                                            {totalCategoryModules}
                                                                        </text>
                                                                        <text
                                                                            x={viewBox.cx}
                                                                            y={(viewBox.cy || 0) + 12}
                                                                            textAnchor="middle"
                                                                            dominantBaseline="middle"
                                                                            className="fill-muted-foreground text-[7px] font-bold text-neutral-400 dark:fill-neutral-500 uppercase tracking-wider"
                                                                        >
                                                                            Total Modul
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

                                    {/* Legends list */}
                                    <div className="flex-1 space-y-2 text-[10px] w-full font-semibold">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-blue-500"></span>
                                                <span className="text-neutral-500 dark:text-neutral-400">Regulasi & Kepatuhan</span>
                                            </div>
                                            <span className="text-neutral-800 dark:text-neutral-200">108 <span className="text-neutral-400 font-normal text-[9px] ml-1">({((108 / totalCategoryModules) * 100).toFixed(1)}%)</span></span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-purple-500"></span>
                                                <span className="text-neutral-500 dark:text-neutral-400">Teknis Laboratorium</span>
                                            </div>
                                            <span className="text-neutral-800 dark:text-neutral-200">92 <span className="text-neutral-400 font-normal text-[9px] ml-1">({((92 / totalCategoryModules) * 100).toFixed(1)}%)</span></span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-pink-500"></span>
                                                <span className="text-neutral-500 dark:text-neutral-400">Sertifikasi & Auditor</span>
                                            </div>
                                            <span className="text-neutral-800 dark:text-neutral-200">68 <span className="text-neutral-400 font-normal text-[9px] ml-1">({((68 / totalCategoryModules) * 100).toFixed(1)}%)</span></span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-amber-500"></span>
                                                <span className="text-neutral-500 dark:text-neutral-400">Manajerial & Kepemimpinan</span>
                                            </div>
                                            <span className="text-neutral-800 dark:text-neutral-200">55 <span className="text-neutral-400 font-normal text-[9px] ml-1">({((55 / totalCategoryModules) * 100).toFixed(1)}%)</span></span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-emerald-500"></span>
                                                <span className="text-neutral-500 dark:text-neutral-400">Teknis Produksi</span>
                                            </div>
                                            <span className="text-neutral-800 dark:text-neutral-200">38 <span className="text-neutral-400 font-normal text-[9px] ml-1">({((38 / totalCategoryModules) * 100).toFixed(1)}%)</span></span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-sky-400"></span>
                                                <span className="text-neutral-500 dark:text-neutral-400">Lainnya</span>
                                            </div>
                                            <span className="text-neutral-800 dark:text-neutral-200">25 <span className="text-neutral-400 font-normal text-[9px] ml-1">({((25 / totalCategoryModules) * 100).toFixed(1)}%)</span></span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Top Modul Diakses */}
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 flex flex-col justify-between">
                                <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/10">
                                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Top Modul Diakses</h3>
                                    <button className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                        Lihat Semua
                                    </button>
                                </div>
                                <CardContent className="p-5 flex-1 flex flex-col justify-between gap-3 text-xs font-medium">
                                    <div className="space-y-3">
                                        {/* Rank 1 */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-5 items-center justify-center rounded bg-amber-500 text-white font-extrabold text-[10px]">1</span>
                                                <span className="text-neutral-800 dark:text-neutral-200 truncate max-w-[220px]">SJPH - Sistem Jaminan Produk Halal (SJPH)</span>
                                            </div>
                                            <span className="text-neutral-550 dark:text-neutral-400 font-semibold flex items-center gap-1"><Eye className="size-3" /> 2,842</span>
                                        </div>

                                        {/* Rank 2 */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-5 items-center justify-center rounded bg-neutral-400 text-white font-extrabold text-[10px]">2</span>
                                                <span className="text-neutral-800 dark:text-neutral-200 truncate max-w-[220px]">Auditor Halal</span>
                                            </div>
                                            <span className="text-neutral-550 dark:text-neutral-400 font-semibold flex items-center gap-1"><Eye className="size-3" /> 2,196</span>
                                        </div>

                                        {/* Rank 3 */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-5 items-center justify-center rounded bg-amber-700 text-white font-extrabold text-[10px]">3</span>
                                                <span className="text-neutral-800 dark:text-neutral-200 truncate max-w-[220px]">Interpretasi Sistem dan Implementasi ISO 17025</span>
                                            </div>
                                            <span className="text-neutral-550 dark:text-neutral-400 font-semibold flex items-center gap-1"><Eye className="size-3" /> 1,896</span>
                                        </div>

                                        {/* Rank 4 */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-5 items-center justify-center rounded bg-neutral-100 text-neutral-600 dark:bg-neutral-850 dark:text-neutral-400 font-extrabold text-[10px]">4</span>
                                                <span className="text-neutral-800 dark:text-neutral-200 truncate max-w-[220px]">CPPOB.02 - Cara Produksi Pangan Olahan yang Baik</span>
                                            </div>
                                            <span className="text-neutral-550 dark:text-neutral-400 font-semibold flex items-center gap-1"><Eye className="size-3" /> 1,654</span>
                                        </div>

                                        {/* Rank 5 */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-5 items-center justify-center rounded bg-neutral-100 text-neutral-600 dark:bg-neutral-850 dark:text-neutral-400 font-extrabold text-[10px]">5</span>
                                                <span className="text-neutral-800 dark:text-neutral-200 truncate max-w-[220px]">Halal Awareness</span>
                                            </div>
                                            <span className="text-neutral-550 dark:text-neutral-400 font-semibold flex items-center gap-1"><Eye className="size-3" /> 1,502</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                    </div>

                    {/* Right Hand Sidebar (Left 1 column space) */}
                    <div className="space-y-6 lg:col-span-1">
                        
                        {/* Preview Dokumen panel */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 flex flex-col justify-between">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Preview Dokumen</h3>
                            </div>
                            
                            {selectedModule ? (
                                <CardContent className="p-5 flex flex-col gap-5 text-xs flex-1 justify-between">
                                    
                                    {/* Cover Card Mockup & Specs */}
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            {/* Cover Card */}
                                            <div className="w-24 h-32 rounded-lg bg-neutral-50 dark:bg-neutral-900 border flex flex-col p-2.5 items-center justify-between relative shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between w-full items-center">
                                                    <span className="text-[7px] font-bold text-neutral-400 uppercase leading-none tracking-wider">Module</span>
                                                    <BookOpen className="size-3 text-neutral-400" />
                                                </div>
                                                <div className="flex flex-col items-center text-center gap-1">
                                                    <span className="text-[6px] font-extrabold text-neutral-900 dark:text-neutral-100 leading-tight uppercase line-clamp-3">
                                                        {selectedModule.title}
                                                    </span>
                                                    <span className="text-[5px] text-neutral-400">Revisi {selectedModule.revision}</span>
                                                </div>
                                                <div className="flex justify-between w-full items-center border-t pt-1.5 dark:border-neutral-850">
                                                    <span className="text-[5px] font-semibold text-neutral-400">{selectedModule.id}</span>
                                                    <Badge className="font-extrabold rounded px-1.5 py-0.2 text-[5px] bg-rose-50 text-rose-600 leading-none">PDF</Badge>
                                                </div>
                                            </div>

                                            {/* Specs */}
                                            <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-neutral-900 dark:text-neutral-100 text-xs truncate leading-snug" title={selectedModule.title}>
                                                        {selectedModule.title}
                                                    </span>
                                                </div>
                                                <div className="space-y-1 mt-2">
                                                    <div className="flex justify-between text-[10px]">
                                                        <span className="font-semibold text-neutral-400">Kode Modul</span>
                                                        <span className="font-bold text-neutral-700 dark:text-neutral-300">{selectedModule.id}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px]">
                                                        <span className="font-semibold text-neutral-400">Revisi</span>
                                                        <span className="font-bold text-neutral-700 dark:text-neutral-300">{selectedModule.revision}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px]">
                                                        <span className="font-semibold text-neutral-400">Bahasa</span>
                                                        <span className="font-bold text-neutral-700 dark:text-neutral-300">{selectedModule.language}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px]">
                                                        <span className="font-semibold text-neutral-400">Ukuran File</span>
                                                        <span className="font-bold text-neutral-700 dark:text-neutral-300">{selectedModule.fileSize} (PDF)</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between text-[10px] items-center pt-2 border-t dark:border-neutral-800">
                                            <span className="font-semibold text-neutral-400">Terakhir Approved</span>
                                            <span className="font-bold text-neutral-700 dark:text-neutral-300">{selectedModule.updatedAt} WIB</span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t dark:border-neutral-800">
                                        <Button size="sm" variant="outline" className="h-9 rounded-lg text-xs font-semibold border-neutral-200 dark:border-neutral-800 text-neutral-600">
                                            Lihat Detail
                                        </Button>
                                        <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-sm">
                                            <span>Download PDF</span>
                                            <Download className="size-3.5" />
                                        </Button>
                                    </div>

                                </CardContent>
                            ) : (
                                <div className="p-8 text-center text-neutral-400 text-xs flex-1 flex items-center justify-center">
                                    Pilih modul di tabel untuk melihat preview.
                                </div>
                            )}
                        </Card>

                        {/* Riwayat Revisi Timeline */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 flex flex-col justify-between">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Riwayat Revisi</h3>
                            </div>
                            <CardContent className="p-5 flex flex-col gap-4">
                                {selectedModule && selectedModule.revisionsHistory ? (
                                    <div className="relative pl-6 border-l border-neutral-100 dark:border-neutral-800 space-y-5 text-xs">
                                        {selectedModule.revisionsHistory.map((historyItem, index) => (
                                            <div key={index} className="relative">
                                                {/* Colored Timeline Node Indicator */}
                                                <span className={`absolute -left-[30px] top-1 flex size-4.5 items-center justify-center rounded-full ring-4 ring-white dark:ring-neutral-950 ${
                                                    index === 0
                                                        ? 'bg-emerald-500 text-white font-extrabold text-[8px]'
                                                        : index === 1
                                                        ? 'bg-amber-500 text-white font-extrabold text-[8px]'
                                                        : index === 2
                                                        ? 'bg-blue-500 text-white font-extrabold text-[8px]'
                                                        : 'bg-neutral-400 text-white font-extrabold text-[8px]'
                                                }`}>
                                                    {index === 0 ? '✓' : ''}
                                                </span>

                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-extrabold text-neutral-900 dark:text-neutral-100 text-xs">{historyItem.version}</span>
                                                        {index === 0 && (
                                                            <Badge className="font-semibold rounded border-0 px-1 py-0.2 text-[8px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 leading-none">Current</Badge>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">{historyItem.date}</span>
                                                    <span className="font-semibold text-neutral-700 dark:text-neutral-300 mt-1">Approved oleh: {historyItem.author}</span>
                                                    <span className="text-neutral-500 dark:text-neutral-400 text-[10px] mt-0.5 leading-relaxed">{historyItem.note}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-neutral-400 text-xs">
                                        Tidak ada riwayat revisi.
                                    </div>
                                )}
                                
                                <div className="pt-2 border-t">
                                    <Button variant="ghost" className="w-full text-center hover:bg-neutral-50 text-neutral-500 text-xs font-semibold dark:hover:bg-neutral-900 dark:text-neutral-400 h-8">
                                        Lihat Semua Riwayat
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                </div>

            </div>

            {/* Modal: Tambah Modul */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Plus className="size-5 text-blue-600 dark:text-blue-400" />
                            <span>Tambah Modul Pelatihan</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Isi detail formulir untuk meregistrasi modul baru ke database.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddModule} className="space-y-4 py-2 text-xs">
                        {/* Kode Modul */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                Kode Modul
                            </label>
                            <input
                                type="text"
                                required
                                value={newId}
                                onChange={(e) => setNewId(e.target.value)}
                                placeholder="Contoh: SJPH.01"
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                        </div>

                        {/* Judul Modul */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                Judul Modul
                            </label>
                            <input
                                type="text"
                                required
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Contoh: Pengenalan ISO 9001:2015"
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                        </div>

                        {/* Program & Bahasa */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                    Program / Jenis Pelatihan
                                </label>
                                <select
                                    value={newProgram}
                                    onChange={(e) => setNewProgram(e.target.value)}
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                >
                                    <option value="Regulasi & Kepatuhan">Regulasi & Kepatuhan</option>
                                    <option value="Teknis Laboratorium">Teknis Laboratorium</option>
                                    <option value="Sertifikasi & Auditor">Sertifikasi & Auditor</option>
                                    <option value="Manajerial & Kepemimpinan">Manajerial & Kepemimpinan</option>
                                    <option value="Teknis Produksi">Teknis Produksi</option>
                                    <option value="Supply Chain & Logistik">Supply Chain & Logistik</option>
                                    <option value="K3 & Keamanan">K3 & Keamanan</option>
                                    <option value="Pengembangan SDM">Pengembangan SDM</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                    Bahasa
                                </label>
                                <select
                                    value={newLanguage}
                                    onChange={(e) => setNewLanguage(e.target.value)}
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                >
                                    <option value="Indonesia">Indonesia</option>
                                    <option value="English">English</option>
                                </select>
                            </div>
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                Deskripsi Ringkas Modul
                            </label>
                            <textarea
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder="Jelaskan secara singkat ruang lingkup modul pelatihan..."
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
                                Simpan Modul
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
const circumference = 226.195;
