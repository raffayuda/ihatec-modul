import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Plus, Edit3, FileText, Search, ChevronLeft, ChevronRight,
    Check, X, Upload, Eye, Trash2, Clock,
    CheckCircle2, XCircle, ArrowLeft,
} from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter,
} from '@/components/ui/dialog';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface PengajuanKhusus {
    id: string;
    dbId: number;
    detail: string;
    jenisKebutuhan: string;
    bahasaPengantar: string;
    jenisModul: string[];
}

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
    fileModul: File | null;
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
    fileProgram: File | null;
}

interface Submission {
    id: string;
    dbId: number;
    noPerubahan: string;
    tglPengajuan: string;
    jenisPerubahan: string;
    kategoriModul: string;
    referensiKhusus: string;
    detailPermintaan: string;
    keteranganKebutuhan: string;
    jenisKebutuhanPelatihan: string;
    bahasaPengantar: string;
    jenisModul: string[];
    modulRows: ModulRow[];
    programRows: ProgramRow[];
    status: string;
    rejectReason?: string;
    approvedBy?: string;
    approvedAt?: string;
}

interface MasterData {
    jenisPerubahan: string[];
    bahasaPengantar: string[];
    jenisModul: string[];
    kodeProgram: Array<{ code: string; name: string; revision?: string }>;
    modules: Array<{ code: string; title: string; revision?: string }>;
    pengajuanKhusus: PengajuanKhusus[];
}

interface PerubahanModulProps extends SharedData {
    submissions: Submission[];
    masterData: MasterData;
    flash?: { message?: string; error?: string };
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    Baru: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
    Draft: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
    'Menunggu Approval': 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    Disetujui: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    Ditolak: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
};

const JENIS_MODUL_PELATIHAN = ['Modul', 'Lembar Kerja', 'Post Test'];

function makeId() { return Math.random().toString(36).slice(2, 9); }

function emptyModulRow(jenisModulPelatihan: string, kategori: string): ModulRow {
    return {
        id: makeId(), jenisModulPelatihan,
        kodeModul: '', namaModul: '',
        sebelumPerubahan: '', setelahPerubahan: '',
        alasanPerubahan: '', kodeRevisi: kategori === 'Baru' ? '0.0' : '',
        tanggalBerlaku: '', linkModul: '', fileModul: null,
    };
}

