import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    RefreshCw,
    Eye,
    FileText,
    Download,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Check,
    X,
    FileCheck2,
    History,
    ListChecks,
    Paperclip,
    ExternalLink,
    Calendar,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Link } from '@inertiajs/react';
import React, { useState, useMemo, useEffect } from 'react';
import { SearchableSelect } from '@/components/ui/searchable-select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Approval Modul',
        href: '/approval',
    },
];

interface ModulRow {
    id: string;
    jenisModulPelatihan: string;
    kodeModul: string;
    namaModul: string;
    sebelumPerubahan: string;
    setelahPerubahan: string;
    alasanPerubahan: string;
    kodeRevisi: string;
    tanggalBerlaku: string;
    linkModul: string;
}

interface ProgramRow {
    id: string;
    kodeProgram: string;
    namaProgram: string;
    sebelumPerubahan: string;
    setelahPerubahan: string;
    alasanPerubahan: string;
    kodeRevisi: string;
    tanggalBerlaku: string;
    linkProgram: string;
}

interface ApprovalItem {
    id: string;
    dbId: number;
    title: string;
    type: string;
    applicant: string;
    unit: string;
    priority: string;
    submittedAt: string;
    deadline: string;
    status: string;
    description: string;
    rejectReason?: string | null;
    processedBy?: string | null;
    processedAt?: string | null;
    fileName?: string | null;
    fileSize?: string | null;
    fileMime?: string | null;
    fileUrl?: string | null;
    program?: string | null;
    language?: string | null;
    training_days?: number | string | null;
    revision_reason?: string | null;
    related_module_id?: number | string | null;
    relatedModuleCode?: string | null;
    relatedModuleTitle?: string | null;
    relatedModuleRevision?: string | null;
    link_modul?: string | null;
    tanggal_realisasi?: string | null;
    tanggal_realisasi_formatted?: string | null;
    jenisKebutuhanPelatihan?: string;
    keteranganKebutuhan?: string;
    jenisModul?: string[];
    modulRows?: ModulRow[];
    programRows?: ProgramRow[];
    jenis_kebutuhan?: string | null;
    nama_instansi?: string | null;
    judul_program?: string | null;
    jam_khusus?: string | null;
    pre_post_test?: string | null;
}

interface ApprovalStats {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
}

interface ApprovalProps extends SharedData {
    queue: ApprovalItem[];
    history: ApprovalItem[];
    stats: ApprovalStats;
    isDriveConnected?: boolean;
    flash?: { message?: string; error?: string };
}

const PRIORITY_COLORS: Record<string, string> = {
    High: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300',
    Medium: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
    Low: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
};

const TYPE_COLORS: Record<string, string> = {
    'Modul Baru': 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
    'Revisi Modul': 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300',
    'Program Baru': 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
    'Revisi Program': 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300',
    'Kebutuhan Khusus': 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300',
};

