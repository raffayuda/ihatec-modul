import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Search,
    Plus,
    Download,
    Upload,
    Eye,
    CheckCircle2,
    AlertTriangle,
    History,
    Loader2,
    Pencil,
    Trash2,
    FileText,
    PowerOff,
    Power,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    XCircle,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SearchableSelect } from '@/components/ui/searchable-select';
import React, { useState, useMemo, useEffect, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Database Program Pelatihan', href: '/database-program' },
];

function generateAcronymCode(name: string, programs: any[] = []): string {
    const cleanName = name.trim();
    if (!cleanName) return '';

    // Split by spaces/whitespace and filter out empty words
    const words = cleanName.split(/\s+/).filter(word => word.length > 0);
    let acronym = '';

    if (words.length === 1) {
        // Only one word - use it in full (clean up special characters)
        acronym = words[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    } else {
        // Multiple words - take first letter of each
        acronym = words
            .map(word => word.charAt(0))
            .join('')
            .replace(/[^a-zA-Z0-9]/g, '')
            .toUpperCase();
    }

    if (!acronym) return '';

    let finalCode = acronym;
    let counter = 1;

    // Check for conflict/clash with existing program codes
    while (programs.some(p => (p.code || p.id || '').toUpperCase() === finalCode.toUpperCase())) {
        finalCode = `${acronym}-${counter}`;
        counter++;
    }

    return finalCode;
}

interface ProgramItem {
    id: string;
    code: string;
    name: string;
    revisionCode: string;
    effectiveDate: string;
    status: 'Aktif' | 'Non Aktif';
    fileSize: string;
    filePages: number;
    description: string;
    updatedAt: string;
    revisionsHistory: Array<{
        id: number;
        revisionCode: string;
        effectiveDate: string;
        date: string;
        author: string;
        note: string;
        status: string;
    }>;
}

interface DatabaseProgramProps extends SharedData {
    programs?: ProgramItem[];
    metrics?: { total: number; aktif: number; nonAktif: number };
    flash?: { message?: string; error?: string };
}

function PdfThumbnail({ url, fallback }: { url: string; fallback: React.ReactNode }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(false);

        const renderPdf = async () => {
            try {
                if (!(window as any).pdfjsLib) {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
                        script.onload = () => {
                            (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
                            resolve(true);
                        };
                        script.onerror = reject;
                        document.body.appendChild(script);
                    });
                }
                const pdfjsLib = (window as any).pdfjsLib;
                const loadingTask = pdfjsLib.getDocument({ url, withCredentials: true });
                const pdf = await loadingTask.promise;
                if (!isMounted) return;
                const page = await pdf.getPage(1);
                if (!isMounted) return;
                const canvas = canvasRef.current;
                if (!canvas) return;
                const context = canvas.getContext('2d');
                if (!context) return;
                const unscaledViewport = page.getViewport({ scale: 1 });
                const scale = 96 / unscaledViewport.width;
                const viewport = page.getViewport({ scale });
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: context, viewport }).promise;
                if (isMounted) setLoading(false);
            } catch {
                if (isMounted) { setError(true); setLoading(false); }
            }
        };

        renderPdf();
        return () => { isMounted = false; };
    }, [url]);

    if (error) return <>{fallback}</>;

    return (
        <div className="w-24 h-32 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center relative shadow-sm overflow-hidden">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-neutral-950/80 z-10">
                    <Loader2 className="size-4 animate-spin text-blue-600" />
                </div>
            )}
            <canvas ref={canvasRef} className="w-full h-full object-cover" />
        </div>
    );
}

