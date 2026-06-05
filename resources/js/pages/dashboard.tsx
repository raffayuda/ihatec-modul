import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowUpRight,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock,
    Database,
    Eye,
    FileEdit,
    FileText,
    MoreVertical,
    Plus,
    Send,
    ShieldCheck,
    UploadCloud,
    UserCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { PieChart, Pie, Cell, Label } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Modul Pelatihan',
        href: '/dashboard',
    },
];

// Interface for training requests
interface RequestItem {
    id: string;
    title: string;
    type: 'Baru' | 'Revisi';
    applicant: string;
    status: 'Menunggu Approval' | 'Approved' | 'Revisi';
    deadline: string;
}

const chartConfig = {
    approved: {
        label: 'Approved',
        color: '#10b981',
    },
    rejected: {
        label: 'Rejected',
        color: '#ef4444',
    },
    pending: {
        label: 'Menunggu',
        color: '#f59e0b',
    },
};

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    const role = user?.role || 'User';
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 5;

    // 15 Dummy request items to support pagination
    const allRequests: RequestItem[] = [
        {
            id: 'PM-2025-0067',
            title: 'Pelatihan Internal Audit Berbasis Risiko',
            type: 'Baru',
            applicant: 'Andi Pratama',
            status: 'Menunggu Approval',
            deadline: '15 Jun 2025',
        },
        {
            id: 'PM-2025-0066',
            title: 'Sistem Manajemen Halal (SJPH)',
            type: 'Baru',
            applicant: 'Dewi Lestari',
            status: 'Approved',
            deadline: '10 Jun 2025',
        },
        {
            id: 'PM-2025-0065',
            title: 'Kompetensi Auditor Halal',
            type: 'Revisi',
            applicant: 'Budi Santoso',
            status: 'Revisi',
            deadline: '12 Jun 2025',
        },
        {
            id: 'PM-2025-0064',
            title: 'Pemeriksaan Bahan PPH',
            type: 'Revisi',
            applicant: 'Rina Apriyani',
            status: 'Menunggu Approval',
            deadline: '11 Jun 2025',
        },
        {
            id: 'PM-2025-0063',
            title: 'Manajemen Risiko Produk Halal',
            type: 'Baru',
            applicant: 'Agus Setiawan',
            status: 'Approved',
            deadline: '08 Jun 2025',
        },
        {
            id: 'PM-2025-0062',
            title: 'Training of Trainer Keamanan Pangan',
            type: 'Baru',
            applicant: 'Joko Susilo',
            status: 'Approved',
            deadline: '05 Jun 2025',
        },
        {
            id: 'PM-2025-0061',
            title: 'Penyusunan Manual SJPH Terintegrasi',
            type: 'Revisi',
            applicant: 'Eko Prasetyo',
            status: 'Menunggu Approval',
            deadline: '04 Jun 2025',
        },
        {
            id: 'PM-2025-0060',
            title: 'Audit Internal Keamanan Pangan Tingkat Lanjut',
            type: 'Baru',
            applicant: 'Linda Sari',
            status: 'Revisi',
            deadline: '02 Jun 2025',
        },
        {
            id: 'PM-2025-0059',
            title: 'Kriteria Sistem Jaminan Produk Halal',
            type: 'Baru',
            applicant: 'Heri Setiawan',
            status: 'Approved',
            deadline: '28 May 2025',
        },
        {
            id: 'PM-2025-0058',
            title: 'Pelatihan Penyelia Halal untuk UMKM',
            type: 'Baru',
            applicant: 'Nina Rahayu',
            status: 'Approved',
            deadline: '25 May 2025',
        },
        {
            id: 'PM-2025-0057',
            title: 'Dokumentasi dan Implementasi Sistem Halal',
            type: 'Revisi',
            applicant: 'Yudi Prabowo',
            status: 'Menunggu Approval',
            deadline: '20 May 2025',
        },
        {
            id: 'PM-2025-0056',
            title: 'Teknik Audit Berbasis Risiko Modul 2',
            type: 'Baru',
            applicant: 'Rini Astuti',
            status: 'Approved',
            deadline: '18 May 2025',
        },
        {
            id: 'PM-2025-0055',
            title: 'Penyusunan Laporan Evaluasi Pelatihan',
            type: 'Baru',
            applicant: 'Dedi Wijaya',
            status: 'Approved',
            deadline: '15 May 2025',
        },
        {
            id: 'PM-2025-0054',
            title: 'Manajemen Mutu Laboratorium Halal',
            type: 'Revisi',
            applicant: 'Maya Indah',
            status: 'Approved',
            deadline: '10 May 2025',
        },
        {
            id: 'PM-2025-0053',
            title: 'Pengenalan Sertifikasi Halal Internasional',
            type: 'Baru',
            applicant: 'Bambang Utomo',
            status: 'Revisi',
            deadline: '08 May 2025',
        },
    ];

    // Filter requests based on user role: basic User can only see their own requests
    const filteredRequests = role === 'User' ? allRequests.filter((req) => req.applicant === user?.name) : allRequests;

    // Compute paginated requests
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

    // Donut chart calculations
    const totalApproval = 60;
    const approvedCount = 42;
    const pendingCount = 10;
    const rejectedCount = 8;

    const approvalData = [
        { name: 'Approved', value: 42, fill: '#10b981' },
        { name: 'Rejected', value: 8, fill: '#ef4444' },
        { name: 'Menunggu', value: 10, fill: '#f59e0b' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Modul Pelatihan" />

            <div className="flex h-full flex-1 flex-col gap-6 bg-neutral-50/60 p-6 dark:bg-neutral-900/10">
                {/* Header Section */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                        Dashboard Modul Pelatihan <span className="text-blue-600 capitalize dark:text-blue-400">({user?.role})</span>
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Selamat datang kembali, <span className="font-semibold text-neutral-800 dark:text-neutral-200">{user?.name}</span>. Monitoring
                        pengajuan, approval, revisi, dan database modul pelatihan.
                    </p>
                </div>

                {/* Dashboard Grid (Main & Sidebar columns) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* LEFT COLUMN: Main dashboard contents */}
                    <div className="space-y-6 lg:col-span-3">
                        {/* 1. Summary Metrics cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {/* Total Modul */}
                            <Card className="group border-neutral-200/80 bg-white shadow-sm transition-all duration-300 hover:border-blue-500/30 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-105 dark:bg-blue-950/50 dark:text-blue-400">
                                        <Database className="size-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Total Modul</span>
                                        <span className="mt-0.5 text-2xl font-bold text-neutral-900 dark:text-neutral-100">386</span>
                                        <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-500">
                                            <ArrowUpRight className="size-3" />
                                            <span>+18 dari bulan lalu</span>
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Menunggu Approval */}
                            <Card className="group border-neutral-200/80 bg-white shadow-sm transition-all duration-300 hover:border-amber-500/30 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-105 dark:bg-amber-950/50 dark:text-amber-400">
                                        <Clock className="size-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Menunggu Approval</span>
                                        <span className="mt-0.5 text-2xl font-bold text-neutral-900 dark:text-neutral-100">24</span>
                                        <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-500">
                                            <span>+5 dari kemarin</span>
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Modul Approved */}
                            <Card className="group border-neutral-200/80 bg-white shadow-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-105 dark:bg-emerald-950/50 dark:text-emerald-400">
                                        <CheckCircle2 className="size-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Modul Approved</span>
                                        <span className="mt-0.5 text-2xl font-bold text-neutral-900 dark:text-neutral-100">312</span>
                                        <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-500">
                                            <ArrowUpRight className="size-3" />
                                            <span>+24 dari bulan lalu</span>
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Revisi Modul */}
                            <Card className="group border-neutral-200/80 bg-white shadow-sm transition-all duration-300 hover:border-red-500/30 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition-transform group-hover:scale-105 dark:bg-red-950/50 dark:text-red-400">
                                        <FileEdit className="size-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Revisi Modul</span>
                                        <span className="mt-0.5 text-2xl font-bold text-neutral-900 dark:text-neutral-100">50</span>
                                        <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-500">
                                            <span>+7 dari kemarin</span>
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 2. Process Stepper (Alur Proses Modul) */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Alur Proses Modul</h3>
                            </div>
                            <CardContent className="overflow-x-auto p-6">
                                <div className="flex min-w-[700px] flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                    {/* Step 1 */}
                                    <div className="group flex flex-1 flex-col items-center text-center">
                                        <div className="relative mb-3 flex size-12 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400">
                                            <span className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white dark:bg-blue-500">
                                                1
                                            </span>
                                            <Send className="size-5" />
                                        </div>
                                        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Pengajuan</span>
                                        <p className="mt-1 max-w-[130px] text-xs text-neutral-400 dark:text-neutral-500">
                                            Pengaju mengirim modul baru/revisi
                                        </p>
                                    </div>

                                    {/* Dotted Line */}
                                    <div className="hidden h-12 flex-1 items-center justify-center lg:flex">
                                        <div className="w-full border-t-2 border-dashed border-neutral-200 dark:border-neutral-800"></div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="group flex flex-1 flex-col items-center text-center">
                                        <div className="relative mb-3 flex size-12 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400">
                                            <span className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white dark:bg-blue-500">
                                                2
                                            </span>
                                            <FileText className="size-5" />
                                        </div>
                                        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Drafting</span>
                                        <p className="mt-1 max-w-[130px] text-xs text-neutral-400 dark:text-neutral-500">
                                            Penyusunan & upload dokumen modul
                                        </p>
                                    </div>

                                    {/* Dotted Line */}
                                    <div className="hidden h-12 flex-1 items-center justify-center lg:flex">
                                        <div className="w-full border-t-2 border-dashed border-neutral-200 dark:border-neutral-800"></div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="group flex flex-1 flex-col items-center text-center">
                                        <div className="relative mb-3 flex size-12 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400">
                                            <span className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white dark:bg-blue-500">
                                                3
                                            </span>
                                            <UserCheck className="size-5" />
                                        </div>
                                        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Approval</span>
                                        <p className="mt-1 max-w-[130px] text-xs text-neutral-400 dark:text-neutral-500">
                                            Review & approval oleh Manager/PD
                                        </p>
                                    </div>

                                    {/* Dotted Line */}
                                    <div className="hidden h-12 flex-1 items-center justify-center lg:flex">
                                        <div className="w-full border-t-2 border-dashed border-neutral-200 dark:border-neutral-800"></div>
                                    </div>

                                    {/* Step 4 (Approved - Green highlighted) */}
                                    <div className="group flex flex-1 flex-col items-center text-center">
                                        <div className="relative mb-3 flex size-12 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-600 dark:border-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400">
                                            <span className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                                                4
                                            </span>
                                            <ShieldCheck className="size-5" />
                                        </div>
                                        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Approved</span>
                                        <p className="mt-1 max-w-[130px] text-xs text-neutral-400 dark:text-neutral-500">
                                            Modul disetujui dan dipublikasikan
                                        </p>
                                    </div>

                                    {/* Dotted Line */}
                                    <div className="hidden h-12 flex-1 items-center justify-center lg:flex">
                                        <div className="w-full border-t-2 border-dashed border-neutral-200 dark:border-neutral-800"></div>
                                    </div>

                                    {/* Step 5 */}
                                    <div className="group flex flex-1 flex-col items-center text-center">
                                        <div className="relative mb-3 flex size-12 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400">
                                            <span className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white dark:bg-blue-500">
                                                5
                                            </span>
                                            <Users className="size-5" />
                                        </div>
                                        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Tim Training</span>
                                        <p className="mt-1 max-w-[130px] text-xs text-neutral-400 dark:text-neutral-500">
                                            Notifikasi ke tim training untuk tindak lanjut
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. Pengajuan Terbaru Table */}
                        <Card className="overflow-hidden border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Pengajuan Terbaru</h3>
                                <button className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                    <span>Lihat Semua</span>
                                    <ChevronRight className="size-3.5" />
                                </button>
                            </div>

                            <CardContent className="overflow-x-auto p-0">
                                <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-100 bg-neutral-50/50 text-xs font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                            <th className="px-6 py-3.5">No Pengajuan</th>
                                            <th className="px-6 py-3.5">Judul Modul</th>
                                            <th className="px-6 py-3.5">Tipe</th>
                                            <th className="px-6 py-3.5">Pengaju</th>
                                            <th className="px-6 py-3.5">Status</th>
                                            <th className="px-6 py-3.5">Deadline</th>
                                            <th className="px-6 py-3.5 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {currentRequests.map((req) => (
                                            <tr key={req.id} className="transition-colors hover:bg-neutral-50/30 dark:hover:bg-neutral-900/10">
                                                <td className="px-6 py-4 text-xs font-semibold text-blue-600 dark:text-blue-400">{req.id}</td>
                                                <td className="px-6 py-4 font-medium text-neutral-800 dark:text-neutral-200">{req.title}</td>
                                                <td className="px-6 py-4">
                                                    <Badge
                                                        variant="secondary"
                                                        className={`rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${
                                                            req.type === 'Baru'
                                                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                                                                : 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300'
                                                        }`}
                                                    >
                                                        {req.type}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-neutral-600 dark:text-neutral-300">{req.applicant}</td>
                                                <td className="px-6 py-4">
                                                    <Badge
                                                        className={`rounded-md border-0 px-2.5 py-0.5 text-[10px] font-semibold ${
                                                            req.status === 'Approved'
                                                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                : req.status === 'Menunggu Approval'
                                                                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300'
                                                                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                                                        }`}
                                                    >
                                                        {req.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                    {req.deadline}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button className="flex size-7 items-center justify-center rounded text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800">
                                                            <Eye className="size-4" />
                                                        </button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="flex size-7 items-center justify-center rounded text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800">
                                                                    <MoreVertical className="size-4" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-36">
                                                                <DropdownMenuItem className="cursor-pointer text-xs font-medium">
                                                                    Detail Modul
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="cursor-pointer text-xs font-medium">
                                                                    Edit Pengajuan
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="cursor-pointer text-xs font-medium text-rose-600">
                                                                    Batalkan
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>

                            {/* Table Pagination Footer */}
                            <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/20 px-6 py-4 dark:border-neutral-800">
                                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                    Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, allRequests.length)} dari {allRequests.length} data
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                    >
                                        &lt;
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`flex size-7 items-center justify-center rounded border text-xs font-semibold ${
                                                currentPage === i + 1
                                                    ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                    >
                                        &gt;
                                    </button>
                                </div>
                            </div>
                        </Card>

                        {/* 4. Bottom Grid: Donut Chart & Module Matrix */}
                        {role !== 'User' && (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
                                {/* Ringkasan Approval Donut Chart */}
                                {(role === 'admin' || role === 'manager PD') && (
                                    <Card className="flex flex-col justify-between border-neutral-200/80 bg-white shadow-sm md:col-span-2 dark:border-neutral-800 dark:bg-neutral-950">
                                        <div className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                                Ringkasan Approval (Bulan Ini)
                                            </h3>
                                        </div>
                                        <CardContent className="flex flex-1 items-center justify-center gap-6 p-6">
                                            {/* SVG Donut Chart */}
                                            <div className="relative flex h-28 w-28 flex-shrink-0 items-center justify-center">
                                                <ChartContainer config={chartConfig} className="h-28 w-28 flex-shrink-0">
                                                    <PieChart>
                                                        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                                        <Pie
                                                            data={approvalData}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            innerRadius={28}
                                                            outerRadius={38}
                                                            strokeWidth={0}
                                                        >
                                                            {approvalData.map((entry, index) => (
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
                                                                                    className="fill-foreground text-2xl font-extrabold text-neutral-800 dark:fill-neutral-100"
                                                                                >
                                                                                    {totalApproval}
                                                                                </text>
                                                                                <text
                                                                                    x={viewBox.cx}
                                                                                    y={(viewBox.cy || 0) + 14}
                                                                                    textAnchor="middle"
                                                                                    dominantBaseline="middle"
                                                                                    className="fill-muted-foreground text-[9px] font-semibold tracking-wider text-neutral-400 uppercase dark:text-neutral-500"
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

                                            {/* Donut Legend Table */}
                                            <div className="flex-1 space-y-2.5">
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="size-2.5 rounded-full bg-emerald-500"></span>
                                                        <span className="font-medium text-neutral-500 dark:text-neutral-400">Approved</span>
                                                    </div>
                                                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                                        42{' '}
                                                        <span className="ml-1 text-[10px] font-normal text-neutral-400 dark:text-neutral-500">
                                                            70%
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="size-2.5 rounded-full bg-rose-500"></span>
                                                        <span className="font-medium text-neutral-500 dark:text-neutral-400">Rejected</span>
                                                    </div>
                                                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                                        8{' '}
                                                        <span className="ml-1 text-[10px] font-normal text-neutral-400 dark:text-neutral-500">
                                                            13%
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="size-2.5 rounded-full bg-amber-500"></span>
                                                        <span className="font-medium text-neutral-500 dark:text-neutral-400">Menunggu</span>
                                                    </div>
                                                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                                        10{' '}
                                                        <span className="ml-1 text-[10px] font-normal text-neutral-400 dark:text-neutral-500">
                                                            17%
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Matriks Modul Pelatihan Preview */}
                                <Card
                                    className={`border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 ${
                                        role === 'admin' || role === 'manager PD' ? 'md:col-span-3' : 'md:col-span-5'
                                    }`}
                                >
                                    <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                            Matriks Modul Pelatihan (Preview)
                                        </h3>
                                        <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                            Lihat Selengkapnya
                                        </button>
                                    </div>
                                    <CardContent className="overflow-x-auto p-0">
                                        <table className="w-full min-w-[500px] border-collapse text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                                    <th className="px-4 py-3 font-semibold">Kode Materi</th>
                                                    <th className="px-4 py-3 font-semibold">Judul Modul / Program Pelatihan</th>
                                                    {['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8'].map((rev) => (
                                                        <th key={rev} className="px-2 py-3 text-center font-semibold">
                                                            {rev}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                                {/* Row 1 */}
                                                <tr className="transition-colors hover:bg-neutral-50/30 dark:hover:bg-neutral-900/10">
                                                    <td className="px-4 py-3.5 font-bold text-neutral-700 dark:text-neutral-300">ILN.1.5</td>
                                                    <td className="px-4 py-3.5 font-medium text-neutral-800 dark:text-neutral-200">
                                                        TKDN & Produk Dalam Negeri
                                                    </td>
                                                    <td className="px-2 py-3.5 text-center">
                                                        <Check className="mx-auto size-3.5 font-bold text-emerald-500" />
                                                    </td>
                                                    <td className="px-2 py-3.5 text-center">
                                                        <Check className="mx-auto size-3.5 font-bold text-emerald-500" />
                                                    </td>
                                                    <td className="px-2 py-3.5 text-center text-neutral-300 dark:text-neutral-700">-</td>
                                                    <td className="px-2 py-3.5 text-center">
                                                        <Check className="mx-auto size-3.5 font-bold text-emerald-500" />
                                                    </td>
                                                    <td className="px-2 py-3.5 text-center text-neutral-300 dark:text-neutral-700">-</td>
                                                    <td className="px-2 py-3.5 text-center">
                                                        <Check className="mx-auto size-3.5 font-bold text-emerald-500" />
                                                    </td>
                                                    <td className="px-2 py-3.5 text-center text-neutral-300 dark:text-neutral-700">-</td>
                                                    <td className="px-2 py-3.5 text-center">
                                                        <Check className="mx-auto size-3.5 font-bold text-emerald-500" />
                                                    </td>
                                                </tr>
                                                {/* Row 2 */}
                                                <tr className="transition-colors hover:bg-neutral-50/30 dark:hover:bg-neutral-900/10">
                                                    <td className="px-4 py-3.5 font-bold text-neutral-700 dark:text-neutral-300">ILN.1.6</td>
                                                    <td className="px-4 py-3.5 font-medium text-neutral-800 dark:text-neutral-200">
                                                        HCA Competency of Halal Laboratories
                                                    </td>
                                                    <td className="px-2 py-3.5 text-center text-neutral-300 dark:text-neutral-700">-</td>
                                                    <td className="px-2 py-3.5 text-center text-neutral-300 dark:text-neutral-700">-</td>
                                                    <td className="px-2 py-3.5 text-center text-neutral-300 dark:text-neutral-700">-</td>
                                                    <td className="px-2 py-3.5 text-center text-neutral-300 dark:text-neutral-700">-</td>
                                                    <td className="px-2 py-3.5 text-center">
                                                        <Check className="mx-auto size-3.5 font-bold text-emerald-500" />
                                                    </td>
                                                    <td className="px-2 py-3.5 text-center text-neutral-300 dark:text-neutral-700">-</td>
                                                    <td className="px-2 py-3.5 text-center">
                                                        <Check className="mx-auto size-3.5 font-bold text-emerald-500" />
                                                    </td>
                                                    <td className="px-2 py-3.5 text-center text-neutral-300 dark:text-neutral-700">-</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Table Legend */}
                                        <div className="flex items-center gap-4 border-t border-neutral-100 bg-neutral-50/10 px-6 py-3 text-[10px] font-medium text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                                            <div className="flex items-center gap-1">
                                                <Check className="size-3 font-bold text-emerald-500" />
                                                <span>Ada Modul</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-neutral-300 dark:text-neutral-700">-</span>
                                                <span>Belum Ada Modul</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Activities, actions, storage capacity and warning alerts */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* 1. Aktivitas Terbaru feed */}
                        <Card className="flex flex-col border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Aktivitas Terbaru</h3>
                                <button className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                    Lihat Semua
                                </button>
                            </div>
                            <CardContent className="flex-1 p-5">
                                <div className="relative space-y-6 border-l border-neutral-100 pl-5 dark:border-neutral-800">
                                    {/* Activity 1 */}
                                    <div className="relative">
                                        <span className="absolute top-1 -left-[26px] flex size-3 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white dark:ring-neutral-950"></span>
                                        <div className="flex flex-col gap-0.5 text-xs">
                                            <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                                Modul{' '}
                                                <span className="font-semibold text-neutral-900 dark:text-white">
                                                    "Sistem Manajemen Halal (SJPH)"
                                                </span>{' '}
                                                disetujui oleh Manager PD.
                                            </span>
                                            <span className="mt-1 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
                                                Oleh Siti Nurhayati
                                            </span>
                                            <span className="mt-0.5 text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                                                10 menit lalu
                                            </span>
                                        </div>
                                    </div>

                                    {/* Activity 2 */}
                                    <div className="relative">
                                        <span className="absolute top-1 -left-[26px] flex size-3 items-center justify-center rounded-full bg-amber-500 ring-4 ring-white dark:ring-neutral-950"></span>
                                        <div className="flex flex-col gap-0.5 text-xs">
                                            <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                                Pengajuan baru{' '}
                                                <span className="font-semibold text-neutral-900 dark:text-white">
                                                    "Pelatihan Internal Audit Berbasis Risiko"
                                                </span>{' '}
                                                menunggu approval.
                                            </span>
                                            <span className="mt-1 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
                                                Oleh Andi Pratama
                                            </span>
                                            <span className="mt-0.5 text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                                                35 menit lalu
                                            </span>
                                        </div>
                                    </div>

                                    {/* Activity 3 */}
                                    <div className="relative">
                                        <span className="absolute top-1 -left-[26px] flex size-3 items-center justify-center rounded-full bg-purple-500 ring-4 ring-white dark:ring-neutral-950"></span>
                                        <div className="flex flex-col gap-0.5 text-xs">
                                            <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                                Revisi diajukan untuk{' '}
                                                <span className="font-semibold text-neutral-900 dark:text-white">"Kompetensi Auditor Halal"</span>.
                                            </span>
                                            <span className="mt-1 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
                                                Oleh Budi Santoso
                                            </span>
                                            <span className="mt-0.5 text-[10px] font-medium text-neutral-400 dark:text-neutral-500">1 jam lalu</span>
                                        </div>
                                    </div>

                                    {/* Activity 4 */}
                                    <div className="relative">
                                        <span className="absolute top-1 -left-[26px] flex size-3 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white dark:ring-neutral-950"></span>
                                        <div className="flex flex-col gap-0.5 text-xs">
                                            <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                                Dokumen diupload pada modul{' '}
                                                <span className="font-semibold text-neutral-900 dark:text-white">"Pemeriksaan Bahan PPH"</span>.
                                            </span>
                                            <span className="mt-1 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
                                                Oleh Rina Apriyani
                                            </span>
                                            <span className="mt-0.5 text-[10px] font-medium text-neutral-400 dark:text-neutral-500">2 jam lalu</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Quick Action Buttons */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Quick Action</h3>
                            </div>
                            <CardContent className="space-y-3 p-5">
                                {/* Solid Button */}
                                <Button className="h-10 w-full justify-between rounded-lg bg-blue-600 px-4 font-semibold text-white transition-all hover:translate-x-0.5 hover:bg-blue-700">
                                    <div className="flex items-center gap-2">
                                        <Plus className="size-4" />
                                        <span className="text-xs">Ajukan Modul Baru</span>
                                    </div>
                                    <ChevronRight className="size-4" />
                                </Button>
                                {/* Outline Button */}
                                <Button
                                    variant="outline"
                                    className="h-10 w-full justify-between rounded-lg border-blue-600 px-4 font-semibold text-blue-600 transition-all hover:translate-x-0.5 hover:bg-blue-50/30 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950/20"
                                >
                                    <div className="flex items-center gap-2">
                                        <UploadCloud className="size-4" />
                                        <span className="text-xs">Upload Revisi Modul</span>
                                    </div>
                                    <ChevronRight className="size-4" />
                                </Button>
                            </CardContent>
                        </Card>

                        {/* 3. Penyimpanan Dokumen Widget */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Penyimpanan Dokumen (PDF)</h3>
                            </div>
                            <CardContent className="p-5">
                                <div className="space-y-4">
                                    {/* Capacity Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                            <span>
                                                28.4 GB{' '}
                                                <span className="font-medium text-neutral-400 dark:text-neutral-500">dari 100 GB digunakan</span>
                                            </span>
                                            <span className="text-blue-600 dark:text-blue-400">28%</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                            <div className="h-full rounded-full bg-blue-600 dark:bg-blue-500" style={{ width: '28.4%' }}></div>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 pt-3.5 text-xs dark:border-neutral-800">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-neutral-400 dark:text-neutral-500">Total File</span>
                                            <span className="mt-0.5 font-bold text-neutral-800 dark:text-neutral-200">1,248</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-neutral-400 dark:text-neutral-500">Sisa Kapasitas</span>
                                            <span className="mt-0.5 font-bold text-neutral-800 dark:text-neutral-200">71.6 GB</span>
                                        </div>
                                    </div>

                                    {/* Action Link */}
                                    <button className="block text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                                        Kelola Penyimpanan
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 4. Notifikasi Penting Box */}
                        {(role === 'admin' || role === 'manager PD') && (
                            <div className="flex flex-col gap-3 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4.5 shadow-sm dark:border-amber-950/40 dark:bg-amber-950/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                        <AlertTriangle className="size-4.5" />
                                        <span className="text-xs font-bold tracking-wider uppercase">Notifikasi Penting</span>
                                    </div>
                                    <button className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                        Lihat Semua
                                    </button>
                                </div>
                                <p className="text-xs leading-relaxed font-semibold text-neutral-700 dark:text-neutral-300">
                                    5 modul akan melewati deadline dalam 3 hari. Segera lakukan approval atau tindak lanjut.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
