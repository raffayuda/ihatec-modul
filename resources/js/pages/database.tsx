import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, Link, useForm, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    BookOpen,
    ShieldAlert,
    RefreshCw,
    Search,
    Plus,
    Download,
    Upload,
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
    History,
    Loader2,
    AlertTriangle,
    Pencil,
    Trash2
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
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, Label } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { SearchableSelect } from '@/components/ui/searchable-select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Database Modul',
        href: '/database',
    },
];

function generateAcronymCode(title: string, modules: any[] = []): string {
    const cleanTitle = title.trim();
    if (!cleanTitle) return '';

    // Split by spaces/whitespace and filter out empty words
    const words = cleanTitle.split(/\s+/).filter(word => word.length > 0);
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

    // Check for conflict/clash with existing module codes
    while (modules.some(m => (m.id || '').toUpperCase() === finalCode.toUpperCase())) {
        finalCode = `${acronym}-${counter}`;
        counter++;
    }

    return finalCode;
}

interface ModuleItem {
    id: string;
    title: string;
    program: string;
    revision: string;
    language: string;
    updatedAt: string;
    status: 'Approved' | 'Revisi';
    fileSize: string;
    filePages: number;
    description: string;
    revisionsHistory: Array<{
        id: number;
        version: string;
        date: string;
        author: string;
        note: string;
        status: 'Approved' | 'Minta Revisi' | 'Rejected' | 'Draft';
    }>;
}

interface DatabaseModulProps extends SharedData {
    modules?: ModuleItem[];
    metrics?: {
        total: number;
        approved: number;
        revisi: number;
    };
    categories?: Array<{
        name: string;
        value: number;
        fill: string;
    }>;
    popular?: Array<{
        id: string;
        title: string;
        views: number;
    }>;
    isDriveConnected?: boolean;
    flash?: {
        message?: string;
        error?: string;
    };
}

interface PdfThumbnailProps {
    url: string;
    fallback: React.ReactNode;
}

export function PdfThumbnail({ url, fallback }: PdfThumbnailProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(false);

        const renderPdf = async () => {
            try {
                // Ensure pdfjsLib is loaded
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
                if (!pdfjsLib) {
                    throw new Error('PDF.js not loaded');
                }

                const loadingTask = pdfjsLib.getDocument({
                    url: url,
                    withCredentials: true
                });
                const pdf = await loadingTask.promise;
                
                if (!isMounted) return;

                const page = await pdf.getPage(1);
                
                if (!isMounted) return;

                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext('2d');
                if (!context) return;

                // Adjust to fit container width (96px/w-24)
                const unscaledViewport = page.getViewport({ scale: 1 });
                const scale = 96 / unscaledViewport.width;
                const viewport = page.getViewport({ scale: scale });

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };

                await page.render(renderContext).promise;

                if (isMounted) {
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error rendering PDF thumbnail:', err);
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        renderPdf();

        return () => {
            isMounted = false;
        };
    }, [url]);

    if (error) {
        return <>{fallback}</>;
    }

    return (
        <div className="w-24 h-32 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 flex items-center justify-center relative shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-neutral-950/80 z-10 font-medium">
                    <Loader2 className="size-4 animate-spin text-blue-600 dark:text-blue-500" />
                </div>
            )}
            <canvas ref={canvasRef} className="w-full h-full object-cover" />
        </div>
    );
}