function emptyProgramRow(): ProgramRow {
    return {
        id: makeId(), kodeProgram: '', namaProgram: '',
        sebelumPerubahan: '', setelahPerubahan: '',
        alasanPerubahan: '', kodeRevisi: '0.0',
        tanggalBerlaku: '', linkProgram: '', fileProgram: null,
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Perubahan Modul', href: '/perubahan-modul' }];

function Cell({ value, onChange, placeholder, type = 'text', disabled = false }: {
    value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean;
}) {
    return (
        <input
            type={type} value={value} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder} disabled={disabled}
            className="w-full min-w-[80px] rounded border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-700 px-2 py-1 text-[11px] outline-none focus:border-blue-400 disabled:bg-neutral-50 dark:disabled:bg-neutral-800 disabled:text-neutral-400 dark:text-neutral-100"
        />
    );
}

function incrementRevision(current: string): string {
    if (!current) return '0.0';
    if (current === '0.0' || current === '00' || current === '0') return '1.0';
    
    // Check if it's a decimal number like 1.0, 2.5
    if (current.includes('.')) {
        const parts = current.split('.');
        const lastPart = parts[parts.length - 1];
        const num = parseInt(lastPart, 10);
        if (!isNaN(num)) {
            parts[parts.length - 1] = String(num + 1);
            return parts.join('.');
        }
    }
    
    // If it's a pure integer (could have leading zeros, like "00", "01", "09")
    const num = parseInt(current, 10);
    if (!isNaN(num)) {
        const nextNum = num + 1;
        if (current.startsWith('0') && current.length > 1) {
            return String(nextNum).padStart(current.length, '0');
        }
        return String(nextNum);
    }
    
    return current + '_rev';
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function PerubahanModul() {
    const { auth, submissions = [], masterData, flash } = usePage<PerubahanModulProps>().props;
    const role = auth?.user?.role ?? 'Staf PD';
    const roleLower = role.toLowerCase();
    const isProcessor = ['admin', 'staf pd'].includes(roleLower);
    const canApprove = ['admin', 'manager pd'].includes(roleLower);

    const md = masterData ?? {
        jenisPerubahan: ['Modul Baru', 'Revisi Modul', 'Program Baru', 'Revisi Program'],
        bahasaPengantar: ['Indonesia', 'Inggris'],
        jenisModul: ['Modul', 'Lembar Kerja', 'Post Test'],
        kodeProgram: [],
        modules: [],
        pengajuanKhusus: [],
    };

    // ── View mode ───────────────────────────────────
    type ViewMode = 'list' | 'detail';
    const [mode, setMode] = useState<ViewMode>('list');
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    // ── Form modal ──────────────────────────────────
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    // ── Filters ─────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // ── Form state ───────────────────────────────────
    const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const [formJenisPerubahan, setFormJenisPerubahan] = useState('Modul Baru');
    const [formKategori, setFormKategori] = useState<'Baru' | 'Existing'>('Baru');
    const [formReferensiKhusus, setFormReferensiKhusus] = useState('');
    const [formDetailPermintaan, setFormDetailPermintaan] = useState('');
    const [formKeteranganKebutuhan, setFormKeteranganKebutuhan] = useState('');
    const [formJenisKebutuhanPelatihan, setFormJenisKebutuhanPelatihan] = useState('');
    const [formBahasaPengantar, setFormBahasaPengantar] = useState('Indonesia');
    const [formJenisModul, setFormJenisModul] = useState<string[]>([]);
    const [modulRows, setModulRows] = useState<ModulRow[]>([]);
    const [programRows, setProgramRows] = useState<ProgramRow[]>([]);

    // ── Approval state ───────────────────────────────
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    // ── Toast ────────────────────────────────────────
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

    const isProgram = formJenisPerubahan.toLowerCase().includes('program');

    useEffect(() => {
        if (!isProgram && formJenisModul.length > 0) {
            setModulRows(prev => {
                const kept = prev.filter(r => formJenisModul.some(() => true));
                const newRows = formJenisModul.flatMap((_jm) =>
                    JENIS_MODUL_PELATIHAN.map(jmp => {
                        const existing = kept.find(r => r.jenisModulPelatihan === jmp);
                        return existing ?? emptyModulRow(jmp, formKategori);
                    })
                ).filter((row, idx, arr) => arr.findIndex(r => r.jenisModulPelatihan === row.jenisModulPelatihan) === idx);
                return newRows;
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formJenisModul, formJenisPerubahan]);

    const handleSelectPengajuanKhusus = (noPengajuan: string) => {
        setFormReferensiKhusus(noPengajuan);
        const found = md.pengajuanKhusus.find(p => p.id === noPengajuan);
        if (found) {
            setFormDetailPermintaan(found.detail);
            setFormJenisKebutuhanPelatihan(found.jenisKebutuhan);
            setFormBahasaPengantar(found.bahasaPengantar);
            setFormJenisModul(found.jenisModul);
        }
    };

    const filteredSubmissions = useMemo(() => {
        return submissions.filter(s => {
            const q = searchQuery.toLowerCase();
            const matchSearch = s.noPerubahan.toLowerCase().includes(q) || s.jenisPerubahan.toLowerCase().includes(q);
            const matchStatus = statusFilter === 'Semua Status' || s.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [submissions, searchQuery, statusFilter]);

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentItems = filteredSubmissions.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

    const resetForm = () => {
        setFormJenisPerubahan('Modul Baru');
        setFormKategori('Baru');
        setFormReferensiKhusus('');
        setFormDetailPermintaan('');
        setFormKeteranganKebutuhan('');
        setFormJenisKebutuhanPelatihan('');
        setFormBahasaPengantar('Indonesia');
        setFormJenisModul([]);
        setModulRows([]);
        setProgramRows([]);
    };

    const openCreateForm = () => {
        resetForm();
        setFormMode('create');
        setIsFormModalOpen(true);
    };

    const openEditForm = (s: Submission) => {
        setFormJenisPerubahan(s.jenisPerubahan);
        setFormKategori(s.kategoriModul as 'Baru' | 'Existing');
        setFormReferensiKhusus(s.referensiKhusus);
        setFormDetailPermintaan(s.detailPermintaan);
        setFormKeteranganKebutuhan(s.keteranganKebutuhan);
        setFormJenisKebutuhanPelatihan(s.jenisKebutuhanPelatihan);
        setFormBahasaPengantar(s.bahasaPengantar);
        setFormJenisModul(s.jenisModul);
        setModulRows(s.modulRows ?? []);
        setProgramRows(s.programRows ?? []);
        setFormMode('edit');
        setSelectedSubmission(s);
        setIsFormModalOpen(true);
    };

    const openDetail = (s: Submission) => {
        setSelectedSubmission(s);
        setMode('detail');
    };

    // ── Row helpers ──────────────────────────────────
    const updateModulRow = (id: string, field: keyof ModulRow, value: string) => {
        setModulRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    };
    const addModulRow = () => setModulRows(prev => [...prev, emptyModulRow(formJenisModul[0] ?? 'Modul', formKategori)]);
    const removeModulRow = (id: string) => setModulRows(prev => prev.filter(r => r.id !== id));

    const updateProgramRow = (id: string, field: keyof ProgramRow, value: string) => {
        setProgramRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    };
    const addProgramRow = () => setProgramRows(prev => [...prev, emptyProgramRow()]);
    const removeProgramRow = (id: string) => setProgramRows(prev => prev.filter(r => r.id !== id));

    // ── Payload builder ──────────────────────────────
    const buildPayload = (submitForApproval = false) => ({
        jenis_perubahan: formJenisPerubahan,
        kategori_modul: formKategori,
        referensi_khusus: formReferensiKhusus,
        detail_permintaan: formDetailPermintaan,
        keterangan_kebutuhan: formKeteranganKebutuhan,
        jenis_kebutuhan_pelatihan: formJenisKebutuhanPelatihan,
        bahasa_pengantar: formBahasaPengantar,
        jenis_modul: formJenisModul,
        modul_rows: modulRows,
        program_rows: programRows,
        submit_for_approval: submitForApproval,
    });

    const handleSave = () => {
        if (formMode === 'create') {
            router.post('/perubahan-modul', buildPayload(false), {
                onSuccess: () => { setIsFormModalOpen(false); resetForm(); },
            });
        } else if (selectedSubmission) {
            router.post(`/perubahan-modul/${selectedSubmission.dbId}`, {
                ...buildPayload(false),
                _method: 'PUT',
            }, {
                onSuccess: () => { setIsFormModalOpen(false); resetForm(); },
            });
        }
    };

    const handleRequestApproval = () => {
        if (formMode === 'create') {
            router.post('/perubahan-modul', buildPayload(true), {
                onSuccess: () => { setIsFormModalOpen(false); resetForm(); },
            });
        } else if (selectedSubmission) {
            router.post(`/perubahan-modul/${selectedSubmission.dbId}`, {
                ...buildPayload(true),
                _method: 'PUT',
            }, {
                onSuccess: () => { setIsFormModalOpen(false); resetForm(); },
            });
        }
    };

    const handleApprove = () => {
        if (!selectedSubmission) return;
        router.post(`/perubahan-modul/${selectedSubmission.dbId}/approve`, {}, {
            onSuccess: () => setMode('list'),
        });
    };

    const handleReject = () => {
        if (!selectedSubmission || !rejectReason.trim()) return;
        router.post(`/perubahan-modul/${selectedSubmission.dbId}/reject`, { reason: rejectReason }, {
            onSuccess: () => { setMode('list'); setRejectOpen(false); setRejectReason(''); },
        });
    };

    const [deleteItem, setDeleteItem] = useState<Submission | null>(null);
    const handleDelete = () => {
        if (!deleteItem) return;
        router.delete(`/perubahan-modul/${deleteItem.dbId}`, {
            onSuccess: () => setDeleteItem(null),
        });
    };

    // ─────────────────────────────────────────────────────
    // ── RENDER ───────────────────────────────────────────
    // ─────────────────────────────────────────────────────

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perubahan Modul" />

            {/* Toast */}
            {localToast && (
                <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${localToast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                    {localToast.type === 'success' ? <Check className="size-4" /> : <X className="size-4" />}
                    {localToast.message}
                </div>
            )}

            <div className="flex flex-1 flex-col gap-5 p-5">

                {/* ══════════════════════════════ LIST VIEW ════════════════════════════════ */}
                {mode === 'list' && (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Perubahan Modul</h1>
                                <p className="text-xs text-neutral-400 mt-0.5">Kelola pengajuan penambahan &amp; revisi modul/program</p>
                            </div>
                            {isProcessor && (
                                <Button
                                    id="btn-new-perubahan"
                                    onClick={openCreateForm}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl px-4 h-9 shadow-sm"
                                >
                                    <Plus className="size-4" /> New Pengajuan
                                </Button>
                            )}
                        </div>

                        {/* Stat cards */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                            {[
                                { label: 'Total', count: submissions.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
                                { label: 'Draft', count: submissions.filter(s => s.status === 'Draft').length, icon: Clock, color: 'text-neutral-500', bg: 'bg-neutral-100 dark:bg-neutral-800' },
                                { label: 'Menunggu', count: submissions.filter(s => s.status === 'Menunggu Approval').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
                                { label: 'Disetujui', count: submissions.filter(s => s.status === 'Disetujui').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
                                { label: 'Ditolak', count: submissions.filter(s => s.status === 'Ditolak').length, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30' },
                            ].map(({ label, count, icon: Icon, color, bg }) => (
                                <Card key={label} className={`border-neutral-200/80 dark:border-neutral-800 ${bg} shadow-none`}>
                                    <div className="flex items-center gap-3 p-4">
                                        <Icon className={`size-5 ${color}`} />
                                        <div>
                                            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{count}</div>
                                            <div className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{label}</div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Table card */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            {/* Toolbar */}
                            <div className="flex flex-wrap items-center gap-3 border-b border-neutral-100 px-5 py-3.5 dark:border-neutral-800">
                                <div className="relative flex-1 min-w-[180px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
                                    <input
                                        type="text" placeholder="Cari no. pengajuan atau jenis..."
                                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                        className="h-8 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-8 pr-3 text-xs outline-none focus:border-blue-400 dark:text-neutral-100"
                                    />
                                </div>
                                <div className="w-40">
                                    <SearchableSelect
                                        value={statusFilter}
                                        onChange={val => setStatusFilter(val)}
                                        options={['Semua Status', 'Draft', 'Menunggu Approval', 'Disetujui', 'Ditolak']}
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                                            {['No. Pengajuan', 'Tgl Pengajuan', 'Jenis Perubahan', 'Kategori', 'Status', 'Aksi'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-50 dark:divide-neutral-900">
                                        {currentItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-12 text-neutral-400">
                                                    {isProcessor
                                                        ? <span>Belum ada pengajuan. <button onClick={openCreateForm} className="text-blue-600 font-semibold hover:underline">Buat pengajuan baru</button>.</span>
                                                        : 'Belum ada data pengajuan perubahan modul.'}
                                                </td>
                                            </tr>
                                        ) : currentItems.map(item => (
                                            <tr key={item.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-900/40 transition-colors">
                                                <td className="px-4 py-3 font-semibold text-neutral-800 dark:text-neutral-200">{item.noPerubahan}</td>
                                                <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{item.tglPengajuan}</td>
                                                <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{item.jenisPerubahan}</td>
                                                <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{item.kategoriModul}</td>
                                                <td className="px-4 py-3">
                                                    <Badge className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[item.status] ?? ''}`}>
                                                        {item.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        {/* View detail */}
                                                        <button onClick={() => openDetail(item)}
                                                            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200" title="Lihat Detail">
                                                            <Eye className="size-3.5" />
                                                        </button>
                                                        {/* Edit (Draft only) */}
                                                        {isProcessor && item.status === 'Draft' && (
                                                            <button onClick={() => openEditForm(item)}
                                                                className="rounded-lg p-1.5 text-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30" title="Edit">
                                                                <Edit3 className="size-3.5" />
                                                            </button>
                                                        )}
                                                        {/* Delete */}
                                                        {isProcessor && ['Baru', 'Draft'].includes(item.status) && (
                                                            <button onClick={() => setDeleteItem(item)}
                                                                className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30" title="Hapus">
                                                                <Trash2 className="size-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3.5 text-xs dark:border-neutral-800">
                                    <span className="text-neutral-400">{filteredSubmissions.length} data</span>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                                            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800">
                                            <ChevronLeft className="size-3.5" />
                                        </button>
                                        <span className="px-2 font-medium text-neutral-600 dark:text-neutral-400">{currentPage} / {totalPages}</span>
                                        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                                            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800">
                                            <ChevronRight className="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </>
                )}

                {/* ══════════════════════════════ DETAIL VIEW ════════════════════════════════ */}
                {mode === 'detail' && selectedSubmission && (
                    <>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setMode('list')} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium">
                                <ArrowLeft className="size-4" /> Kembali ke Daftar
                            </button>
                            <span className="text-neutral-300 dark:text-neutral-700">/</span>
                            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{selectedSubmission.noPerubahan}</span>
                            <Badge className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[selectedSubmission.status] ?? ''}`}>
                                {selectedSubmission.status}
                            </Badge>
                        </div>

                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800 bg-neutral-50/30">
                                <h2 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">Detail Pengajuan Perubahan Modul</h2>
                            </div>
                            <div className="p-6 space-y-6">

                                {/* Info rows */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-xs">
                                    {[
                                        { label: 'Tgl Pengajuan', value: selectedSubmission.tglPengajuan },
                                        { label: 'No. Pengajuan Perubahan Modul', value: selectedSubmission.noPerubahan },
                                        { label: 'Jenis Perubahan', value: selectedSubmission.jenisPerubahan },
                                        { label: 'Kategori Modul', value: selectedSubmission.kategoriModul },
                                        { label: 'Referensi No. Pengajuan Modul Khusus', value: selectedSubmission.referensiKhusus },
                                        { label: 'Detail Permintaan Modul Khusus', value: selectedSubmission.detailPermintaan },
                                        { label: 'Jenis Kebutuhan Modul Pelatihan', value: selectedSubmission.jenisKebutuhanPelatihan },
                                        { label: 'Bahasa Pengantar', value: selectedSubmission.bahasaPengantar },
                                        { label: 'Jenis Modul', value: selectedSubmission.jenisModul?.join(', ') },
                                    ].map(row => (
                                        <div key={row.label} className="flex gap-3">
                                            <span className="w-56 flex-shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">{row.label}</span>
                                            <span className="font-bold text-rose-600 dark:text-rose-400">{row.value || '-'}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Modul rows table */}
                                {selectedSubmission.modulRows && selectedSubmission.modulRows.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Perubahan Modul</h3>
                                        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
                                            <table className="w-full text-[11px] min-w-[900px]">
                                                <thead>
                                                    <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                                                        {['Jenis Modul Pelatihan', 'Kode Modul', 'Nama Modul', 'Sebelum Perubahan', 'Setelah Perubahan', 'Alasan Perubahan', 'Kode Revisi', 'Tanggal Berlaku', 'Link Modul'].map(h => (
                                                            <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                                    {selectedSubmission.modulRows.map(row => (
                                                        <tr key={row.id}>
                                                            <td className="px-3 py-2.5 font-medium text-neutral-700 dark:text-neutral-300">{row.jenisModulPelatihan}</td>
                                                            <td className="px-3 py-2.5 font-semibold text-rose-600 dark:text-rose-400">{row.kodeModul || '-'}</td>
                                                            <td className="px-3 py-2.5 text-rose-600 dark:text-rose-400">{row.namaModul || '-'}</td>
                                                            <td className="px-3 py-2.5 text-neutral-600 dark:text-neutral-400">{row.sebelumPerubahan || 'Tidak ada'}</td>
                                                            <td className="px-3 py-2.5 text-neutral-600 dark:text-neutral-400">{row.setelahPerubahan || 'Ada'}</td>
                                                            <td className="px-3 py-2.5 text-rose-600 dark:text-rose-400">{row.alasanPerubahan || '-'}</td>
                                                            <td className="px-3 py-2.5 font-bold text-rose-600 dark:text-rose-400">{row.kodeRevisi || '00'}</td>
                                                            <td className="px-3 py-2.5 text-rose-600 dark:text-rose-400">{row.tanggalBerlaku || '-'}</td>
                                                            <td className="px-3 py-2.5">
                                                                {row.linkModul
                                                                    ? <a href={row.linkModul} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-semibold">Open file</a>
                                                                    : <span className="text-neutral-400">-</span>}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-[10px] text-blue-700 dark:text-blue-400 italic mt-2 font-medium">
                                            * Data di atas disesuaikan dengan data perubahan yang diajukan.
                                        </p>
                                    </div>
                                )}

                                {/* Program rows table */}
                                {selectedSubmission.programRows && selectedSubmission.programRows.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Perubahan Program</h3>
                                        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
                                            <table className="w-full text-[11px] min-w-[800px]">
                                                <thead>
                                                    <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                                                        {['Kode Program', 'Nama Program', 'Sebelum Perubahan', 'Setelah Perubahan', 'Alasan Perubahan', 'Kode Revisi', 'Tanggal Berlaku', 'Link Program'].map(h => (
                                                            <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                                    {selectedSubmission.programRows.map(row => (
                                                        <tr key={row.id}>
                                                            <td className="px-3 py-2.5 font-semibold text-rose-600 dark:text-rose-400">{row.kodeProgram || '-'}</td>
                                                            <td className="px-3 py-2.5 text-rose-600 dark:text-rose-400">{row.namaProgram || '-'}</td>
                                                            <td className="px-3 py-2.5 text-neutral-600 dark:text-neutral-400">{row.sebelumPerubahan || 'Tidak ada'}</td>
                                                            <td className="px-3 py-2.5 text-neutral-600 dark:text-neutral-400">{row.setelahPerubahan || 'Ada'}</td>
                                                            <td className="px-3 py-2.5 text-rose-600 dark:text-rose-400">{row.alasanPerubahan || '-'}</td>
                                                            <td className="px-3 py-2.5 font-bold text-rose-600 dark:text-rose-400">{row.kodeRevisi || '00'}</td>
                                                            <td className="px-3 py-2.5 text-rose-600 dark:text-rose-400">{row.tanggalBerlaku || '-'}</td>
                                                            <td className="px-3 py-2.5">
                                                                {row.linkProgram
                                                                    ? <a href={row.linkProgram} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-semibold">Open file</a>
                                                                    : <span className="text-neutral-400">-</span>}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Reject reason */}
                                {selectedSubmission.status === 'Ditolak' && selectedSubmission.rejectReason && (
                                    <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/10 p-4">
                                        <p className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-1">Alasan Reject</p>
                                        <p className="text-xs text-rose-600 dark:text-rose-400">{selectedSubmission.rejectReason}</p>
                                    </div>
                                )}

                                {/* Approval info */}
                                {selectedSubmission.approvedBy && (
                                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/10 p-4 flex items-center gap-3">
                                        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Disetujui oleh {selectedSubmission.approvedBy}</p>
                                            <p className="text-[10px] text-emerald-600 dark:text-emerald-500">{selectedSubmission.approvedAt}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Manager approve/reject buttons */}
                                {canApprove && selectedSubmission.status === 'Menunggu Approval' && (
                                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                        <Button onClick={handleApprove} size="sm"
                                            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg">
                                            <CheckCircle2 className="size-3.5 mr-1.5" /> Approved
                                        </Button>
                                        <Button onClick={() => setRejectOpen(true)} size="sm"
                                            className="h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg">
                                            <XCircle className="size-3.5 mr-1.5" /> Reject
                                        </Button>
                                    </div>
                                )}

                                {/* Staf PD: edit or submit for approval from detail */}
                                {isProcessor && selectedSubmission.status === 'Draft' && (
                                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                        <Button onClick={() => openEditForm(selectedSubmission)} variant="outline" size="sm"
                                            className="h-9 px-4 text-xs font-semibold rounded-lg text-blue-600 border-blue-200 hover:bg-blue-50">
                                            <Edit3 className="size-3.5 mr-1.5" /> Edit
                                        </Button>
                                        <Button onClick={() => {
                                            router.post(`/perubahan-modul/${selectedSubmission.dbId}/submit`, {}, {
                                                onSuccess: () => setMode('list'),
                                            });
                                        }} size="sm"
                                            className="h-9 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg">
                                            <Upload className="size-3.5 mr-1.5" /> Request Approval
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </>
                )}

            </div>

            {/* ══════════════════════════════ FORM MODAL ════════════════════════════════ */}
            <Dialog open={isFormModalOpen} onOpenChange={(v) => { if (!v) { setIsFormModalOpen(false); resetForm(); } }}>
                <DialogContent className="max-w-5xl w-full max-h-[92vh] overflow-y-auto bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-0">
                    <DialogHeader className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 px-6 py-4 sticky top-0 z-10">
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                            {formMode === 'create' ? '✦ Pengajuan Perubahan Modul Baru' : `Edit Perubahan — ${selectedSubmission?.noPerubahan}`}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400">
                            Isi form di bawah untuk mengajukan penambahan modul atau revisi modul existing.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        {/* ── Header fields ── */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Tgl Pengajuan</label>
                                <input type="text" value={today} disabled className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 dark:bg-neutral-900 px-3 text-xs text-neutral-400 outline-none dark:border-neutral-800" />
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">No. Pengajuan Perubahan Modul</label>
                                <input type="text"
                                    value={formMode === 'create' ? 'Auto-generate saat disimpan' : (selectedSubmission?.noPerubahan ?? '')}
                                    disabled className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 dark:bg-neutral-900 px-3 text-xs text-neutral-400 outline-none dark:border-neutral-800" />
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Jenis Perubahan *</label>
                                <SearchableSelect value={formJenisPerubahan}
                                    onChange={val => { setFormJenisPerubahan(val); setFormJenisModul([]); setModulRows([]); setProgramRows([]); }}
                                    options={md.jenisPerubahan}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Kategori Modul/Program</label>
                                <div className="flex gap-4 items-center h-9">
                                    {(['Baru', 'Existing'] as const).map(k => (
                                        <label key={k} className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                                            <input type="radio" name="kategoriModulModal" value={k} checked={formKategori === k}
                                                onChange={() => {
                                                    setFormKategori(k);
                                                    setModulRows([]);
                                                    setProgramRows([]);
                                                }} className="text-blue-600 focus:ring-blue-500" />
                                            {k}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {formKategori === 'Baru' && (
                                <div>
                                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Referensi No. Pengajuan Modul Khusus</label>
                                    <SearchableSelect value={formReferensiKhusus} onChange={val => handleSelectPengajuanKhusus(val)}
                                        options={md.pengajuanKhusus.map(p => ({ value: p.id, label: p.id }))}
                                        nullLabel="-- Pilih No. Pengajuan Khusus --"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Detail Permintaan Modul Khusus</label>
                                <textarea value={formDetailPermintaan} onChange={e => setFormDetailPermintaan(e.target.value)} rows={2}
                                    disabled={formKategori === 'Baru' && !!formReferensiKhusus}
                                    className="w-full rounded-lg border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:text-neutral-100 disabled:bg-neutral-50 dark:disabled:bg-neutral-800 disabled:text-neutral-400 resize-none"
                                    placeholder="Isian dari pengajuan modul khusus..." />
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Keterangan Kebutuhan</label>
                                <textarea value={formKeteranganKebutuhan} onChange={e => setFormKeteranganKebutuhan(e.target.value)} rows={2}
                                    disabled={formKategori === 'Baru' && !!formReferensiKhusus}
                                    className="w-full rounded-lg border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:text-neutral-100 disabled:bg-neutral-50 dark:disabled:bg-neutral-800 disabled:text-neutral-400 resize-none"
                                    placeholder="Isian dari pengajuan modul khusus..." />
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Jenis Kebutuhan Modul Pelatihan</label>
                                <input type="text" value={formJenisKebutuhanPelatihan} onChange={e => setFormJenisKebutuhanPelatihan(e.target.value)}
                                    disabled={formKategori === 'Baru' && !!formReferensiKhusus}
                                    className="w-full h-9 rounded-lg border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3 text-xs outline-none focus:border-blue-500 dark:text-neutral-100 disabled:bg-neutral-50 dark:disabled:bg-neutral-800 disabled:text-neutral-400"
                                    placeholder="Pilih dari no. pengajuan modul khusus..." />
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Bahasa Pengantar</label>
                                <SearchableSelect value={formBahasaPengantar} onChange={val => setFormBahasaPengantar(val)}
                                    options={md.bahasaPengantar}
                                />
                            </div>

                            {!isProgram && (
                                <div className="col-span-2">
                                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Jenis Modul (Pilih lebih dari satu)</label>
                                    <div className="flex flex-wrap gap-3">
                                        {md.jenisModul.map(jm => (
                                            <label key={jm} className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                                                <input type="checkbox" checked={formJenisModul.includes(jm)}
                                                    onChange={e => setFormJenisModul(prev => e.target.checked ? [...prev, jm] : prev.filter(j => j !== jm))}
                                                    className="rounded text-blue-600 focus:ring-blue-500" />
                                                {jm}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Modul rows table ── */}
                        {!isProgram && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Perubahan Modul</h3>
                                    <button onClick={addModulRow} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold">
                                        <Plus className="size-3.5" /> Tambah Baris
                                    </button>
                                </div>
                                <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
                                    <table className="w-full text-[11px] min-w-[900px]">
                                        <thead>
                                            <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                                                {['Jenis Modul Pelatihan', 'Kode Modul', 'Nama Modul', 'Sebelum Perubahan', 'Setelah Perubahan', 'Alasan Perubahan', 'Kode Revisi', 'Tanggal Berlaku', 'Link Modul', ''].map(h => (
                                                    <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                            {modulRows.length === 0 ? (
                                                <tr><td colSpan={10} className="text-center py-6 text-neutral-400 text-xs">Pilih Jenis Modul di atas atau klik "Tambah Baris".</td></tr>
                                            ) : modulRows.map(row => (
                                                <tr key={row.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20">
                                                    <td className="px-3 py-2">
                                                        <SearchableSelect value={row.jenisModulPelatihan} onChange={val => updateModulRow(row.id, 'jenisModulPelatihan', val)}
                                                            options={JENIS_MODUL_PELATIHAN} />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {formKategori === 'Existing' ? (
                                                            <SearchableSelect
                                                                value={row.kodeModul}
                                                                onChange={val => {
                                                                    const code = val;
                                                                    const found = md.modules.find(m => m.code === code);
                                                                    setModulRows(prev => prev.map(r => r.id === row.id ? {
                                                                        ...r,
                                                                        kodeModul: code,
                                                                        namaModul: found ? found.title : '',
                                                                        kodeRevisi: found ? incrementRevision(found.revision ?? '00') : '01'
                                                                    } : r));
                                                                }}
                                                                options={md.modules.map(m => ({ value: m.code, label: `${m.code} - ${m.title}` }))}
                                                                nullLabel="-- Pilih --"
                                                            />
                                                        ) : (
                                                            <Cell value={row.kodeModul} onChange={v => updateModulRow(row.id, 'kodeModul', v)} placeholder="Kode" />
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Cell
                                                            value={row.namaModul}
                                                            onChange={v => updateModulRow(row.id, 'namaModul', v)}
                                                            placeholder="Nama modul..."
                                                            disabled={formKategori === 'Existing'}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2"><Cell value={row.sebelumPerubahan} onChange={v => updateModulRow(row.id, 'sebelumPerubahan', v)} placeholder="Sebelum..." /></td>
                                                    <td className="px-3 py-2"><Cell value={row.setelahPerubahan} onChange={v => updateModulRow(row.id, 'setelahPerubahan', v)} placeholder="Setelah..." /></td>
                                                    <td className="px-3 py-2"><Cell value={row.alasanPerubahan} onChange={v => updateModulRow(row.id, 'alasanPerubahan', v)} placeholder="Alasan..." /></td>
                                                    <td className="px-3 py-2">
                                                        <Cell
                                                            value={row.kodeRevisi}
                                                            onChange={v => updateModulRow(row.id, 'kodeRevisi', v)}
                                                            placeholder="00"
                                                            disabled={formKategori === 'Baru' || formKategori === 'Existing'}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2"><Cell value={row.tanggalBerlaku} onChange={v => updateModulRow(row.id, 'tanggalBerlaku', v)} type="date" /></td>
                                                    <td className="px-3 py-2">
                                                        <label className="flex items-center gap-1 cursor-pointer">
                                                            <input type="file" accept=".pdf" className="hidden"
                                                                onChange={e => { const file = e.target.files?.[0] ?? null; setModulRows(prev => prev.map(r => r.id === row.id ? { ...r, fileModul: file } : r)); }} />
                                                            <span className="text-blue-600 hover:text-blue-700 text-[11px] font-semibold flex items-center gap-1">
                                                                <Upload className="size-3" />
                                                                {row.fileModul ? row.fileModul.name.slice(0, 12) + '...' : 'Upload pdf'}
                                                            </span>
                                                        </label>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <button onClick={() => removeModulRow(row.id)} className="text-rose-400 hover:text-rose-600 p-1"><X className="size-3.5" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ── Program rows table ── */}
                        {isProgram && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Perubahan Program</h3>
                                    <button onClick={addProgramRow} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold">
                                        <Plus className="size-3.5" /> Tambah Baris
                                    </button>
                                </div>
                                <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
                                    <table className="w-full text-[11px] min-w-[900px]">
                                        <thead>
                                            <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                                                {['Kode Program', 'Nama Program', 'Sebelum Perubahan', 'Setelah Perubahan', 'Alasan Perubahan', 'Kode Revisi', 'Tanggal Berlaku', 'Link Program', ''].map(h => (
                                                    <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                            {programRows.length === 0 ? (
                                                <tr><td colSpan={9} className="text-center py-6 text-neutral-400 text-xs">Belum ada baris program. Klik "Tambah Baris".</td></tr>
                                            ) : programRows.map(row => (
                                                <tr key={row.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20">
                                                    <td className="px-3 py-2">
                                                        {formKategori === 'Existing' ? (
                                                            <SearchableSelect
                                                                value={row.kodeProgram}
                                                                onChange={val => {
                                                                    const code = val;
                                                                    const found = md.kodeProgram.find(kp => kp.code === code);
                                                                    setProgramRows(prev => prev.map(r => r.id === row.id ? {
                                                                        ...r,
                                                                        kodeProgram: code,
                                                                        namaProgram: found ? found.name : '',
                                                                        kodeRevisi: found ? incrementRevision(found.revision ?? '00') : '01'
                                                                    } : r));
                                                                }}
                                                                options={md.kodeProgram.map(kp => ({ value: kp.code, label: `${kp.code} - ${kp.name}` }))}
                                                                nullLabel="-- Pilih --"
                                                            />
                                                        ) : (
                                                            <Cell value={row.kodeProgram} onChange={v => updateProgramRow(row.id, 'kodeProgram', v)} placeholder="Kode" />
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Cell
                                                            value={row.namaProgram}
                                                            onChange={v => updateProgramRow(row.id, 'namaProgram', v)}
                                                            placeholder="Nama program..."
                                                            disabled={formKategori === 'Existing'}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2"><Cell value={row.sebelumPerubahan} onChange={v => updateProgramRow(row.id, 'sebelumPerubahan', v)} placeholder="Sebelum..." /></td>
                                                    <td className="px-3 py-2"><Cell value={row.setelahPerubahan} onChange={v => updateProgramRow(row.id, 'setelahPerubahan', v)} placeholder="Setelah..." /></td>
                                                    <td className="px-3 py-2"><Cell value={row.alasanPerubahan} onChange={v => updateProgramRow(row.id, 'alasanPerubahan', v)} placeholder="Alasan..." /></td>
                                                    <td className="px-3 py-2">
                                                        <Cell
                                                            value={row.kodeRevisi}
                                                            onChange={v => updateProgramRow(row.id, 'kodeRevisi', v)}
                                                            placeholder="00"
                                                            disabled={formKategori === 'Baru' || formKategori === 'Existing'}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2"><Cell value={row.tanggalBerlaku} onChange={v => updateProgramRow(row.id, 'tanggalBerlaku', v)} type="date" /></td>
                                                    <td className="px-3 py-2">
                                                        <label className="flex items-center gap-1 cursor-pointer">
                                                            <input type="file" accept=".pdf" className="hidden"
                                                                onChange={e => { const file = e.target.files?.[0] ?? null; setProgramRows(prev => prev.map(r => r.id === row.id ? { ...r, fileProgram: file } : r)); }} />
                                                            <span className="text-blue-600 hover:text-blue-700 text-[11px] font-semibold flex items-center gap-1">
                                                                <Upload className="size-3" />
                                                                {row.fileProgram ? row.fileProgram.name.slice(0, 12) + '...' : 'Upload pdf'}
                                                            </span>
                                                        </label>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <button onClick={() => removeProgramRow(row.id)} className="text-rose-400 hover:text-rose-600 p-1"><X className="size-3.5" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Modal footer */}
                    <div className="sticky bottom-0 z-10 bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 px-6 py-4 flex items-center gap-2">
                        <Button onClick={() => { setIsFormModalOpen(false); resetForm(); }} variant="outline" size="sm"
                            className="h-9 px-4 text-xs font-semibold rounded-lg">
                            Batal
                        </Button>
                        <Button onClick={handleRequestApproval} variant="outline" size="sm"
                            className="h-9 px-4 text-xs font-semibold rounded-lg border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-400">
                            <Upload className="size-3.5 mr-1.5" /> Request Approval
                        </Button>
                        <Button onClick={handleSave} size="sm"
                            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg">
                            <FileText className="size-3.5 mr-1.5" /> Simpan Draft
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Reject Dialog ── */}
            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <XCircle className="size-5" /> Reject Pengajuan
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400">
                            Masukkan alasan penolakan. Pengajuan akan dikembalikan ke Staf PD untuk diproses ulang.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Alasan Reject *</label>
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4}
                            placeholder="Jelaskan alasan penolakan pengajuan ini..."
                            className="w-full rounded-lg border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3 py-2 text-xs outline-none focus:border-rose-400 dark:text-neutral-100 resize-none" />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setRejectOpen(false)} className="h-9 px-4 text-xs font-semibold rounded-lg">Batal</Button>
                        <Button onClick={handleReject} disabled={!rejectReason.trim()}
                            className="h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg">
                            Kirim Penolakan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirm ── */}
            <Dialog open={!!deleteItem} onOpenChange={(v) => !v && setDeleteItem(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Hapus Pengajuan</DialogTitle>
                        <DialogDescription>
                            Pengajuan <strong>{deleteItem?.noPerubahan}</strong> akan dihapus permanen. Yakin?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteItem(null)}>Batal</Button>
                        <Button variant="destructive" onClick={handleDelete}>Ya, Hapus</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