export default function DatabaseProgram({
    programs: initialPrograms = [],
    metrics = { total: 0, aktif: 0, nonAktif: 0 },
    flash,
}: DatabaseProgramProps) {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;
    const role = user?.role || 'User';

    const [programs, setPrograms] = useState<ProgramItem[]>(initialPrograms);
    React.useEffect(() => { setPrograms(initialPrograms); }, [initialPrograms]);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState(false);
    const [selectedProgramId, setSelectedProgramId] = useState<string>('');

    const activeSelectedId = useMemo(() => {
        if (selectedProgramId) return selectedProgramId;
        return programs.length > 0 ? programs[0].code : '';
    }, [programs, selectedProgramId]);

    const [localToast, setLocalToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
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

    useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

    // --- Add modal ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        name: '',
        revision_code: '1.0',
        effective_date: '',
        description: '',
        file: null as File | null,
    });

    // --- Edit modal ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCode, setEditingCode] = useState('');
    const editForm = useForm({
        code: '',
        name: '',
        revision_code: '',
        effective_date: '',
        description: '',
        file: null as File | null,
    });

    // --- Revise modal ---
    const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
    const reviseForm = useForm({
        code: '',
        revision_code: '',
        effective_date: '',
        note: '',
        file: null as File | null,
    });

    // --- Import modal ---
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const importForm = useForm({ file: null as File | null });

    // --- History modal ---
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyProgram, setHistoryProgram] = useState<ProgramItem | null>(null);

    // --- Delete confirm ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingCode, setDeletingCode] = useState('');

    // --- Filtered & paginated ---
    const filteredPrograms = useMemo(() => {
        return programs.filter((p) => {
            const matchesSearch =
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.revisionCode.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'Semua Status' || p.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [programs, searchQuery, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / itemsPerPage));
    const paginatedPrograms = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredPrograms.slice(start, start + itemsPerPage);
    }, [filteredPrograms, currentPage, itemsPerPage]);

    const startIndex = (currentPage - 1) * itemsPerPage;

    // --- Handlers ---
    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/database-program', {
            forceFormData: true,
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
                setIsCodeManuallyEdited(false);
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.post(`/database-program/${editingCode}/update`, {
            forceFormData: true,
            onSuccess: () => { setIsEditModalOpen(false); editForm.reset(); },
        });
    };

    const handleReviseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        reviseForm.post(`/database-program/${reviseForm.data.code}/revision`, {
            forceFormData: true,
            onSuccess: () => { setIsReviseModalOpen(false); reviseForm.reset(); },
        });
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        importForm.post('/database-program/import', {
            forceFormData: true,
            onSuccess: () => { setIsImportModalOpen(false); importForm.reset(); },
        });
    };

    const handleToggleStatus = (code: string) => {
        router.post(`/database-program/${code}/status`, {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        router.delete(`/database-program/${deletingCode}`, {
            onSuccess: () => { setIsDeleteModalOpen(false); setDeletingCode(''); },
        });
    };

    const openEdit = (program: ProgramItem) => {
        setEditingCode(program.code);
        editForm.setData({
            code: program.code,
            name: program.name,
            revision_code: program.revisionCode,
            effective_date: program.effectiveDate !== '-' ? program.effectiveDate : '',
            description: program.description,
            file: null,
        });
        setIsEditModalOpen(true);
    };

    const openRevise = (program: ProgramItem) => {
        const parts = program.revisionCode.split('.');
        const minor = parseInt(parts[1] ?? '0', 10) + 1;
        const nextRevision = `${parts[0]}.${minor}`;
        reviseForm.setData({
            code: program.code,
            revision_code: nextRevision,
            effective_date: '',
            note: '',
            file: null,
        });
        setIsReviseModalOpen(true);
    };

    const canEdit = role === 'admin' || role === 'Staf PD';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Database Program Pelatihan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                        Database Program Pelatihan
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Pusat data program pelatihan, dokumen aktif, dan riwayat revisi.
                    </p>
                </div>

                {/* Toast */}
                {localToast && (
                    <div className={`fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-xl border p-4 text-sm font-semibold shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300 ${
                        localToast.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300'
                            : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300'
                    }`}>
                        {localToast.type === 'success'
                            ? <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                            : <AlertTriangle className="size-4.5 text-rose-600" />}
                        <span>{localToast.message}</span>
                    </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                        { label: 'Total Program', value: metrics.total, icon: FileText, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900' },
                        { label: 'Aktif', value: metrics.aktif, icon: CheckCircle2, color: 'text-emerald-650 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' },
                        { label: 'Non Aktif', value: metrics.nonAktif, icon: XCircle, color: 'text-neutral-500 bg-neutral-50 dark:bg-neutral-950/50 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800' },
                    ].map((m) => (
                        <Card key={m.label} className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <CardContent className="flex items-start gap-2 p-4">
                                <div className={`flex size-9 items-center justify-center rounded-xl ${m.color}`}>
                                    <m.icon className="size-4.5" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{m.value}</div>
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{m.label}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>


                {/* Table Card */}
                <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm overflow-hidden">
                    {/* Filter Bar */}
                    <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/10 space-y-4">
                        {/* Top Row: Search & Actions */}
                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                            {/* Search */}
                            <div className="relative max-w-sm flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari kode program, nama, deskripsi..."
                                    className="h-9 w-full rounded-lg border border-neutral-200 bg-white dark:bg-neutral-900 pl-9 pr-4 text-xs text-neutral-900 dark:text-neutral-100 outline-none placeholder:text-neutral-400 focus:border-blue-500 dark:border-neutral-800 shadow-sm transition-all"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:justify-end">
                                {canEdit && (
                                    <Button
                                        onClick={() => setIsAddModalOpen(true)}
                                        size="sm"
                                        className="h-9 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
                                    >
                                        <Plus className="mr-1.5 size-4" />
                                        <span>Tambah Program</span>
                                    </Button>
                                )}

                                <div className="flex items-center gap-2">
                                    {canEdit && (
                                        <Button
                                            onClick={() => setIsImportModalOpen(true)}
                                            variant="outline"
                                            size="sm"
                                            className="h-9 rounded-lg border-neutral-200 dark:border-neutral-800 px-3 text-xs font-semibold bg-white dark:bg-neutral-900 hover:bg-neutral-50"
                                        >
                                            <Upload className="size-3.5" />
                                            <span>Import</span>
                                        </Button>
                                    )}

                                    <Button
                                        onClick={() => window.location.href = '/database-program/export'}
                                        variant="outline"
                                        size="sm"
                                        className="h-9 rounded-lg border-neutral-200 dark:border-neutral-800 px-3 text-xs font-semibold bg-white dark:bg-neutral-900 hover:bg-neutral-50"
                                    >
                                        <Download className="size-3.5" />
                                        <span>Export</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row: Specific Filters */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <div className="w-40">
                                    <SearchableSelect
                                        value={statusFilter}
                                        onChange={(val) => setStatusFilter(val)}
                                        options={["Semua Status", "Aktif", "Non Aktif"]}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('Semua Status');
                                }}
                                variant="outline"
                                size="sm"
                                className="h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 text-xs font-semibold"
                            >
                                <RefreshCw className="mr-1.5 size-3.5" /> Reset
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[950px] text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                    <th className="px-5 py-3.5 w-12 text-center">No</th>
                                    <th className="px-4 py-3.5">Kode Program</th>
                                    <th className="px-4 py-3.5">Nama Program</th>
                                    <th className="px-4 py-3.5">Kode Revisi</th>
                                    <th className="px-4 py-3.5">Tanggal Berlaku</th>
                                    <th className="px-4 py-3.5">Attachment File</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-4 py-3.5 text-center w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {paginatedPrograms.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-10 text-neutral-400 font-medium dark:text-neutral-500">
                                            Tidak ada data program pelatihan yang cocok dengan filter.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedPrograms.map((program, index) => (
                                        <tr
                                            key={program.code}
                                            onClick={() => setSelectedProgramId(program.code)}
                                            className={`cursor-pointer transition-colors ${
                                                activeSelectedId === program.code
                                                    ? 'bg-blue-50/30 hover:bg-blue-50/40 dark:bg-blue-950/10 dark:hover:bg-blue-950/15'
                                                    : 'hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10'
                                            }`}
                                        >
                                            <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400 font-medium">
                                                {startIndex + index + 1}
                                            </td>
                                            <td className="px-4 py-4 font-semibold text-neutral-850 dark:text-neutral-300">
                                                {program.code}
                                            </td>
                                            <td className="px-4 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                                                <div>
                                                    <span className="font-semibold">{program.name}</span>
                                                    {program.description && (
                                                        <p className="text-[10px] font-normal text-neutral-450 dark:text-neutral-500 mt-0.5 line-clamp-1">
                                                            {program.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-neutral-700 dark:text-neutral-300 font-bold">
                                                {program.revisionCode}
                                            </td>
                                            <td className="px-4 py-4 text-neutral-600 dark:text-neutral-400 font-medium">
                                                {program.effectiveDate}
                                            </td>
                                            <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                                {program.fileSize && program.fileSize !== '0 B' ? (
                                                    <div className="flex items-center gap-2">
                                                        <PdfThumbnail
                                                            url={`/database-program/${program.code}/preview`}
                                                            fallback={
                                                                <div className="w-10 h-14 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
                                                                    <FileText className="size-4 text-neutral-400" />
                                                                </div>
                                                            }
                                                        />
                                                        <div className="flex flex-col gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => window.open(`/database-program/${program.code}/preview`, '_blank', 'noopener,noreferrer')}
                                                                className="h-7 px-2 text-[10px] font-semibold rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm"
                                                            >
                                                                <Eye className="size-3" />
                                                                Lihat
                                                            </Button>
                                                            <span className="text-[9px] text-neutral-450 dark:text-neutral-550">{program.fileSize}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-neutral-450 dark:text-neutral-550 italic">Belum ada file</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge
                                                    className={`font-semibold rounded-md border-0 px-2 py-0.5 text-[9px] ${
                                                        program.status === 'Aktif'
                                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                                    }`}
                                                >
                                                    {program.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {program.fileSize && program.fileSize !== '0 B' && (
                                                        <button
                                                            onClick={() => {
                                                                window.open(`/database-program/${program.code}/preview`, '_blank', 'noopener,noreferrer');
                                                            }}
                                                            className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400"
                                                            title="Preview PDF"
                                                        >
                                                            <Eye className="size-3.5" />
                                                        </button>
                                                    )}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400">
                                                                <MoreVertical className="size-3.5" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40 text-xs">
                                                            {program.fileSize && program.fileSize !== '0 B' && (
                                                                <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => window.location.href = `/database-program/${program.code}/download`}>
                                                                    Unduh PDF
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem 
                                                                className="cursor-pointer font-medium"
                                                                onClick={() => {
                                                                    setHistoryProgram(program);
                                                                    setIsHistoryModalOpen(true);
                                                                }}
                                                            >
                                                                Riwayat Revisi
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                className="cursor-pointer font-medium"
                                                                onClick={() => {
                                                                    const shareableUrl = `${window.location.origin}/database-program/${program.code}/preview`;
                                                                    navigator.clipboard.writeText(shareableUrl);
                                                                    setLocalToast({ message: 'Link preview program berhasil disalin ke clipboard!', type: 'success' });
                                                                }}
                                                            >
                                                                Salin Link Program
                                                            </DropdownMenuItem>
                                                            {canEdit && (
                                                                <>
                                                                    <DropdownMenuItem 
                                                                        className="cursor-pointer font-medium"
                                                                        onClick={() => openEdit(program)}
                                                                    >
                                                                        Edit Program
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem 
                                                                        className="cursor-pointer font-medium"
                                                                        onClick={() => openRevise(program)}
                                                                    >
                                                                        Buat Revisi
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem 
                                                                        className="cursor-pointer font-medium"
                                                                        onClick={() => handleToggleStatus(program.code)}
                                                                    >
                                                                        {program.status === 'Aktif' ? 'Non Aktifkan' : 'Aktifkan'}
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            {role === 'admin' && (
                                                                <DropdownMenuItem 
                                                                    className="cursor-pointer font-medium text-rose-600 focus:text-rose-600 dark:text-rose-450"
                                                                    onClick={() => {
                                                                        setDeletingCode(program.code);
                                                                        setIsDeleteModalOpen(true);
                                                                    }}
                                                                >
                                                                    Hapus Program
                                                                </DropdownMenuItem>
                                                            )}
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

                    {/* Pagination Footer */}
                    <div className="p-4 border-t border-neutral-100 bg-neutral-50/20 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-neutral-500 dark:text-neutral-400">
                        <span className="font-medium text-xs">
                            Menampilkan {filteredPrograms.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredPrograms.length)} dari {filteredPrograms.length} program
                        </span>
                        <div className="flex items-center gap-4">
                            <div className="w-32">
                                <SearchableSelect
                                    value={String(itemsPerPage)}
                                    onChange={(val) => {
                                        setItemsPerPage(Number(val));
                                        setCurrentPage(1);
                                    }}
                                    options={[
                                        { value: '10', label: '10 / halaman' },
                                        { value: '20', label: '20 / halaman' },
                                        { value: '50', label: '50 / halaman' }
                                    ]}
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-55 disabled:hover:bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                                >
                                    <ChevronLeft className="size-3.5" />
                                </button>
                                
                                {(() => {
                                    const range = [];
                                    const maxVisible = 5;
                                    if (totalPages <= maxVisible) {
                                        for (let i = 1; i <= totalPages; i++) {
                                            range.push(i);
                                        }
                                    } else {
                                        range.push(1);
                                        let start = Math.max(2, currentPage - 1);
                                        let end = Math.min(totalPages - 1, currentPage + 1);

                                        if (currentPage <= 3) {
                                            end = 4;
                                        } else if (currentPage >= totalPages - 2) {
                                            start = totalPages - 3;
                                        }

                                        if (start > 2) {
                                            range.push('...');
                                        }

                                        for (let i = start; i <= end; i++) {
                                            range.push(i);
                                        }

                                        if (end < totalPages - 1) {
                                            range.push('...');
                                        }

                                        range.push(totalPages);
                                    }

                                    return range.map((pageVal, index) => {
                                        if (pageVal === '...') {
                                            return (
                                                <span key={`ell-${index}`} className="text-neutral-400 px-1 select-none">
                                                    ...
                                                </span>
                                            );
                                        }
                                        const isActive = pageVal === currentPage;
                                        return (
                                            <button
                                                key={`page-${pageVal}`}
                                                onClick={() => setCurrentPage(Number(pageVal))}
                                                className={`flex size-7 items-center justify-center rounded text-xs font-semibold border ${
                                                    isActive
                                                        ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500'
                                                        : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400'
                                                }`}
                                            >
                                                {pageVal}
                                            </button>
                                        );
                                    });
                                })()}

                                <button 
                                    onClick={() => {
                                        setCurrentPage(prev => Math.min(prev + 1, totalPages));
                                    }}
                                    disabled={currentPage === totalPages || filteredPrograms.length === 0}
                                    className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-55 disabled:hover:bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                                >
                                    <ChevronRight className="size-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* --- Add Modal --- */}
            <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                setIsAddModalOpen(open);
                if (!open) {
                    reset();
                    setIsCodeManuallyEdited(false);
                }
            }}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Plus className="size-5 text-blue-600 dark:text-blue-400" />
                            <span>Tambah Program Pelatihan</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Isi detail formulir untuk meregistrasi program baru ke database.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddSubmit} className="space-y-4 py-2 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Kode Program *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.code}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '') {
                                            setIsCodeManuallyEdited(false);
                                            setData(prev => ({
                                                ...prev,
                                                code: generateAcronymCode(prev.name, programs)
                                            }));
                                        } else {
                                            setIsCodeManuallyEdited(true);
                                            setData('code', val.toUpperCase());
                                        }
                                    }}
                                    placeholder="Contoh: AH"
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-450 dark:placeholder:text-neutral-550"
                                />
                                {errors.code && <p className="text-[10px] text-rose-600 font-semibold mt-1">{errors.code}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Kode Revisi *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.revision_code}
                                    onChange={(e) => setData('revision_code', e.target.value)}
                                    placeholder="1.0"
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-450 dark:placeholder:text-neutral-550"
                                />
                                {errors.revision_code && <p className="text-[10px] text-rose-600 font-semibold mt-1">{errors.revision_code}</p>}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Nama Program *</label>
                            <input
                                type="text"
                                required
                                value={data.name}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setData(prev => ({
                                        ...prev,
                                        name: val,
                                        code: isCodeManuallyEdited ? prev.code : generateAcronymCode(val, programs)
                                    }));
                                }}
                                placeholder="Contoh: Auditor Halal"
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-455 dark:placeholder:text-neutral-550"
                            />
                            {errors.name && <p className="text-[10px] text-rose-600 font-semibold mt-1">{errors.name}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Tanggal Berlaku</label>
                            <input
                                type="date"
                                value={data.effective_date}
                                onChange={(e) => setData('effective_date', e.target.value)}
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                            />
                            {errors.effective_date && <p className="text-[10px] text-rose-600 font-semibold mt-1">{errors.effective_date}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Deskripsi</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Jelaskan secara singkat ruang lingkup program pelatihan..."
                                className="w-full h-20 rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 resize-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">File Attachment (PDF) *</label>
                            <input
                                type="file"
                                accept=".pdf"
                                required
                                onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 file:mr-2.5 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-neutral-800 dark:file:text-blue-400 cursor-pointer"
                            />
                            {errors.file && <p className="text-[10px] text-rose-600 font-semibold mt-1">{errors.file}</p>}
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => { setIsAddModalOpen(false); reset(); setIsCodeManuallyEdited(false); }}
                                className="rounded-lg h-9 px-4 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg h-9 px-4 text-xs font-semibold flex items-center gap-1.5"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="size-3.5 animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <span>Simpan Program</span>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- Edit Modal --- */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => {
                setIsEditModalOpen(open);
                if (!open) {
                    editForm.reset();
                }
            }}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Pencil className="size-5 text-blue-600 dark:text-blue-400" />
                            <span>Edit Program Pelatihan</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Perbarui informasi program pelatihan. Kode program dapat disesuaikan jika diperlukan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Kode Program *</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.code}
                                    onChange={(e) => editForm.setData('code', e.target.value.toUpperCase())}
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                />
                                {editForm.errors.code && <p className="text-[10px] text-rose-650 font-semibold mt-1">{editForm.errors.code}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Kode Revisi *</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.revision_code}
                                    onChange={(e) => editForm.setData('revision_code', e.target.value)}
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                />
                                {editForm.errors.revision_code && <p className="text-[10px] text-rose-650 font-semibold mt-1">{editForm.errors.revision_code}</p>}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Nama Program *</label>
                            <input
                                type="text"
                                required
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                            />
                            {editForm.errors.name && <p className="text-[10px] text-rose-650 font-semibold mt-1">{editForm.errors.name}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Tanggal Berlaku</label>
                            <input
                                type="date"
                                value={editForm.data.effective_date}
                                onChange={(e) => editForm.setData('effective_date', e.target.value)}
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Deskripsi</label>
                            <textarea
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                                className="w-full h-20 rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 resize-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">File PDF Baru (Opsional)</label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => editForm.setData('file', e.target.files?.[0] ?? null)}
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 file:mr-2.5 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-neutral-800 dark:file:text-blue-400 cursor-pointer"
                            />
                            <p className="text-[10px] text-neutral-400 mt-1">Biarkan kosong jika tidak ingin mengubah file dokumen.</p>
                            {editForm.errors.file && <p className="text-[10px] text-rose-650 font-semibold mt-1">{editForm.errors.file}</p>}
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsEditModalOpen(false)}
                                className="rounded-lg h-9 px-4 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg h-9 px-4 text-xs font-semibold flex items-center gap-1.5"
                            >
                                {editForm.processing ? (
                                    <>
                                        <Loader2 className="size-3.5 animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <span>Simpan Perubahan</span>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- Revise Modal --- */}
            <Dialog open={isReviseModalOpen} onOpenChange={(open) => {
                setIsReviseModalOpen(open);
                if (!open) {
                    reviseForm.reset();
                }
            }}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <RefreshCw className="size-5 text-blue-600 dark:text-blue-400" />
                            <span>Buat Revisi Program</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Unggah dokumen versi baru untuk merevisi program <span className="font-bold">{reviseForm.data.code}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleReviseSubmit} className="space-y-4 py-2 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Kode Program</label>
                                <input
                                    type="text"
                                    value={reviseForm.data.code}
                                    readOnly
                                    disabled
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-100 px-3 text-xs outline-none dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Kode Revisi Baru *</label>
                                <input
                                    type="text"
                                    required
                                    value={reviseForm.data.revision_code}
                                    onChange={(e) => reviseForm.setData('revision_code', e.target.value)}
                                    placeholder="Contoh: 1.1 atau 2.0"
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                                />
                                {reviseForm.errors.revision_code && <p className="text-[10px] text-rose-600 font-semibold mt-1">{reviseForm.errors.revision_code}</p>}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Tanggal Berlaku</label>
                            <input
                                type="date"
                                value={reviseForm.data.effective_date}
                                onChange={(e) => reviseForm.setData('effective_date', e.target.value)}
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Catatan Perubahan (Revisi) *</label>
                            <textarea
                                required
                                value={reviseForm.data.note}
                                onChange={(e) => reviseForm.setData('note', e.target.value)}
                                placeholder="Jelaskan perubahan utama pada dokumen versi baru ini..."
                                className="w-full h-20 rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-450 dark:placeholder:text-neutral-550 resize-none"
                            />
                            {reviseForm.errors.note && <p className="text-[10px] text-rose-600 font-semibold mt-1">{reviseForm.errors.note}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">File PDF Revisi *</label>
                            <input
                                type="file"
                                accept=".pdf"
                                required
                                onChange={(e) => reviseForm.setData('file', e.target.files?.[0] ?? null)}
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 file:mr-2.5 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-neutral-800 dark:file:text-blue-400 cursor-pointer"
                            />
                            {reviseForm.errors.file && <p className="text-[10px] text-rose-600 font-semibold mt-1">{reviseForm.errors.file}</p>}
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsReviseModalOpen(false)}
                                className="rounded-lg h-9 px-4 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={reviseForm.processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg h-9 px-4 text-xs font-semibold flex items-center gap-1.5"
                            >
                                {reviseForm.processing ? (
                                    <>
                                        <Loader2 className="size-3.5 animate-spin" />
                                        <span>Mengunggah...</span>
                                    </>
                                ) : (
                                    <span>Simpan Revisi</span>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- Import Modal --- */}
            <Dialog open={isImportModalOpen} onOpenChange={(open) => {
                setIsImportModalOpen(open);
                if (!open) {
                    importForm.reset();
                }
            }}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Upload className="size-5 text-blue-600 dark:text-blue-400" />
                            <span>Import Data Program</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Unduh template, isi datanya di Excel, lalu unggah kembali file .xlsx dengan format kolom yang sama.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleImportSubmit} className="space-y-4 py-2 text-xs">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.location.href = '/database-program/template'}
                            className="h-9 w-full rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 shadow-sm"
                        >
                            <Download className="mr-1.5 size-3.5" />
                            Download Template Excel
                        </Button>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">File Template Terisi</label>
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                required
                                onChange={(e) => importForm.setData('file', e.target.files?.[0] ?? null)}
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 file:mr-2.5 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-neutral-800 dark:file:text-blue-400 cursor-pointer"
                            />
                            {importForm.errors.file && <p className="text-[10px] text-rose-600 font-semibold mt-1">{importForm.errors.file}</p>}
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsImportModalOpen(false)}
                                className="rounded-lg h-9 px-4 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={importForm.processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg h-9 px-4 text-xs font-semibold"
                            >
                                {importForm.processing ? 'Mengimpor...' : 'Import Data'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- History Modal --- */}
            <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <History className="size-5 text-blue-600 dark:text-blue-400" />
                            <span>Riwayat Revisi Program</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Berikut adalah daftar riwayat revisi dan catatan perubahan untuk program <span className="font-bold">{historyProgram?.code} - {historyProgram?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 max-h-[350px] overflow-y-auto pr-1">
                        {historyProgram && historyProgram.revisionsHistory && historyProgram.revisionsHistory.length > 0 ? (
                            <div className="relative pl-6 border-l border-neutral-100 dark:border-neutral-800 space-y-6 text-xs">
                                {historyProgram.revisionsHistory.map((rev, index) => (
                                    <div key={rev.id} className="relative">
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
                                                <span className="font-extrabold text-neutral-900 dark:text-neutral-100 text-xs">Revisi {rev.revisionCode}</span>
                                                {index === 0 && (
                                                    <Badge className="font-semibold rounded border-0 px-1 py-0.2 text-[8px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 leading-none">Terbaru</Badge>
                                                )}
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[9px] font-semibold border-0 px-1.5 py-0.2 rounded-md ${
                                                        rev.status === 'Aktif'
                                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                                                            : 'bg-neutral-50 text-neutral-600 dark:bg-neutral-400 dark:bg-neutral-800'
                                                    }`}
                                                >
                                                    {rev.status}
                                                </Badge>
                                            </div>
                                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">{rev.date}</span>
                                            <span className="font-semibold text-neutral-700 dark:text-neutral-300 mt-1">Oleh: {rev.author}</span>
                                            {rev.effectiveDate && rev.effectiveDate !== '-' && (
                                                <span className="text-[10px] text-neutral-550 dark:text-neutral-450">Tanggal Berlaku: {rev.effectiveDate}</span>
                                            )}
                                            {rev.note && (
                                                <div className="mt-1 bg-neutral-50 dark:bg-neutral-900/50 p-2 rounded border border-neutral-100 dark:border-neutral-800 text-neutral-550 dark:text-neutral-400 text-[10px] leading-relaxed">
                                                    {rev.note}
                                                </div>
                                            )}
                                            <div className="flex gap-2 mt-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="h-7 rounded text-[10px] px-2.5 font-semibold text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800"
                                                    onClick={() => window.open(`/database-program/revision/${rev.id}/preview`, '_blank')}
                                                >
                                                    Lihat PDF
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="h-7 rounded text-[10px] px-2.5 font-semibold text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 flex items-center gap-1"
                                                    onClick={() => window.location.href = `/database-program/revision/${rev.id}/download`}
                                                >
                                                    <span>Download</span>
                                                    <Download className="size-3" />
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="h-7 rounded text-[10px] px-2.5 font-semibold text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800"
                                                    onClick={() => {
                                                        const revisionUrl = `${window.location.origin}/database-program/revision/${rev.id}/preview`;
                                                        navigator.clipboard.writeText(revisionUrl);
                                                        setLocalToast({ message: 'Link preview revisi berhasil disalin!', type: 'success' });
                                                    }}
                                                >
                                                    Salin Link
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-neutral-400 text-xs py-6">
                                Tidak ada riwayat revisi untuk program ini.
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-2">
                        <Button
                            type="button"
                            onClick={() => setIsHistoryModalOpen(false)}
                            className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg h-9 px-4 text-xs font-semibold w-full sm:w-auto"
                        >
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- Delete Confirm Modal --- */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-sm bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Trash2 className="size-5 text-rose-600 dark:text-rose-500" />
                            <span>Hapus Program</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Apakah Anda yakin ingin menghapus program <span className="font-bold text-neutral-900 dark:text-neutral-100">{deletingCode}</span>? Tindakan ini tidak dapat dibatalkan. File di Google Drive juga akan dihapus.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="rounded-lg h-9 px-4 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleDelete}
                            className="bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-600 dark:hover:bg-rose-700 rounded-lg h-9 px-4 text-xs font-semibold"
                        >
                            Hapus Program
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
