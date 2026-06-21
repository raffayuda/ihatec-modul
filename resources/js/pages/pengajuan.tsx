import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
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
    Loader2,
    CheckSquare,
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
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permintaan Modul Khusus',
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
    process: number;
    waiting: number;
    done: number;
    hold: number;
    cancel: number;
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
    isDriveConnected?: boolean;
    flash?: {
        message?: string;
        error?: string;
    };
}

const STATUS_COLORS: Record<string, string> = {
    Baru: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
    Drafting: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
    'Menunggu Approval': 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    Selesai: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    Ditolak: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    Batal: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    Hold: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
};

// Status display labels for Permintaan Modul Khusus (Kebutuhan Khusus)
const STATUS_LABELS: Record<string, string> = {
    Baru: 'Process',
    Drafting: 'Process',
    'Menunggu Approval': 'Menunggu Approval',
    Selesai: 'Done',
    Ditolak: 'Cancel',
    Batal: 'Cancel',
    Hold: 'Hold',
};

const PRIORITY_COLORS: Record<string, string> = {
    High: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300',
    Medium: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
    Low: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
};

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
    const { auth, submissions, stats, chartData, availableModules, flash, trainingTypes, jenisKebutuhanOptions, bahasaPengantarOptions, isDriveConnected = true } = usePage<PengajuanProps>().props;
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

    const [dismissedNotifications, setDismissedNotifications] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('dismissed_notifications');
                return saved ? JSON.parse(saved) : [];
            } catch (e) {
                return [];
            }
        }
        return [];
    });

    const dismissNotification = (id: string) => {
        const updated = [...dismissedNotifications, id];
        setDismissedNotifications(updated);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('dismissed_notifications', JSON.stringify(updated));
            } catch (e) {
                console.error(e);
            }
        }
    };

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editItem, setEditItem] = useState<SubmissionItem | null>(null);
    const [deleteItem, setDeleteItem] = useState<SubmissionItem | null>(null);
    const [detailItem, setDetailItem] = useState<SubmissionItem | null>(null);
    const [uploadItem, setUploadItem] = useState<SubmissionItem | null>(null);
    const [prosesItem, setProsesItem] = useState<SubmissionItem | null>(null);

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
        type: 'Kebutuhan Khusus',
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
        type: 'Kebutuhan Khusus' as string,
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

    // Staf PD / Admin processing form
    const prosesForm = useForm({
        status: 'Baru' as string,
        link_modul: '',
        tanggal_realisasi: '',
        tanggal_kebutuhan_baru: '',
        reject_reason: '',
    });

    // Standalone file upload
    const [standaloneFile, setStandaloneFile] = useState<File | null>(null);
    const [uploadProcessing, setUploadProcessing] = useState(false);

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

    // Selected Submission for Right Column Preview
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('');

    // If selectedSubmissionId is empty, use the first submission code if any
    const activeSelectedId = useMemo(() => {
        if (selectedSubmissionId) return selectedSubmissionId;
        return submissions.length > 0 ? submissions[0].id : '';
    }, [submissions, selectedSubmissionId]);

    const selectedSubmission = useMemo(() => {
        return submissions.find(s => s.id === activeSelectedId) || submissions[0] || null;
    }, [submissions, activeSelectedId]);

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

        // Front-end validation for Kebutuhan Khusus
        if (createData.type === 'Kebutuhan Khusus') {
            const errors: Record<string, string> = {};
            
            if (!createData.jenis_kebutuhan) {
                errors.jenis_kebutuhan = 'Jenis Kebutuhan Modul wajib dipilih.';
            }
            if (!createData.language) {
                errors.language = 'Bahasa Pengantar wajib dipilih.';
            }
            if (!createData.judul_program) {
                errors.judul_program = 'Judul Program Pelatihan wajib diisi.';
            }
            if (!createData.description) {
                errors.description = 'Detail Permintaan Modul Khusus wajib diisi.';
            }
            if (!createData.deadline) {
                errors.deadline = 'Tanggal Kebutuhan wajib diisi.';
            } else if (!isDateValid(createData.deadline)) {
                errors.deadline = 'Tanggal kebutuhan khusus minimal harus 14 hari dari hari ini.';
            }

            if (createData.jenis_kebutuhan === 'Pelatihan Inhouse') {
                if (!createData.nama_instansi) {
                    errors.nama_instansi = 'Nama Instansi wajib diisi untuk Pelatihan Inhouse.';
                }

                if (!createData.jam_khusus) {
                    errors.jam_khusus = 'Request Jam Khusus Pelatihan wajib diisi untuk Pelatihan Inhouse.';
                }
                if (!createData.pre_post_test) {
                    errors.pre_post_test = 'Permintaan Pre & Post Test wajib diisi untuk Pelatihan Inhouse.';
                }
            } else if (['Pelatihan Internal', 'Seminar'].includes(createData.jenis_kebutuhan)) {
                if (!createData.keterangan_kebutuhan) {
                    errors.keterangan_kebutuhan = 'Keterangan Kebutuhan wajib diisi untuk Pelatihan Internal / Seminar.';
                }
            }

            if (Object.keys(errors).length > 0) {
                setCreateErrors(errors);
                return;
            }
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
                    type: 'Kebutuhan Khusus',
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
            link_modul: item.link_modul || '',
            tanggal_realisasi: item.tanggal_realisasi || '',
            tanggal_kebutuhan_baru: item.tanggal_kebutuhan_baru || '',
            reject_reason: item.rejectReason || '',
        });
        setEditFile(null);
        setEditItem(item);
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editItem) return;

        editForm.clearErrors();

        // Front-end validation for Kebutuhan Khusus detail edits
        const isAdmin = role.toLowerCase() === 'admin';
        if (!isAdmin && editForm.data.type === 'Kebutuhan Khusus') {
            let hasError = false;
            
            if (!editForm.data.jenis_kebutuhan) {
                editForm.setError('jenis_kebutuhan', 'Jenis Kebutuhan Modul wajib dipilih.');
                hasError = true;
            }
            if (!editForm.data.language) {
                editForm.setError('language', 'Bahasa Pengantar wajib dipilih.');
                hasError = true;
            }
            if (!editForm.data.judul_program) {
                editForm.setError('judul_program', 'Judul Program Pelatihan wajib diisi.');
                hasError = true;
            }
            if (!editForm.data.description) {
                editForm.setError('description', 'Detail Permintaan Modul Khusus wajib diisi.');
                hasError = true;
            }
            if (!editForm.data.deadline) {
                editForm.setError('deadline', 'Tanggal Kebutuhan wajib diisi.');
                hasError = true;
            } else if (!isDateValid(editForm.data.deadline)) {
                editForm.setError('deadline', 'Tanggal kebutuhan khusus minimal harus 14 hari dari hari ini.');
                hasError = true;
            }

            if (editForm.data.jenis_kebutuhan === 'Pelatihan Inhouse') {
                if (!editForm.data.nama_instansi) {
                    editForm.setError('nama_instansi', 'Nama Instansi wajib diisi untuk Pelatihan Inhouse.');
                    hasError = true;
                }

                if (!editForm.data.jam_khusus) {
                    editForm.setError('jam_khusus', 'Request Jam Khusus Pelatihan wajib diisi untuk Pelatihan Inhouse.');
                    hasError = true;
                }
                if (!editForm.data.pre_post_test) {
                    editForm.setError('pre_post_test', 'Permintaan Pre & Post Test wajib diisi untuk Pelatihan Inhouse.');
                    hasError = true;
                }
            } else if (['Pelatihan Internal', 'Seminar'].includes(editForm.data.jenis_kebutuhan)) {
                if (!editForm.data.keterangan_kebutuhan) {
                    editForm.setError('keterangan_kebutuhan', 'Keterangan Kebutuhan wajib diisi untuk Pelatihan Internal / Seminar.');
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

    const openProses = (item: SubmissionItem) => {
        prosesForm.setData({
            status: ['Baru', 'Drafting'].includes(item.status) ? 'Baru' : item.status,
            link_modul: item.link_modul || '',
            tanggal_realisasi: item.tanggal_realisasi || '',
            tanggal_kebutuhan_baru: item.tanggal_kebutuhan_baru || '',
            reject_reason: item.rejectReason || '',
        });
        prosesForm.clearErrors();
        setProsesItem(item);
    };

    const handleProses = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prosesItem) return;

        prosesForm.clearErrors();
        let hasError = false;

        if (prosesForm.data.status === 'Selesai') {
            if (!prosesForm.data.link_modul) {
                prosesForm.setError('link_modul', 'Link Modul wajib diisi jika status Done.');
                hasError = true;
            }
            if (!prosesForm.data.tanggal_realisasi) {
                prosesForm.setError('tanggal_realisasi', 'Tanggal Realisasi wajib diisi jika status Done.');
                hasError = true;
            }
            if (!prosesForm.data.reject_reason) {
                prosesForm.setError('reject_reason', 'Keterangan wajib diisi.');
                hasError = true;
            }
        } else if (prosesForm.data.status === 'Hold') {
            if (!prosesForm.data.tanggal_kebutuhan_baru) {
                prosesForm.setError('tanggal_kebutuhan_baru', 'Tanggal Kebutuhan Baru wajib diisi jika status Hold.');
                hasError = true;
            }
            if (!prosesForm.data.reject_reason) {
                prosesForm.setError('reject_reason', 'Keterangan wajib diisi.');
                hasError = true;
            }
        } else if (prosesForm.data.status === 'Batal') {
            if (!prosesForm.data.reject_reason) {
                prosesForm.setError('reject_reason', 'Keterangan wajib diisi.');
                hasError = true;
            }
        }

        if (hasError) return;

        prosesForm.put(route('pengajuan.update', prosesItem.dbId), {
            onSuccess: () => setProsesItem(null),
        });
    };

    const handleCancelByUser = (item: SubmissionItem) => {
        if (confirm('Yakin ingin membatalkan pengajuan ini?')) {
            router.put(route('pengajuan.update', item.dbId), {
                status: 'Batal',
                reject_reason: 'Dibatalkan oleh Pengaju',
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

    const canEdit = (status: string) => status === 'Baru' || status === 'Drafting';
    const canDelete = (status: string) => status === 'Baru';
    const canSubmit = (status: string) => status === 'Baru' || status === 'Drafting';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permintaan Modul Khusus" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Permintaan Modul Khusus</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {role === 'User' ? 'Ajukan dan pantau permintaan modul khusus Anda.' : 'Kelola seluruh permintaan modul khusus dari pengguna.'}
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
                            <strong>Pemberitahuan:</strong> Akun Google Drive belum terhubung. Anda masih dapat mengajukan draf/permintaan modul, tetapi pengajuan tersebut tidak akan bisa disetujui (Approve) oleh Manager PD sampai akun Google Drive terhubung. Harap hubungi Administrator untuk menautkan akun Google Drive.
                        </div>
                    </div>
                )}

                {/* Completed Requests Notification Banner */}
                {role === 'User' && submissions.some(item => item.status === 'Selesai' && item.type === 'Kebutuhan Khusus' && !dismissedNotifications.includes(item.id)) && (
                    <div className="space-y-2.5">
                        {submissions.filter(item => item.status === 'Selesai' && item.type === 'Kebutuhan Khusus' && !dismissedNotifications.includes(item.id)).map(item => (
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
                                <div className="flex items-center gap-2">
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
                                    <button
                                        type="button"
                                        onClick={() => dismissNotification(item.id)}
                                        className="flex size-7 items-center justify-center rounded-lg border border-emerald-200 hover:bg-emerald-100 text-emerald-600 dark:border-emerald-900/50 dark:hover:bg-emerald-950 font-sans cursor-pointer"
                                        title="Tutup"
                                    >
                                        <XIcon className="size-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="space-y-6">

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                            {[
                                { label: 'Total', value: stats.total, icon: FileText, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900' },
                                { label: 'Process', value: stats.process, icon: RefreshCw, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900' },
                                { label: 'Menunggu', value: stats.waiting, icon: Clock, color: 'text-purple-650 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-200 dark:border-purple-900' },
                                { label: 'Done', value: stats.done, icon: CheckCircle2, color: 'text-emerald-650 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' },
                                { label: 'Hold', value: stats.hold, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900' },
                                { label: 'Cancel', value: stats.cancel, icon: XCircle, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900' },
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
                                    <div className="w-40">
                                        <SearchableSelect
                                            value={statusFilter}
                                            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                                            options={[
                                                { value: 'Semua Status', label: 'Semua Status' },
                                                { value: 'Baru', label: 'Process' },
                                                { value: 'Menunggu Approval', label: 'Menunggu Approval' },
                                                { value: 'Selesai', label: 'Done' },
                                                { value: 'Hold', label: 'Hold' },
                                                { value: 'Batal', label: 'Cancel' }
                                            ]}
                                        />
                                    </div>
                                    <div className="w-44">
                                        <SearchableSelect
                                            value={typeFilter}
                                            onChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}
                                            options={[
                                                'Semua Tipe',
                                                'Kebutuhan Khusus'
                                            ]}
                                        />
                                    </div>
                                    <Button onClick={handleResetFilters} variant="outline" size="sm" className="h-9 rounded-lg border-neutral-200 px-3 text-xs font-semibold dark:border-neutral-800">
                                        <RefreshCw className="mr-1.5 size-3.5" /> Reset
                                    </Button>
                                    {role == 'User' && (
                                        <Button onClick={() => setIsCreateOpen(true)} size="sm" className="h-9 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700">
                                            <Plus className="mr-1.5 size-4" /> Ajukan Permintaan
                                        </Button>
                                    )}
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
                                                <tr
                                                    key={item.id}
                                                    onClick={() => setSelectedSubmissionId(item.id)}
                                                    className={`cursor-pointer transition-colors ${
                                                        activeSelectedId === item.id
                                                            ? 'bg-blue-50/30 hover:bg-blue-50/40 dark:bg-blue-950/10 dark:hover:bg-blue-950/15'
                                                            : 'hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10'
                                                    }`}
                                                >
                                                    <td className="whitespace-nowrap px-5 py-4 font-mono text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                                                        {item.id}
                                                    </td>
                                                    <td className="max-w-[160px] px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => setDetailItem(item)}
                                                            className="line-clamp-2 text-left font-semibold leading-tight text-neutral-900 hover:text-blue-600 dark:text-neutral-100 dark:hover:text-blue-400 cursor-pointer"
                                                        >
                                                            {item.title}
                                                        </button>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <Badge variant="outline" className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${item.type === 'Modul Baru' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300' : item.type === 'Revisi Modul' ? 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300' : 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300'}`}>
                                                            {item.type}
                                                        </Badge>
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4 font-medium text-neutral-600 dark:text-neutral-400">{item.applicant}</td>
                                                    <td className="whitespace-nowrap px-5 py-4 font-medium text-neutral-500 dark:text-neutral-400">{item.deadline}</td>
                                                    <td className="px-5 py-4">
                                                        <Badge variant="outline" className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[item.priority] ?? ''}`}>
                                                            {item.priority}
                                                        </Badge>
                                                    </td>
                                                    {/* File column */}
                                                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
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
                                                        ) : item.link_modul ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="flex size-6 items-center justify-center rounded bg-blue-50 text-blue-500 dark:bg-blue-950/30">
                                                                    <ArrowUpRight className="size-3.5" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <a
                                                                        href={item.link_modul}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-[10px] font-semibold text-blue-600 hover:underline dark:text-blue-400 block truncate max-w-[120px]"
                                                                    >
                                                                        Buka Link Modul
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            item.type === 'Kebutuhan Khusus' ? (
                                                                <span className="text-[10px] text-neutral-400 font-medium font-sans italic">Tidak ada dokumen</span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => { setUploadItem(item); setStandaloneFile(null); }}
                                                                    className="flex items-center gap-1 text-[10px] font-semibold text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                                                                >
                                                                    <Upload className="size-3" />
                                                                    Upload
                                                                </button>
                                                            )
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <Badge variant="outline" className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[item.status] ?? ''}`}>
                                                            {STATUS_LABELS[item.status] ?? item.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="mx-auto flex size-7 items-center justify-center rounded text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 cursor-pointer">
                                                                    <MoreVertical className="size-3.5" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48 text-xs">
                                                                <DropdownMenuItem onClick={() => setDetailItem(item)} className="cursor-pointer font-medium">
                                                                    <ArrowUpRight className="mr-2 size-3.5" /> Lihat Detail
                                                                </DropdownMenuItem>
                                                                {/* {item.status === 'Selesai' && item.link_modul && (
                                                                    <DropdownMenuItem onClick={() => window.open(item.link_modul!, '_blank')} className="cursor-pointer font-medium text-emerald-600">
                                                                        <ArrowUpRight className="mr-2 size-3.5" /> Lihat Modul
                                                                    </DropdownMenuItem>
                                                                )} */}
                                                                {/* Staf PD & Admin Actions */}
                                                                {['Staf PD', 'Admin'].includes(role) && (
                                                                    <DropdownMenuItem onClick={() => openProses(item)} className="cursor-pointer font-medium text-purple-600">
                                                                        <CheckSquare className="mr-2 size-3.5" /> Proses Pengajuan
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {/* User / Admin Edit Actions */}
                                                                {((role === 'User' && canEdit(item.status)) || role === 'Admin') && (
                                                                    <DropdownMenuItem onClick={() => openEdit(item)} className="cursor-pointer font-medium text-blue-600">
                                                                        <Edit3 className="mr-2 size-3.5" /> Edit Pengajuan
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {/* User Cancel Action */}
                                                                {role === 'User' && canEdit(item.status) && (
                                                                    <DropdownMenuItem onClick={() => handleCancelByUser(item)} className="cursor-pointer font-medium text-rose-600">
                                                                        <XIcon className="mr-2 size-3.5" /> Batalkan Pengajuan
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {/* Admin Delete Action */}
                                                                {role === 'Admin' && (
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
                                <SearchableSelect value={createData.type}
                                    onChange={(val) => setCreateData({ ...createData, type: val })}
                                    disabled={true}
                                    options={['Kebutuhan Khusus']}
                                />
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
                                <SearchableSelect value={createData.priority} onChange={(val) => setCreateData({ ...createData, priority: val })} options={['High', 'Medium', 'Low']} />
                            </div>
                        </div>

                        {/* ── CONDITIONAL SECTION: MODUL BARU ── */}
                        {createData.type === 'Modul Baru' && (
                            <div className="space-y-3 p-3.5 border border-blue-100 dark:border-blue-900/40 rounded-xl bg-blue-50/20 dark:bg-blue-950/5">
                                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Detail Modul Baru</div>
                                
                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Kategori / Jenis Pelatihan *</label>
                                    <SearchableSelect value={createData.program} onChange={(val) => setCreateData({ ...createData, program: val })} options={trainingTypeList} nullLabel="-- Pilih Jenis Pelatihan --" required={createData.type === 'Modul Baru'} />
                                </div>

                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Judul Modul *</label>
                                    <input type="text" value={createData.title} onChange={(e) => setCreateData({ ...createData, title: e.target.value })} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" placeholder="e.g. Interpretasi Sistem ISO" required />
                                    {createErrors.title && <p className="mt-1 text-xs text-rose-500">{createErrors.title}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Bahasa Pelatihan *</label>
                                        <SearchableSelect value={createData.language} onChange={(val) => setCreateData({ ...createData, language: val })} options={['Indonesia', 'English']} />
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
                                    <SearchableSelect value={createData.related_module_id} onChange={(val) => handleRelatedModuleChange(val)} options={availableModules.map(m => ({ value: String(m.id), label: `${m.code} — ${m.title} (Rev. ${m.revision})` }))} nullLabel="-- Pilih Modul --" required={createData.type === 'Revisi Modul'} />
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
                                        <SearchableSelect
                                            value={createData.jenis_kebutuhan}
                                            onChange={(val) => setCreateData({ ...createData, jenis_kebutuhan: val, nama_instansi: val !== 'Pelatihan Inhouse' ? '' : createData.nama_instansi })}
                                            options={jenisKebutuhanList}
                                            nullLabel="-- Pilih Jenis --"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Bahasa Pengantar *</label>
                                        <SearchableSelect
                                            value={createData.language}
                                            onChange={(val) => setCreateData({ ...createData, language: val })}
                                            options={bahasaPengantarList}
                                            nullLabel="-- Pilih Bahasa --"
                                            required
                                        />
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
                                        <SearchableSelect
                                            value={createData.pre_post_test}
                                            onChange={(val) => setCreateData({ ...createData, pre_post_test: val })}
                                            options={['Ya', 'Tidak']}
                                            required
                                        />
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
                                <SearchableSelect
                                    value={editForm.data.type}
                                    onChange={(val) => editForm.setData('type', val)}
                                    disabled={role === 'User'}
                                    options={
                                        role !== 'User'
                                            ? ['Modul Baru', 'Revisi Modul', 'Kebutuhan Khusus']
                                            : ['Kebutuhan Khusus']
                                    }
                                />
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
                                <SearchableSelect value={editForm.data.priority} onChange={(val) => editForm.setData('priority', val)} options={['High', 'Medium', 'Low']} />
                            </div>
                        </div>

                        {/* ── CONDITIONAL SECTION: MODUL BARU ── */}
                        {editForm.data.type === 'Modul Baru' && (
                            <div className="space-y-3 p-3.5 border border-blue-100 dark:border-blue-900/40 rounded-xl bg-blue-50/20 dark:bg-blue-950/5">
                                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Detail Modul Baru</div>
                                
                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Kategori / Jenis Pelatihan *</label>
                                    <SearchableSelect value={editForm.data.program} onChange={(val) => editForm.setData('program', val)} options={trainingTypeList} nullLabel="-- Pilih Jenis Pelatihan --" required={editForm.data.type === 'Modul Baru'} />
                                </div>

                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Judul Modul *</label>
                                    <input type="text" value={editForm.data.title} onChange={(e) => editForm.setData('title', e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" required />
                                    {editForm.errors.title && <p className="mt-1 text-xs text-rose-500">{editForm.errors.title}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Bahasa Pelatihan *</label>
                                        <SearchableSelect value={editForm.data.language} onChange={(val) => editForm.setData('language', val)} options={['Indonesia', 'English']} />
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
                                    <SearchableSelect
                                        value={editForm.data.related_module_id}
                                        onChange={(val) => handleEditRelatedModuleChange(val)}
                                        options={availableModules.map(m => ({ value: String(m.id), label: `${m.code} — ${m.title} (Rev. ${m.revision})` }))}
                                        nullLabel="-- Pilih Modul --"
                                        required={editForm.data.type === 'Revisi Modul'}
                                    />
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
                                            <SearchableSelect
                                                value={editForm.data.jenis_kebutuhan}
                                                onChange={(val) => editForm.setData((data) => ({ ...data, jenis_kebutuhan: val, nama_instansi: val !== 'Pelatihan Inhouse' ? '' : data.nama_instansi }))}
                                                options={jenisKebutuhanList}
                                                nullLabel="-- Pilih Jenis --"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Bahasa Pengantar *</label>
                                            <SearchableSelect
                                                value={editForm.data.language}
                                                onChange={(val) => editForm.setData('language', val)}
                                                options={bahasaPengantarList}
                                                nullLabel="-- Pilih Bahasa --"
                                                required
                                            />
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
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans">Pre & Post Test *</label>
                                            <SearchableSelect
                                                value={editForm.data.pre_post_test}
                                                onChange={(val) => editForm.setData('pre_post_test', val)}
                                                options={['Ya', 'Tidak']}
                                                required
                                            />
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
                                        />
                                    </div>
                                </div>
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

            {/* ── PROSES DIALOG ── */}
            <Dialog open={!!prosesItem} onOpenChange={(open) => { if (!open) setProsesItem(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Proses Pengajuan</DialogTitle>
                        <DialogDescription>
                            Tentukan status dan lengkapi detail penyelesaian untuk pengajuan <span className="font-bold">{prosesItem?.id}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleProses} className="mt-2 space-y-4">
                        <div className="space-y-3 p-3.5 border border-purple-250 dark:border-purple-900/40 rounded-xl bg-purple-50/10 dark:bg-purple-950/5">
                            <div>
                                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 font-sans">Status *</label>
                                <SearchableSelect
                                    value={prosesForm.data.status}
                                    onChange={(val) => {
                                        prosesForm.setData('status', val);
                                        prosesForm.clearErrors();
                                    }}
                                    options={[
                                        { value: 'Baru', label: 'Process' },
                                        { value: 'Selesai', label: 'Done' },
                                        { value: 'Hold', label: 'Hold' },
                                        { value: 'Batal', label: 'Cancel' }
                                    ]}
                                    required
                                />
                                {prosesForm.errors.status && <p className="mt-1 text-[10px] text-rose-500 font-sans">{prosesForm.errors.status}</p>}
                            </div>

                            {/* Link Modul - Visible only if Selesai */}
                            {prosesForm.data.status === 'Selesai' && (
                                <div>
                                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans font-semibold">Link Modul *</label>
                                    <input
                                        type="url"
                                        value={prosesForm.data.link_modul}
                                        onChange={(e) => prosesForm.setData('link_modul', e.target.value)}
                                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                        placeholder="https://drive.google.com/..."
                                        required
                                    />
                                    {prosesForm.errors.link_modul && <p className="mt-1 text-[10px] text-rose-500 font-sans">{prosesForm.errors.link_modul}</p>}
                                </div>
                            )}

                            {/* Tanggal Realisasi - Visible only if Selesai */}
                            {prosesForm.data.status === 'Selesai' && (
                                <div>
                                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans font-semibold">Tanggal Realisasi *</label>
                                    <input
                                        type="date"
                                        value={prosesForm.data.tanggal_realisasi}
                                        onChange={(e) => prosesForm.setData('tanggal_realisasi', e.target.value)}
                                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                        required
                                    />
                                    {prosesForm.errors.tanggal_realisasi && <p className="mt-1 text-[10px] text-rose-500 font-sans">{prosesForm.errors.tanggal_realisasi}</p>}
                                </div>
                            )}

                            {/* Tanggal Kebutuhan Baru - Visible only if Hold */}
                            {prosesForm.data.status === 'Hold' && (
                                <div>
                                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans font-semibold">Tanggal Kebutuhan Baru *</label>
                                    <input
                                        type="date"
                                        value={prosesForm.data.tanggal_kebutuhan_baru}
                                        onChange={(e) => prosesForm.setData('tanggal_kebutuhan_baru', e.target.value)}
                                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                        required
                                    />
                                    {prosesForm.errors.tanggal_kebutuhan_baru && <p className="mt-1 text-[10px] text-rose-500 font-sans">{prosesForm.errors.tanggal_kebutuhan_baru}</p>}
                                </div>
                            )}

                            {/* Keterangan Proses / Alasan - Visible if Selesai, Hold, or Batal */}
                            {['Selesai', 'Hold', 'Batal'].includes(prosesForm.data.status) && (
                                <div>
                                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-sans font-semibold">
                                        Keterangan {prosesForm.data.status !== 'Baru' && <span className="text-rose-500">*</span>}
                                    </label>
                                    <textarea
                                        value={prosesForm.data.reject_reason}
                                        onChange={(e) => prosesForm.setData('reject_reason', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                        placeholder="Keterangan hasil pemrosesan..."
                                        required
                                    />
                                    {prosesForm.errors.reject_reason && <p className="mt-1 text-[10px] text-rose-500 font-sans">{prosesForm.errors.reject_reason}</p>}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setProsesItem(null)}>Batal</Button>
                            <Button type="submit" disabled={prosesForm.processing} className="bg-purple-800 text-white hover:bg-purple-900">
                                {prosesForm.processing ? 'Menyimpan...' : 'Simpan Proses'}
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

                                            {detailItem.rejectReason && detailItem.status !== 'Baru' && detailItem.status !== 'Drafting' && detailItem.status !== 'Menunggu Approval' && (
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
                            ) : !detailItem.link_modul && (
                                <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/30 p-3.5 text-center dark:border-neutral-800">
                                    <p className="text-xs text-neutral-400 font-sans">Belum ada dokumen PDF yang diupload.</p>
                                </div>
                            )}

                            {['Ditolak', 'Batal'].includes(detailItem.status) && detailItem.rejectReason && detailItem.type !== 'Kebutuhan Khusus' && (
                                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 dark:border-rose-900/40 dark:bg-rose-950/20">
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 font-sans">
                                        {detailItem.status === 'Batal' ? 'Alasan Pembatalan' : 'Alasan Penolakan dari Manager'}
                                    </p>
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