export default function DatabaseModul({
    modules: initialModules = [],
    metrics = { total: 0, approved: 0, revisi: 0 },
    categories = [],
    popular = [],
    isDriveConnected = true,
    flash,
}: DatabaseModulProps) {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;
    const role = user?.role || 'User';

    const [modules, setModules] = useState<ModuleItem[]>(initialModules);

    React.useEffect(() => {
        setModules(initialModules);
    }, [initialModules]);

    // Selection check boxes
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('Semua Jenis');
    const [langFilter, setLangFilter] = useState('Semua Bahasa');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [revFilter, setRevFilter] = useState('Semua Revisi');

    // Selected Module for Right Column Preview
    const [selectedModuleId, setSelectedModuleId] = useState<string>('');

    // History modal states
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyModule, setHistoryModule] = useState<ModuleItem | null>(null);

    // If selectedModuleId is empty, use the first module code if any
    const activeSelectedId = useMemo(() => {
        if (selectedModuleId) return selectedModuleId;
        return modules.length > 0 ? modules[0].id : '';
    }, [modules, selectedModuleId]);

    // Add module form modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form hook
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        title: '',
        revision: '0.0',
        program: 'Modul',
        language: 'Indonesia',
        description: '',
        file: null as File | null,
    });

    const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);

    const reviseForm = useForm({
        code: '',
        revision: '',
        note: '',
        file: null as File | null,
    });

    const {
        data: reviseData,
        setData: setReviseData,
        post: postRevise,
        processing: reviseProcessing,
        errors: reviseErrors,
        reset: resetRevise
    } = reviseForm;

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

    // Manual code edit tracking
    const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState(false);

    // Edit modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingModuleCode, setEditingModuleCode] = useState<string>('');

    // Edit form hook
    const editForm = useForm({
        code: '',
        title: '',
        program: 'Modul',
        language: 'Indonesia',
        description: '',
        file: null as File | null,
    });

    const importForm = useForm({
        file: null as File | null,
    });

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset current page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, typeFilter, langFilter, statusFilter, revFilter]);

    // Active item matching
    const selectedModule = useMemo(() => {
        return modules.find(m => m.id === activeSelectedId) || modules[0] || null;
    }, [modules, activeSelectedId]);

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

    // Paginated modules for rendering
    const paginatedModules = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredModules.slice(start, start + itemsPerPage);
    }, [filteredModules, currentPage, itemsPerPage]);

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
        post('/database', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
                setIsCodeManuallyEdited(false);
                // Flash handles message
            },
        });
    };

    // Edit module submit handler
    const handleEditModule = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.post(`/database/${editingModuleCode}/update`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                editForm.reset();
                // Flash handles message
            },
        });
    };

    // Revise module submit handler
    const handleReviseModule = (e: React.FormEvent) => {
        e.preventDefault();
        postRevise(`/database/${reviseData.code}/revision`, {
            onSuccess: () => {
                setIsReviseModalOpen(false);
                resetRevise();
                // Flash handles message
            },
        });
    };

    const handleImportModules = (e: React.FormEvent) => {
        e.preventDefault();
        importForm.post('/database/import', {
            forceFormData: true,
            onSuccess: () => {
                setIsImportModalOpen(false);
                importForm.reset();
                // Flash handles message
            },
        });
    };

    const handleBulkDelete = () => {
        router.delete('/database/bulk', {
            data: { ids: selectedModules },
            onSuccess: () => {
                setSelectedModules([]);
                setIsBulkDeleteModalOpen(false);
                // Flash handles message
            },
        });
    };

    const chartConfig = {
        modul: { label: 'Modul', color: '#3b82f6' },
        lembarKerja: { label: 'Lembar Kerja', color: '#a855f7' },
        postTest: { label: 'Post Test', color: '#ec4899' },
        lainnya: { label: 'Lainnya', color: '#6b7280' },
    } satisfies ChartConfig;

    const categoryChartData = useMemo(() => {
        return categories.length > 0 ? categories : [
            { name: 'Modul', value: 0, fill: '#3b82f6' },
            { name: 'Lembar Kerja', value: 0, fill: '#a855f7' },
            { name: 'Post Test', value: 0, fill: '#ec4899' },
            { name: 'Lainnya', value: 0, fill: '#6b7280' },
        ];
    }, [categories]);

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

                {!isDriveConnected && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-amber-800 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/10 dark:text-amber-400 animate-in fade-in duration-300">
                        <AlertTriangle className="size-5 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
                        <div className="text-xs font-semibold leading-normal font-sans">
                            <strong>Integrasi Google Drive belum terhubung:</strong> Anda tidak dapat menambahkan modul baru atau menambahkan revisi ke database modul secara langsung sampai akun Google Drive ditautkan. Hubungkan akun terlebih dahulu di halaman <a href="/admin/drive-integration" className="underline font-bold hover:text-amber-900 dark:hover:text-amber-200">Integrasi Drive</a>.
                        </div>
                    </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                        { label: 'Total Modul', value: metrics.total, icon: FileText, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900' },
                        { label: 'Approved', value: metrics.approved, icon: CheckCircle2, color: 'text-emerald-650 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' },
                        { label: 'Revisi', value: metrics.revisi, icon: RefreshCw, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/50 dark:text-orange-400 border border-orange-200 dark:border-orange-900' },
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

                {/* Filter Bar and Data Table card */}
                <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm overflow-hidden">
                            {/* Filter items */}
                            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/10 space-y-4">
                                {/* Top Row: Search & Primary Actions */}
                                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                                    {/* Search input - prominent and flexible */}
                                    <div className="relative max-w-sm flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Cari kode modul, judul, jenis..."
                                            className="h-9 w-full rounded-lg border border-neutral-200 bg-white dark:bg-neutral-900 pl-9 pr-4 text-xs text-neutral-900 dark:text-neutral-100 outline-none placeholder:text-neutral-400 focus:border-blue-500 dark:border-neutral-800 shadow-sm transition-all"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:justify-end">
                                        {selectedModules.length > 0 && role === 'admin' && (
                                            <Button
                                                onClick={() => setIsBulkDeleteModalOpen(true)}
                                                variant="destructive"
                                                size="sm"
                                                className="h-9 rounded-lg px-3 text-xs font-semibold"
                                            >
                                                <Trash2 className="size-4" />
                                                <span>Hapus ({selectedModules.length})</span>
                                            </Button>
                                        )}

                                        {(role === 'admin' || role === 'Staf PD') && (
                                            <Button
                                                onClick={() => setIsAddModalOpen(true)}
                                                size="sm"
                                                className="h-9 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
                                            >
                                                <Plus className="mr-1.5 size-4" />
                                                <span>Tambah Modul</span>
                                            </Button>
                                        )}

                                        <div className="flex items-center gap-2">
                                            {(role === 'admin' || role === 'Staf PD') && (
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
                                                onClick={() => window.location.href = '/database/export'}
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
                                        {/* Jenis Modul Filter */}
                                        <div className="w-40">
                                            <SearchableSelect
                                                value={typeFilter}
                                                onChange={(val) => setTypeFilter(val)}
                                                options={["Semua Jenis", "Modul", "Lembar Kerja", "Post Test"]}
                                            />
                                        </div>

                                        {/* Language Filter */}
                                        <div className="w-40">
                                            <SearchableSelect
                                                value={langFilter}
                                                onChange={(val) => setLangFilter(val)}
                                                options={["Semua Bahasa", "Indonesia", "English"]}
                                            />
                                        </div>

                                        {/* Status Filter */}
                                        <div className="w-40">
                                            <SearchableSelect
                                                value={statusFilter}
                                                onChange={(val) => setStatusFilter(val)}
                                                options={["Semua Status", "Approved", "Revisi"]}
                                            />
                                        </div>

                                        {/* Revision filter */}
                                        <div className="w-40">
                                            <SearchableSelect
                                                value={revFilter}
                                                onChange={(val) => setRevFilter(val)}
                                                options={[
                                                    "Semua Revisi",
                                                    "1.0",
                                                    "1.1",
                                                    "1.2",
                                                    "1.3",
                                                    "2.0",
                                                    "2.1",
                                                    "2.2",
                                                    "3.0"
                                                ]}
                                            />
                                        </div>
                                    </div>

                                    <Button onClick={handleResetFilters} variant="outline" size="sm" className="h-9 rounded-lg border-neutral-200 dark:border-neutral-800 px-3 text-xs font-semibold">
                                        <RefreshCw className="mr-1.5 size-3.5" /> Reset
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
                                            <th className="px-4 py-3.5">Jenis Modul</th>
                                            <th className="px-4 py-3.5">Revisi</th>
                                            <th className="px-4 py-3.5">Bahasa</th>
                                            <th className="px-4 py-3.5">Updated At</th>
                                            <th className="px-4 py-3.5">Status</th>
                                            <th className="px-4 py-3.5 text-center w-24">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {paginatedModules.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="text-center py-10 text-neutral-400 font-medium dark:text-neutral-500">
                                                    Tidak ada data modul yang cocok dengan filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedModules.map((item) => (
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
                                                            variant="outline"
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
                                                                    window.open(`/database/${item.id}/preview`, '_blank', 'noopener,noreferrer');
                                                                }}
                                                                className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400"
                                                                title="Preview PDF"
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
                                                                    <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => window.location.href = `/database/${item.id}/download`}>Unduh PDF</DropdownMenuItem>
                                                                    <DropdownMenuItem 
                                                                        className="cursor-pointer font-medium"
                                                                        onClick={() => {
                                                                            setHistoryModule(item);
                                                                            setIsHistoryModalOpen(true);
                                                                        }}
                                                                    >
                                                                        Riwayat Revisi
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem 
                                                                        className="cursor-pointer font-medium"
                                                                        onClick={() => {
                                                                            const shareableUrl = `${window.location.origin}/database/${item.id}/preview`;
                                                                            navigator.clipboard.writeText(shareableUrl);
                                                                            setLocalToast({ message: 'Link preview modul berhasil disalin ke clipboard!', type: 'success' });
                                                                        }}
                                                                    >
                                                                        Salin Link Modul
                                                                    </DropdownMenuItem>
                                                                    {(role === 'admin' || role === 'Staf PD') && (
                                                                        <>
                                                                            <DropdownMenuItem 
                                                                                className="cursor-pointer font-medium"
                                                                                onClick={() => {
                                                                                    setEditingModuleCode(item.id);
                                                                                    editForm.setData({
                                                                                        code: item.id,
                                                                                        title: item.title,
                                                                                        program: item.program,
                                                                                        language: item.language,
                                                                                        description: item.description || '',
                                                                                        file: null,
                                                                                    });
                                                                                    setIsEditModalOpen(true);
                                                                                }}
                                                                            >
                                                                                Edit Modul
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem 
                                                                                className="cursor-pointer font-medium"
                                                                                onClick={() => {
                                                                                    let nextRevision = '1.1';
                                                                                    if (item.revision) {
                                                                                        const parsed = parseFloat(item.revision);
                                                                                        if (!isNaN(parsed)) {
                                                                                            nextRevision = (parsed + 0.1).toFixed(1);
                                                                                        }
                                                                                    }
                                                                                    setReviseData({
                                                                                        code: item.id,
                                                                                        revision: nextRevision,
                                                                                        note: '',
                                                                                        file: null,
                                                                                    });
                                                                                    setIsReviseModalOpen(true);
                                                                                }}
                                                                            >
                                                                                Buat Revisi
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                    {role === 'admin' && (
                                                                        <DropdownMenuItem className="cursor-pointer font-medium text-rose-600" onClick={() => { if (confirm(`Apakah Anda yakin ingin menghapus modul ${item.id}?`)) { router.delete(`/database/${item.id}`); } }}>Hapus Modul</DropdownMenuItem>
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

                            {/* Pagination footer */}
                            <div className="p-4 border-t border-neutral-100 bg-neutral-50/20 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-neutral-500 dark:text-neutral-400">
                                <span className="font-medium">
                                    Menampilkan {filteredModules.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredModules.length)} dari {filteredModules.length} modul
                                </span>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-55 disabled:hover:bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                                        >
                                            <ChevronLeft className="size-3.5" />
                                        </button>
                                        
                                        {(() => {
                                            const totalPages = Math.ceil(filteredModules.length / itemsPerPage);
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
                                                const totalPages = Math.ceil(filteredModules.length / itemsPerPage);
                                                setCurrentPage(prev => Math.min(prev + 1, totalPages));
                                            }}
                                            disabled={currentPage === Math.ceil(filteredModules.length / itemsPerPage) || filteredModules.length === 0}
                                            className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-55 disabled:hover:bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                                        >
                                            <ChevronRight className="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
            </div>

            {/* Modal: Import Excel */}
            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Upload className="size-5 text-blue-600 dark:text-blue-400" />
                            <span>Import Data Modul</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Unduh template, isi datanya di Excel, lalu unggah kembali file .xlsx dengan format kolom yang sama.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleImportModules} className="space-y-4 py-2 text-xs">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.location.href = '/database/template'}
                            className="h-9 w-full rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                        >
                            <Download className="mr-1.5 size-3.5" />
                            Download Template Excel
                        </Button>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                File Template Terisi
                            </label>
                            <input
                                type="file"
                                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                required
                                onChange={(e) => importForm.setData('file', e.target.files ? e.target.files[0] : null)}
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 file:mr-2.5 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-neutral-800 dark:file:text-blue-400 cursor-pointer"
                            />
                            {importForm.errors.file && (
                                <p className="text-[10px] text-rose-600 font-semibold mt-1">{importForm.errors.file}</p>
                            )}
                            {importForm.progress && (
                                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                    <div
                                        className="h-full bg-blue-600 transition-all"
                                        style={{ width: `${importForm.progress.percentage}%` }}
                                    />
                                </div>
                            )}
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
                        {/* Kode Modul & Kode Revisi */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                    Kode Modul *
                                </label>
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
                                                code: generateAcronymCode(prev.title, modules)
                                            }));
                                        } else {
                                            setIsCodeManuallyEdited(true);
                                            setData('code', val.toUpperCase());
                                        }
                                    }}
                                    placeholder="Contoh: SJPH"
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                                />
                                {errors.code && (
                                    <p className="text-[10px] text-rose-600 font-semibold mt-1">{errors.code}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                    Kode Revisi *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.revision}
                                    onChange={(e) => setData('revision', e.target.value)}
                                    placeholder="0.0"
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                                />
                                {errors.revision && (
                                    <p className="text-[10px] text-rose-600 font-semibold mt-1">{errors.revision}</p>
                                )}
                            </div>
                        </div>

                        {/* Judul Modul */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                Judul Modul
                            </label>
                            <input
                                type="text"
                                required
                                value={data.title}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setData(prev => ({
                                        ...prev,
                                        title: val,
                                        code: isCodeManuallyEdited ? prev.code : generateAcronymCode(val, modules)
                                    }));
                                }}
                                placeholder="Contoh: Pengenalan ISO 9001:2015"
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                            {errors.title && (
                                <p className="text-[10px] text-rose-600 font-semibold mt-1">{errors.title}</p>
                            )}
                        </div>

                        {/* Program & Bahasa */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                    Jenis Modul
                                </label>
                                <SearchableSelect
                                    value={data.program}
                                    onChange={(val) => setData('program', val)}
                                    options={["Modul", "Lembar Kerja", "Post Test"]}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                    Bahasa
                                </label>
                                <SearchableSelect
                                    value={data.language}
                                    onChange={(val) => setData('language', val)}
                                    options={["Indonesia", "English"]}
                                />
                            </div>
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                Deskripsi Ringkas Modul
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Jelaskan secara singkat ruang lingkup modul pelatihan..."
                                className="w-full h-20 rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                        </div>

                        {/* PDF File Upload */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                File PDF Modul
                            </label>
                            <input
                                type="file"
                                accept="application/pdf"
                                required
                                onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 file:mr-2.5 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-neutral-800 dark:file:text-blue-400 cursor-pointer"
                            />
                            {errors.file && (
                                <p className="text-[10px] text-rose-600 font-semibold mt-1">{errors.file}</p>
                            )}
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

            {/* Modal: Buat Revisi Modul */}
            <Dialog open={isReviseModalOpen} onOpenChange={setIsReviseModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <RefreshCw className="size-5 text-blue-600 dark:text-blue-400" />
                            <span>Buat Revisi Modul</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Unggah dokumen versi baru untuk merevisi modul <span className="font-bold">{reviseData.code}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleReviseModule} className="space-y-4 py-2 text-xs">
                        {/* Kode Modul (Read Only) */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                Kode Modul
                            </label>
                            <input
                                type="text"
                                readOnly
                                disabled
                                value={reviseData.code}
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-100 px-3 text-xs outline-none dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400"
                            />
                        </div>

                        {/* Versi Revisi */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                Versi Revisi Baru
                            </label>
                            <input
                                type="text"
                                required
                                value={reviseData.revision}
                                onChange={(e) => setReviseData('revision', e.target.value)}
                                placeholder="Contoh: 1.1 atau 2.0"
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                            {reviseErrors.revision && (
                                <p className="text-[10px] text-rose-600 font-semibold mt-1">{reviseErrors.revision}</p>
                            )}
                        </div>

                        {/* Catatan Revisi */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                Catatan Perubahan (Revisi)
                            </label>
                            <textarea
                                required
                                value={reviseData.note}
                                onChange={(e) => setReviseData('note', e.target.value)}
                                placeholder="Jelaskan perubahan utama pada dokumen versi baru ini..."
                                className="w-full h-20 rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                            {reviseErrors.note && (
                                <p className="text-[10px] text-rose-600 font-semibold mt-1">{reviseErrors.note}</p>
                            )}
                        </div>

                        {/* PDF File Upload */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                File PDF Modul Versi Baru
                            </label>
                            <input
                                type="file"
                                accept="application/pdf"
                                required
                                onChange={(e) => setReviseData('file', e.target.files ? e.target.files[0] : null)}
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 file:mr-2.5 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-neutral-800 dark:file:text-blue-400 cursor-pointer"
                            />
                            {reviseErrors.file && (
                                <p className="text-[10px] text-rose-600 font-semibold mt-1">{reviseErrors.file}</p>
                            )}
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
                                disabled={reviseProcessing}
                                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg h-9 px-4 text-xs font-semibold"
                            >
                                {reviseProcessing ? 'Mengunggah...' : 'Simpan Revisi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: Edit Modul */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Pencil className="size-5 text-blue-600 dark:text-blue-400" />
                            <span>Edit Modul Pelatihan</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Ubah detail modul pelatihan. Kode modul dapat disesuaikan jika diperlukan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditModule} className="space-y-4 py-2 text-xs">
                        {/* Kode Modul */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                Kode Modul
                            </label>
                            <input
                                type="text"
                                required
                                value={editForm.data.code}
                                onChange={(e) => editForm.setData('code', e.target.value)}
                                placeholder="Contoh: SJPH.01"
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                            {editForm.errors.code && (
                                <p className="text-[10px] text-rose-600 font-semibold mt-1">{editForm.errors.code}</p>
                            )}
                        </div>

                        {/* Judul Modul */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                Judul Modul
                            </label>
                            <input
                                type="text"
                                required
                                value={editForm.data.title}
                                onChange={(e) => editForm.setData('title', e.target.value)}
                                placeholder="Contoh: Pengenalan ISO 9001:2015"
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                            {editForm.errors.title && (
                                <p className="text-[10px] text-rose-600 font-semibold mt-1">{editForm.errors.title}</p>
                            )}
                        </div>

                        {/* Program & Bahasa */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                    Jenis Modul
                                </label>
                                <SearchableSelect
                                    value={editForm.data.program}
                                    onChange={(val) => editForm.setData('program', val)}
                                    options={["Modul", "Lembar Kerja", "Post Test"]}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                    Bahasa
                                </label>
                                <SearchableSelect
                                    value={editForm.data.language}
                                    onChange={(val) => editForm.setData('language', val)}
                                    options={["Indonesia", "English"]}
                                />
                            </div>
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                Deskripsi Ringkas Modul
                            </label>
                            <textarea
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                                placeholder="Jelaskan secara singkat ruang lingkup modul pelatihan..."
                                className="w-full h-20 rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                        </div>

                        {/* PDF File Upload (Optional) */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                File PDF Modul Baru (Opsional)
                            </label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => editForm.setData('file', e.target.files ? e.target.files[0] : null)}
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 file:mr-2.5 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-neutral-800 dark:file:text-blue-400 cursor-pointer"
                            />
                            <p className="text-[10px] text-neutral-400 mt-1">Biarkan kosong jika tidak ingin mengubah file dokumen di Google Drive.</p>
                            {editForm.errors.file && (
                                <p className="text-[10px] text-rose-600 font-semibold mt-1">{editForm.errors.file}</p>
                            )}
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

            {/* Modal: Bulk Delete Confirmation */}
            <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
                <DialogContent className="max-w-sm bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Trash2 className="size-5 text-rose-600 dark:text-rose-500" />
                            <span>Hapus Masal Modul</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Yakin ingin menghapus <span className="font-bold text-neutral-900 dark:text-neutral-100">{selectedModules.length}</span> modul yang dipilih secara permanen? File di Google Drive juga akan dihapus.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsBulkDeleteModalOpen(false)}
                            className="rounded-lg h-9 px-4 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleBulkDelete}
                            className="bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-600 dark:hover:bg-rose-700 rounded-lg h-9 px-4 text-xs font-semibold"
                        >
                            Hapus Semua Terpilih
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Riwayat Revisi */}
            <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
                <DialogContent className="max-w- bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <History className="size-5 text-blue-600 dark:text-blue-400" />
                            <span>Riwayat Revisi Modul</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Berikut adalah daftar riwayat revisi dan catatan perubahan untuk modul <span className="font-bold">{historyModule?.id} - {historyModule?.title}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 max-h-[350px] overflow-y-auto">
                        {historyModule && historyModule.revisionsHistory && historyModule.revisionsHistory.length > 0 ? (
                            <div className="relative pl-8 space-y-6 text-xs">
                                {historyModule.revisionsHistory.map((historyItem, index) => (
                                    <div key={index} className="relative">
                                        {index < historyModule.revisionsHistory.length - 1 && (
                                            <div className="absolute left-[-18px] top-5 bottom-[-34px] w-0.5 bg-neutral-100 dark:bg-neutral-800" />
                                        )}
                                        {/* Colored Timeline Node Indicator */}
                                        <span className={`absolute -left-[26px] top-1 flex size-4.5 items-center justify-center rounded-full ring-4 ring-white dark:ring-neutral-950 ${
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
                                                <span className="font-extrabold text-neutral-900 dark:text-neutral-100 text-xs">Revisi {historyItem.version}</span>
                                                {index === 0 && (
                                                    <Badge className="font-semibold rounded border-0 px-1 py-0.2 text-[8px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 leading-none">Terbaru</Badge>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">{historyItem.date}</span>
                                            <span className="font-semibold text-neutral-700 dark:text-neutral-300 mt-1">Disetujui oleh: {historyItem.author}</span>
                                            {historyItem.note && (
                                                <div className="mt-1 bg-neutral-50 dark:bg-neutral-900/50 p-2 rounded border border-neutral-100 dark:border-neutral-800 text-neutral-550 dark:text-neutral-400 text-[10px] leading-relaxed">
                                                    {historyItem.note}
                                                </div>
                                            )}
                                            <div className="flex gap-2 mt-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="h-7 rounded text-[10px] px-2.5 font-semibold text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800"
                                                    onClick={() => window.open(`/database/revision/${historyItem.id}/preview`, '_blank', 'noopener,noreferrer')}
                                                >
                                                    Lihat PDF
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="h-7 rounded text-[10px] px-2.5 font-semibold text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 flex items-center gap-1"
                                                    onClick={() => window.location.href = `/database/revision/${historyItem.id}/download`}
                                                >
                                                    <span>Download</span>
                                                    <Download className="size-3" />
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="h-7 rounded text-[10px] px-2.5 font-semibold text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800"
                                                    onClick={() => {
                                                        const revisionUrl = `${window.location.origin}/database/revision/${historyItem.id}/preview`;
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
                                Tidak ada riwayat revisi untuk modul ini.
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

        </AppLayout>
    );
}
const circumference = 226.195;
