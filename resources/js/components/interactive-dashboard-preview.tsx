import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    Bell,
    BookOpen,
    Check,
    CheckCircle2,
    CheckSquare,
    ChevronRight,
    CircleHelp,
    Clock,
    Database,
    FileEdit,
    FileText,
    Grid,
    LayoutGrid,
    PanelLeft,
    Plus,
    Search,
    Send,
    ShieldCheck,
    UploadCloud,
    UserCheck,
    Users,
} from 'lucide-react';
import React from 'react';

export type DashboardView = 'overview' | 'pengajuan' | 'review' | 'approval' | 'database' | 'matrix';

const sidebarMenus: { id: DashboardView; label: string; icon: React.ElementType; group: 'main' | 'other' }[] = [
    { id: 'overview', label: 'Dashboard Admin', icon: LayoutGrid, group: 'main' },
    { id: 'pengajuan', label: 'Pengajuan Modul', icon: FileText, group: 'main' },
    { id: 'approval', label: 'Approval Modul', icon: CheckSquare, group: 'main' },
    { id: 'database', label: 'Database Modul', icon: Database, group: 'main' },
    { id: 'matrix', label: 'Matriks Pelatihan', icon: Grid, group: 'main' },
];

const viewTitles: Record<DashboardView, { title: string; subtitle: string }> = {
    overview: {
        title: 'Dashboard Modul Pelatihan',
        subtitle: 'Monitoring pengajuan, approval, revisi, dan database modul pelatihan.',
    },
    pengajuan: {
        title: 'Pengajuan Modul',
        subtitle: 'Kelola pengajuan modul baru dan revisi modul yang sudah ada.',
    },
    review: {
        title: 'Review Tim PD',
        subtitle: 'Tim People Development meninjau materi, relevansi kurikulum, dan format.',
    },
    approval: {
        title: 'Approval Modul',
        subtitle: 'Review dan putuskan pengajuan modul dari antrian approval.',
    },
    database: {
        title: 'Database Modul',
        subtitle: 'Akses semua modul approved, arsip, dan riwayat revisi.',
    },
    matrix: {
        title: 'Matriks Pelatihan',
        subtitle: 'Petakan modul ke program pelatihan dan identifikasi gap kompetensi.',
    },
};

function viewToSidebarId(view: DashboardView): DashboardView {
    if (view === 'review') {
        return 'approval';
    }

    return view;
}

function PreviewCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 ${className}`}>
            {children}
        </div>
    );
}

function PreviewStatCard({
    icon: Icon,
    label,
    value,
    sub,
    iconClass,
    iconBg,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    sub?: string;
    iconClass: string;
    iconBg: string;
}) {
    return (
        <PreviewCard>
            <div className="flex items-center gap-2.5 p-2.5">
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className={`size-4 ${iconClass}`} />
                </div>
                <div className="min-w-0">
                    <div className="truncate text-[8px] font-semibold text-neutral-400 dark:text-neutral-500">{label}</div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{value}</div>
                    {sub && <div className="truncate text-[8px] font-semibold text-emerald-600 dark:text-emerald-500">{sub}</div>}
                </div>
            </div>
        </PreviewCard>
    );
}

function PreviewBadge({ children, className }: { children: React.ReactNode; className: string }) {
    return <span className={`rounded-md border-0 px-1.5 py-0.5 text-[8px] font-semibold ${className}`}>{children}</span>;
}

function PreviewTableHead({ cols }: { cols: string[] }) {
    return (
        <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[8px] font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                {cols.map((col) => (
                    <th key={col} className="px-2 py-2 text-left font-semibold">
                        {col}
                    </th>
                ))}
            </tr>
        </thead>
    );
}

function OverviewContent() {
    const steps = [
        { num: 1, icon: Send, label: 'Pengajuan' },
        { num: 2, icon: FileText, label: 'Drafting' },
        { num: 3, icon: UserCheck, label: 'Approval' },
        { num: 4, icon: ShieldCheck, label: 'Approved', active: true },
        { num: 5, icon: Users, label: 'Tim Training' },
    ];

    return (
        <div className="grid grid-cols-4 gap-2">
            <div className="col-span-4 space-y-2 sm:col-span-3">
                <div className="grid grid-cols-2 gap-1.5 xl:grid-cols-4">
                    <PreviewStatCard icon={Database} label="Total Modul" value="386" sub="+18 dari bulan lalu" iconClass="text-blue-600 dark:text-blue-400" iconBg="bg-blue-50 dark:bg-blue-950/50" />
                    <PreviewStatCard icon={Clock} label="Menunggu Approval" value="24" sub="+5 dari kemarin" iconClass="text-amber-600 dark:text-amber-400" iconBg="bg-amber-50 dark:bg-amber-950/50" />
                    <PreviewStatCard icon={CheckCircle2} label="Modul Approved" value="312" sub="+24 dari bulan lalu" iconClass="text-emerald-600 dark:text-emerald-400" iconBg="bg-emerald-50 dark:bg-emerald-950/50" />
                    <PreviewStatCard icon={FileEdit} label="Revisi Modul" value="50" sub="+7 dari kemarin" iconClass="text-red-600 dark:text-red-400" iconBg="bg-red-50 dark:bg-red-950/50" />
                </div>

                <PreviewCard>
                    <div className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
                        <h3 className="text-[9px] font-semibold text-neutral-900 dark:text-neutral-100">Alur Proses Modul</h3>
                    </div>
                    <div className="flex items-center justify-between gap-1 overflow-x-auto p-2.5">
                        {steps.map((step, i) => (
                            <React.Fragment key={step.num}>
                                <div className="flex min-w-[52px] flex-col items-center text-center">
                                    <div
                                        className={`relative mb-1 flex size-7 items-center justify-center rounded-full border-2 ${
                                            step.active
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:border-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400'
                                                : 'border-blue-600 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400'
                                        }`}
                                    >
                                        <span
                                            className={`absolute -top-0.5 -left-0.5 flex size-3.5 items-center justify-center rounded-full text-[7px] font-bold text-white ${
                                                step.active ? 'bg-emerald-500' : 'bg-blue-600 dark:bg-blue-500'
                                            }`}
                                        >
                                            {step.num}
                                        </span>
                                        <step.icon className="size-3" />
                                    </div>
                                    <span className="text-[7px] font-semibold text-neutral-800 dark:text-neutral-200">{step.label}</span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className="hidden h-7 min-w-3 flex-1 items-center sm:flex">
                                        <div className="w-full border-t-2 border-dashed border-neutral-200 dark:border-neutral-800" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </PreviewCard>

                <PreviewCard>
                    <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
                        <h3 className="text-[9px] font-semibold text-neutral-900 dark:text-neutral-100">Pengajuan Terbaru</h3>
                        <button type="button" className="inline-flex items-center gap-0.5 text-[8px] font-semibold text-blue-600 dark:text-blue-400">
                            Lihat Semua <ChevronRight className="size-2.5" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[320px] border-collapse text-left">
                            <PreviewTableHead cols={['No Pengajuan', 'Judul Modul', 'Status', 'Deadline']} />
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {[
                                    { id: 'PM-2025-0067', title: 'Pelatihan Internal Audit Berbasis Risiko', status: 'Menunggu Approval', statusClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300', deadline: '15 Jun 2025' },
                                    { id: 'PM-2025-0066', title: 'Sistem Manajemen Halal (SJPH)', status: 'Approved', statusClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300', deadline: '10 Jun 2025' },
                                ].map((row) => (
                                    <tr key={row.id} className="hover:bg-neutral-50/30 dark:hover:bg-neutral-900/10">
                                        <td className="px-2 py-2 text-[8px] font-semibold text-blue-600 dark:text-blue-400">{row.id}</td>
                                        <td className="max-w-[100px] truncate px-2 py-2 text-[8px] font-medium text-neutral-800 dark:text-neutral-200">{row.title}</td>
                                        <td className="px-2 py-2">
                                            <PreviewBadge className={row.statusClass}>{row.status}</PreviewBadge>
                                        </td>
                                        <td className="px-2 py-2 text-[8px] font-medium text-neutral-500 dark:text-neutral-400">{row.deadline}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </PreviewCard>
            </div>

            <div className="col-span-4 hidden space-y-2 sm:col-span-1 sm:block">
                <PreviewCard>
                    <div className="flex items-center justify-between border-b border-neutral-100 px-2.5 py-2 dark:border-neutral-800">
                        <h3 className="text-[9px] font-semibold text-neutral-900 dark:text-neutral-100">Aktivitas Terbaru</h3>
                    </div>
                    <div className="space-y-3 p-2.5">
                        {[
                            { color: 'bg-emerald-500', text: 'Modul "SJPH" disetujui Manager PD.', by: 'Siti Nurhayati', time: '10 menit lalu' },
                            { color: 'bg-amber-500', text: 'Pengajuan "Internal Audit" menunggu approval.', by: 'Andi Pratama', time: '35 menit lalu' },
                        ].map((item, i) => (
                            <div key={i} className="relative border-l border-neutral-100 pl-3 dark:border-neutral-800">
                                <span className={`absolute top-1 -left-[5px] size-2 rounded-full ${item.color} ring-2 ring-white dark:ring-neutral-950`} />
                                <p className="text-[8px] font-medium leading-snug text-neutral-700 dark:text-neutral-300">{item.text}</p>
                                <p className="mt-0.5 text-[7px] font-semibold text-neutral-400">{item.by}</p>
                                <p className="text-[7px] text-neutral-400">{item.time}</p>
                            </div>
                        ))}
                    </div>
                </PreviewCard>

                <PreviewCard>
                    <div className="border-b border-neutral-100 px-2.5 py-2 dark:border-neutral-800">
                        <h3 className="text-[9px] font-semibold text-neutral-900 dark:text-neutral-100">Quick Action</h3>
                    </div>
                    <div className="space-y-1.5 p-2.5">
                        <button type="button" className="flex h-7 w-full items-center justify-between rounded-lg bg-blue-600 px-2 text-[8px] font-semibold text-white dark:bg-blue-500">
                            <span className="flex items-center gap-1"><Plus className="size-3" /> Ajukan Modul Baru</span>
                            <ChevronRight className="size-3" />
                        </button>
                        <button type="button" className="flex h-7 w-full items-center justify-between rounded-lg border border-blue-600 px-2 text-[8px] font-semibold text-blue-600 dark:border-blue-500 dark:text-blue-400">
                            <span className="flex items-center gap-1"><UploadCloud className="size-3" /> Upload Revisi</span>
                            <ChevronRight className="size-3" />
                        </button>
                    </div>
                </PreviewCard>
            </div>
        </div>
    );
}

function PengajuanContent() {
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                <PreviewStatCard icon={FileText} label="Total Pengajuan" value="12" iconClass="text-blue-600 dark:text-blue-400" iconBg="bg-blue-50 dark:bg-blue-950/50" />
                <PreviewStatCard icon={Clock} label="Menunggu Approval" value="3" iconClass="text-amber-600 dark:text-amber-400" iconBg="bg-amber-50 dark:bg-amber-950/50" />
                <PreviewStatCard icon={FileEdit} label="Drafting" value="2" iconClass="text-purple-600 dark:text-purple-400" iconBg="bg-purple-50 dark:bg-purple-950/50" />
                <PreviewStatCard icon={CheckCircle2} label="Selesai" value="5" iconClass="text-emerald-600 dark:text-emerald-400" iconBg="bg-emerald-50 dark:bg-emerald-950/50" />
            </div>

            <PreviewCard>
                <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
                    <h3 className="text-[9px] font-semibold text-neutral-900 dark:text-neutral-100">Daftar Pengajuan Modul</h3>
                    <button type="button" className="flex items-center gap-1 rounded-lg bg-blue-600 px-2 py-1 text-[8px] font-semibold text-white dark:bg-blue-500">
                        <Plus className="size-3" /> Tambah
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[360px] border-collapse text-left">
                        <PreviewTableHead cols={['No. Pengajuan', 'Judul Modul', 'Jenis', 'Status']} />
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {[
                                { id: 'PMD-2024-0064', title: 'Manajemen Risiko Operasional', type: 'Modul Baru', typeClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300', status: 'Baru', statusClass: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300' },
                                { id: 'PMD-2024-0062', title: 'Analisis Data Non Data Scientist', type: 'Modul Baru', typeClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300', status: 'Menunggu Approval', statusClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300' },
                                { id: 'PMD-2024-0063', title: 'Kepemimpinan Situasional', type: 'Revisi Modul', typeClass: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300', status: 'Drafting', statusClass: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300' },
                            ].map((row) => (
                                <tr key={row.id} className="hover:bg-neutral-50/30 dark:hover:bg-neutral-900/10">
                                    <td className="px-2 py-2 text-[8px] font-semibold text-blue-600 dark:text-blue-400">{row.id}</td>
                                    <td className="max-w-[120px] truncate px-2 py-2 text-[8px] font-medium text-neutral-800 dark:text-neutral-200">{row.title}</td>
                                    <td className="px-2 py-2"><PreviewBadge className={row.typeClass}>{row.type}</PreviewBadge></td>
                                    <td className="px-2 py-2"><PreviewBadge className={row.statusClass}>{row.status}</PreviewBadge></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </PreviewCard>
        </div>
    );
}

function ReviewContent() {
    return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
            <PreviewCard className="sm:col-span-2">
                <div className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
                    <h3 className="text-[9px] font-semibold text-neutral-900 dark:text-neutral-100">Antrian Review PD</h3>
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {[
                        { id: 'PD-2024-0627', title: 'Cybersecurity Awareness', active: true },
                        { id: 'PD-2024-0626', title: 'Leadership Fundamentals', active: false },
                    ].map((item) => (
                        <div key={item.id} className={`cursor-pointer px-3 py-2 ${item.active ? 'border-l-2 border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/20' : ''}`}>
                            <div className="text-[8px] font-semibold text-blue-600 dark:text-blue-400">{item.id}</div>
                            <div className="truncate text-[8px] font-medium text-neutral-800 dark:text-neutral-200">{item.title}</div>
                        </div>
                    ))}
                </div>
            </PreviewCard>

            <PreviewCard className="sm:col-span-3">
                <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
                    <h3 className="text-[9px] font-semibold text-neutral-900 dark:text-neutral-100">Detail Review</h3>
                    <PreviewBadge className="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">Dalam Review</PreviewBadge>
                </div>
                <div className="space-y-2 p-3">
                    <div>
                        <div className="text-[9px] font-bold text-neutral-900 dark:text-neutral-100">Cybersecurity Awareness</div>
                        <div className="text-[8px] text-neutral-500 dark:text-neutral-400">PD-2024-0627 · IT & Digital · 24 halaman</div>
                    </div>
                    {['Relevansi kurikulum sesuai program', 'Format dokumen memenuhi standar', 'Metadata lengkap dan akurat'].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                            <div className="flex size-4 items-center justify-center rounded bg-emerald-50 dark:bg-emerald-950/50">
                                <Check className="size-2.5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-[8px] font-medium text-neutral-600 dark:text-neutral-400">{item}</span>
                        </div>
                    ))}
                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-700 dark:bg-neutral-900/50">
                        <div className="mb-1 text-[8px] font-semibold text-neutral-500 dark:text-neutral-400">Catatan Reviewer</div>
                        <p className="text-[8px] leading-relaxed text-neutral-600 dark:text-neutral-400">Secara umum sudah baik. Mohon tambahkan studi kasus terbaru.</p>
                    </div>
                    <button type="button" className="w-full rounded-lg bg-blue-600 py-1.5 text-[8px] font-bold text-white dark:bg-blue-500">Teruskan ke Manager</button>
                </div>
            </PreviewCard>
        </div>
    );
}

function ApprovalContent() {
    return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
            <PreviewCard className="sm:col-span-2">
                <div className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
                    <h3 className="text-[9px] font-semibold text-neutral-900 dark:text-neutral-100">Antrian Approval</h3>
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {[
                        { id: 'PD-2024-0627', title: 'Cybersecurity Awareness', priority: 'High', active: true },
                        { id: 'PD-2024-0625', title: 'Data Analytics for Business', priority: 'High', active: false },
                    ].map((item) => (
                        <div key={item.id} className={`cursor-pointer px-3 py-2 ${item.active ? 'border-l-2 border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/20' : ''}`}>
                            <div className="flex items-center justify-between">
                                <span className="text-[8px] font-semibold text-blue-600 dark:text-blue-400">{item.id}</span>
                                <PreviewBadge className={item.priority === 'High' ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}>{item.priority}</PreviewBadge>
                            </div>
                            <div className="truncate text-[8px] font-medium text-neutral-800 dark:text-neutral-200">{item.title}</div>
                        </div>
                    ))}
                </div>
            </PreviewCard>

            <PreviewCard className="sm:col-span-3">
                <div className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
                    <h3 className="text-[9px] font-semibold text-neutral-900 dark:text-neutral-100">Keputusan Approval</h3>
                </div>
                <div className="space-y-2 p-3">
                    <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-900/30">
                        <div className="text-[9px] font-bold text-neutral-900 dark:text-neutral-100">Cybersecurity Awareness</div>
                        <div className="mt-1 flex gap-1">
                            <PreviewBadge className="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">Modul Baru</PreviewBadge>
                            <PreviewBadge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">Disarankan PD</PreviewBadge>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                        <button type="button" className="rounded-lg bg-emerald-600 py-1.5 text-[8px] font-bold text-white dark:bg-emerald-500">Setujui</button>
                        <button type="button" className="rounded-lg bg-amber-500 py-1.5 text-[8px] font-bold text-white">Revisi</button>
                        <button type="button" className="rounded-lg bg-red-500 py-1.5 text-[8px] font-bold text-white">Tolak</button>
                    </div>
                </div>
            </PreviewCard>
        </div>
    );
}

function DatabaseContent() {
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                <PreviewStatCard icon={Database} label="Total Modul" value="386" iconClass="text-blue-600 dark:text-blue-400" iconBg="bg-blue-50 dark:bg-blue-950/50" />
                <PreviewStatCard icon={CheckCircle2} label="Approved" value="312" iconClass="text-emerald-600 dark:text-emerald-400" iconBg="bg-emerald-50 dark:bg-emerald-950/50" />
                <PreviewStatCard icon={FileEdit} label="Revisi" value="50" iconClass="text-amber-600 dark:text-amber-400" iconBg="bg-amber-50 dark:bg-amber-950/50" />
                <PreviewStatCard icon={Database} label="Arsip" value="24" iconClass="text-neutral-600 dark:text-neutral-400" iconBg="bg-neutral-100 dark:bg-neutral-800" />
            </div>

            <PreviewCard>
                <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
                    <h3 className="text-[9px] font-semibold text-neutral-900 dark:text-neutral-100">Database Modul Aktif</h3>
                    <button type="button" className="text-[8px] font-semibold text-blue-600 dark:text-blue-400">+ Tambah Modul</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[360px] border-collapse text-left">
                        <PreviewTableHead cols={['Kode', 'Judul Modul', 'Program', 'Status']} />
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {[
                                { code: 'DL-001', title: 'Pelatihan Internal Audit', program: 'Sertifikasi & Auditor', status: 'Approved', statusClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' },
                                { code: 'PM-2025-012', title: 'Sistem Manajemen Halal', program: 'Auditor Halal', status: 'Approved', statusClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' },
                                { code: 'PM-2025-008', title: 'Kompetensi Auditor Halal', program: 'SJPH Internal', status: 'Revisi', statusClass: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300' },
                            ].map((row) => (
                                <tr key={row.code} className="hover:bg-neutral-50/30 dark:hover:bg-neutral-900/10">
                                    <td className="px-2 py-2 text-[8px] font-bold text-neutral-700 dark:text-neutral-300">{row.code}</td>
                                    <td className="max-w-[110px] truncate px-2 py-2 text-[8px] font-medium text-neutral-800 dark:text-neutral-200">{row.title}</td>
                                    <td className="max-w-[90px] truncate px-2 py-2 text-[8px] text-neutral-500 dark:text-neutral-400">{row.program}</td>
                                    <td className="px-2 py-2"><PreviewBadge className={row.statusClass}>{row.status}</PreviewBadge></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </PreviewCard>
        </div>
    );
}

function MatrixContent() {
    const statusBadge = (status: string) => {
        if (status === 'Wajib') {
            return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
        }
        if (status === 'Opsional') {
            return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
        }

        return 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500';
    };

    return (
        <div className="space-y-2">
            <PreviewCard>
                <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
                    <h3 className="text-[9px] font-semibold text-neutral-900 dark:text-neutral-100">Matriks Modul Pelatihan</h3>
                    <button type="button" className="text-[8px] font-semibold text-blue-600 dark:text-blue-400">Lihat Selengkapnya</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[360px] border-collapse text-left text-[8px]">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                <th className="px-2 py-2 text-left">Program</th>
                                {['M1', 'M2', 'M3', 'M4'].map((col) => (
                                    <th key={col} className="px-1 py-2 text-center">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {[
                                { program: 'IT & Digital', cells: ['Wajib', 'Wajib', 'Opsional', 'Wajib'] },
                                { program: 'Auditor Halal', cells: ['Wajib', 'Wajib', 'Wajib', 'Opsional'] },
                                { program: 'Operasional', cells: ['Wajib', 'Opsional', 'Belum Ada', 'Wajib'] },
                            ].map((row) => (
                                <tr key={row.program}>
                                    <td className="px-2 py-2 font-medium text-neutral-800 dark:text-neutral-200">{row.program}</td>
                                    {row.cells.map((cell, i) => (
                                        <td key={i} className="px-1 py-2 text-center">
                                            {cell === 'Belum Ada' ? (
                                                <span className="text-neutral-300 dark:text-neutral-600">-</span>
                                            ) : (
                                                <span className={`inline-block rounded px-1 py-0.5 text-[7px] font-bold ${statusBadge(cell)}`}>{cell === 'Wajib' ? '✓' : '○'}</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center gap-3 border-t border-neutral-100 px-3 py-2 text-[7px] font-medium text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                    <span className="flex items-center gap-1"><Check className="size-2.5 text-emerald-500" /> Wajib</span>
                    <span>○ Opsional</span>
                    <span>- Belum Ada</span>
                </div>
            </PreviewCard>

            <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-2 dark:border-amber-950/40 dark:bg-amber-950/20">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="size-3" />
                    <span className="text-[8px] font-bold uppercase tracking-wider">Gap Modul</span>
                </div>
                <p className="mt-1 text-[8px] font-semibold text-neutral-700 dark:text-neutral-300">Operasional & SJPH Internal memiliki 2 modul belum tersedia.</p>
            </div>
        </div>
    );
}

function DashboardFeatureContent({ view }: { view: DashboardView }) {
    const content: Record<DashboardView, React.ReactNode> = {
        overview: <OverviewContent />,
        pengajuan: <PengajuanContent />,
        review: <ReviewContent />,
        approval: <ApprovalContent />,
        database: <DatabaseContent />,
        matrix: <MatrixContent />,
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                {content[view]}
            </motion.div>
        </AnimatePresence>
    );
}

export function InteractiveDashboardPreview({
    activeView,
    onViewChange,
    variant = 'inline',
}: {
    activeView: DashboardView;
    onViewChange: (view: DashboardView) => void;
    variant?: 'hero' | 'inline';
}) {
    const sidebarActive = viewToSidebarId(activeView);
    const pageInfo = viewTitles[activeView];

    return (
        <div className={`w-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950 ${variant === 'hero' ? 'ring-1 ring-neutral-200/50 dark:ring-neutral-700/50' : ''}`}>
            <div className={`flex ${variant === 'hero' ? 'min-h-[400px]' : 'min-h-[360px]'}`}>
                {/* Sidebar — mirrors AppSidebar */}
                <aside className="flex w-[118px] shrink-0 flex-col border-r border-neutral-200/80 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/80 sm:w-[130px]">
                    <div className="border-b border-neutral-200/80 p-2 dark:border-neutral-800">
                        <div className="flex items-center gap-1.5">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20">
                                <BookOpen className="size-3.5" />
                            </div>
                            <div className="hidden min-w-0 sm:block">
                                <div className="truncate text-[9px] font-semibold text-neutral-900 dark:text-neutral-100">Training PD</div>
                                <div className="truncate text-[7px] font-medium text-neutral-500 dark:text-neutral-400">Module Management</div>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto px-1.5 py-2">
                        <div className="mb-1 px-1.5 text-[7px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Menu Utama</div>
                        <div className="space-y-0.5">
                            {sidebarMenus.filter((m) => m.group === 'main').map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => onViewChange(item.id)}
                                    className={`flex h-7 w-full items-center gap-1.5 rounded-lg px-2 text-left transition-colors ${
                                        sidebarActive === item.id
                                            ? 'bg-neutral-200/70 font-semibold text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                                            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200'
                                    }`}
                                >
                                    <item.icon className="size-3 shrink-0" />
                                    <span className="truncate text-[8px]">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </nav>

                    <div className="mx-1.5 mb-2 rounded-xl border border-neutral-100 bg-neutral-50/50 p-2 dark:border-neutral-800 dark:bg-neutral-900/50">
                        <div className="mb-1 text-[7px] font-semibold text-neutral-700 dark:text-neutral-300">Penyimpanan (PDF)</div>
                        <div className="mb-1 h-1 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                            <div className="h-full rounded-full bg-blue-600 dark:bg-blue-500" style={{ width: '28%' }} />
                        </div>
                        <div className="flex justify-between text-[7px] font-medium text-neutral-500 dark:text-neutral-400">
                            <span>28.4/100 GB</span>
                            <span>28%</span>
                        </div>
                    </div>
                </aside>

                {/* Main area — mirrors AppSidebarHeader + dashboard content */}
                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="flex h-9 shrink-0 items-center justify-between border-b border-neutral-200/80 bg-white px-2 dark:border-neutral-800 dark:bg-neutral-950">
                        <div className="flex items-center gap-1.5">
                            <PanelLeft className="size-3 text-neutral-500 dark:text-neutral-400" />
                            <span className="hidden truncate text-[8px] font-medium text-neutral-500 dark:text-neutral-400 sm:block">
                                {pageInfo.title}
                            </span>
                        </div>
                        <div className="relative mx-2 hidden max-w-[140px] flex-1 md:block">
                            <Search className="absolute top-1/2 left-2 size-2.5 -translate-y-1/2 text-neutral-400" />
                            <div className="h-6 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-6 text-[7px] leading-6 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500">
                                Cari modul...
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="relative flex size-6 items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900">
                                <Bell className="size-3 text-neutral-600 dark:text-neutral-400" />
                                <span className="absolute -top-0.5 -right-0.5 flex size-3 items-center justify-center rounded-full bg-red-500 text-[6px] font-bold text-white">12</span>
                            </div>
                            <CircleHelp className="size-3 text-neutral-600 dark:text-neutral-400" />
                            <div className="flex size-6 items-center justify-center rounded-full bg-neutral-200 text-[7px] font-bold text-neutral-700 dark:bg-neutral-700 dark:text-white">
                                RP
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto bg-neutral-50/60 p-2.5 dark:bg-neutral-900/10">
                        <div className="mb-2">
                            <h4 className="text-[10px] font-bold text-neutral-900 dark:text-neutral-50">
                                {pageInfo.title}{' '}
                                {activeView === 'overview' && <span className="text-blue-600 dark:text-blue-400">(Manager PD)</span>}
                            </h4>
                            <p className="text-[8px] text-neutral-500 dark:text-neutral-400">{pageInfo.subtitle}</p>
                        </div>
                        <DashboardFeatureContent view={activeView} />
                    </div>
                </div>
            </div>
        </div>
    );
}
