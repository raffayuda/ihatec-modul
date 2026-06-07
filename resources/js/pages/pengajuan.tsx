import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Plus,
    Search,
    RefreshCw,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Send,
    Trash2,
    Edit3,
    AlertTriangle,
    ArrowUpRight,
    Upload,
    Paperclip,
    Eye,
    Download,
    X as XIcon,
    FileCheck,
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
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengajuan Modul',
        href: '/pengajuan',
    },
];

interface SubmissionItem {
    id: string;
    dbId: number;
    type: string;
    title: string;
    applicant: string;
    unit: string;
    submissionDate: string;
    deadline: string;
    deadlineFormatted: string;
    status: string;
    description: string;
    priority: string;
    rejectReason?: string | null;
    // File
    fileName?: string | null;
    fileSize?: string | null;
    fileMime?: string | null;
    fileUrl?: string | null;
    // New fields from diagram
    program?: string | null;
    language?: string | null;
    training_days?: number | string | null;
    revision_reason?: string | null;
    related_module_id?: number | string | null;
    relatedModuleCode?: string | null;
    relatedModuleTitle?: string | null;
    relatedModuleRevision?: string | null;
    
    // Kebutuhan Khusus fields
    jenis_kebutuhan?: string | null;
    nama_instansi?: string | null;
    judul_program?: string | null;
    jam_khusus?: string | null;
    pre_post_test?: string | null;
    keterangan_kebutuhan?: string | null;
    
    // Processing fields
    link_modul?: string | null;
    tanggal_realisasi?: string | null;
    tanggal_realisasi_formatted?: string | null;
    tanggal_kebutuhan_baru?: string | null;
    tanggal_kebutuhan_baru_formatted?: string | null;
}

interface Stats {
    total: number;
    waiting: number;
    drafting: number;
    finished: number;
    baru: number;
    ditolak: number;
}

interface ChartDataItem {
    name: string;
    value: number;
    fill: string;
}

interface AvailableModule {
    id: number;
    code: string;
    title: string;
    revision: string;
}

interface PengajuanProps extends SharedData {
    submissions: SubmissionItem[];
    stats: Stats;
    chartData: ChartDataItem[];
    availableModules: AvailableModule[];
    trainingTypes?: string[];
    jenisKebutuhanOptions?: string[];
    bahasaPengantarOptions?: string[];
    flash?: {
        message?: string;
        error?: string;
    };
}

const STATUS_COLORS: Record<string, string> = {
    Baru: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
    Drafting: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
    'Menunggu Approval': 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    Selesai: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    Ditolak: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    Batal: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    Hold: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
};

const PRIORITY_COLORS: Record<string, string> = {
    High: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300',
    Medium: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
    Low: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
};

// ── File Upload Zone Component ──────────────────────────────────────────────
interface FileDropZoneProps {
    onFileSelect: (file: File | null) => void;
    selectedFile: File | null;
    existingFileName?: string | null;
    existingFileSize?: string | null;
    existingFileUrl?: string | null;
}