export default function Approval() {
    const { auth, queue, history, stats, flash, isDriveConnected = true } = usePage<ApprovalProps>().props;
    const user = auth?.user;
    const role = user?.role || 'User';
    const roleLower = (user?.role || '').toLowerCase();
    const hasAccess = roleLower === 'admin' || roleLower === 'manager pd';

    const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('Semua Tipe');
    const [priorityFilter, setPriorityFilter] = useState('Semua Prioritas');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Detail + action state
    const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
    const [rejectItem, setRejectItem] = useState<ApprovalItem | null>(null);
    const [processKhususItem, setProcessKhususItem] = useState<ApprovalItem | null>(null);

    // Reject form
    const rejectForm = useForm({ reject_reason: '' });

    // Process form for Kebutuhan Khusus approval
    const processForm = useForm({
        status: 'Selesai',
        link_modul: '',
        tanggal_realisasi: '',
        reject_reason: '', // keterangan
        tanggal_kebutuhan_baru: '',
    });

    // Toast state and auto-close handler
    const [localToast, setLocalToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
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

    const activeList = activeTab === 'queue' ? queue : history;

    const filteredItems = useMemo(() => {
        return activeList.filter((item) => {
            const matchSearch =
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.applicant.toLowerCase().includes(searchQuery.toLowerCase());
            const matchType = typeFilter === 'Semua Tipe' || item.type === typeFilter;
            const matchPriority = priorityFilter === 'Semua Prioritas' || item.priority === priorityFilter;
            return matchSearch && matchType && matchPriority;
        });
    }, [activeList, searchQuery, typeFilter, priorityFilter]);

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    const handleReset = () => {
        setSearchQuery('');
        setTypeFilter('Semua Tipe');
        setPriorityFilter('Semua Prioritas');
        setCurrentPage(1);
    };

    const handleApprove = (item: ApprovalItem) => {
        router.post(route('approval.approve', item.dbId), {}, {
            onSuccess: () => setSelectedItem(null),
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectItem) return;
        rejectForm.post(route('approval.reject', rejectItem.dbId), {
            onSuccess: () => {
                setRejectItem(null);
                setSelectedItem(null);
            },
        });
    };

    const handleProcessSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!processKhususItem) return;

        processForm.clearErrors();
        let hasError = false;
        if (processForm.data.status === 'Selesai') {
            if (!processForm.data.link_modul) {
                processForm.setError('link_modul', 'Link Modul wajib diisi jika status Selesai.');
                hasError = true;
            }
            if (!processForm.data.tanggal_realisasi) {
                processForm.setError('tanggal_realisasi', 'Tanggal Realisasi wajib diisi jika status Selesai.');
                hasError = true;
            }
            if (!processForm.data.reject_reason) {
                processForm.setError('reject_reason', 'Keterangan wajib diisi.');
                hasError = true;
            }
        } else if (processForm.data.status === 'Hold') {
            if (!processForm.data.tanggal_kebutuhan_baru) {
                processForm.setError('tanggal_kebutuhan_baru', 'Tanggal Kebutuhan Baru wajib diisi jika status Hold.');
                hasError = true;
            }
            if (!processForm.data.reject_reason) {
                processForm.setError('reject_reason', 'Keterangan wajib diisi.');
                hasError = true;
            }
        } else if (processForm.data.status === 'Batal') {
            if (!processForm.data.reject_reason) {
                processForm.setError('reject_reason', 'Keterangan wajib diisi.');
                hasError = true;
            }
        }
        if (hasError) return;

        processForm.post(route('approval.approve', processKhususItem.dbId), {
            onSuccess: () => {
                setProcessKhususItem(null);
            },
        });
    };

    // Access denied view
    if (!hasAccess) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Akses Ditolak" />
                <div className="flex h-[80vh] flex-col items-center justify-center p-6 text-center">
                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                        <AlertTriangle className="size-8" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Akses Halaman Ditolak</h1>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                        Hanya <span className="font-semibold">Admin</span> dan <span className="font-semibold">Manager PD</span> yang dapat mengakses halaman Approval.
                    </p>
                    <Button asChild className="mt-6 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700">
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

            <div className="flex h-full flex-1 flex-col gap-6 bg-neutral-50/60 p-6 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Approval Modul</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Tinjau, setujui, atau tolak pengajuan modul pelatihan.
                    </p>
                </div>

                {/* Floating success/error toast */}
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

                {!isDriveConnected && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-amber-800 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/10 dark:text-amber-400">
                        <AlertTriangle className="size-5 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
                        <div className="text-xs font-semibold leading-normal font-sans">
                            <strong>Integrasi Google Drive belum terhubung:</strong> Pengajuan tipe <strong>Modul Baru</strong> dan <strong>Revisi Modul</strong> tidak akan dapat disetujui (Approve) sampai akun Google Drive ditautkan. Hubungkan akun terlebih dahulu di halaman <a href="/admin/drive-integration" className="underline font-bold hover:text-amber-900 dark:hover:text-amber-200">Integrasi Drive</a>.
                        </div>
                    </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Total Pengajuan', value: stats.total, icon: FileText, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' },
                        { label: 'Menunggu Approval', value: stats.pending, icon: Clock, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' },
                        { label: 'Disetujui', value: stats.approved, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' },
                        { label: 'Ditolak', value: stats.rejected, icon: XCircle, color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400' },
                    ].map((m) => (
                        <Card key={m.label} className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className={`flex aspect-square size-12 flex-shrink-0 items-center justify-center rounded-2xl ${m.color}`}>
                                    <m.icon className="size-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">{m.label}</p>
                                    <p className="mt-0.5 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{m.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tabs + Table */}
                <Card className="overflow-hidden border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                    {/* Tab Bar */}
                    <div className="flex items-center gap-1 border-b border-neutral-100 px-4 pt-3 dark:border-neutral-800">
                        <button
                            onClick={() => { setActiveTab('queue'); setCurrentPage(1); }}
                            className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-xs font-semibold transition-colors ${activeTab === 'queue' ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'}`}
                        >
                            <ListChecks className="size-3.5" />
                            Antrian Approval
                            {stats.pending > 0 && (
                                <span className="ml-0.5 flex size-4.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                                    {stats.pending}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => { setActiveTab('history'); setCurrentPage(1); }}
                            className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-xs font-semibold transition-colors ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'}`}
                        >
                            <History className="size-3.5" />
                            Riwayat Keputusan
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 dark:border-neutral-800 md:flex-row md:items-center md:justify-between">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder="Cari judul, ID, pengaju..."
                                className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 text-xs outline-none placeholder:text-neutral-400 focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                             <div className="w-44">
                                 <SearchableSelect
                                     value={typeFilter}
                                     onChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}
                                     options={[
                                         "Semua Tipe",
                                         "Modul Baru",
                                         "Revisi Modul",
                                         "Program Baru",
                                         "Revisi Program",
                                         "Kebutuhan Khusus"
                                     ]}
                                 />
                             </div>
                             <div className="w-40">
                                 <SearchableSelect
                                     value={priorityFilter}
                                     onChange={(val) => { setPriorityFilter(val); setCurrentPage(1); }}
                                     options={[
                                         "Semua Prioritas",
                                         "High",
                                         "Medium",
                                         "Low"
                                     ]}
                                 />
                             </div>
                            <Button onClick={handleReset} variant="outline" size="sm" className="h-9 rounded-lg border-neutral-200 px-3 text-xs font-semibold dark:border-neutral-800">
                                <RefreshCw className="mr-1.5 size-3.5" /> Reset
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                    <th className="px-5 py-3.5">ID</th>
                                    <th className="px-5 py-3.5">Judul</th>
                                    <th className="px-5 py-3.5">Tipe</th>
                                    <th className="px-5 py-3.5">Pengaju</th>
                                    <th className="px-5 py-3.5">Prioritas</th>
                                    <th className="px-5 py-3.5">Dokumen</th>
                                    <th className="px-5 py-3.5">Waktu Submit</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="w-28 px-5 py-3.5 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-12 text-center font-medium text-neutral-400 dark:text-neutral-500">
                                            {activeTab === 'queue' ? 'Tidak ada pengajuan yang menunggu approval.' : 'Belum ada riwayat keputusan.'}
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((item) => (
                                        <tr key={item.id} className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20">
                                            <td className="whitespace-nowrap px-5 py-4 font-mono text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                                                {item.id}
                                            </td>
                                            <td className="max-w-[180px] px-5 py-4">
                                                <button
                                                    onClick={() => setSelectedItem(item)}
                                                    className="line-clamp-2 text-left font-semibold leading-tight text-neutral-900 hover:text-blue-600 dark:text-neutral-100 dark:hover:text-blue-400"
                                                >
                                                    {item.title}
                                                </button>
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${TYPE_COLORS[item.type] ?? ''}`}>
                                                    {item.type}
                                                </Badge>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 font-medium text-neutral-600 dark:text-neutral-400">
                                                <div>
                                                    <p>{item.applicant}</p>
                                                    <p className="text-[10px] text-neutral-400">{item.unit}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[item.priority] ?? ''}`}>
                                                    {item.priority}
                                                </Badge>
                                            </td>
                                            {/* Dokumen column */}
                                            <td className="px-5 py-4">
                                                {item.type === 'Kebutuhan Khusus' ? (
                                                    item.link_modul ? (
                                                        <div className="flex items-center gap-1.5 font-sans">
                                                            <div className="flex size-6 items-center justify-center rounded bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400">
                                                                <Paperclip className="size-3.5" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="max-w-[80px] truncate text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">Link Modul</p>
                                                                {item.tanggal_realisasi_formatted && (
                                                                    <p className="text-[9px] text-neutral-450 dark:text-neutral-555">{item.tanggal_realisasi_formatted}</p>
                                                                )}
                                                            </div>
                                                            <a
                                                                href={item.link_modul}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex size-5 items-center justify-center rounded text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950/30"
                                                                title="Buka Link Modul"
                                                            >
                                                                <ExternalLink className="size-3" />
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] italic text-neutral-350 dark:text-neutral-600">Belum ada link</span>
                                                    )
                                                ) : item.fileName ? (
                                                    <div className="flex items-center gap-1.5 font-sans">
                                                        <div className="flex size-6 items-center justify-center rounded bg-red-50 text-red-500 dark:bg-red-950/30">
                                                            <FileText className="size-3.5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="max-w-[80px] truncate text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">{item.fileName}</p>
                                                            {item.fileSize && <p className="text-[9px] text-neutral-400">{item.fileSize}</p>}
                                                        </div>
                                                        {item.fileUrl && (
                                                            <a
                                                                href={item.fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex size-5 items-center justify-center rounded text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                                                title="Lihat PDF"
                                                            >
                                                                <Eye className="size-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] italic text-neutral-300 dark:text-neutral-600">Tidak ada file</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 font-medium text-neutral-500 dark:text-neutral-400">
                                                {item.submittedAt}
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${
                                                    item.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                    : (item.status === 'Ditolak' || item.status === 'Batal') ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                                    : item.status === 'Menunggu Approval' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                                }`}>
                                                    {item.status}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedItem(item)}
                                                        className="flex size-7 items-center justify-center rounded text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye className="size-3.5" />
                                                    </button>
                                                    {item.status === 'Menunggu Approval' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(item)}
                                                                className="flex size-7 items-center justify-center rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                                                                title="Approve"
                                                            >
                                                                <Check className="size-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => { rejectForm.reset(); setRejectItem(item); }}
                                                                className="flex size-7 items-center justify-center rounded bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50"
                                                                title="Reject"
                                                            >
                                                                <X className="size-3.5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col gap-3 border-t border-neutral-100 p-4 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            Menampilkan {indexOfFirst + 1}–{Math.min(indexOfLast, filteredItems.length)} dari {filteredItems.length} data
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-xs font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                <ChevronLeft className="size-3.5" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button key={page} onClick={() => setCurrentPage(page)} className={`flex size-7 items-center justify-center rounded border text-xs font-semibold ${page === currentPage ? 'border-blue-600 bg-blue-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400'}`}>
                                    {page}
                                </button>
                            ))}
                            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-xs font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                <ChevronRight className="size-3.5" />
                            </button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* ── DETAIL DIALOG ── */}
            <Dialog open={!!selectedItem} onOpenChange={(open) => { if (!open) setSelectedItem(null); }}>
                <DialogContent className={selectedItem && ['Modul Baru', 'Revisi Modul', 'Program Baru', 'Revisi Program'].includes(selectedItem.type) ? "max-w-6xl w-[95vw] max-h-[92vh] overflow-y-auto" : "max-w-lg"}>
                    <DialogHeader>
                        <DialogTitle className="pr-6">{selectedItem?.title}</DialogTitle>
                        <DialogDescription className="font-mono text-[11px]">{selectedItem?.id}</DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="mt-2 space-y-4 text-sm max-h-[65vh] overflow-y-auto pr-1">
                            {/* Informasi Umum Container */}
                            <div className="grid grid-cols-2 gap-3 p-3.5 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                                <div className="col-span-2 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Informasi Umum</div>
                                <div>
                                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Nama Pengaju</p>
                                    <p className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">{selectedItem.applicant}</p>
                                </div>
                                <div>
                                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Tanggal Pengajuan</p>
                                    <p className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">{selectedItem.submittedAt}</p>
                                </div>
                                <div>
                                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Tipe Modul</p>
                                    <Badge className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${TYPE_COLORS[selectedItem.type] ?? ''}`}>{selectedItem.type}</Badge>
                                </div>
                                <div>
                                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Prioritas</p>
                                    <Badge className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[selectedItem.priority] ?? ''}`}>{selectedItem.priority}</Badge>
                                </div>
                            </div>

                            {/* ── CONDITIONAL SECTION: MODUL BARU ── */}
                            {selectedItem.type === 'Modul Baru' && !((selectedItem.modulRows && selectedItem.modulRows.length > 0) || (selectedItem.programRows && selectedItem.programRows.length > 0)) && (
                                <div className="space-y-3 p-3.5 border border-blue-100 dark:border-blue-900/40 rounded-xl bg-blue-50/20 dark:bg-blue-950/5">
                                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Detail Modul Baru</div>
                                    
                                    <div>
                                        <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Kategori / Jenis Pelatihan</p>
                                        <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{selectedItem.program ?? '-'}</p>
                                    </div>

                                    <div>
                                        <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Judul Modul</p>
                                        <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{selectedItem.title}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Bahasa Pelatihan</p>
                                            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{selectedItem.language ?? 'Indonesia'}</p>
                                        </div>
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Jumlah Hari Pelatihan</p>
                                            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{selectedItem.training_days ? `${selectedItem.training_days} Hari` : '-'}</p>
                                        </div>
                                    </div>

                                    {selectedItem.description && (
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans font-semibold">Deskripsi / Permintaan Khusus</p>
                                            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">{selectedItem.description}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── CONDITIONAL SECTION: REVISI MODUL ── */}
                            {selectedItem.type === 'Revisi Modul' && !((selectedItem.modulRows && selectedItem.modulRows.length > 0) || (selectedItem.programRows && selectedItem.programRows.length > 0)) && (
                                <div className="space-y-3 p-3.5 border border-violet-100 dark:border-violet-900/40 rounded-xl bg-violet-50/20 dark:bg-violet-950/5">
                                    <div className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">Detail Modul Existing / Revisi</div>
                                    
                                    <div className="grid grid-cols-3 gap-2 bg-neutral-100/60 dark:bg-neutral-800/60 p-2.5 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50 text-[11px] text-neutral-600 dark:text-neutral-400">
                                        <div>
                                            <span className="font-bold block text-[9px] uppercase tracking-wider text-neutral-400">Kode Modul</span>
                                            <span>{selectedItem.relatedModuleCode ?? '-'}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="font-bold block text-[9px] uppercase tracking-wider text-neutral-400">Judul & Versi Aktif</span>
                                            <span className="line-clamp-1">{selectedItem.relatedModuleTitle ?? selectedItem.title} (Rev. {selectedItem.relatedModuleRevision ?? '1.0'})</span>
                                        </div>
                                    </div>

                                    {selectedItem.revision_reason && (
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Alasan Perubahan</p>
                                            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">{selectedItem.revision_reason}</p>
                                        </div>
                                    )}

                                    {selectedItem.description && (
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Detail Perubahan</p>
                                            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">{selectedItem.description}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── CONDITIONAL SECTION: KEBUTUHAN KHUSUS ── */}
                            {selectedItem.type === 'Kebutuhan Khusus' && (
                                <div className="space-y-3 p-3.5 border border-teal-100 dark:border-teal-900/40 rounded-xl bg-teal-50/10 dark:bg-teal-950/5">
                                    <div className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">Detail Kebutuhan Khusus</div>
                                    
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-500 dark:text-teal-400 font-sans">Jenis Kebutuhan</p>
                                            <p className="font-semibold text-neutral-800 dark:text-neutral-200">{selectedItem.jenis_kebutuhan ?? '-'}</p>
                                        </div>
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-500 dark:text-teal-400 font-sans">Bahasa Pengantar</p>
                                            <p className="font-semibold text-neutral-800 dark:text-neutral-200">{selectedItem.language ?? 'Indonesia'}</p>
                                        </div>
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-500 dark:text-teal-400 font-sans">Jam Khusus / Jumlah Jam</p>
                                            <p className="font-semibold text-neutral-800 dark:text-neutral-200">{selectedItem.jam_khusus ?? '-'}</p>
                                        </div>
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-500 dark:text-teal-400 font-sans">Pre & Post Test</p>
                                            <p className="font-semibold text-neutral-800 dark:text-neutral-200">{selectedItem.pre_post_test ?? 'Tidak'}</p>
                                        </div>
                                        {selectedItem.jenis_kebutuhan === 'Pelatihan Inhouse' && selectedItem.nama_instansi && (
                                            <div className="col-span-2">
                                                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-500 dark:text-teal-400 font-sans">Nama Instansi</p>
                                                <p className="font-semibold text-neutral-800 dark:text-neutral-200">{selectedItem.nama_instansi}</p>
                                            </div>
                                        )}
                                        <div className="col-span-2">
                                            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-500 dark:text-teal-400 font-sans">Judul Program / Modul</p>
                                            <p className="font-semibold text-neutral-800 dark:text-neutral-200">{selectedItem.title}</p>
                                        </div>
                                    </div>

                                    {selectedItem.description && (
                                        <div className="pt-2 border-t border-teal-100 dark:border-teal-900/20">
                                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-teal-500 dark:text-teal-400 font-sans font-semibold">Deskripsi / Detail Kebutuhan</p>
                                            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal whitespace-pre-line">{selectedItem.description}</p>
                                        </div>
                                    )}

                                    {selectedItem.rejectReason && (selectedItem.status === 'Menunggu Approval' || selectedItem.status === 'Selesai') && (
                                        <div className="pt-2 border-t border-teal-100 dark:border-teal-900/20 font-sans">
                                            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 font-semibold">Keterangan Proses / Catatan Staf PD</p>
                                            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">{selectedItem.rejectReason}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── ROW-BASED CHANGES DETAIL ── */}
                            {['Modul Baru', 'Revisi Modul', 'Program Baru', 'Revisi Program'].includes(selectedItem.type) && 
                             ((selectedItem.modulRows && selectedItem.modulRows.length > 0) || 
                              (selectedItem.programRows && selectedItem.programRows.length > 0)) && (
                                <div className="space-y-4 font-sans">
                                    <div className="grid grid-cols-2 gap-3.5 p-3.5 bg-blue-50/10 dark:bg-blue-950/5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                                        <div className="col-span-2 text-xs font-bold text-blue-600 dark:text-blue-450 uppercase tracking-wider mb-1">
                                            Detail Perubahan {selectedItem.type.includes('Program') ? 'Program' : 'Modul'}
                                        </div>
                                        
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Kategori</p>
                                            <p className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">{selectedItem.program || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Bahasa Pengantar</p>
                                            <p className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">{selectedItem.language || 'Indonesia'}</p>
                                        </div>
                                        {selectedItem.jenisModul && selectedItem.jenisModul.length > 0 && (
                                            <div className="col-span-2">
                                                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Jenis Modul</p>
                                                <p className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">{selectedItem.jenisModul.join(', ')}</p>
                                            </div>
                                        )}
                                        {selectedItem.jenisKebutuhanPelatihan && (
                                            <div className="col-span-2">
                                                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans font-semibold">Jenis Kebutuhan Modul Pelatihan</p>
                                                <p className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">{selectedItem.jenisKebutuhanPelatihan}</p>
                                            </div>
                                        )}
                                        {selectedItem.revision_reason && (
                                            <div className="col-span-2">
                                                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans font-semibold">Referensi No. Pengajuan Modul Khusus</p>
                                                <p className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">{selectedItem.revision_reason}</p>
                                            </div>
                                        )}
                                        {selectedItem.description && (
                                            <div className="col-span-2 pt-1">
                                                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans font-semibold">Detail Permintaan Modul Khusus</p>
                                                <p className="text-xs text-neutral-705 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap bg-white/50 dark:bg-neutral-900/30 p-2.5 rounded-lg border border-neutral-200/40 dark:border-neutral-800/40">{selectedItem.description}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Modul Rows Table */}
                                    {selectedItem.modulRows && selectedItem.modulRows.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Daftar Modul yang Diajukan</h4>
                                            <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                                                <table className="w-full text-[11px] min-w-[900px]">
                                                    <thead>
                                                        <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400">
                                                            {['Jenis Modul Pelatihan', 'Kode Modul', 'Nama Modul', 'Sebelum Perubahan', 'Setelah Perubahan', 'Alasan Perubahan', 'Kode Revisi', 'Tanggal Berlaku', 'Link Modul'].map(h => (
                                                                <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
                                                        {selectedItem.modulRows.map(row => (
                                                            <tr key={row.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20">
                                                                <td className="px-3 py-2.5 font-medium">{row.jenisModulPelatihan}</td>
                                                                <td className="px-3 py-2.5 font-semibold text-neutral-900 dark:text-neutral-100">{row.kodeModul || '-'}</td>
                                                                <td className="px-3 py-2.5">{row.namaModul || '-'}</td>
                                                                <td className="px-3 py-2.5 text-neutral-500 dark:text-neutral-400">{row.sebelumPerubahan || 'Tidak ada'}</td>
                                                                <td className="px-3 py-2.5 text-neutral-500 dark:text-neutral-400">{row.setelahPerubahan || 'Ada'}</td>
                                                                <td className="px-3 py-2.5">{row.alasanPerubahan || '-'}</td>
                                                                <td className="px-3 py-2.5 font-bold text-neutral-900 dark:text-neutral-100">{row.kodeRevisi || '00'}</td>
                                                                <td className="px-3 py-2.5">{row.tanggalBerlaku || '-'}</td>
                                                                <td className="px-3 py-2.5">
                                                                    {row.linkModul ? (
                                                                        <a
                                                                            href={row.linkModul}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                                                                        >
                                                                            <ExternalLink className="size-3" />
                                                                            Buka Link
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-neutral-400">-</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Program Rows Table */}
                                    {selectedItem.programRows && selectedItem.programRows.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Daftar Program yang Diajukan</h4>
                                            <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                                                <table className="w-full text-[11px] min-w-[800px]">
                                                    <thead>
                                                        <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400">
                                                            {['Kode Program', 'Nama Program', 'Sebelum Perubahan', 'Setelah Perubahan', 'Alasan Perubahan', 'Kode Revisi', 'Tanggal Berlaku', 'Link Program'].map(h => (
                                                                <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
                                                        {selectedItem.programRows.map(row => (
                                                            <tr key={row.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20">
                                                                <td className="px-3 py-2.5 font-semibold text-neutral-900 dark:text-neutral-100">{row.kodeProgram || '-'}</td>
                                                                <td className="px-3 py-2.5">{row.namaProgram || '-'}</td>
                                                                <td className="px-3 py-2.5 text-neutral-500 dark:text-neutral-400">{row.sebelumPerubahan || 'Tidak ada'}</td>
                                                                <td className="px-3 py-2.5 text-neutral-500 dark:text-neutral-400">{row.setelahPerubahan || 'Ada'}</td>
                                                                <td className="px-3 py-2.5">{row.alasanPerubahan || '-'}</td>
                                                                <td className="px-3 py-2.5 font-bold text-neutral-900 dark:text-neutral-100">{row.kodeRevisi || '00'}</td>
                                                                <td className="px-3 py-2.5">{row.tanggalBerlaku || '-'}</td>
                                                                <td className="px-3 py-2.5">
                                                                    {row.linkProgram ? (
                                                                        <a
                                                                            href={row.linkProgram}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                                                                        >
                                                                            <ExternalLink className="size-3" />
                                                                            Buka Link
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-neutral-400">-</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* File / Link section */}
                            {selectedItem.type === 'Kebutuhan Khusus' ? (
                                <div className="space-y-4">
                                    <div>
                                        <p className="mb-1.5 text-xs font-semibold text-neutral-400 font-sans">Link Modul yang Diajukan</p>
                                        {selectedItem.link_modul ? (
                                            <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900 font-sans">
                                                <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400">
                                                    <Paperclip className="size-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-semibold text-neutral-800 dark:text-neutral-200">Link Modul Pelatihan</p>
                                                    <p className="truncate text-[10px] text-neutral-450 dark:text-neutral-500 select-all">{selectedItem.link_modul}</p>
                                                </div>
                                                <a
                                                    href={selectedItem.link_modul}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-teal-50 hover:text-teal-600 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:text-teal-400 dark:hover:bg-teal-950/30"
                                                    title="Buka Link Modul"
                                                >
                                                    <ExternalLink className="size-3.5" />
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/30 p-4 text-center dark:border-neutral-800 font-sans">
                                                <Paperclip className="mx-auto mb-1 size-5 text-neutral-350" />
                                                <p className="text-xs text-neutral-450">Belum ada link modul yang dilampirkan.</p>
                                            </div>
                                        )}
                                    </div>

                                    {selectedItem.tanggal_realisasi_formatted && selectedItem.tanggal_realisasi_formatted !== '-' && (
                                        <div>
                                            <p className="mb-1.5 text-xs font-semibold text-neutral-400 font-sans">Rencana Realisasi</p>
                                            <div className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900 font-sans">
                                                <Calendar className="size-4 text-neutral-500 dark:text-neutral-400" />
                                                <span className="text-xs font-semibold text-neutral-850 dark:text-neutral-250">
                                                    {selectedItem.tanggal_realisasi_formatted}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Only show this request-level PDF section if NOT a row-based request!
                                !((selectedItem.modulRows && selectedItem.modulRows.length > 0) || 
                                  (selectedItem.programRows && selectedItem.programRows.length > 0)) && (
                                    <div>
                                        <p className="mb-1.5 text-xs font-semibold text-neutral-400 font-sans">Dokumen PDF</p>
                                        {selectedItem.fileName ? (
                                            <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900 font-sans">
                                                <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-950/30">
                                                    <FileText className="size-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-semibold text-neutral-800 dark:text-neutral-200">{selectedItem.fileName}</p>
                                                    {selectedItem.fileSize && (
                                                        <p className="text-[10px] text-neutral-400">{selectedItem.fileSize} · PDF</p>
                                                    )}
                                                </div>
                                                {selectedItem.fileUrl && (
                                                    <div className="flex items-center gap-1.5">
                                                        <a
                                                            href={selectedItem.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-blue-50 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:text-blue-400"
                                                            title="Preview PDF"
                                                        >
                                                            <Eye className="size-3.5" />
                                                        </a>
                                                        <a
                                                            href={selectedItem.fileUrl}
                                                            download
                                                            className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-emerald-50 hover:text-emerald-600 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:text-emerald-450"
                                                            title="Download PDF"
                                                        >
                                                            <Download className="size-3.5" />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/30 p-4 text-center dark:border-neutral-800 font-sans">
                                                <Paperclip className="mx-auto mb-1 size-5 text-neutral-350" />
                                                <p className="text-xs text-neutral-455">Tidak ada dokumen yang dilampirkan.</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            )}

                            {/* Reject reason (history) */}
                            {['Ditolak', 'Batal'].includes(selectedItem.status) && selectedItem.rejectReason && (
                                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-900/40 dark:bg-rose-950/20 font-sans">
                                    <p className="mb-1 text-xs font-bold text-rose-700 dark:text-rose-400">
                                        {selectedItem.status === 'Batal' ? 'Alasan Pembatalan' : 'Alasan Penolakan'}
                                    </p>
                                    <p className="text-xs leading-relaxed text-rose-600 dark:text-rose-300">{selectedItem.rejectReason}</p>
                                    {selectedItem.processedBy && (
                                        <p className="mt-1 text-[10px] text-rose-400">Oleh {selectedItem.processedBy} · {selectedItem.processedAt}</p>
                                    )}
                                </div>
                            )}

                            {selectedItem.status === 'Selesai' && (
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                        ✓ Disetujui oleh {selectedItem.processedBy ?? '-'} pada {selectedItem.processedAt ?? '-'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setSelectedItem(null)}>Tutup</Button>
                        {selectedItem?.status === 'Menunggu Approval' && (
                            <>
                                <Button
                                    onClick={() => { if (selectedItem) { rejectForm.reset(); setRejectItem(selectedItem); setSelectedItem(null); } }}
                                    className="bg-rose-600 text-white hover:bg-rose-700"
                                >
                                    <X className="mr-1.5 size-3.5" /> Tolak
                                </Button>
                                <Button
                                    onClick={() => { if (selectedItem) handleApprove(selectedItem); }}
                                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                    <Check className="mr-1.5 size-3.5" /> Setujui
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── REJECT DIALOG ── */}
            <Dialog open={!!rejectItem} onOpenChange={(open) => { if (!open) setRejectItem(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tolak Pengajuan</DialogTitle>
                        <DialogDescription>
                            Masukkan alasan penolakan untuk pengajuan <span className="font-bold">{rejectItem?.id}</span>. Alasan ini akan dikirim ke pengaju.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleReject} className="mt-2 space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                Alasan Penolakan <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={rejectForm.data.reject_reason}
                                onChange={(e) => rejectForm.setData('reject_reason', e.target.value)}
                                rows={4}
                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                placeholder="Jelaskan alasan penolakan secara detail agar pengaju dapat melakukan perbaikan..."
                                required
                            />
                            {rejectForm.errors.reject_reason && (
                                <p className="mt-1 text-xs text-rose-500">{rejectForm.errors.reject_reason}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setRejectItem(null)}>Batal</Button>
                            <Button type="submit" disabled={rejectForm.processing || !rejectForm.data.reject_reason} className="bg-rose-600 text-white hover:bg-rose-700">
                                {rejectForm.processing ? 'Memproses...' : 'Konfirmasi Tolak'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── PROCESS KEBUTUHAN KHUSUS DIALOG ── */}
            <Dialog open={!!processKhususItem} onOpenChange={(open) => { if (!open) setProcessKhususItem(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Proses Pengajuan Kebutuhan Khusus</DialogTitle>
                        <DialogDescription>
                            Lengkapi data penyelesaian untuk pengajuan <span className="font-bold">{processKhususItem?.id}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleProcessSubmit} className="mt-2 space-y-4">
                        <div className="space-y-3 p-3.5 border border-purple-200 dark:border-purple-900/40 rounded-xl bg-purple-50/20 dark:bg-purple-950/5">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans font-semibold text-purple-600 dark:text-purple-400 font-sans">Status Proses *</label>
                                    <SearchableSelect
                                        value={processForm.data.status}
                                        onChange={(val) => processForm.setData('status', val)}
                                        options={[
                                            { value: 'Selesai', label: 'Selesai (Done)' },
                                            { value: 'Batal', label: 'Batal (Cancel)' },
                                            { value: 'Hold', label: 'Hold' }
                                        ]}
                                        required
                                    />
                                    {processForm.errors.status && <p className="mt-1 text-[10px] text-rose-500 font-sans">{processForm.errors.status}</p>}
                                </div>
                                
                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans font-semibold font-sans">Tanggal Realisasi {processForm.data.status === 'Selesai' && <span className="text-rose-500">*</span>}</label>
                                    <input
                                        type="date"
                                        value={processForm.data.tanggal_realisasi}
                                        onChange={(e) => processForm.setData('tanggal_realisasi', e.target.value)}
                                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                        required={processForm.data.status === 'Selesai'}
                                    />
                                    {processForm.errors.tanggal_realisasi && <p className="mt-1 text-[10px] text-rose-500 font-sans">{processForm.errors.tanggal_realisasi}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans font-semibold font-sans">Link Modul / Dokumen {processForm.data.status === 'Selesai' && <span className="text-rose-500">*</span>}</label>
                                    <input
                                        type="url"
                                        value={processForm.data.link_modul}
                                        onChange={(e) => processForm.setData('link_modul', e.target.value)}
                                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                        placeholder="https://drive.google.com/..."
                                        required={processForm.data.status === 'Selesai'}
                                    />
                                    {processForm.errors.link_modul && <p className="mt-1 text-[10px] text-rose-500 font-sans">{processForm.errors.link_modul}</p>}
                                </div>
                                
                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans font-semibold font-sans">Tanggal Kebutuhan Baru {processForm.data.status === 'Hold' && <span className="text-rose-500">*</span>}</label>
                                    <input
                                        type="date"
                                        value={processForm.data.tanggal_kebutuhan_baru}
                                        onChange={(e) => processForm.setData('tanggal_kebutuhan_baru', e.target.value)}
                                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                        required={processForm.data.status === 'Hold'}
                                    />
                                    {processForm.errors.tanggal_kebutuhan_baru && <p className="mt-1 text-[10px] text-rose-500 font-sans">{processForm.errors.tanggal_kebutuhan_baru}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans font-semibold font-sans">Keterangan Proses / Alasan Hold/Cancel <span className="text-rose-500">*</span></label>
                                <textarea
                                    value={processForm.data.reject_reason}
                                    onChange={(e) => processForm.setData('reject_reason', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                    placeholder="Keterangan tambahan mengenai hasil pemrosesan..."
                                    required
                                />
                                {processForm.errors.reject_reason && <p className="mt-1 text-[10px] text-rose-500 font-sans">{processForm.errors.reject_reason}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setProcessKhususItem(null)}>Batal</Button>
                            <Button type="submit" disabled={processForm.processing} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                                {processForm.processing ? 'Memproses...' : 'Proses Pengajuan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
