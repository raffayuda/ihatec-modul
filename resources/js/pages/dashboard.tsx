import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowUpRight,
    CheckCircle2,
    ChevronRight,
    Clock,
    Database,
    FileEdit,
    FileText,
    Grid,
    MoreVertical,
    Plus,
    Send,
    ShieldCheck,
    UploadCloud,
    UserCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Cell, Label, Pie, PieChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Modul Pelatihan',
        href: '/dashboard',
    },
];

interface RequestItem {
    id: string;
    title: string;
    type: 'Baru' | 'Revisi';
    applicant: string;
    status: string;
    deadline: string;
}

interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    pendingUsers: number;
    inactiveUsers: number;
    totalModules: number;
    approvedModules: number;
    pendingRequests: number;
}

interface ManagerStats {
    totalModules: number;
    pendingApprovals: number;
    approvedModules: number;
    revisionCount: number;
}

interface StafStats {
    draft: number;
    drafting: number;
    waitingApproval: number;
    approved: number;
    rejected: number;
}

interface TimTrainingStats {
    approvedModules: number;
    newApproved: number;
    totalModules: number;
    revisionsApproved: number;
}

interface UserStats {
    total: number;
    inProgress: number;
    approved: number;
    rejected: number;
}

interface ApprovalSummary {
    approved: number;
    rejected: number;
    pending: number;
}

interface RoleDistribution {
    [role: string]: number;
}

interface DashboardProps extends SharedData {
    stats: AdminStats | ManagerStats | StafStats | TimTrainingStats | UserStats;
    recentRequests?: RequestItem[];
    approvalSummary?: ApprovalSummary;
    roleDistribution?: RoleDistribution;
}

const chartConfig = {
    approved: { label: 'Approved', color: '#10b981' },
    rejected: { label: 'Rejected', color: '#ef4444' },
    pending: { label: 'Menunggu', color: '#f59e0b' },
};