function FileDropZone({ onFileSelect, selectedFile, existingFileName, existingFileSize, existingFileUrl }: FileDropZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/pdf') {
                onFileSelect(file);
            }
        },
        [onFileSelect],
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        onFileSelect(file);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    // Showing newly selected file
    if (selectedFile) {
        return (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40">
                    <FileCheck className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-neutral-800 dark:text-neutral-200">{selectedFile.name}</p>
                    <p className="text-[10px] text-neutral-400">{formatSize(selectedFile.size)}</p>
                </div>
                <button
                    type="button"
                    onClick={() => { onFileSelect(null); if (inputRef.current) inputRef.current.value = ''; }}
                    className="flex size-6 items-center justify-center rounded hover:bg-neutral-200 text-neutral-400 dark:hover:bg-neutral-700"
                >
                    <XIcon className="size-3.5" />
                </button>
            </div>
        );
    }

    // Showing existing uploaded file
    if (existingFileName && !selectedFile) {
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 dark:border-blue-900/40 dark:bg-blue-950/20">
                    <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40">
                        <Paperclip className="size-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-neutral-800 dark:text-neutral-200">{existingFileName}</p>
                        {existingFileSize && <p className="text-[10px] text-neutral-400">{existingFileSize}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                        {existingFileUrl && (
                            <a
                                href={existingFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex size-7 items-center justify-center rounded hover:bg-blue-100 text-blue-600 dark:hover:bg-blue-900/40"
                                title="Preview"
                            >
                                <Eye className="size-3.5" />
                            </a>
                        )}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                    Ganti file PDF
                </button>
                <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </div>
        );
    }

    // Empty drop zone
    return (
        <div>
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed py-6 px-4 text-center transition-colors ${
                    isDragOver
                        ? 'border-blue-500 bg-blue-50/60 dark:border-blue-400 dark:bg-blue-950/30'
                        : 'border-neutral-200 bg-neutral-50/30 hover:border-blue-400 hover:bg-blue-50/30 dark:border-neutral-700 dark:bg-neutral-900/20'
                }`}
            >
                <div className={`flex size-10 items-center justify-center rounded-xl ${isDragOver ? 'bg-blue-100 text-blue-600' : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'}`}>
                    <Upload className="size-5" />
                </div>
                <div>
                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Drop file PDF di sini atau <span className="text-blue-600 dark:text-blue-400">klik untuk browse</span>
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Hanya format PDF, maks. 20 MB</p>
                </div>
            </div>
            <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
        </div>
    );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function Pengajuan() {
    const { auth, submissions, stats, chartData, availableModules, flash, trainingTypes, jenisKebutuhanOptions, bahasaPengantarOptions } = usePage<PengajuanProps>().props;
    const role = auth?.user?.role ?? 'User';
    const isProcessor = ['Admin', 'Staf PD'].includes(role);

    const trainingTypeList = trainingTypes || [
        "Regulasi & Kepatuhan",
        "Teknis Laboratorium",
        "Sertifikasi & Auditor",
        "Manajerial & Kepemimpinan",
        "Teknis Produksi",
        "Supply Chain & Logistik",
        "K3 & Keamanan",
        "Pengembangan SDM",
        "Lainnya"
    ];

    const jenisKebutuhanList = jenisKebutuhanOptions || [
        "Pelatihan Inhouse",
        "Pelatihan Internal",
        "Seminar"
    ];

    const bahasaPengantarList = bahasaPengantarOptions || [
        "Indonesia",
        "English",
        "Arab",
        "Mandarin"
    ];

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [typeFilter, setTypeFilter] = useState('Semua Tipe');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editItem, setEditItem] = useState<SubmissionItem | null>(null);
    const [deleteItem, setDeleteItem] = useState<SubmissionItem | null>(null);
    const [detailItem, setDetailItem] = useState<SubmissionItem | null>(null);
    const [uploadItem, setUploadItem] = useState<SubmissionItem | null>(null);

    // Helper for validating needs date (14 days in future)
    const isDateValid = (dateStr: string) => {
        if (!dateStr) return true;
        const selectedDate = new Date(dateStr);
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 14);
        minDate.setHours(0, 0, 0, 0);
        return selectedDate >= minDate;
    };

    // Create form — using FormData compatible approach via router.post
    const [createFile, setCreateFile] = useState<File | null>(null);
    const [createData, setCreateData] = useState({
        type: role === 'User' ? 'Kebutuhan Khusus' : 'Modul Baru',
        title: '',
        unit: '',
        description: '',
        deadline: '',
        priority: 'Medium',
        related_module_id: '',
        program: '',
        language: 'Indonesia',
        training_days: '',
        revision_reason: '',
        // Kebutuhan Khusus fields
        jenis_kebutuhan: '',
        nama_instansi: '',
        judul_program: '',
        jam_khusus: '',
        pre_post_test: 'Tidak',
        keterangan_kebutuhan: '',
    });
    const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
    const [createProcessing, setCreateProcessing] = useState(false);

    // Edit form
    const [editFile, setEditFile] = useState<File | null>(null);
    const editForm = useForm({
        type: 'Modul Baru' as string,
        title: '',
        unit: '',
        description: '',
        deadline: '',
        priority: 'Medium' as string,
        status: 'Baru' as string,
        related_module_id: '' as string | number,
        program: '',
        language: 'Indonesia',
        training_days: '' as string | number,
        revision_reason: '',
        // Kebutuhan Khusus fields
        jenis_kebutuhan: '',
        nama_instansi: '',
        judul_program: '',
        jam_khusus: '',
        pre_post_test: 'Tidak',
        keterangan_kebutuhan: '',
        // Admin processing fields
        link_modul: '',
        tanggal_realisasi: '',
        tanggal_kebutuhan_baru: '',
        reject_reason: '',
    });

    // Standalone file upload
    const [standaloneFile, setStandaloneFile] = useState<File | null>(null);
    const [uploadProcessing, setUploadProcessing] = useState(false);

    // Filter
    const filteredSubmissions = useMemo(() => {
        return submissions.filter((s) => {
            const matchSearch =
                s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.applicant.toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === 'Semua Status' || s.status === statusFilter;
            const matchType = typeFilter === 'Semua Tipe' || s.type === typeFilter;
            return matchSearch && matchStatus && matchType;
        });
    }, [submissions, searchQuery, statusFilter, typeFilter]);

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentItems = filteredSubmissions.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

    const handleResetFilters = () => {
        setSearchQuery('');
        setStatusFilter('Semua Status');
        setTypeFilter('Semua Tipe');
        setCurrentPage(1);
    };

    // Create submission (multipart form)
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        // Front-end validation for file upload in Revisi Modul
        if (createData.type === 'Revisi Modul' && !createFile) {
            setCreateErrors({
                ...createErrors,
                file: 'Dokumen PDF wajib dilampirkan untuk revisi modul.',
            });
            return;
        }

        // Front-end validation for deadline in Kebutuhan Khusus
        if (createData.type === 'Kebutuhan Khusus' && !isDateValid(createData.deadline)) {
            setCreateErrors({
                ...createErrors,
                deadline: 'Tanggal kebutuhan khusus minimal harus 14 hari dari hari ini.',
            });
            return;
        }

        setCreateProcessing(true);
        const formData = new FormData();
        formData.append('type', createData.type);
        
        if (createData.type === 'Kebutuhan Khusus') {
            formData.append('title', createData.judul_program);
            formData.append('jenis_kebutuhan', createData.jenis_kebutuhan);
            formData.append('nama_instansi', createData.nama_instansi);
            formData.append('judul_program', createData.judul_program);
            formData.append('jam_khusus', createData.jam_khusus);
            formData.append('pre_post_test', createData.pre_post_test);
            formData.append('keterangan_kebutuhan', createData.keterangan_kebutuhan);
            formData.append('language', createData.language);
        } else {
            formData.append('title', createData.title);
            formData.append('program', createData.program);
            formData.append('language', createData.language);
            formData.append('training_days', createData.training_days);
            formData.append('revision_reason', createData.revision_reason);
        }
        
        formData.append('description', createData.description);
        formData.append('deadline', createData.deadline);
        formData.append('priority', createData.priority);
        if (createData.related_module_id) formData.append('related_module_id', createData.related_module_id);
        if (createFile) formData.append('file', createFile);

        router.post(route('pengajuan.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                setCreateData({
                    type: role === 'User' ? 'Kebutuhan Khusus' : 'Modul Baru',
                    title: '',
                    unit: '',
                    description: '',
                    deadline: '',
                    priority: 'Medium',
                    related_module_id: '',
                    program: '',
                    language: 'Indonesia',
                    training_days: '',
                    revision_reason: '',
                    // Kebutuhan Khusus fields
                    jenis_kebutuhan: '',
                    nama_instansi: '',
                    judul_program: '',
                    jam_khusus: '',
                    pre_post_test: 'Tidak',
                    keterangan_kebutuhan: '',
                });
                setCreateFile(null);
                setCreateErrors({});
            },
            onError: (errors) => setCreateErrors(errors),
            onFinish: () => setCreateProcessing(false),
        });
    };

    const handleRelatedModuleChange = (moduleIdStr: string) => {
        const moduleId = parseInt(moduleIdStr, 10);
        const selectedModule = availableModules.find(m => m.id === moduleId);
        if (selectedModule) {
            setCreateData({
                ...createData,
                related_module_id: moduleIdStr,
                title: selectedModule.title, // Autofill Judul Modul
            });
        } else {
            setCreateData({
                ...createData,
                related_module_id: '',
            });
        }
    };

    const handleEditRelatedModuleChange = (moduleIdStr: string) => {
        const moduleId = parseInt(moduleIdStr, 10);
        const selectedModule = availableModules.find(m => m.id === moduleId);
        if (selectedModule) {
            editForm.setData((data) => ({
                ...data,
                related_module_id: moduleIdStr,
                title: selectedModule.title, // Autofill Judul Modul
            }));
        } else {
            editForm.setData('related_module_id', '');
        }
    };

    const openEdit = (item: SubmissionItem) => {
        editForm.setData({
            type: item.type,
            title: item.title,
            unit: '', // Hapus unit kerja
            description: item.description,
            deadline: item.deadline || '',
            priority: item.priority,
            status: item.status,
            related_module_id: item.related_module_id ?? '',
            program: item.program ?? '',
            language: item.language ?? 'Indonesia',
            training_days: item.training_days ?? '',
            revision_reason: item.revision_reason ?? '',
            // Kebutuhan Khusus
            jenis_kebutuhan: item.jenis_kebutuhan ?? '',
            nama_instansi: item.nama_instansi ?? '',
            judul_program: item.judul_program ?? '',
            jam_khusus: item.jam_khusus ?? '',
            pre_post_test: item.pre_post_test ?? 'Tidak',
            keterangan_kebutuhan: item.keterangan_kebutuhan ?? '',
            // Admin processing fields
            link_modul: item.link_modul ?? '',
            tanggal_realisasi: item.tanggal_realisasi ?? '',
            tanggal_kebutuhan_baru: item.tanggal_kebutuhan_baru ?? '',
            reject_reason: item.rejectReason ?? '',
        });
        setEditFile(null);
        setEditItem(item);
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editItem) return;

        // Front-end validation for file upload in Revisi Modul
        if (editForm.data.type === 'Revisi Modul' && !editFile && !editItem.fileName) {
            editForm.setError('file', 'Dokumen PDF wajib dilampirkan untuk revisi modul.');
            return;
        }

        // Front-end validation for deadline in Kebutuhan Khusus
        const isProcessor = ['Admin', 'Staf PD'].includes(role);
        if (!isProcessor && editForm.data.type === 'Kebutuhan Khusus' && !isDateValid(editForm.data.deadline)) {
            editForm.setError('deadline', 'Tanggal kebutuhan khusus minimal harus 14 hari dari hari ini.');
            return;
        }

        // Front-end validation for processor panel (Kebutuhan Khusus)
        if (isProcessor && editForm.data.type === 'Kebutuhan Khusus') {
            editForm.clearErrors();
            let hasError = false;
            if (editForm.data.status === 'Selesai') {
                if (!editForm.data.link_modul) {
                    editForm.setError('link_modul', 'Link Modul wajib diisi jika status Selesai.');
                    hasError = true;
                }
                if (!editForm.data.tanggal_realisasi) {
                    editForm.setError('tanggal_realisasi', 'Tanggal Realisasi wajib diisi jika status Selesai.');
                    hasError = true;
                }
                if (!editForm.data.reject_reason) {
                    editForm.setError('reject_reason', 'Keterangan wajib diisi.');
                    hasError = true;
                }
            } else if (editForm.data.status === 'Hold') {
                if (!editForm.data.tanggal_kebutuhan_baru) {
                    editForm.setError('tanggal_kebutuhan_baru', 'Tanggal Kebutuhan Baru wajib diisi jika status Hold.');
                    hasError = true;
                }
                if (!editForm.data.reject_reason) {
                    editForm.setError('reject_reason', 'Keterangan wajib diisi.');
                    hasError = true;
                }
            } else if (editForm.data.status === 'Batal') {
                if (!editForm.data.reject_reason) {
                    editForm.setError('reject_reason', 'Keterangan wajib diisi.');
                    hasError = true;
                }
            }
            if (hasError) return;
        }

        if (editFile) {
            // Use FormData when file is attached
            const formData = new FormData();
            Object.entries(editForm.data).forEach(([k, v]) => {
                if (v !== null && v !== undefined) {
                    formData.append(k, v as string);
                }
            });
            formData.append('file', editFile);
            formData.append('_method', 'PUT');

            router.post(route('pengajuan.update', editItem.dbId), formData, {
                forceFormData: true,
                onSuccess: () => setEditItem(null),
            });
        } else {
            editForm.put(route('pengajuan.update', editItem.dbId), {
                onSuccess: () => setEditItem(null),
            });
        }
    };

    const handleDelete = () => {
        if (!deleteItem) return;
        router.delete(route('pengajuan.destroy', deleteItem.dbId), {
            onSuccess: () => setDeleteItem(null),
        });
    };

    const handleSubmitForApproval = (item: SubmissionItem) => {
        router.post(route('pengajuan.submit', item.dbId));
    };

    const handleStandaloneUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadItem || !standaloneFile) return;
        setUploadProcessing(true);
        const formData = new FormData();
        formData.append('file', standaloneFile);
        router.post(route('pengajuan.upload', uploadItem.dbId), formData, {
            forceFormData: true,
            onSuccess: () => { setUploadItem(null); setStandaloneFile(null); },
            onFinish: () => setUploadProcessing(false),
        });
    };

    const canEdit = (status: string) => ['Baru', 'Drafting'].includes(status);
    const canDelete = (status: string) => status === 'Baru';
    const canSubmit = (status: string) => ['Baru', 'Drafting'].includes(status);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengajuan Modul" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Pengajuan Modul</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {role === 'User' ? 'Pantau dan ajukan permintaan modul pelatihan.' : 'Kelola seluruh pengajuan modul dari pengguna.'}
                    </p>
                </div>

                {/* Flash */}
                {flash?.message && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400">
                        <CheckCircle2 className="size-4.5" />
                        <span>{flash.message}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
                        <AlertTriangle className="size-4.5" />
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Completed Requests Notification Banner */}
                {role === 'User' && submissions.some(item => item.status === 'Selesai' && item.type === 'Kebutuhan Khusus') && (
                    <div className="space-y-2.5">
                        {submissions.filter(item => item.status === 'Selesai' && item.type === 'Kebutuhan Khusus').map(item => (
                            <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-medium text-emerald-800 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                                        <CheckCircle2 className="size-4.5" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Pengajuan modul dengan nomor {item.id} telah selesai.</p>
                                        <p className="text-emerald-600/95 dark:text-emerald-400/90 mt-0.5 font-normal font-sans">
                                            Silakan klik tombol detail atau gunakan tombol di samping untuk melihat link modulnya.
                                        </p>
                                    </div>
                                </div>
                                {item.link_modul && (
                                    <a
                                        href={item.link_modul}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline dark:text-emerald-300 bg-white/80 dark:bg-emerald-950/50 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 font-sans"
                                    >
                                        <ArrowUpRight className="size-3.5" />
                                        Buka Modul
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* LEFT: Table (3/4) */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                            {[
                                { label: 'Total', value: stats.total, icon: FileText, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400' },
                                { label: 'Baru', value: stats.baru, icon: Plus, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400' },
                                { label: 'Drafting', value: stats.drafting, icon: Edit3, color: 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800' },
                                { label: 'Menunggu', value: stats.waiting, icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400' },
                                { label: 'Selesai', value: stats.finished, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400' },
                                { label: 'Ditolak', value: stats.ditolak, icon: XCircle, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400' },
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
                        <Card className="overflow-hidden border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            {/* Filters */}
                            <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 dark:border-neutral-800 md:flex-row md:items-center md:justify-between">
                                <div className="relative max-w-sm flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                        placeholder="Cari judul, ID, atau pengaju..."
                                        className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                    />
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs text-neutral-700 outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                                        <option value="Semua Status">Semua Status</option>
                                        <option value="Baru">Baru</option>
                                        <option value="Drafting">Drafting</option>
                                        <option value="Menunggu Approval">Menunggu Approval</option>
                                        <option value="Selesai">Selesai</option>
                                        <option value="Ditolak">Ditolak</option>
                                    </select>
                                    <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }} className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs text-neutral-700 outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                                        <option value="Semua Tipe">Semua Tipe</option>
                                        <option value="Modul Baru">Modul Baru</option>
                                        <option value="Revisi Modul">Revisi Modul</option>
                                        <option value="Kebutuhan Khusus">Kebutuhan Khusus</option>
                                    </select>
                                    <Button onClick={handleResetFilters} variant="outline" size="sm" className="h-9 rounded-lg border-neutral-200 px-3 text-xs font-semibold dark:border-neutral-800">
                                        <RefreshCw className="mr-1.5 size-3.5" /> Reset
                                    </Button>
                                    <Button onClick={() => setIsCreateOpen(true)} size="sm" className="h-9 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700">
                                        <Plus className="mr-1.5 size-4" /> Ajukan Modul
                                    </Button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[820px] border-collapse text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                            <th className="px-5 py-3.5">No. Pengajuan</th>
                                            <th className="px-5 py-3.5">Judul</th>
                                            <th className="px-5 py-3.5">Tipe</th>
                                            <th className="px-5 py-3.5">Pengaju</th>
                                            <th className="px-5 py-3.5">Deadline</th>
                                            <th className="px-5 py-3.5">Prioritas</th>
                                            <th className="px-5 py-3.5">File</th>
                                            <th className="px-5 py-3.5">Status</th>
                                            <th className="w-20 px-5 py-3.5 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {currentItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="py-10 text-center font-medium text-neutral-400 dark:text-neutral-500">
                                                    Belum ada pengajuan.
                                                </td>
                                            </tr>
                                        ) : (
                                            currentItems.map((item) => (
                                                <tr key={item.id} className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20">
                                                    <td className="whitespace-nowrap px-5 py-4 font-mono text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                                                        {item.id}
                                                    </td>
                                                    <td className="max-w-[160px] px-5 py-4">
                                                        <button
                                                            onClick={() => setDetailItem(item)}
                                                            className="line-clamp-2 text-left font-semibold leading-tight text-neutral-900 hover:text-blue-600 dark:text-neutral-100 dark:hover:text-blue-400"
                                                        >
                                                            {item.title}
                                                        </button>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <Badge variant="secondary" className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${item.type === 'Modul Baru' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300' : item.type === 'Revisi Modul' ? 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300' : 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300'}`}>
                                                            {item.type}
                                                        </Badge>
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4 font-medium text-neutral-600 dark:text-neutral-400">{item.applicant}</td>
                                                    <td className="whitespace-nowrap px-5 py-4 font-medium text-neutral-500 dark:text-neutral-400">{item.deadline}</td>
                                                    <td className="px-5 py-4">
                                                        <Badge className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[item.priority] ?? ''}`}>
                                                            {item.priority}
                                                        </Badge>
                                                    </td>
                                                    {/* File column */}
                                                    <td className="px-5 py-4">
                                                        {item.fileName ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="flex size-6 items-center justify-center rounded bg-red-50 text-red-500 dark:bg-red-950/30">
                                                                    <FileText className="size-3.5" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="max-w-[90px] truncate text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">{item.fileName}</p>
                                                                    {item.fileSize && <p className="text-[9px] text-neutral-400">{item.fileSize}</p>}
                                                                </div>
                                                                {item.fileUrl && (
                                                                    <a
                                                                        href={item.fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex size-5 items-center justify-center rounded text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                                                        title="Lihat/Download"
                                                                    >
                                                                        <Eye className="size-3" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            item.type === 'Kebutuhan Khusus' ? (
                                                                <span className="text-[10px] text-neutral-400 font-medium font-sans italic">Tidak ada dokumen</span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => { setUploadItem(item); setStandaloneFile(null); }}
                                                                    className="flex items-center gap-1 text-[10px] font-semibold text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400"
                                                                >
                                                                    <Upload className="size-3" />
                                                                    Upload
                                                                </button>
                                                            )
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <Badge className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[item.status] ?? ''}`}>
                                                            {item.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="mx-auto flex size-7 items-center justify-center rounded text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800">
                                                                    <MoreVertical className="size-3.5" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48 text-xs">
                                                                <DropdownMenuItem onClick={() => setDetailItem(item)} className="cursor-pointer font-medium">
                                                                    <ArrowUpRight className="mr-2 size-3.5" /> Lihat Detail
                                                                </DropdownMenuItem>
                                                                {item.type !== 'Kebutuhan Khusus' && (
                                                                    <DropdownMenuItem onClick={() => { setUploadItem(item); setStandaloneFile(null); }} className="cursor-pointer font-medium text-blue-600">
                                                                        <Upload className="mr-2 size-3.5" /> Upload / Ganti File
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {canSubmit(item.status) && (
                                                                    <DropdownMenuItem onClick={() => handleSubmitForApproval(item)} className="cursor-pointer font-medium text-amber-600">
                                                                        <Send className="mr-2 size-3.5" /> Kirim ke Approval
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {canEdit(item.status) && (
                                                                    <DropdownMenuItem onClick={() => openEdit(item)} className="cursor-pointer font-medium">
                                                                        <Edit3 className="mr-2 size-3.5" /> Edit Pengajuan
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {canDelete(item.status) && (
                                                                    <DropdownMenuItem onClick={() => setDeleteItem(item)} className="cursor-pointer font-medium text-rose-600">
                                                                        <Trash2 className="mr-2 size-3.5" /> Hapus
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
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
                                    Menampilkan {indexOfFirst + 1}–{Math.min(indexOfLast, filteredSubmissions.length)} dari {filteredSubmissions.length} pengajuan
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

                    {/* RIGHT: Chart */}
                    <div className="space-y-6 lg:col-span-1">
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Distribusi Status</h3>
                            </div>
                            <CardContent className="p-5">
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={chartData} layout="vertical" barSize={10}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                        <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={100} />
                                        <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e5e7eb' }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                                <div className="mt-4 space-y-2 text-xs">
                                    {chartData.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                                                <span className="font-medium text-neutral-500 dark:text-neutral-400">{item.name}</span>
                                            </div>
                                            <span className="font-bold text-neutral-800 dark:text-neutral-200">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* ── CREATE DIALOG ── */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Ajukan Modul Pelatihan</DialogTitle>
                        <DialogDescription>Isi detail pengajuan modul. Nomor pengajuan dibuat otomatis.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="mt-2 space-y-4">
                        {/* Informasi Umum Container */}
                        <div className="grid grid-cols-2 gap-3 p-3.5 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                            <div className="col-span-2 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Informasi Umum</div>
                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Nama Pengaju</label>
                                <input type="text" value={auth?.user?.name ?? '-'} disabled className="w-full rounded-lg border border-neutral-200 bg-neutral-100/80 dark:bg-neutral-800/80 px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 outline-none" />
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Tanggal Pengajuan</label>
                                <input type="text" value={new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} disabled className="w-full rounded-lg border border-neutral-200 bg-neutral-100/80 dark:bg-neutral-800/80 px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 outline-none" />
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Tipe Modul *</label>
                                <select
                                    value={createData.type}
                                    onChange={(e) => setCreateData({ ...createData, type: e.target.value })}
                                    disabled={role === 'User'}
                                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 disabled:opacity-75 disabled:bg-neutral-100 dark:disabled:bg-neutral-800"
                                >
                                    {role !== 'User' && <option value="Modul Baru">Modul Baru</option>}
                                    {role !== 'User' && <option value="Revisi Modul">Revisi Modul</option>}
                                    <option value="Kebutuhan Khusus">Kebutuhan Khusus</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Tanggal Kebutuhan *</label>
                                <input type="date" value={createData.deadline} onChange={(e) => setCreateData({ ...createData, deadline: e.target.value })} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" required />
                                {createData.type === 'Kebutuhan Khusus' && !isDateValid(createData.deadline) && createData.deadline && (
                                    <p className="mt-1 text-[9px] text-rose-500 font-sans flex items-center gap-0.5 leading-none">
                                        <AlertTriangle className="size-2.5 flex-shrink-0" />
                                        Harus minimal 14 hari ke depan.
                                    </p>
                                )}
                                {createErrors.deadline && <p className="mt-1 text-[10px] text-rose-500 font-sans">{createErrors.deadline}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Prioritas *</label>
                                <select value={createData.priority} onChange={(e) => setCreateData({ ...createData, priority: e.target.value })} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                        </div>

                        {/* ── CONDITIONAL SECTION: MODUL BARU ── */}
                        {createData.type === 'Modul Baru' && (
                            <div className="space-y-3 p-3.5 border border-blue-100 dark:border-blue-900/40 rounded-xl bg-blue-50/20 dark:bg-blue-950/5">
                                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Detail Modul Baru</div>
                                
                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Kategori / Jenis Pelatihan *</label>
                                    <select value={createData.program} onChange={(e) => setCreateData({ ...createData, program: e.target.value })} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" required={createData.type === 'Modul Baru'}>
                                        <option value="">-- Pilih Jenis Pelatihan --</option>
                                        {trainingTypeList.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Judul Modul *</label>
                                    <input type="text" value={createData.title} onChange={(e) => setCreateData({ ...createData, title: e.target.value })} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" placeholder="e.g. Interpretasi Sistem ISO" required />
                                    {createErrors.title && <p className="mt-1 text-xs text-rose-500">{createErrors.title}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Bahasa Pelatihan *</label>
                                        <select value={createData.language} onChange={(e) => setCreateData({ ...createData, language: e.target.value })} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                                            <option value="Indonesia">Indonesia</option>
                                            <option value="English">English</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Jumlah Hari Pelatihan</label>
                                        <input type="number" min="1" value={createData.training_days} onChange={(e) => setCreateData({ ...createData, training_days: e.target.value })} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" placeholder="e.g. 3" />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Deskripsi / Permintaan Khusus</label>
                                    <textarea value={createData.description} onChange={(e) => setCreateData({ ...createData, description: e.target.value })} rows={3} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" placeholder="Jelaskan kebutuhan khusus atau background permintaan..." />
                                </div>
                            </div>
                        )}

                        {/* ── CONDITIONAL SECTION: REVISI MODUL (MODUL EXISTING) ── */}
                        {createData.type === 'Revisi Modul' && (
                            <div className="space-y-3 p-3.5 border border-violet-100 dark:border-violet-900/40 rounded-xl bg-violet-50/20 dark:bg-violet-950/5">
                                <div className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">Detail Modul Existing / Revisi</div>
                                
                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Pilih Modul Existing *</label>
                                    <select value={createData.related_module_id} onChange={(e) => handleRelatedModuleChange(e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" required={createData.type === 'Revisi Modul'}>
                                        <option value="">-- Pilih Modul --</option>
                                        {availableModules.map((m) => (
                                            <option key={m.id} value={m.id}>{m.code} — {m.title} (Rev. {m.revision})</option>
                                        ))}
                                    </select>
                                </div>

                                {createData.related_module_id && (
                                    <div className="grid grid-cols-3 gap-2 bg-neutral-100/60 dark:bg-neutral-800/60 p-2.5 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50 text-[11px] text-neutral-600 dark:text-neutral-400">
                                        <div>
                                            <span className="font-bold block text-[9px] uppercase tracking-wider text-neutral-400">Kode Modul</span>
                                            <span>{availableModules.find(m => m.id === parseInt(createData.related_module_id, 10))?.code}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="font-bold block text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Judul & Versi Aktif</span>
                                            <span className="line-clamp-1">{availableModules.find(m => m.id === parseInt(createData.related_module_id, 10))?.title} (Rev. {availableModules.find(m => m.id === parseInt(createData.related_module_id, 10))?.revision})</span>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Alasan Perubahan *</label>
                                    <textarea value={createData.revision_reason} onChange={(e) => setCreateData({ ...createData, revision_reason: e.target.value })} rows={2} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" placeholder="Alasan mengapa modul ini perlu direvisi..." required={createData.type === 'Revisi Modul'} />
                                </div>

                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Detail Perubahan *</label>
                                    <textarea value={createData.description} onChange={(e) => setCreateData({ ...createData, description: e.target.value })} rows={3} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" placeholder="Rincian materi/bab yang diubah..." required={createData.type === 'Revisi Modul'} />
                                </div>
                            </div>
                        )}

                        {/* ── CONDITIONAL SECTION: KEBUTUHAN KHUSUS ── */}
                        {createData.type === 'Kebutuhan Khusus' && (
                            <div className="space-y-3 p-3.5 border border-teal-100 dark:border-teal-900/40 rounded-xl bg-teal-50/20 dark:bg-teal-950/5">
                                <div className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">Detail Kebutuhan Khusus</div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Jenis Kebutuhan *</label>
                                        <select
                                            value={createData.jenis_kebutuhan}
                                            onChange={(e) => setCreateData({ ...createData, jenis_kebutuhan: e.target.value, nama_instansi: e.target.value !== 'Pelatihan Inhouse' ? '' : createData.nama_instansi })}
                                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                            required
                                        >
                                            <option value="">-- Pilih Jenis --</option>
                                            {jenisKebutuhanList.map((jk) => (
                                                <option key={jk} value={jk}>{jk}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Bahasa Pengantar *</label>
                                        <select
                                            value={createData.language}
                                            onChange={(e) => setCreateData({ ...createData, language: e.target.value })}
                                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                            required
                                        >
                                            <option value="">-- Pilih Bahasa --</option>
                                            {bahasaPengantarList.map((bp) => (
                                                <option key={bp} value={bp}>{bp}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {createData.jenis_kebutuhan === 'Pelatihan Inhouse' && (
                                    <div className="transition-all">
                                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Nama Instansi *</label>
                                        <input
                                            type="text"
                                            value={createData.nama_instansi}
                                            onChange={(e) => setCreateData({ ...createData, nama_instansi: e.target.value })}
                                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                            placeholder="e.g. PT Maju Bersama"
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Judul Program / Modul *</label>
                                    <input
                                        type="text"
                                        value={createData.judul_program}
                                        onChange={(e) => setCreateData({ ...createData, judul_program: e.target.value, title: e.target.value })}
                                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                        placeholder="e.g. Inhouse Training ISO 9001:2015"
                                        required
                                    />
                                    {createErrors.title && <p className="mt-1 text-xs text-rose-500">{createErrors.title}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Jam Khusus / Jumlah Jam *</label>
                                        <input
                                            type="text"
                                            value={createData.jam_khusus}
                                            onChange={(e) => setCreateData({ ...createData, jam_khusus: e.target.value })}
                                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                            placeholder="e.g. 16 Jam Pelatihan"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Pre & Post Test *</label>
                                        <select
                                            value={createData.pre_post_test}
                                            onChange={(e) => setCreateData({ ...createData, pre_post_test: e.target.value })}
                                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                            required
                                        >
                                            <option value="Ya">Ya</option>
                                            <option value="Tidak">Tidak</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Keterangan / Detail Kebutuhan</label>
                                    <textarea
                                        value={createData.description}
                                        onChange={(e) => setCreateData({ ...createData, description: e.target.value, keterangan_kebutuhan: e.target.value })}
                                        rows={4}
                                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                        placeholder="Jelaskan detail kebutuhan modul atau program yang diminta..."
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* File Upload */}
                        {(createData.type === 'Modul Baru' || createData.type === 'Revisi Modul') && (
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-neutral-600 dark:text-neutral-400 font-sans">
                                    Dokumen PDF {createData.type === 'Revisi Modul' ? <span className="text-rose-500">*</span> : <span className="font-normal text-neutral-400">(opsional)</span>}
                                </label>
                                <FileDropZone onFileSelect={setCreateFile} selectedFile={createFile} />
                                {createErrors.file && <p className="mt-1 text-xs text-rose-500 font-sans">{createErrors.file}</p>}
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => { setIsCreateOpen(false); setCreateFile(null); }}>Batal</Button>
                            <Button type="submit" disabled={createProcessing} className="bg-blue-600 text-white hover:bg-blue-700">
                                {createProcessing ? 'Menyimpan...' : 'Kirim Pengajuan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── UPLOAD FILE DIALOG ── */}
            <Dialog open={!!uploadItem} onOpenChange={(open) => { if (!open) { setUploadItem(null); setStandaloneFile(null); } }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload Dokumen PDF</DialogTitle>
                        <DialogDescription>
                            Upload atau ganti file dokumen untuk pengajuan <span className="font-bold">{uploadItem?.id}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleStandaloneUpload} className="mt-2 space-y-4">
                        <FileDropZone
                            onFileSelect={setStandaloneFile}
                            selectedFile={standaloneFile}
                            existingFileName={uploadItem?.fileName}
                            existingFileSize={uploadItem?.fileSize}
                            existingFileUrl={uploadItem?.fileUrl}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setUploadItem(null); setStandaloneFile(null); }}>Batal</Button>
                            <Button type="submit" disabled={!standaloneFile || uploadProcessing} className="bg-blue-600 text-white hover:bg-blue-700">
                                {uploadProcessing ? 'Mengupload...' : 'Upload File'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── EDIT DIALOG ── */}
            <Dialog open={!!editItem} onOpenChange={(open) => { if (!open) setEditItem(null); }}>
                <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Pengajuan</DialogTitle>
                        <DialogDescription>Perbarui informasi. Hanya status Baru/Drafting yang dapat diedit.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="mt-2 space-y-4">
                        {/* Informasi Umum Container */}
                        <div className="grid grid-cols-2 gap-3 p-3.5 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                            <div className="col-span-2 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Informasi Umum</div>
                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Nama Pengaju</label>
                                <input type="text" value={editItem?.applicant ?? '-'} disabled className="w-full rounded-lg border border-neutral-200 bg-neutral-100/80 dark:bg-neutral-800/80 px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 outline-none" />
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Tanggal Pengajuan</label>
                                <input type="text" value={editItem?.submissionDate ?? '-'} disabled className="w-full rounded-lg border border-neutral-200 bg-neutral-100/80 dark:bg-neutral-800/80 px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 outline-none" />
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Tipe Modul *</label>
                                <select
                                    value={editForm.data.type}
                                    onChange={(e) => editForm.setData('type', e.target.value)}
                                    disabled={role === 'User'}
                                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 disabled:opacity-75 disabled:bg-neutral-100 dark:disabled:bg-neutral-800"
                                >
                                    {role !== 'User' && <option value="Modul Baru">Modul Baru</option>}
                                    {role !== 'User' && <option value="Revisi Modul">Revisi Modul</option>}
                                    <option value="Kebutuhan Khusus">Kebutuhan Khusus</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Tanggal Kebutuhan *</label>
                                <input type="date" value={editForm.data.deadline} onChange={(e) => editForm.setData('deadline', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" required />
                                {editForm.data.type === 'Kebutuhan Khusus' && !['Admin', 'Staf PD'].includes(role) && !isDateValid(editForm.data.deadline) && editForm.data.deadline && (
                                    <p className="mt-1 text-[9px] text-rose-500 font-sans flex items-center gap-0.5 leading-none">
                                        <AlertTriangle className="size-2.5 flex-shrink-0" />
                                        Harus minimal 14 hari ke depan.
                                    </p>
                                )}
                                {editForm.errors.deadline && <p className="mt-1 text-[10px] text-rose-500 font-sans">{editForm.errors.deadline}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Prioritas *</label>
                                <select value={editForm.data.priority} onChange={(e) => editForm.setData('priority', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                        </div>

                        {/* ── CONDITIONAL SECTION: MODUL BARU ── */}
                        {editForm.data.type === 'Modul Baru' && (
                            <div className="space-y-3 p-3.5 border border-blue-100 dark:border-blue-900/40 rounded-xl bg-blue-50/20 dark:bg-blue-950/5">
                                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Detail Modul Baru</div>
                                
                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Kategori / Jenis Pelatihan *</label>
                                    <select value={editForm.data.program} onChange={(e) => editForm.setData('program', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" required={editForm.data.type === 'Modul Baru'}>
                                        <option value="">-- Pilih Jenis Pelatihan --</option>
                                        {trainingTypeList.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Judul Modul *</label>
                                    <input type="text" value={editForm.data.title} onChange={(e) => editForm.setData('title', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" required />
                                    {editForm.errors.title && <p className="mt-1 text-xs text-rose-500">{editForm.errors.title}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Bahasa Pelatihan *</label>
                                        <select value={editForm.data.language} onChange={(e) => editForm.setData('language', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                                            <option value="Indonesia">Indonesia</option>
                                            <option value="English">English</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Jumlah Hari Pelatihan</label>
                                        <input type="number" min="1" value={editForm.data.training_days} onChange={(e) => editForm.setData('training_days', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 font-sans" />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Deskripsi / Permintaan Khusus</label>
                                    <textarea value={editForm.data.description} onChange={(e) => editForm.setData('description', e.target.value)} rows={3} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 font-sans" />
                                </div>
                            </div>
                        )}

                        {/* ── CONDITIONAL SECTION: REVISI MODUL (MODUL EXISTING) ── */}
                        {editForm.data.type === 'Revisi Modul' && (
                            <div className="space-y-3 p-3.5 border border-violet-100 dark:border-violet-900/40 rounded-xl bg-violet-50/20 dark:bg-violet-950/5">
                                <div className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">Detail Modul Existing / Revisi</div>
                                
                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Pilih Modul Existing *</label>
                                    <select value={editForm.data.related_module_id} onChange={(e) => handleEditRelatedModuleChange(e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" required={editForm.data.type === 'Revisi Modul'}>
                                        <option value="">-- Pilih Modul --</option>
                                        {availableModules.map((m) => (
                                            <option key={m.id} value={m.id}>{m.code} — {m.title} (Rev. {m.revision})</option>
                                        ))}
                                    </select>
                                </div>

                                {editForm.data.related_module_id && (
                                    <div className="grid grid-cols-3 gap-2 bg-neutral-100/60 dark:bg-neutral-800/60 p-2.5 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50 text-[11px] text-neutral-600 dark:text-neutral-400">
                                        <div>
                                            <span className="font-bold block text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Kode Modul</span>
                                            <span>{availableModules.find(m => m.id === parseInt(editForm.data.related_module_id as string, 10))?.code}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="font-bold block text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Judul & Versi Aktif</span>
                                            <span className="line-clamp-1">{availableModules.find(m => m.id === parseInt(editForm.data.related_module_id as string, 10))?.title} (Rev. {availableModules.find(m => m.id === parseInt(editForm.data.related_module_id as string, 10))?.revision})</span>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Alasan Perubahan *</label>
                                    <textarea value={editForm.data.revision_reason} onChange={(e) => editForm.setData('revision_reason', e.target.value)} rows={2} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 font-sans" required={editForm.data.type === 'Revisi Modul'} />
                                </div>

                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Detail Perubahan *</label>
                                    <textarea value={editForm.data.description} onChange={(e) => editForm.setData('description', e.target.value)} rows={3} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 font-sans" required={editForm.data.type === 'Revisi Modul'} />
                                </div>
                            </div>
                        )}

                        {/* ── CONDITIONAL SECTION: KEBUTUHAN KHUSUS ── */}
                        {editForm.data.type === 'Kebutuhan Khusus' && (
                            <div className="space-y-4">
                                <div className="space-y-3 p-3.5 border border-teal-100 dark:border-teal-900/40 rounded-xl bg-teal-50/20 dark:bg-teal-950/5">
                                    <div className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">Detail Kebutuhan Khusus</div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Jenis Kebutuhan *</label>
                                            <select
                                                value={editForm.data.jenis_kebutuhan}
                                                onChange={(e) => editForm.setData((data) => ({ ...data, jenis_kebutuhan: e.target.value, nama_instansi: e.target.value !== 'Pelatihan Inhouse' ? '' : data.nama_instansi }))}
                                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                                required
                                                disabled={isProcessor} // disable input if processing
                                            >
                                                <option value="">-- Pilih Jenis --</option>
                                                {jenisKebutuhanList.map((jk) => (
                                                    <option key={jk} value={jk}>{jk}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Bahasa Pengantar *</label>
                                            <select
                                                value={editForm.data.language}
                                                onChange={(e) => editForm.setData('language', e.target.value)}
                                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                                required
                                                disabled={isProcessor}
                                            >
                                                <option value="">-- Pilih Bahasa --</option>
                                                {bahasaPengantarList.map((bp) => (
                                                    <option key={bp} value={bp}>{bp}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {editForm.data.jenis_kebutuhan === 'Pelatihan Inhouse' && (
                                        <div className="transition-all">
                                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Nama Instansi *</label>
                                            <input
                                                type="text"
                                                value={editForm.data.nama_instansi}
                                                onChange={(e) => editForm.setData('nama_instansi', e.target.value)}
                                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                                placeholder="e.g. PT Maju Bersama"
                                                required
                                                disabled={isProcessor}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Judul Program / Modul *</label>
                                        <input
                                            type="text"
                                            value={editForm.data.judul_program}
                                            onChange={(e) => editForm.setData((data) => ({ ...data, judul_program: e.target.value, title: e.target.value }))}
                                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                            placeholder="e.g. Inhouse Training ISO 9001:2015"
                                            required
                                            disabled={isProcessor}
                                        />
                                        {editForm.errors.title && <p className="mt-1 text-xs text-rose-500">{editForm.errors.title}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Jam Khusus / Jumlah Jam *</label>
                                            <input
                                                type="text"
                                                value={editForm.data.jam_khusus}
                                                onChange={(e) => editForm.setData('jam_khusus', e.target.value)}
                                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                                placeholder="e.g. 16 Jam Pelatihan"
                                                required
                                                disabled={isProcessor}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Pre & Post Test *</label>
                                            <select
                                                value={editForm.data.pre_post_test}
                                                onChange={(e) => editForm.setData('pre_post_test', e.target.value)}
                                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                                required
                                                disabled={isProcessor}
                                            >
                                                <option value="Ya">Ya</option>
                                                <option value="Tidak">Tidak</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Keterangan / Detail Kebutuhan</label>
                                        <textarea
                                            value={editForm.data.description}
                                            onChange={(e) => editForm.setData((data) => ({ ...data, description: e.target.value, keterangan_kebutuhan: e.target.value }))}
                                            rows={4}
                                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                            placeholder="Jelaskan detail kebutuhan modul atau program yang diminta..."
                                            required
                                            disabled={isProcessor}
                                        />
                                    </div>
                                </div>

                                {/* Processing panel by Admin or Staf PD */}
                                {isProcessor && (
                                    <div className="space-y-3 p-3.5 border border-purple-200 dark:border-purple-900/40 rounded-xl bg-purple-50/20 dark:bg-purple-950/5">
                                        <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">Penyelesaian Pengajuan (Admin / Staf PD)</div>
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans font-semibold text-purple-600 dark:text-purple-400">Status Proses *</label>
                                                <select
                                                    value={editForm.data.status}
                                                    onChange={(e) => editForm.setData('status', e.target.value)}
                                                    className="w-full rounded-lg border border-purple-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-purple-500 dark:border-purple-800 dark:bg-neutral-900 dark:text-neutral-100"
                                                    required
                                                >
                                                    <option value="Baru">Baru</option>
                                                    <option value="Drafting">Drafting</option>
                                                    <option value="Menunggu Approval">Menunggu Approval</option>
                                                    <option value="Selesai">Selesai (Done)</option>
                                                    <option value="Batal">Batal (Cancel)</option>
                                                    <option value="Hold">Hold</option>
                                                </select>
                                                {editForm.errors.status && <p className="mt-1 text-[10px] text-rose-500 font-sans">{editForm.errors.status}</p>}
                                            </div>
                                            
                                            <div>
                                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans font-semibold">Tanggal Realisasi {editForm.data.status === 'Selesai' && <span className="text-rose-500">*</span>}</label>
                                                <input
                                                    type="date"
                                                    value={editForm.data.tanggal_realisasi}
                                                    onChange={(e) => editForm.setData('tanggal_realisasi', e.target.value)}
                                                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                                    required={editForm.data.status === 'Selesai'}
                                                />
                                                {editForm.errors.tanggal_realisasi && <p className="mt-1 text-[10px] text-rose-500 font-sans">{editForm.errors.tanggal_realisasi}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans font-semibold">Link Modul / Dokumen {editForm.data.status === 'Selesai' && <span className="text-rose-500">*</span>}</label>
                                                <input
                                                    type="url"
                                                    value={editForm.data.link_modul}
                                                    onChange={(e) => editForm.setData('link_modul', e.target.value)}
                                                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                                    placeholder="https://drive.google.com/..."
                                                    required={editForm.data.status === 'Selesai'}
                                                />
                                                {editForm.errors.link_modul && <p className="mt-1 text-[10px] text-rose-500 font-sans">{editForm.errors.link_modul}</p>}
                                            </div>
                                            
                                            <div>
                                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans font-semibold">Tanggal Kebutuhan Baru {editForm.data.status === 'Hold' && <span className="text-rose-500">*</span>}</label>
                                                <input
                                                    type="date"
                                                    value={editForm.data.tanggal_kebutuhan_baru}
                                                    onChange={(e) => editForm.setData('tanggal_kebutuhan_baru', e.target.value)}
                                                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                                    required={editForm.data.status === 'Hold'}
                                                />
                                                {editForm.errors.tanggal_kebutuhan_baru && <p className="mt-1 text-[10px] text-rose-500 font-sans">{editForm.errors.tanggal_kebutuhan_baru}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans font-semibold">Keterangan Proses / Alasan Hold/Cancel <span className="text-rose-500">*</span></label>
                                            <textarea
                                                value={editForm.data.reject_reason}
                                                onChange={(e) => editForm.setData('reject_reason', e.target.value)}
                                                rows={2}
                                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                                placeholder="Keterangan tambahan dari admin mengenai hasil pemrosesan..."
                                                required
                                            />
                                            {editForm.errors.reject_reason && <p className="mt-1 text-[10px] text-rose-500 font-sans">{editForm.errors.reject_reason}</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* File Upload */}
                        {(editForm.data.type === 'Modul Baru' || editForm.data.type === 'Revisi Modul') && (
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-neutral-600 dark:text-neutral-400 font-sans">
                                    Ganti Dokumen PDF {editForm.data.type === 'Revisi Modul' ? <span className="text-rose-500">*</span> : <span className="font-normal text-neutral-400">(opsional)</span>}
                                </label>
                                <FileDropZone
                                    onFileSelect={setEditFile}
                                    selectedFile={editFile}
                                    existingFileName={editItem?.fileName}
                                    existingFileSize={editItem?.fileSize}
                                    existingFileUrl={editItem?.fileUrl}
                                />
                                {editForm.errors.file && <p className="mt-1 text-xs text-rose-500 font-sans">{editForm.errors.file}</p>}
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setEditItem(null)}>Batal</Button>
                            <Button type="submit" disabled={editForm.processing} className="bg-blue-600 text-white hover:bg-blue-700">
                                {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── DELETE DIALOG ── */}
            <Dialog open={!!deleteItem} onOpenChange={(open) => { if (!open) setDeleteItem(null); }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Hapus Pengajuan</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus pengajuan <span className="font-bold text-neutral-900 dark:text-neutral-100">{deleteItem?.id}</span>? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteItem(null)}>Batal</Button>
                        <Button onClick={handleDelete} className="bg-rose-600 text-white hover:bg-rose-700">Hapus</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── DETAIL DIALOG ── */}
            <Dialog open={!!detailItem} onOpenChange={(open) => { if (!open) setDetailItem(null); }}>
                <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="line-clamp-2 pr-6 leading-snug">{detailItem?.title}</DialogTitle>
                        <DialogDescription className="font-mono text-[11px] font-semibold text-neutral-400">{detailItem?.id}</DialogDescription>
                    </DialogHeader>
                    {detailItem && (
                        <div className="mt-2 space-y-5 text-xs text-neutral-600 dark:text-neutral-400">
                            {/* Informasi Utama Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 p-3.5 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-neutral-100 dark:border-neutral-800/80">
                                <div>
                                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Tipe Pengajuan</p>
                                    <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[10px] font-semibold bg-neutral-200/60 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                                        {detailItem.type}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Prioritas</p>
                                    <Badge className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[detailItem.priority]}`}>{detailItem.priority}</Badge>
                                </div>
                                <div>
                                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Status</p>
                                    <Badge className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[detailItem.status]}`}>{detailItem.status}</Badge>
                                </div>
                                <div>
                                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Pengaju</p>
                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{detailItem.applicant}</p>
                                </div>
                                <div>
                                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Tanggal Pengajuan</p>
                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{detailItem.submissionDate}</p>
                                </div>
                                <div>
                                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Tanggal Kebutuhan</p>
                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{detailItem.deadlineFormatted ?? detailItem.deadline}</p>
                                </div>
                            </div>

                            {/* ── DETAILS FOR MODUL BARU ── */}
                            {detailItem.type === 'Modul Baru' && (
                                <div className="space-y-3 p-3.5 border border-blue-100 dark:border-blue-900/40 rounded-xl bg-blue-50/10 dark:bg-blue-950/5">
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 font-sans">Kategori / Jenis Pelatihan</p>
                                            <p className="font-semibold text-neutral-800 dark:text-neutral-200">{detailItem.program ?? '-'}</p>
                                        </div>
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 font-sans">Bahasa Pelatihan</p>
                                            <p className="font-semibold text-neutral-800 dark:text-neutral-200">{detailItem.language ?? 'Indonesia'}</p>
                                        </div>
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 font-sans">Jumlah Hari Pelatihan</p>
                                            <p className="font-semibold text-neutral-800 dark:text-neutral-200">{detailItem.training_days ? `${detailItem.training_days} Hari` : '-'}</p>
                                        </div>
                                    </div>
                                    {detailItem.description && (
                                        <div className="pt-2 border-t border-blue-100 dark:border-blue-900/20">
                                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 font-sans">Deskripsi / Permintaan Khusus</p>
                                            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal whitespace-pre-line">{detailItem.description}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── DETAILS FOR REVISI MODUL ── */}
                            {detailItem.type === 'Revisi Modul' && (
                                <div className="space-y-3 p-3.5 border border-violet-100 dark:border-violet-900/40 rounded-xl bg-violet-50/10 dark:bg-violet-950/5">
                                    {detailItem.related_module_id && (
                                        <div>
                                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-violet-500 dark:text-violet-400 font-sans">Modul Existing yang Direvisi</p>
                                            <div className="bg-white dark:bg-neutral-950 p-2.5 rounded-lg border border-neutral-200/50 dark:border-neutral-800/80">
                                                <span className="font-mono font-bold text-[10px] text-neutral-500 block">{detailItem.relatedModuleCode}</span>
                                                <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-xs block">{detailItem.relatedModuleTitle}</span>
                                                <span className="text-[10px] text-neutral-400 block mt-0.5 font-sans">Versi Aktif: Rev. {detailItem.relatedModuleRevision}</span>
                                            </div>
                                        </div>
                                    )}
                                    {detailItem.revision_reason && (
                                        <div className="pt-2 border-t border-violet-100 dark:border-violet-900/20">
                                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-violet-500 dark:text-violet-400 font-sans">Alasan Perubahan</p>
                                            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal whitespace-pre-line">{detailItem.revision_reason}</p>
                                        </div>
                                    )}
                                    {detailItem.description && (
                                        <div className="pt-2 border-t border-violet-100 dark:border-violet-900/20">
                                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-violet-500 dark:text-violet-400 font-sans">Detail Perubahan</p>
                                            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal whitespace-pre-line">{detailItem.description}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── DETAILS FOR KEBUTUHAN KHUSUS ── */}
                            {detailItem.type === 'Kebutuhan Khusus' && (
                                <div className="space-y-4">
                                    <div className="space-y-3 p-3.5 border border-teal-100 dark:border-teal-900/40 rounded-xl bg-teal-50/10 dark:bg-teal-950/5">
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-500 dark:text-teal-400 font-sans">Jenis Kebutuhan</p>
                                                <p className="font-semibold text-neutral-800 dark:text-neutral-200">{detailItem.jenis_kebutuhan ?? '-'}</p>
                                            </div>
                                            <div>
                                                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-500 dark:text-teal-400 font-sans">Bahasa Pengantar</p>
                                                <p className="font-semibold text-neutral-800 dark:text-neutral-200">{detailItem.language ?? 'Indonesia'}</p>
                                            </div>
                                            <div>
                                                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-500 dark:text-teal-400 font-sans">Jam Khusus / Jumlah Jam</p>
                                                <p className="font-semibold text-neutral-800 dark:text-neutral-200">{detailItem.jam_khusus ?? '-'}</p>
                                            </div>
                                            <div>
                                                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-500 dark:text-teal-400 font-sans">Pre & Post Test</p>
                                                <p className="font-semibold text-neutral-800 dark:text-neutral-200">{detailItem.pre_post_test ?? 'Tidak'}</p>
                                            </div>
                                            {detailItem.jenis_kebutuhan === 'Pelatihan Inhouse' && detailItem.nama_instansi && (
                                                <div className="col-span-2">
                                                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-500 dark:text-teal-400 font-sans">Nama Instansi</p>
                                                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">{detailItem.nama_instansi}</p>
                                                </div>
                                            )}
                                        </div>
                                        {detailItem.description && (
                                            <div className="pt-2 border-t border-teal-100 dark:border-teal-900/20">
                                                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-teal-500 dark:text-teal-400 font-sans">Deskripsi / Detail Kebutuhan</p>
                                                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal whitespace-pre-line">{detailItem.description}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Admin processing results */}
                                    {(detailItem.link_modul || detailItem.tanggal_realisasi || detailItem.tanggal_kebutuhan_baru || ['Selesai', 'Batal', 'Hold'].includes(detailItem.status)) && (
                                        <div className="space-y-3 p-3.5 border border-purple-100 dark:border-purple-900/40 rounded-xl bg-purple-50/10 dark:bg-purple-950/5">
                                            <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1 font-semibold">Penyelesaian Pengajuan (Admin/Staf PD)</div>
                                            
                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                {detailItem.tanggal_realisasi && (
                                                    <div>
                                                        <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400 font-sans">Tanggal Realisasi</p>
                                                        <p className="font-semibold text-neutral-800 dark:text-neutral-200">{detailItem.tanggal_realisasi_formatted}</p>
                                                    </div>
                                                )}
                                                {detailItem.tanggal_kebutuhan_baru && (
                                                    <div>
                                                        <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400 font-sans font-semibold">Tanggal Kebutuhan Baru</p>
                                                        <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-purple-600 dark:text-purple-400">{detailItem.tanggal_kebutuhan_baru_formatted}</p>
                                                    </div>
                                                )}
                                                {detailItem.link_modul && (
                                                    <div className="col-span-2">
                                                        <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400 font-sans">Link Modul / Dokumen</p>
                                                        <a
                                                            href={detailItem.link_modul}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1 mt-0.5"
                                                        >
                                                            <ArrowUpRight className="size-3.5" />
                                                            Buka Dokumen Modul
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            {detailItem.rejectReason && (
                                                <div className="pt-2 border-t border-purple-100 dark:border-purple-900/20">
                                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400 font-sans">Keterangan Proses / Alasan</p>
                                                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal whitespace-pre-line">{detailItem.rejectReason}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* File attachment section */}
                            {detailItem.fileName ? (
                                <div>
                                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">Dokumen PDF</p>
                                    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
                                        <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-950/30">
                                            <FileText className="size-4.5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-semibold text-neutral-800 dark:text-neutral-200">{detailItem.fileName}</p>
                                            {detailItem.fileSize && <p className="text-[10px] text-neutral-400">{detailItem.fileSize}</p>}
                                        </div>
                                        {detailItem.fileUrl && (
                                            <div className="flex items-center gap-1">
                                                <a href={detailItem.fileUrl} target="_blank" rel="noopener noreferrer" className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-blue-50 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:text-blue-400" title="Lihat PDF">
                                                    <Eye className="size-3.5" />
                                                </a>
                                                <a href={detailItem.fileUrl} download className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-emerald-50 hover:text-emerald-600 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:text-emerald-400" title="Download">
                                                    <Download className="size-3.5" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/30 p-3.5 text-center dark:border-neutral-800">
                                    <p className="text-xs text-neutral-400 font-sans">Belum ada dokumen PDF yang diupload.</p>
                                </div>
                            )}

                            {detailItem.rejectReason && detailItem.type !== 'Kebutuhan Khusus' && (
                                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 dark:border-rose-900/40 dark:bg-rose-950/20">
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 font-sans">Alasan Penolakan dari Manager</p>
                                    <p className="text-xs leading-relaxed text-rose-600 dark:text-rose-300 font-medium whitespace-pre-line">{detailItem.rejectReason}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailItem(null)}>Tutup</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
