import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Clock,
    CheckCircle2,
    XCircle,
    RotateCw,
    Search,
    RefreshCw,
    Play,
    Eye,
    FileText,
    Download,
    ExternalLink,
    AlertTriangle,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Check,
    X,
    FileCheck2
} from 'lucide-react';
import React, { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Approval Modul',
        href: '/approval',
    },
];

interface ApprovalQueueItem {
    id: string;
    title: string;
    type: 'Modul Baru' | 'Revisi Modul' | 'Kebutuhan Khusus';
    applicant: string;
    unit: string;
    priority: 'High' | 'Medium' | 'Low';
    submittedAt: string;
    status: 'Menunggu Approval' | 'Approved' | 'Revisi' | 'Rejected';
    summary: string;
    pdfName: string;
    pdfSize: string;
    pdfPages: number;
}

interface DecisionHistoryItem {
    id: string;
    title: string;
    status: 'Approved' | 'Minta Revisi' | 'Rejected';
    reviewer: string;
    date: string;
    note: string;
}

export default function Approval() {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;
    const role = user?.role || 'User';

    // Access control: only admin and manager PD can access the approval page
    const hasAccess = role === 'admin' || role === 'manager PD';

    // Initial mock queue items matching the screenshot
    const [queue, setQueue] = useState<ApprovalQueueItem[]>([
        {
            id: 'PD-2024-0627',
            title: 'Cybersecurity Awareness',
            type: 'Modul Baru',
            applicant: 'Andi Pratama',
            unit: 'IT & Digital',
            priority: 'High',
            submittedAt: '22 Mei 2024 14:32',
            status: 'Menunggu Approval',
            summary: 'Pengajuan modul baru tentang kesadaran keamanan siber yang mencakup pengenalan ancaman, praktik keamanan, dan respons insiden untuk seluruh karyawan.',
            pdfName: 'Cybersecurity Awareness.pdf',
            pdfSize: '2.4 MB',
            pdfPages: 24
        },
        {
            id: 'PD-2024-0626',
            title: 'Leadership Fundamentals',
            type: 'Revisi Modul',
            applicant: 'Dewi Lestari',
            unit: 'Pengembangan SDM',
            priority: 'Medium',
            submittedAt: '22 Mei 2024 10:15',
            status: 'Menunggu Approval',
            summary: 'Revisi materi kepemimpinan untuk menyelaraskan dengan kerangka kompetensi manajerial 2024.',
            pdfName: 'Leadership Fundamentals Rev.pdf',
            pdfSize: '1.8 MB',
            pdfPages: 18
        },
        {
            id: 'PD-2024-0625',
            title: 'Data Analytics for Business',
            type: 'Modul Baru',
            applicant: 'Budi Santoso',
            unit: 'IT & Digital',
            priority: 'High',
            submittedAt: '21 Mei 2024 16:40',
            status: 'Menunggu Approval',
            summary: 'Pelatihan praktis teknik analisa data, visualisasi laporan berkala, dan interpretasi metrik performa bisnis.',
            pdfName: 'Data Analytics Business.pdf',
            pdfSize: '3.1 MB',
            pdfPages: 32
        },
        {
            id: 'PD-2024-0624',
            title: 'Komunikasi Efektif',
            type: 'Revisi Modul',
            applicant: 'Rina Ariyanti',
            unit: 'Operasional',
            priority: 'Medium',
            submittedAt: '21 Mei 2024 09:22',
            status: 'Menunggu Approval',
            summary: 'Penyesuaian bab teknik penyampaian pesan verbal untuk unit garda depan layanan konsumen.',
            pdfName: 'Komunikasi Efektif v2.pdf',
            pdfSize: '1.2 MB',
            pdfPages: 12
        },
        {
            id: 'PD-2024-0623',
            title: 'Manajemen Proyek Agile',
            type: 'Modul Baru',
            applicant: 'Agus Setiawan',
            unit: 'Keuangan',
            priority: 'Low',
            submittedAt: '20 Mei 2024 15:05',
            status: 'Menunggu Approval',
            summary: 'Modul dasar manajemen proyek menggunakan kerangka kerja Scrum dan Kanban.',
            pdfName: 'Agile Project Management.pdf',
            pdfSize: '2.0 MB',
            pdfPages: 20
        },
        {
            id: 'PD-2024-0622',
            title: 'Excel Advanced',
            type: 'Revisi Modul',
            applicant: 'Mega Kusuma',
            unit: 'Keuangan',
            priority: 'Medium',
            submittedAt: '20 Mei 2024 11:48',
            status: 'Menunggu Approval',
            summary: 'Pembahasan mendalam formula bersarang, dasar macro, dan visualisasi bagan interaktif.',
            pdfName: 'Excel Advanced Manual.pdf',
            pdfSize: '2.8 MB',
            pdfPages: 28
        },
        {
            id: 'PD-2024-0621',
            title: 'Customer Service Excellence',
            type: 'Modul Baru',
            applicant: 'Yusuf Setiawan',
            unit: 'Operasional',
            priority: 'Low',
            submittedAt: '19 Mei 2024 13:30',
            status: 'Menunggu Approval',
            summary: 'Standar kualitas pelayanan, komunikasi empati, dan penanganan keluhan nasabah secara taktis.',
            pdfName: 'CS Excellence Standard.pdf',
            pdfSize: '1.5 MB',
            pdfPages: 15
        },
        {
            id: 'PD-2024-0620',
            title: 'Digital Marketing Basics',
            type: 'Revisi Modul',
            applicant: 'Nita Fadilah',
            unit: 'IT & Digital',
            priority: 'Low',
            submittedAt: '19 Mei 2024 09:10',
            status: 'Menunggu Approval',
            summary: 'Pembaruan materi pengenalan SEO dan dasar-dasar periklanan berbayar.',
            pdfName: 'Digital Marketing Basic.pdf',
            pdfSize: '2.2 MB',
            pdfPages: 22
        },
        {
            id: 'PD-2024-0619',
            title: 'Financial Statement Analysis',
            type: 'Modul Baru',
            applicant: 'Bambang Indriyanto',
            unit: 'Keuangan',
            priority: 'High',
            submittedAt: '18 Mei 2024 16:55',
            status: 'Menunggu Approval',
            summary: 'Kerangka analisis rasio keuangan korporat untuk menentukan kelayakan investasi proyek.',
            pdfName: 'Financial Statement Analysis.pdf',
            pdfSize: '3.5 MB',
            pdfPages: 35
        },
        {
            id: 'PD-2024-0618',
            title: 'Time Management',
            type: 'Revisi Modul',
            applicant: 'Siti Lestari',
            unit: 'Pengembangan SDM',
            priority: 'Medium',
            submittedAt: '18 Mei 2024 10:20',
            status: 'Menunggu Approval',
            summary: 'Metode prioritas tugas kuadran Eisenhower dan teknik menghindari prokrastinasi.',
            pdfName: 'Time Management manual.pdf',
            pdfSize: '1.1 MB',
            pdfPages: 11
        }
    ]);

    // Currently selected queue item (defaults to first item)
    const [selectedItemId, setSelectedItemId] = useState<string>('PD-2024-0627');
    
    // Comments input state
    const [commentText, setCommentText] = useState('Secara umum sudah baik dan relevan. Mohon tambahkan contoh studi kasus terbaru dan perbarui referensi pada halaman 12.');
    
    // Category Tab filters (Semua, Modul Baru, Revisi Modul, Kebutuhan Khusus)
    const [activeTab, setActiveTab] = useState<'Semua' | 'Modul Baru' | 'Revisi Modul' | 'Kebutuhan Khusus'>('Semua');

    // Filter fields
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('Semua Jenis');
    const [unitFilter, setUnitFilter] = useState('Semua Unit');
    const [priorityFilter, setPriorityFilter] = useState('Semua Priority');
    const [statusFilter, setStatusFilter] = useState('Semua Status');

    // Decision History Log
    const [history, setHistory] = useState<DecisionHistoryItem[]>([
        {
            id: 'PD-2024-0616',
            title: 'Data Privacy & Protection',
            status: 'Approved',
            reviewer: 'Raffa',
            date: '20 Mei 2024 15:20',
            note: 'Sudah sesuai dan siap dipublikasikan.'
        },
        {
            id: 'PD-2024-0615',
            title: 'K3 Dasar di Tempat Kerja',
            status: 'Minta Revisi',
            reviewer: 'Raffa',
            date: '19 Mei 2024 11:05',
            note: 'Lengkapi materi praktik dan evaluasi.'
        },
        {
            id: 'PD-2024-0614',
            title: 'Advanced Excel Macros',
            status: 'Rejected',
            reviewer: 'Raffa',
            date: '18 Mei 2024 09:42',
            note: 'Tidak sesuai kebutuhan saat ini.'
        }
    ]);

    // Toast notification
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Compute metric card counts
    const metrics = useMemo(() => {
        const waiting = queue.filter(q => q.status === 'Menunggu Approval').length;
        const approvedToday = history.filter(h => h.status === 'Approved').length + 5; // offset mock
        const revisions = history.filter(h => h.status === 'Minta Revisi').length + 4; // offset mock
        const rejected = history.filter(h => h.status === 'Rejected').length + 1; // offset mock
        return { waiting, approvedToday, revisions, rejected };
    }, [queue, history]);

    // Filter queue list
    const filteredQueue = useMemo(() => {
        return queue.filter((item) => {
            // Search match
            const matchesSearch = 
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.id.toLowerCase().includes(searchQuery.toLowerCase());
            
            // Tab match
            const matchesTab = 
                activeTab === 'Semua' || 
                (activeTab === 'Modul Baru' && item.type === 'Modul Baru') ||
                (activeTab === 'Revisi Modul' && item.type === 'Revisi Modul') ||
                (activeTab === 'Kebutuhan Khusus' && item.type === 'Kebutuhan Khusus');

            // Select matches
            const matchesType = typeFilter === 'Semua Jenis' || item.type === typeFilter;
            const matchesUnit = unitFilter === 'Semua Unit' || item.unit === unitFilter;
            const matchesPriority = priorityFilter === 'Semua Priority' || item.priority === priorityFilter;
            const matchesStatus = statusFilter === 'Semua Status' || item.status === statusFilter;

            return matchesSearch && matchesTab && matchesType && matchesUnit && matchesPriority && matchesStatus;
        });
    }, [queue, searchQuery, activeTab, typeFilter, unitFilter, priorityFilter, statusFilter]);

    // Find the currently active selected item in the queue
    const selectedItem = useMemo(() => {
        return queue.find(q => q.id === selectedItemId) || queue[0] || null;
    }, [queue, selectedItemId]);

    // Handle row selection
    const handleSelectRow = (id: string) => {
        setSelectedItemId(id);
        const item = queue.find(q => q.id === id);
        if (item) {
            setCommentText(''); // Clear comment box on switch or keep custom text
        }
    };

    // Handle resetting filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setTypeFilter('Semua Jenis');
        setUnitFilter('Semua Unit');
        setPriorityFilter('Semua Priority');
        setStatusFilter('Semua Status');
        setActiveTab('Semua');
    };

    // Handle making a decision (Approve / Reject / Minta Revisi)
    const handleMakeDecision = (decisionType: 'Approved' | 'Minta Revisi' | 'Rejected') => {
        if (!selectedItem) return;

        // Remove item from queue list
        setQueue(prev => prev.filter(item => item.id !== selectedItem.id));

        // Add to history log
        const newHistoryItem: DecisionHistoryItem = {
            id: selectedItem.id,
            title: selectedItem.title,
            status: decisionType,
            reviewer: user?.name?.split(' ')[0] || 'Raffa',
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            note: commentText || (decisionType === 'Approved' ? 'Modul disetujui.' : decisionType === 'Rejected' ? 'Modul ditolak.' : 'Revisi diminta.')
        };
        setHistory(prev => [newHistoryItem, ...prev]);

        // Feedback toast
        setToastMessage(`Modul ${selectedItem.id} berhasil diproses dengan keputusan: ${decisionType}`);
        setTimeout(() => setToastMessage(null), 4000);

        // Reset comment box and select another item if possible
        setCommentText('');
        const remaining = queue.filter(item => item.id !== selectedItem.id);
        if (remaining.length > 0) {
            setSelectedItemId(remaining[0].id);
        } else {
            setSelectedItemId('');
        }
    };

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
                        Anda masuk sebagai <span className="font-semibold text-neutral-800 dark:text-neutral-200 capitalize">({role})</span>. Hanya akun dengan wewenang Admin dan Manager PD yang dapat mengakses modul approval ini.
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
            <Head title="Approval Modul" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                        Approval Modul
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Review, approve, reject, atau minta revisi untuk modul dan perubahan yang diajukan.
                    </p>
                </div>

                {/* Toast Notification */}
                {toastMessage && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400 shadow-sm animate-in fade-in duration-300">
                        <Check className="size-4.5" />
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* Metrics Indicator Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {/* Menunggu Approval */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <Clock className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Menunggu Approval</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{metrics.waiting}</span>
                                <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 mt-0.5">Menunggu tindakan Anda</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Approved Hari Ini */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <CheckCircle2 className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Approved Hari Ini</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{metrics.approvedToday}</span>
                                <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 mt-0.5">Disetujui hari ini</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Revisi Diminta */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                                <RotateCw className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Revisi Diminta</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{metrics.revisions}</span>
                                <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 mt-0.5">Perlu perbaikan</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ditolak */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                                <XCircle className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Ditolak</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{metrics.rejected}</span>
                                <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 mt-0.5">Ditolak hari ini</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sub-menu Tabs Selection */}
                <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-800 text-sm">
                    {(['Semua', 'Modul Baru', 'Revisi Modul', 'Kebutuhan Khusus'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 font-medium transition-colors relative ${
                                activeTab === tab
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100'
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 animate-in fade-in duration-300" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Split Column Queue List & Details Panel */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    
                    {/* Left Column (2/3 width) - Antrian Approval Table */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm overflow-hidden">
                            
                            {/* Filter panel */}
                            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/10 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                                
                                {/* Search input */}
                                <div className="relative flex-1 max-w-xs">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari judul, pengaju, unit, atau kode..."
                                        className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                    />
                                </div>

                                {/* Select filter group */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Jenis">Semua Jenis</option>
                                        <option value="Modul Baru">Modul Baru</option>
                                        <option value="Revisi Modul">Revisi Modul</option>
                                        <option value="Kebutuhan Khusus">Kebutuhan Khusus</option>
                                    </select>

                                    <select
                                        value={unitFilter}
                                        onChange={(e) => setUnitFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Unit">Semua Unit</option>
                                        <option value="IT & Digital">IT & Digital</option>
                                        <option value="Pengembangan SDM">Pengembangan SDM</option>
                                        <option value="Operasional">Operasional</option>
                                        <option value="Keuangan">Keuangan</option>
                                    </select>

                                    <select
                                        value={priorityFilter}
                                        onChange={(e) => setPriorityFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Priority">Semua Priority</option>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>

                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Status">Semua Status</option>
                                        <option value="Menunggu Approval">Menunggu Approval</option>
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
                                        size="sm"
                                        className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Play className="size-3.5 fill-current" />
                                        <span>Buka Antrian Approval</span>
                                    </Button>
                                </div>

                            </div>

                            {/* Queue Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px] text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                            <th className="px-5 py-3.5 w-12 text-center">Radio</th>
                                            <th className="px-4 py-3.5">No Pengajuan</th>
                                            <th className="px-4 py-3.5">Judul Modul</th>
                                            <th className="px-4 py-3.5">Jenis</th>
                                            <th className="px-4 py-3.5">Pengaju</th>
                                            <th className="px-4 py-3.5">Unit</th>
                                            <th className="px-4 py-3.5">Priority</th>
                                            <th className="px-4 py-3.5">Submitted At</th>
                                            <th className="px-4 py-3.5">Status</th>
                                            <th className="px-4 py-3.5 text-center w-16">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {filteredQueue.length === 0 ? (
                                            <tr>
                                                <td colSpan={10} className="text-center py-10 text-neutral-400 font-medium dark:text-neutral-500">
                                                    Tidak ada data antrian yang cocok dengan filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredQueue.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    onClick={() => handleSelectRow(item.id)}
                                                    className={`cursor-pointer transition-colors ${
                                                        selectedItemId === item.id
                                                            ? 'bg-blue-50/30 hover:bg-blue-50/40 dark:bg-blue-950/10 dark:hover:bg-blue-950/15'
                                                            : 'hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10'
                                                    }`}
                                                >
                                                    <td className="px-5 py-4 text-center">
                                                        <div className={`mx-auto size-3.5 rounded-full border flex items-center justify-center ${
                                                            selectedItemId === item.id
                                                                ? 'border-blue-600 dark:border-blue-400'
                                                                : 'border-neutral-300 dark:border-neutral-700'
                                                        }`}>
                                                            {selectedItemId === item.id && (
                                                                <span className="size-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 font-semibold text-blue-600 dark:text-blue-400 text-xs">
                                                        {item.id}
                                                    </td>
                                                    <td className="px-4 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                                                        {item.title}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Badge
                                                            variant="secondary"
                                                            className={`font-semibold rounded-md border-0 px-2.5 py-0.5 text-[9px] ${
                                                                item.type === 'Modul Baru'
                                                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                                                                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300'
                                                            }`}
                                                        >
                                                            {item.type}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-4 font-medium text-neutral-700 dark:text-neutral-300">
                                                        {item.applicant}
                                                    </td>
                                                    <td className="px-4 py-4 text-neutral-500 dark:text-neutral-400 font-medium">
                                                        {item.unit}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Badge
                                                            variant="outline"
                                                            className={`font-bold rounded-md px-2 py-0.5 text-[9px] ${
                                                                item.priority === 'High'
                                                                    ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
                                                                    : item.priority === 'Medium'
                                                                    ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                                                                    : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30'
                                                            }`}
                                                        >
                                                            {item.priority}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-4 text-neutral-400 dark:text-neutral-500 font-medium">
                                                        {item.submittedAt}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Badge className="font-semibold rounded-md border-0 px-2 py-0.5 text-[9px] bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                                                            {item.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <button className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400 mx-auto">
                                                            <Eye className="size-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Table pagination footer */}
                            <div className="p-4 border-t border-neutral-100 bg-neutral-50/20 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-neutral-500 dark:text-neutral-400">
                                <span className="font-medium">
                                    Menampilkan 1-{filteredQueue.length} dari {queue.length} pengajuan
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
                                        <button className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"><ChevronRight className="size-3.5" /></button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                    </div>

                    {/* Right Column (1/3 width) - Preview & Keputusan Panel */}
                    <div className="lg:col-span-1">
                        
                        <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm flex flex-col h-full justify-between">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/10">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Preview & Keputusan</h3>
                            </div>
                            
                            {selectedItem ? (
                                <div className="p-5 flex-1 flex flex-col gap-5 text-xs">
                                    {/* Sub-header specs */}
                                    <div className="space-y-2 border-b pb-4 dark:border-neutral-800">
                                        <div className="flex justify-between py-1">
                                            <span className="font-semibold text-neutral-400">No Pengajuan</span>
                                            <span className="font-bold text-neutral-800 dark:text-neutral-200">{selectedItem.id}</span>
                                        </div>
                                        <div className="flex justify-between py-1 items-start gap-4">
                                            <span className="font-semibold text-neutral-400 flex-shrink-0">Judul Modul</span>
                                            <span className="font-bold text-neutral-800 text-right dark:text-neutral-200">{selectedItem.title}</span>
                                        </div>
                                        <div className="flex justify-between py-1">
                                            <span className="font-semibold text-neutral-400">Jenis</span>
                                            <Badge variant="secondary" className="font-semibold rounded-md border-0 px-2 py-0.5 text-[9px] bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                                                {selectedItem.type}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between py-1">
                                            <span className="font-semibold text-neutral-400">Pengaju</span>
                                            <span className="font-semibold text-neutral-700 dark:text-neutral-300">{selectedItem.applicant}</span>
                                        </div>
                                        <div className="flex justify-between py-1">
                                            <span className="font-semibold text-neutral-400">Unit</span>
                                            <span className="font-semibold text-neutral-700 dark:text-neutral-300">{selectedItem.unit}</span>
                                        </div>
                                        <div className="flex justify-between py-1">
                                            <span className="font-semibold text-neutral-400">Submitted At</span>
                                            <span className="font-semibold text-neutral-700 dark:text-neutral-300">{selectedItem.submittedAt}</span>
                                        </div>
                                        <div className="flex justify-between py-1 items-center">
                                            <span className="font-semibold text-neutral-400">Priority</span>
                                            <Badge className={`font-bold rounded-md px-2 py-0.5 text-[9px] ${
                                                selectedItem.priority === 'High'
                                                    ? 'bg-red-50 text-red-600 border border-red-200'
                                                    : selectedItem.priority === 'Medium'
                                                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                                    : 'bg-green-50 text-green-600 border border-green-200'
                                            }`}>
                                                {selectedItem.priority}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Ringkasan Perubahan */}
                                    <div className="space-y-1.5">
                                        <h4 className="font-bold text-neutral-500 dark:text-neutral-400">Ringkasan Perubahan</h4>
                                        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed bg-neutral-50/40 p-3 rounded-lg border border-neutral-100/50 dark:bg-neutral-900/40 dark:border-neutral-800/50">
                                            {selectedItem.summary}
                                        </p>
                                    </div>

                                    {/* File Modul PDF */}
                                    <div className="space-y-1.5">
                                        <h4 className="font-bold text-neutral-500 dark:text-neutral-400">File Modul (PDF)</h4>
                                        <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950/20 shadow-sm">
                                            <div className="flex size-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                                                <FileText className="size-5" />
                                            </div>
                                            <div className="flex-1 flex flex-col min-w-0">
                                                <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">{selectedItem.pdfName}</span>
                                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">{selectedItem.pdfSize} • {selectedItem.pdfPages} halaman</span>
                                            </div>
                                            <Button size="sm" variant="outline" className="h-8 px-2.5 rounded-lg text-neutral-600 font-semibold border-neutral-200 dark:border-neutral-800 text-[10px] flex items-center gap-1">
                                                <span>Lihat / Unduh</span>
                                                <Download className="size-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Catatan Reviewer textarea */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <h4 className="font-bold text-neutral-500 dark:text-neutral-400">Catatan Reviewer</h4>
                                            <span className="text-neutral-400 dark:text-neutral-500 text-[10px]">{commentText.length} / 500</span>
                                        </div>
                                        <textarea
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value.slice(0, 500))}
                                            placeholder="Tulis saran revisi atau alasan jika menolak pengajuan..."
                                            className="w-full h-20 rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                                        />
                                    </div>

                                    {/* Keputusan Actions */}
                                    <div className="pt-2 flex gap-2">
                                        <Button
                                            onClick={() => handleMakeDecision('Approved')}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                                        >
                                            <Check className="size-3.5 stroke-[3px]" />
                                            <span>Approve</span>
                                        </Button>

                                        <Button
                                            onClick={() => handleMakeDecision('Rejected')}
                                            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg h-9 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                                        >
                                            <X className="size-3.5 stroke-[3px]" />
                                            <span>Reject</span>
                                        </Button>

                                        <Button
                                            onClick={() => handleMakeDecision('Minta Revisi')}
                                            className="flex-1 bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 dark:bg-orange-950/20 dark:border-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-950/40 rounded-lg h-9 text-xs font-semibold flex items-center justify-center gap-1.5"
                                        >
                                            <RotateCw className="size-3.5" />
                                            <span>Minta Revisi</span>
                                        </Button>
                                    </div>

                                </div>
                            ) : (
                                <div className="p-8 flex flex-col items-center justify-center text-center text-neutral-400 gap-2 flex-1">
                                    <CheckCircle2 className="size-10 text-emerald-500" />
                                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">Antrian Kosong</span>
                                    <span className="text-[10px] text-neutral-400">Semua pengajuan telah diproses secara tuntas.</span>
                                </div>
                            )}

                        </Card>

                    </div>

                </div>

                {/* Bottom Row - Past Decisions History & SLA Approval */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    
                    {/* Left Bottom Section (2/3 width) - Riwayat Keputusan */}
                    <div className="lg:col-span-2">
                        
                        <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm flex flex-col justify-between">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Riwayat Keputusan</h3>
                            </div>
                            <CardContent className="p-5 space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-neutral-100 text-neutral-400 font-semibold dark:border-neutral-800">
                                                <th className="pb-2">No Pengajuan</th>
                                                <th className="pb-2">Judul Modul</th>
                                                <th className="pb-2">Keputusan</th>
                                                <th className="pb-2">Reviewer</th>
                                                <th className="pb-2">Tanggal</th>
                                                <th className="pb-2">Catatan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
                                            {history.map((hist) => (
                                                <tr key={hist.id} className="hover:bg-neutral-50/10 transition-colors">
                                                    <td className="py-3 font-semibold text-blue-600 dark:text-blue-400">{hist.id}</td>
                                                    <td className="py-3 font-medium text-neutral-950 dark:text-neutral-50">{hist.title}</td>
                                                    <td className="py-3">
                                                        <Badge
                                                            className={`font-semibold rounded-md border-0 px-2 py-0.5 text-[9px] ${
                                                                hist.status === 'Approved'
                                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                    : hist.status === 'Minta Revisi'
                                                                    ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300'
                                                                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                                                            }`}
                                                        >
                                                            {hist.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 text-neutral-600 dark:text-neutral-400 font-medium">{hist.reviewer}</td>
                                                    <td className="py-3 text-neutral-400 dark:text-neutral-500">{hist.date}</td>
                                                    <td className="py-3 text-neutral-500 dark:text-neutral-400 max-w-[200px] truncate" title={hist.note}>
                                                        {hist.note}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="pt-2 border-t text-center">
                                    <button className="text-blue-600 hover:text-blue-700 text-xs font-semibold dark:text-blue-400 dark:hover:text-blue-300">
                                        Lihat Semua Riwayat
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right Bottom Section (1/3 width) - SLA Approval Box */}
                    <div className="lg:col-span-1">
                        
                        <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm flex flex-col justify-between">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">SLA Approval</h3>
                            </div>
                            <CardContent className="p-5 space-y-4">
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    {/* Turnaround Time */}
                                    <div className="p-3 border rounded-xl bg-neutral-50/20 dark:border-neutral-800 flex flex-col gap-1.5 items-center justify-center">
                                        <Clock className="size-4.5 text-blue-600 dark:text-blue-400" />
                                        <div className="flex flex-col">
                                            <span className="text-neutral-400 text-[8px] font-bold uppercase tracking-wider">Turnaround</span>
                                            <span className="font-extrabold text-neutral-900 dark:text-neutral-100 text-base mt-0.5">1.6 hari</span>
                                            <span className="text-[8px] text-neutral-400 mt-0.5">Target &le; 3 hari</span>
                                        </div>
                                    </div>

                                    {/* Overdue Items */}
                                    <div className="p-3 border rounded-xl bg-neutral-50/20 dark:border-neutral-800 flex flex-col gap-1.5 items-center justify-center">
                                        <AlertTriangle className="size-4.5 text-rose-500" />
                                        <div className="flex flex-col">
                                            <span className="text-neutral-400 text-[8px] font-bold uppercase tracking-wider">Overdue</span>
                                            <span className="font-extrabold text-neutral-900 dark:text-neutral-100 text-base mt-0.5">3</span>
                                            <span className="text-[8px] text-rose-500 font-semibold mt-0.5">Perlu perhatian</span>
                                        </div>
                                    </div>

                                    {/* Completion Rate */}
                                    <div className="p-3 border rounded-xl bg-neutral-50/20 dark:border-neutral-800 flex flex-col gap-1.5 items-center justify-center">
                                        <TrendingUp className="size-4.5 text-emerald-500" />
                                        <div className="flex flex-col">
                                            <span className="text-neutral-400 text-[8px] font-bold uppercase tracking-wider">Completion</span>
                                            <span className="font-extrabold text-neutral-900 dark:text-neutral-100 text-base mt-0.5">94.2%</span>
                                            <span className="text-[8px] text-emerald-500 font-semibold mt-0.5">Bulan ini</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t text-center">
                                    <button className="text-blue-600 hover:text-blue-700 text-xs font-semibold dark:text-blue-400 dark:hover:text-blue-300">
                                        Lihat Detail SLA
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                </div>

            </div>

        </AppLayout>
    );
}