export default function Dashboard() {
    const { auth, stats, recentRequests = [], approvalSummary, roleDistribution } =
        usePage<DashboardProps>().props;

    const user = auth?.user;
    const role = user?.role || 'User';
    const roleLower = role.toLowerCase();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 5;

    // Paginate requests
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRequests = recentRequests.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(recentRequests.length / itemsPerPage);

    // Donut chart data from real approval summary
    const approvalData = approvalSummary
        ? [
              { name: 'Approved', value: approvalSummary.approved || 0, fill: '#10b981' },
              { name: 'Rejected', value: approvalSummary.rejected || 0, fill: '#ef4444' },
              { name: 'Menunggu', value: approvalSummary.pending || 0, fill: '#f59e0b' },
          ]
        : [
              { name: 'Approved', value: 0, fill: '#10b981' },
              { name: 'Rejected', value: 0, fill: '#ef4444' },
              { name: 'Menunggu', value: 0, fill: '#f59e0b' },
          ];
    const totalApproval = approvalData.reduce((a, b) => a + b.value, 0);

    // Metrics cards — built per role from real DB data
    const buildMetricCards = () => {
        if (roleLower === 'tim training') {
            const s = stats as TimTrainingStats;
            return [
                { title: 'Total Modul Approved', value: String(s.approvedModules ?? 0), icon: Database, bgColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400', hoverBorder: 'hover:border-emerald-500/30', trend: 'Total modul aktif' },
                { title: 'Modul Baru Bulan Ini', value: String(s.newApproved ?? 0), icon: ShieldCheck, bgColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400', hoverBorder: 'hover:border-blue-500/30', trend: 'Approved bulan ini' },
                { title: 'Revisi Approved', value: String(s.revisionsApproved ?? 0), icon: FileEdit, bgColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400', hoverBorder: 'hover:border-amber-500/30', trend: 'Revisi disetujui' },
                { title: 'Total Semua Modul', value: String(s.totalModules ?? 0), icon: Grid, bgColor: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400', hoverBorder: 'hover:border-purple-500/30', trend: 'Termasuk arsip' },
            ];
        }

        if (roleLower === 'admin') {
            const s = stats as AdminStats;
            return [
                { title: 'Total Pengguna', value: String(s.totalUsers ?? 0), icon: Users, bgColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400', hoverBorder: 'hover:border-blue-500/30', trend: `${s.activeUsers ?? 0} aktif` },
                { title: 'Total Modul', value: String(s.totalModules ?? 0), icon: Database, bgColor: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400', hoverBorder: 'hover:border-purple-500/30', trend: `${s.approvedModules ?? 0} approved` },
                { title: 'Modul Approved', value: String(s.approvedModules ?? 0), icon: CheckCircle2, bgColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400', hoverBorder: 'hover:border-emerald-500/30', trend: 'Modul final' },
                { title: 'Menunggu Approval', value: String(s.pendingRequests ?? 0), icon: Clock, bgColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400', hoverBorder: 'hover:border-amber-500/30', trend: 'Perlu tindak lanjut' },
            ];
        }

        if (roleLower === 'manager pd') {
            const s = stats as ManagerStats;
            return [
                { title: 'Total Modul', value: String(s.totalModules ?? 0), icon: Database, bgColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400', hoverBorder: 'hover:border-blue-500/30', trend: 'Di sistem' },
                { title: 'Menunggu Approval', value: String(s.pendingApprovals ?? 0), icon: Clock, bgColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400', hoverBorder: 'hover:border-amber-500/30', trend: 'Butuh review' },
                { title: 'Modul Approved', value: String(s.approvedModules ?? 0), icon: CheckCircle2, bgColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400', hoverBorder: 'hover:border-emerald-500/30', trend: 'Modul final' },
                { title: 'Dalam Revisi', value: String(s.revisionCount ?? 0), icon: FileEdit, bgColor: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400', hoverBorder: 'hover:border-purple-500/30', trend: 'Perlu perhatian' },
            ];
        }

        if (roleLower === 'staf pd') {
            const s = stats as StafStats;
            return [
                { title: 'Pengajuan Baru', value: String(s.draft ?? 0), icon: FileText, bgColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400', hoverBorder: 'hover:border-blue-500/30', trend: 'Status Baru' },
                { title: 'Sedang Drafting', value: String(s.drafting ?? 0), icon: FileEdit, bgColor: 'bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400', hoverBorder: 'hover:border-neutral-500/30', trend: 'Dalam penyusunan' },
                { title: 'Menunggu Approval', value: String(s.waitingApproval ?? 0), icon: Clock, bgColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400', hoverBorder: 'hover:border-amber-500/30', trend: 'Sudah dikirim' },
                { title: 'Selesai', value: String(s.approved ?? 0), icon: CheckCircle2, bgColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400', hoverBorder: 'hover:border-emerald-500/30', trend: `${s.rejected ?? 0} ditolak` },
            ];
        }

        // Default User role
        const s = stats as UserStats;
        return [
            { title: 'Total Pengajuan', value: String(s.total ?? 0), icon: FileText, bgColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400', hoverBorder: 'hover:border-blue-500/30', trend: 'Semua pengajuan saya' },
            { title: 'Dalam Proses', value: String(s.inProgress ?? 0), icon: Clock, bgColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400', hoverBorder: 'hover:border-amber-500/30', trend: 'Sedang diproses' },
            { title: 'Disetujui', value: String(s.approved ?? 0), icon: CheckCircle2, bgColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400', hoverBorder: 'hover:border-emerald-500/30', trend: 'Pengajuan selesai' },
            { title: 'Ditolak', value: String(s.rejected ?? 0), icon: AlertTriangle, bgColor: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400', hoverBorder: 'hover:border-red-500/30', trend: 'Perlu revisi' },
        ];
    };

    const metricsCards = buildMetricCards();

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Approved':
            case 'Selesai':
                return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
            case 'Menunggu Approval':
                return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
            case 'Ditolak':
                return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
            case 'Drafting':
                return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300';
            case 'Baru':
                return 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300';
            default:
                return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300';
        }
    };

    const getHeadingByRole = () => {
        if (roleLower === 'admin') return 'Ringkasan Sistem';
        if (roleLower === 'manager pd') return 'Antrian Approval';
        if (roleLower === 'staf pd') return 'Status Pengajuan';
        if (roleLower === 'tim training') return 'Modul Tersedia';
        return 'Pengajuan Saya';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                        Selamat Datang, {user?.name ?? 'Pengguna'} 👋
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {roleLower === 'admin' && 'Pantau seluruh aktivitas sistem manajemen modul pelatihan.'}
                        {roleLower === 'manager pd' && 'Tinjau dan kelola persetujuan pengajuan modul.'}
                        {roleLower === 'staf pd' && 'Kelola pengajuan modul dan proses administrasi.'}
                        {roleLower === 'tim training' && 'Temukan modul pelatihan yang telah disetujui.'}
                        {roleLower === 'user' && 'Pantau status pengajuan modul Anda.'}
                    </p>
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* LEFT COLUMN (3/4) */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Metric Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {metricsCards.map((card) => (
                                <Card
                                    key={card.title}
                                    className={`border-neutral-200/80 bg-white shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-950 ${card.hoverBorder}`}
                                >
                                    <CardContent className="flex items-center gap-4 p-5">
                                        <div className={`flex aspect-square size-12 flex-shrink-0 items-center justify-center rounded-2xl ${card.bgColor}`}>
                                            <card.icon className="size-6" />
                                        </div>
                                        <div className="flex min-w-0 flex-col">
                                            <span className="truncate text-xs font-semibold text-neutral-400 dark:text-neutral-500">{card.title}</span>
                                            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{card.value}</span>
                                            <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 mt-1">{card.trend}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Requests Table */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 overflow-hidden">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 flex items-center justify-between">
                                <h2 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                                    {getHeadingByRole()}
                                </h2>
                                <Link
                                    href={roleLower === 'manager pd' ? '/approval' : '/pengajuan'}
                                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Lihat Semua
                                    <ArrowUpRight className="size-3.5" />
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px] border-collapse text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                            <th className="px-5 py-3.5">ID</th>
                                            <th className="px-5 py-3.5">Judul Modul</th>
                                            <th className="px-5 py-3.5">Tipe</th>
                                            <th className="px-5 py-3.5">Pengaju</th>
                                            <th className="px-5 py-3.5">Deadline</th>
                                            <th className="px-5 py-3.5">Status</th>
                                            <th className="px-5 py-3.5 text-center w-16">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {currentRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-10 text-center text-neutral-400 dark:text-neutral-500 font-medium">
                                                    Belum ada data pengajuan.
                                                </td>
                                            </tr>
                                        ) : (
                                            currentRequests.map((req) => (
                                                <tr key={req.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20 transition-colors">
                                                    <td className="px-5 py-4 font-mono text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                                        {req.id}
                                                    </td>
                                                    <td className="px-5 py-4 max-w-[200px]">
                                                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 leading-tight line-clamp-1">
                                                            {req.title}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <Badge
                                                            variant="secondary"
                                                            className={`border-0 px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                                                                req.type === 'Baru'
                                                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                                                                    : 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300'
                                                            }`}
                                                        >
                                                            {req.type}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-5 py-4 font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                                                        {req.applicant}
                                                    </td>
                                                    <td className="px-5 py-4 font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                                        {req.deadline}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <Badge
                                                            className={`border-0 px-2 py-0.5 text-[10px] font-semibold rounded-md ${getStatusVariant(req.status)}`}
                                                        >
                                                            {req.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400 mx-auto">
                                                                    <MoreVertical className="size-3.5" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-36 text-xs">
                                                                <DropdownMenuItem className="cursor-pointer font-medium">
                                                                    <Send className="mr-2 size-3.5" /> Lihat Detail
                                                                </DropdownMenuItem>
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
                            <div className="border-t border-neutral-100 dark:border-neutral-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-neutral-500 dark:text-neutral-400">
                                <span className="text-xs font-medium">
                                    Menampilkan {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, recentRequests.length)} dari {recentRequests.length} data
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-xs font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                                    >
                                        ‹
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`flex size-7 items-center justify-center rounded text-xs font-semibold border ${
                                                page === currentPage
                                                    ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500'
                                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="flex size-7 items-center justify-center rounded border border-neutral-200 bg-white text-xs font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN (1/4) */}
                    <div className="space-y-6 lg:col-span-1">

                        {/* Approval Summary Donut Chart */}
                        {approvalSummary && (
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                                <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Rekap Approval</h3>
                                </div>
                                <CardContent className="p-5 flex flex-col items-center gap-4">
                                    <ChartContainer config={chartConfig} className="h-36 w-36 flex-shrink-0">
                                        <PieChart>
                                            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                            <Pie
                                                data={approvalData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={34}
                                                outerRadius={50}
                                                strokeWidth={0}
                                            >
                                                {approvalData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                                <Label
                                                    content={({ viewBox }) => {
                                                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                                            return (
                                                                <g>
                                                                    <text
                                                                        x={viewBox.cx}
                                                                        y={viewBox.cy}
                                                                        textAnchor="middle"
                                                                        dominantBaseline="middle"
                                                                        className="fill-foreground text-xl font-extrabold"
                                                                    >
                                                                        {totalApproval}
                                                                    </text>
                                                                    <text
                                                                        x={viewBox.cx}
                                                                        y={(viewBox.cy || 0) + 14}
                                                                        textAnchor="middle"
                                                                        dominantBaseline="middle"
                                                                        className="fill-muted-foreground text-[8px] font-bold uppercase tracking-wider"
                                                                    >
                                                                        Total
                                                                    </text>
                                                                </g>
                                                            );
                                                        }
                                                    }}
                                                />
                                            </Pie>
                                        </PieChart>
                                    </ChartContainer>
                                    <div className="w-full space-y-2 text-xs">
                                        {approvalData.map((item) => (
                                            <div key={item.name} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="size-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                                                    <span className="text-neutral-500 dark:text-neutral-400 font-medium">{item.name}</span>
                                                </div>
                                                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                                    {item.value}
                                                    <span className="ml-1 text-[10px] font-normal text-neutral-400">
                                                        ({totalApproval > 0 ? ((item.value / totalApproval) * 100).toFixed(0) : 0}%)
                                                    </span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Role Distribution (admin only) */}
                        {role === 'admin' && roleDistribution && (
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                                <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Distribusi Role</h3>
                                </div>
                                <CardContent className="p-5 space-y-3 text-xs">
                                    {Object.entries(roleDistribution).map(([roleKey, count]) => (
                                        <div key={roleKey} className="flex items-center justify-between">
                                            <span className="font-medium text-neutral-600 dark:text-neutral-400 capitalize">{roleKey}</span>
                                            <span className="font-bold text-neutral-800 dark:text-neutral-200">{count}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Quick Action</h3>
                            </div>
                            <CardContent className="space-y-3 p-5">
                                <Link href="/pengajuan">
                                    <Button className="h-10 w-full justify-between rounded-lg bg-blue-600 px-4 font-semibold text-white transition-all hover:translate-x-0.5 hover:bg-blue-700 mb-3">
                                        <div className="flex items-center gap-2">
                                            <Plus className="size-4" />
                                            <span className="text-xs">Ajukan Modul Baru</span>
                                        </div>
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </Link>
                                <Link href="/database">
                                    <Button
                                        variant="outline"
                                        className="h-10 w-full justify-between rounded-lg border-blue-600 px-4 font-semibold text-blue-600 transition-all hover:translate-x-0.5 hover:bg-blue-50/30 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950/20"
                                    >
                                        <div className="flex items-center gap-2">
                                            <UploadCloud className="size-4" />
                                            <span className="text-xs">Database Modul</span>
                                        </div>
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Notification Box */}
                        {(roleLower === 'admin' || roleLower === 'manager pd') && (stats as AdminStats | ManagerStats) && (
                            (() => {
                                const pending = roleLower === 'admin'
                                    ? (stats as AdminStats).pendingRequests
                                    : (stats as ManagerStats).pendingApprovals;
                                return pending > 0 ? (
                                    <div className="flex flex-col gap-3 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-sm dark:border-amber-950/40 dark:bg-amber-950/20">
                                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                            <AlertTriangle className="size-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Perlu Tindak Lanjut</span>
                                        </div>
                                        <p className="text-xs leading-relaxed font-semibold text-neutral-700 dark:text-neutral-300">
                                            Ada <span className="text-amber-700 dark:text-amber-400 font-bold">{pending}</span> pengajuan yang menunggu approval.
                                        </p>
                                        <Link href="/approval" className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400">
                                            Buka Halaman Approval →
                                        </Link>
                                    </div>
                                ) : null;
                            })()
                        )}

                        {roleLower === 'tim training' && (
                            <div className="flex flex-col gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-sm dark:border-emerald-950/40 dark:bg-emerald-950/20">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle2 className="size-4 animate-bounce" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Notifikasi Modul</span>
                                </div>
                                <p className="text-xs leading-relaxed font-semibold text-neutral-700 dark:text-neutral-300">
                                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                        {(stats as TimTrainingStats).newApproved}
                                    </span> modul baru disetujui bulan ini dan siap digunakan dalam Matriks Pelatihan.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
