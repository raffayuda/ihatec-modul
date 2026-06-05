import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    BarChart3,
    ShieldCheck,
    Edit3,
    Users,
    Calendar,
    Settings,
    Download,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    FileText,
    TrendingUp,
    Play,
    AlertCircle,
    Info,
    Check
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Cell,
    PieChart,
    Pie,
    Label
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Report',
        href: '/report',
    },
];

interface SavedReportItem {
    id: string;
    name: string;
    period: string;
    author: string;
    format: 'PDF' | 'Excel' | 'CSV';
    lastGenerated: string;
}

interface ScheduledReportItem {
    id: string;
    name: string;
    scheduleText: string;
    status: 'Aktif' | 'Nonaktif';
}

const chartConfig = {
    pengajuan: {
        label: 'Pengajuan',
        color: '#3b82f6',
    },
    approval: {
        label: 'Approval',
        color: '#10b981',
    },
    aktif: {
        label: 'Aktif',
        color: '#10b981',
    },
    menunggu: {
        label: 'Menunggu Approval',
        color: '#3b82f6',
    },
    draft: {
        label: 'Draft',
        color: '#f59e0b',
    },
    nonaktif: {
        label: 'Nonaktif',
        color: '#9ca3af',
    },
    teknis: {
        label: 'Teknis',
        color: '#3b82f6',
    },
    softskill: {
        label: 'Soft Skill',
        color: '#10b981',
    },
    kepemimpinan: {
        label: 'Kepemimpinan',
        color: '#f59e0b',
    },
    kepatuhan: {
        label: 'Kepatuhan',
        color: '#8b5cf6',
    },
    lainnya: {
        label: 'Lainnya',
        color: '#9ca3af',
    },
};

export default function Report() {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;
    const role = user?.role || 'User';

    // Mock dataset matching the user's screenshot
    const [reports, setReports] = useState<SavedReportItem[]>([
        { id: '1', name: 'Laporan Pengajuan & Approval Bulanan', period: 'Mei 2024', author: 'Raffa', format: 'PDF', lastGenerated: '31 Mei 2024 09:15' },
        { id: '2', name: 'Laporan Aktivitas User per Unit', period: 'Mei 2024', author: 'Dewi Lestari', format: 'Excel', lastGenerated: '31 Mei 2024 08:45' },
        { id: '3', name: 'Laporan Status Modul', period: 'Mei 2024', author: 'Budi Santoso', format: 'PDF', lastGenerated: '30 Mei 2024 16:30' },
        { id: '4', name: 'Laporan Distribusi Modul', period: 'April 2024', author: 'Mega Kirana', format: 'Excel', lastGenerated: '30 Apr 2024 11:20' },
        { id: '5', name: 'Laporan Approval Rate', period: 'April 2024', author: 'Raffa', format: 'CSV', lastGenerated: '30 Apr 2024 10:10' }
    ]);

    // Schedule lists
    const [schedules, setSchedules] = useState<ScheduledReportItem[]>([
        { id: '1', name: 'Laporan Mingguan', scheduleText: 'Setiap Senin, 09:00 WIB', status: 'Aktif' },
        { id: '2', name: 'Laporan Bulanan', scheduleText: 'Setiap 1 bulan, 09:00 WIB', status: 'Aktif' },
        { id: '3', name: 'Laporan Approval Rate', scheduleText: 'Setiap 1 bulan, 10:00 WIB', status: 'Aktif' }
    ]);

    // Filters
    const [dateRangeText, setDateRangeText] = useState('01 Mei 2024 - 31 Mei 2024');
    const [unitFilter, setUnitFilter] = useState('Semua Unit');
    const [typeFilter, setTypeFilter] = useState('Semua Jenis Report');
    const [formatFilter, setFormatFilter] = useState('Semua Format');

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Filter reports list
    const filteredReports = useMemo(() => {
        return reports.filter((rep) => {
            const matchesFormat = formatFilter === 'Semua Format' || rep.format === formatFilter;
            return matchesFormat;
        });
    }, [reports, formatFilter]);

    // Handle manual generate report
    const handleGenerateReport = () => {
        const newId = String(reports.length + 1);
        const newRep: SavedReportItem = {
            id: newId,
            name: `Laporan Kustom generated_${newId}`,
            period: 'Mei 2024',
            author: user?.name?.split(' ')[0] || 'Raffa',
            format: 'PDF',
            lastGenerated: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
        setReports(prev => [newRep, ...prev]);

        setToastMessage(`Laporan berhasil di-generate secara manual.`);
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Computing reactive metrics & datasets based on active filters
    const dashboardData = useMemo(() => {
        // Default base metrics
        let metrics = {
            modulBulanIni: 42,
            approvalRate: 86,
            pengajuanSelesai: 54,
            userAktif: 186
        };

        // Line Chart: Tren Pengajuan & Approval
        let trendData = [
            { name: '1 Mei', pengajuan: 15, approval: 10 },
            { name: '3 Mei', pengajuan: 22, approval: 14 },
            { name: '5 Mei', pengajuan: 18, approval: 12 },
            { name: '8 Mei', pengajuan: 35, approval: 22 },
            { name: '11 Mei', pengajuan: 28, approval: 18 },
            { name: '14 Mei', pengajuan: 16, approval: 10 },
            { name: '17 Mei', pengajuan: 25, approval: 17 },
            { name: '20 Mei', pengajuan: 20, approval: 12 },
            { name: '23 Mei', pengajuan: 32, approval: 24 },
            { name: '26 Mei', pengajuan: 36, approval: 26 },
            { name: '29 Mei', pengajuan: 28, approval: 19 },
            { name: '31 Mei', pengajuan: 38, approval: 30 },
        ];

        // Bar Chart: Distribusi Modul per Jenis Pelatihan
        let distributionData = [
            { category: 'Teknis', count: 78, fill: '#3b82f6' },
            { category: 'Soft Skill', count: 62, fill: '#10b981' },
            { category: 'Kepemimpinan', count: 45, fill: '#f59e0b' },
            { category: 'Kepatuhan', count: 28, fill: '#8b5cf6' },
            { category: 'Lainnya', count: 17, fill: '#9ca3af' },
        ];

        // Donut Chart: Status Modul
        let statusData = [
            { name: 'Aktif', value: 124, percentage: 50, fill: '#10b981' },
            { name: 'Menunggu Approval', value: 68, percentage: 27, fill: '#3b82f6' },
            { name: 'Draft', value: 36, percentage: 15, fill: '#f59e0b' },
            { name: 'Nonaktif', value: 20, percentage: 8, fill: '#9ca3af' },
        ];

        // Horizontal Bar Chart: Aktivitas User per Unit
        let activityTitle = 'Aktivitas User per Unit';
        let activityData = [
            { name: 'IT & Digital', value: 126, fill: '#2563eb' },
            { name: 'Pengembangan SDM', value: 98, fill: '#3b82f6' },
            { name: 'Keuangan', value: 76, fill: '#60a5fa' },
            { name: 'Operasional', value: 64, fill: '#93c5fd' },
            { name: 'Pemasaran', value: 42, fill: '#cbd5e1' },
        ];

        // Apply filters
        if (unitFilter === 'IT & Digital') {
            metrics = {
                modulBulanIni: 24,
                approvalRate: 92,
                pengajuanSelesai: 20,
                userAktif: 64
            };

            trendData = [
                { name: '1 Mei', pengajuan: 8, approval: 6 },
                { name: '3 Mei', pengajuan: 12, approval: 10 },
                { name: '5 Mei', pengajuan: 9, approval: 8 },
                { name: '8 Mei', pengajuan: 18, approval: 16 },
                { name: '11 Mei', pengajuan: 14, approval: 13 },
                { name: '14 Mei', pengajuan: 7, approval: 7 },
                { name: '17 Mei', pengajuan: 12, approval: 11 },
                { name: '20 Mei', pengajuan: 10, approval: 9 },
                { name: '23 Mei', pengajuan: 15, approval: 14 },
                { name: '26 Mei', pengajuan: 20, approval: 19 },
                { name: '29 Mei', pengajuan: 14, approval: 13 },
                { name: '31 Mei', pengajuan: 22, approval: 21 },
            ];

            distributionData = [
                { category: 'Teknis', count: 60, fill: '#3b82f6' },
                { category: 'Soft Skill', count: 10, fill: '#10b981' },
                { category: 'Kepemimpinan', count: 5, fill: '#f59e0b' },
                { category: 'Kepatuhan', count: 2, fill: '#8b5cf6' },
                { category: 'Lainnya', count: 1, fill: '#9ca3af' },
            ];

            statusData = [
                { name: 'Aktif', value: 80, percentage: 63, fill: '#10b981' },
                { name: 'Menunggu Approval', value: 24, percentage: 19, fill: '#3b82f6' },
                { name: 'Draft', value: 12, percentage: 10, fill: '#f59e0b' },
                { name: 'Nonaktif', value: 10, percentage: 8, fill: '#9ca3af' },
            ];

            activityTitle = 'Aktivitas per Tim IT & Digital';
            activityData = [
                { name: 'Software Engineer', value: 54, fill: '#2563eb' },
                { name: 'UI/UX Design', value: 32, fill: '#3b82f6' },
                { name: 'IT Support', value: 25, fill: '#60a5fa' },
                { name: 'DevOps & Security', value: 15, fill: '#cbd5e1' },
            ];
        } else if (unitFilter === 'Pengembangan SDM') {
            metrics = {
                modulBulanIni: 12,
                approvalRate: 80,
                pengajuanSelesai: 18,
                userAktif: 52
            };

            trendData = [
                { name: '1 Mei', pengajuan: 4, approval: 3 },
                { name: '3 Mei', pengajuan: 6, approval: 4 },
                { name: '5 Mei', pengajuan: 5, approval: 3 },
                { name: '8 Mei', pengajuan: 10, approval: 8 },
                { name: '11 Mei', pengajuan: 8, approval: 6 },
                { name: '14 Mei', pengajuan: 5, approval: 3 },
                { name: '17 Mei', pengajuan: 8, approval: 6 },
                { name: '20 Mei', pengajuan: 6, approval: 4 },
                { name: '23 Mei', pengajuan: 11, approval: 9 },
                { name: '26 Mei', pengajuan: 12, approval: 10 },
                { name: '29 Mei', pengajuan: 8, approval: 6 },
                { name: '31 Mei', pengajuan: 10, approval: 8 },
            ];

            distributionData = [
                { category: 'Teknis', count: 8, fill: '#3b82f6' },
                { category: 'Soft Skill', count: 42, fill: '#10b981' },
                { category: 'Kepemimpinan', count: 25, fill: '#f59e0b' },
                { category: 'Kepatuhan', count: 12, fill: '#8b5cf6' },
                { category: 'Lainnya', count: 11, fill: '#9ca3af' },
            ];

            statusData = [
                { name: 'Aktif', value: 32, percentage: 39, fill: '#10b981' },
                { name: 'Menunggu Approval', value: 28, percentage: 34, fill: '#3b82f6' },
                { name: 'Draft', value: 18, percentage: 21, fill: '#f59e0b' },
                { name: 'Nonaktif', value: 5, percentage: 6, fill: '#9ca3af' },
            ];

            activityTitle = 'Aktivitas per Sub-Unit SDM';
            activityData = [
                { name: 'Recruitment & Assessment', value: 40, fill: '#2563eb' },
                { name: 'Training & Development', value: 32, fill: '#3b82f6' },
                { name: 'Employee Relations', value: 18, fill: '#60a5fa' },
                { name: 'HR Admin & Payroll', value: 8, fill: '#cbd5e1' },
            ];
        } else if (unitFilter === 'Keuangan') {
            metrics = {
                modulBulanIni: 6,
                approvalRate: 85,
                pengajuanSelesai: 16,
                userAktif: 70
            };

            trendData = [
                { name: '1 Mei', pengajuan: 3, approval: 1 },
                { name: '3 Mei', pengajuan: 4, approval: 0 },
                { name: '5 Mei', pengajuan: 4, approval: 1 },
                { name: '8 Mei', pengajuan: 7, approval: 4 },
                { name: '11 Mei', pengajuan: 6, approval: 3 },
                { name: '14 Mei', pengajuan: 4, approval: 2 },
                { name: '17 Mei', pengajuan: 5, approval: 3 },
                { name: '20 Mei', pengajuan: 4, approval: 2 },
                { name: '23 Mei', pengajuan: 6, approval: 4 },
                { name: '26 Mei', pengajuan: 7, approval: 5 },
                { name: '29 Mei', pengajuan: 6, approval: 4 },
                { name: '31 Mei', pengajuan: 8, approval: 6 },
            ];

            distributionData = [
                { category: 'Teknis', count: 10, fill: '#3b82f6' },
                { category: 'Soft Skill', count: 10, fill: '#10b981' },
                { category: 'Kepemimpinan', count: 15, fill: '#f59e0b' },
                { category: 'Kepatuhan', count: 14, fill: '#8b5cf6' },
                { category: 'Lainnya', count: 5, fill: '#9ca3af' },
            ];

            statusData = [
                { name: 'Aktif', value: 12, percentage: 31, fill: '#10b981' },
                { name: 'Menunggu Approval', value: 16, percentage: 41, fill: '#3b82f6' },
                { name: 'Draft', value: 6, percentage: 15, fill: '#f59e0b' },
                { name: 'Nonaktif', value: 5, percentage: 13, fill: '#9ca3af' },
            ];

            activityTitle = 'Aktivitas per Fungsi Keuangan';
            activityData = [
                { name: 'Accounting & Reporting', value: 35, fill: '#2563eb' },
                { name: 'Tax & Internal Audit', value: 20, fill: '#3b82f6' },
                { name: 'Budgeting & Cost Control', value: 15, fill: '#60a5fa' },
                { name: 'Treasury & Cashier', value: 6, fill: '#cbd5e1' },
            ];
        }

        // Apply typeFilter changes as secondary effect to mock dynamic changes
        if (typeFilter !== 'Semua Jenis Report') {
            const multiplier = typeFilter === 'Laporan Modul' ? 1.25 : 0.85;
            metrics.modulBulanIni = Math.round(metrics.modulBulanIni * multiplier);
            metrics.pengajuanSelesai = Math.round(metrics.pengajuanSelesai * multiplier);
            metrics.userAktif = Math.round(metrics.userAktif * multiplier);

            trendData = trendData.map(t => ({
                ...t,
                pengajuan: Math.round(t.pengajuan * multiplier),
                approval: Math.round(t.approval * multiplier)
            }));

            distributionData = distributionData.map(d => ({
                ...d,
                count: Math.round(d.count * multiplier)
            }));
        }

        return {
            metrics,
            trendData,
            distributionData,
            statusData,
            activityTitle,
            activityData
        };
    }, [unitFilter, typeFilter]);

    // Find item values inside dashboardData.statusData:
    const statusAktif = dashboardData.statusData.find(s => s.name === 'Aktif') || { value: 0, percentage: 0 };
    const statusMenunggu = dashboardData.statusData.find(s => s.name === 'Menunggu Approval') || { value: 0, percentage: 0 };
    const statusDraft = dashboardData.statusData.find(s => s.name === 'Draft') || { value: 0, percentage: 0 };
    const statusNonaktif = dashboardData.statusData.find(s => s.name === 'Nonaktif') || { value: 0, percentage: 0 };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Report & Analisa" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                        Report
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Laporan performa modul, approval, pengajuan, dan aktivitas pengguna.
                    </p>
                </div>

                {/* Toast message */}
                {toastMessage && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400 shadow-sm animate-in fade-in duration-300">
                        <Check className="size-4.5" />
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* Metrics Indicator Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {/* Modul Bulan Ini */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <FileText className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Modul Bulan Ini</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{dashboardData.metrics.modulBulanIni}</span>
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-500 mt-1">
                                    <span>↑ 16% dari bulan lalu</span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Approval Rate */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <ShieldCheck className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Approval Rate</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{dashboardData.metrics.approvalRate}%</span>
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-500 mt-1">
                                    <span>↑ 8% dari bulan lalu</span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pengajuan Selesai */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                                <Edit3 className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Pengajuan Selesai</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{dashboardData.metrics.pengajuanSelesai}</span>
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-500 mt-1">
                                    <span>↑ 20% dari bulan lalu</span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Aktif */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                                <Users className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">User Aktif</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">{dashboardData.metrics.userAktif}</span>
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-500 mt-1">
                                    <span>↑ 9% dari bulan lalu</span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter items */}
                <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm overflow-hidden p-4">
                    <div className="flex flex-wrap items-center gap-3 justify-between">
                        
                        {/* Left pickers */}
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative flex items-center h-9 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 px-3 text-xs text-neutral-600 dark:text-neutral-400 gap-1.5 cursor-pointer">
                                <Calendar className="size-3.5" />
                                <span>{dateRangeText}</span>
                            </div>

                            <select
                                value={unitFilter}
                                onChange={(e) => setUnitFilter(e.target.value)}
                                className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                            >
                                <option value="Semua Unit">Semua Unit</option>
                                <option value="IT & Digital">IT & Digital</option>
                                <option value="Pengembangan SDM">Pengembangan SDM</option>
                                <option value="Keuangan">Keuangan</option>
                            </select>

                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                            >
                                <option value="Semua Jenis Report">Semua Jenis Report</option>
                                <option value="Laporan Modul">Laporan Modul</option>
                                <option value="Laporan Performa">Laporan Performa</option>
                            </select>

                            <select
                                value={formatFilter}
                                onChange={(e) => setFormatFilter(e.target.value)}
                                className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                            >
                                <option value="Semua Format">Semua Format</option>
                                <option value="PDF">PDF</option>
                                <option value="Excel">Excel</option>
                                <option value="CSV">CSV</option>
                            </select>
                        </div>

                        {/* Generate Trigger */}
                        <Button
                            onClick={handleGenerateReport}
                            size="sm"
                            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                        >
                            <BarChart3 className="size-4" />
                            <span>Generate Report</span>
                        </Button>
                    </div>
                </Card>

                {/* Dashboard Split Column Area */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    
                    {/* Charts & Reports tables (Left 3 columns) */}
                    <div className="lg:col-span-3 space-y-6">
                        
                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Tren Pengajuan & Approval */}
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                                <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Tren Pengajuan & Approval</h3>
                                </div>
                                <CardContent className="p-5 flex flex-col gap-4">
                                    <div className="w-full h-40">
                                        <ChartContainer config={chartConfig} className="h-40 w-full">
                                            <LineChart
                                                data={dashboardData.trendData}
                                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-neutral-100 dark:stroke-neutral-800" />
                                                <XAxis
                                                    dataKey="name"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    dy={8}
                                                    className="text-[10px] fill-neutral-400 dark:fill-neutral-500 font-bold"
                                                />
                                                <YAxis
                                                    tickLine={false}
                                                    axisLine={false}
                                                    dx={-8}
                                                    className="text-[10px] fill-neutral-400 dark:fill-neutral-500 font-bold"
                                                />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="pengajuan"
                                                    stroke="var(--color-pengajuan)"
                                                    strokeWidth={2.5}
                                                    dot={false}
                                                    activeDot={{ r: 4 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="approval"
                                                    stroke="var(--color-approval)"
                                                    strokeWidth={2.5}
                                                    dot={false}
                                                    activeDot={{ r: 4 }}
                                                />
                                            </LineChart>
                                        </ChartContainer>
                                    </div>
                                    <div className="flex justify-center gap-4 text-[9px] font-bold text-neutral-400">
                                        <div className="flex items-center gap-1"><span className="size-2 rounded bg-blue-500"></span><span>Pengajuan</span></div>
                                        <div className="flex items-center gap-1"><span className="size-2 rounded bg-emerald-500"></span><span>Approval</span></div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Distribusi Modul per Jenis Pelatihan */}
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                                <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Distribusi Modul per Jenis Pelatihan</h3>
                                </div>
                                <CardContent className="p-5">
                                    <div className="w-full h-40">
                                        <ChartContainer config={chartConfig} className="h-40 w-full">
                                            <BarChart
                                                data={dashboardData.distributionData}
                                                margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-neutral-100 dark:stroke-neutral-800" />
                                                <XAxis
                                                    dataKey="category"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    dy={8}
                                                    className="text-[10px] fill-neutral-400 dark:fill-neutral-500 font-bold"
                                                />
                                                <YAxis
                                                    tickLine={false}
                                                    axisLine={false}
                                                    dx={-8}
                                                    className="text-[10px] fill-neutral-400 dark:fill-neutral-500 font-bold"
                                                />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Bar
                                                    dataKey="count"
                                                    radius={[4, 4, 0, 0]}
                                                    maxBarSize={24}
                                                >
                                                    {dashboardData.distributionData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ChartContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status Modul Donut */}
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                                <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Status Modul</h3>
                                </div>
                                <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-center gap-6">
                                    <div className="relative flex h-28 w-28 items-center justify-center flex-shrink-0">
                                        <ChartContainer config={chartConfig} className="h-28 w-28 flex-shrink-0">
                                            <PieChart>
                                                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                                <Pie
                                                    data={dashboardData.statusData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    innerRadius={28}
                                                    outerRadius={38}
                                                    strokeWidth={0}
                                                >
                                                    {dashboardData.statusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                    <Label
                                                        content={({ viewBox }) => {
                                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                                const total = dashboardData.statusData.reduce((acc, curr) => acc + curr.value, 0);
                                                                return (
                                                                    <g>
                                                                        <text
                                                                            x={viewBox.cx}
                                                                            y={viewBox.cy}
                                                                            textAnchor="middle"
                                                                            dominantBaseline="middle"
                                                                            className="fill-foreground text-lg font-extrabold text-neutral-800 dark:fill-neutral-100"
                                                                        >
                                                                            {total}
                                                                        </text>
                                                                        <text
                                                                            x={viewBox.cx}
                                                                            y={(viewBox.cy || 0) + 12}
                                                                            textAnchor="middle"
                                                                            dominantBaseline="middle"
                                                                            className="fill-muted-foreground text-[7px] font-bold text-neutral-400 dark:fill-neutral-500 uppercase tracking-wider"
                                                                        >
                                                                            Total Modul
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

                                    {/* Legends */}
                                    <div className="flex-1 space-y-2 text-[10px] w-full font-semibold">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-emerald-500"></span>
                                                <span className="text-neutral-500 dark:text-neutral-400">Aktif</span>
                                            </div>
                                            <span className="text-neutral-800 dark:text-neutral-200">{statusAktif.value} <span className="text-neutral-400 font-normal text-[9px] ml-1">({statusAktif.percentage}%)</span></span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-blue-500"></span>
                                                <span className="text-neutral-500 dark:text-neutral-400">Menunggu Approval</span>
                                            </div>
                                            <span className="text-neutral-800 dark:text-neutral-200">{statusMenunggu.value} <span className="text-neutral-400 font-normal text-[9px] ml-1">({statusMenunggu.percentage}%)</span></span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-amber-500"></span>
                                                <span className="text-neutral-500 dark:text-neutral-400">Draft</span>
                                            </div>
                                            <span className="text-neutral-800 dark:text-neutral-200">{statusDraft.value} <span className="text-neutral-400 font-normal text-[9px] ml-1">({statusDraft.percentage}%)</span></span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
                                                <span className="text-neutral-500 dark:text-neutral-400">Nonaktif</span>
                                            </div>
                                            <span className="text-neutral-800 dark:text-neutral-200">{statusNonaktif.value} <span className="text-neutral-400 font-normal text-[9px] ml-1">({statusNonaktif.percentage}%)</span></span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Aktivitas User per Unit */}
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                                <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{dashboardData.activityTitle}</h3>
                                </div>
                                <CardContent className="p-5">
                                    <ChartContainer config={chartConfig} className="h-40 w-full">
                                        <BarChart
                                            data={dashboardData.activityData}
                                            layout="y"
                                            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-neutral-100 dark:stroke-neutral-800" />
                                            <XAxis
                                                type="number"
                                                tickLine={false}
                                                axisLine={false}
                                                className="text-[10px] fill-neutral-400 dark:fill-neutral-500 font-bold"
                                            />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                tickLine={false}
                                                axisLine={false}
                                                className="text-[9px] fill-neutral-600 dark:fill-neutral-350 font-bold"
                                                width={90}
                                            />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar
                                                dataKey="value"
                                                radius={[0, 4, 4, 0]}
                                                maxBarSize={12}
                                            >
                                                {dashboardData.activityData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Saved Reports Table */}
                        <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm overflow-hidden">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Daftar Laporan Tersimpan</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[750px] border-collapse text-xs text-left">
                                    <thead>
                                        <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                            <th className="px-6 py-3.5">Nama Laporan</th>
                                            <th className="px-6 py-3.5">Periode</th>
                                            <th className="px-6 py-3.5">Dibuat Oleh</th>
                                            <th className="px-6 py-3.5">Format</th>
                                            <th className="px-6 py-3.5">Last Generated</th>
                                            <th className="px-6 py-3.5 text-center w-24">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {filteredReports.map((item) => (
                                            <tr key={item.id} className="hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                                    <span className="size-2 rounded bg-blue-500"></span>
                                                    <span>{item.name}</span>
                                                </td>
                                                <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 font-medium">
                                                    {item.period}
                                                </td>
                                                <td className="px-6 py-4 text-neutral-600 dark:text-neutral-450 font-medium">
                                                    {item.author}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge
                                                        className={`font-semibold rounded border-0 px-2.5 py-0.5 text-[9px] ${
                                                            item.format === 'PDF'
                                                                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                                                                : item.format === 'Excel'
                                                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                                                                : 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                                                        }`}
                                                    >
                                                        {item.format}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-neutral-550 dark:text-neutral-500 font-medium">
                                                    {item.lastGenerated}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400">
                                                            <Download className="size-3.5" />
                                                        </button>
                                                        <button className="flex size-7 items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 dark:hover:bg-neutral-800 dark:text-neutral-400">
                                                            <MoreVertical className="size-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination footer */}
                            <div className="p-4 border-t border-neutral-100 bg-neutral-50/20 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-neutral-500 dark:text-neutral-400">
                                <span className="font-medium">
                                    Menampilkan 1-{filteredReports.length} dari 28 laporan
                                </span>
                                <div className="flex items-center gap-4">
                                    <select
                                        className="h-8 rounded-lg border border-neutral-200 bg-white px-2 text-xs outline-none text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                                        defaultValue="10"
                                    >
                                        <option value="10">10 / halaman</option>
                                        <option value="20">20 / halaman</option>
                                        <option value="55">50 / halaman</option>
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

                    {/* Right column (1/3 width) - Quick exports, Insight, Scheduled report list */}
                    <div className="space-y-6 lg:col-span-1">
                        
                        {/* Quick Export formats */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Quick Export</h3>
                            </div>
                            <CardContent className="p-5 space-y-3 text-xs">
                                
                                {/* PDF */}
                                <div className="flex items-center gap-3 p-3.5 border rounded-xl hover:bg-neutral-50/10 transition-colors cursor-pointer dark:border-neutral-800">
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40">
                                        <FileText className="size-4.5" />
                                    </div>
                                    <div className="flex-1 flex flex-col gap-0.5">
                                        <span className="font-bold text-neutral-850 dark:text-neutral-200">Export ke PDF</span>
                                        <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-medium">Dokumen siap cetak</span>
                                    </div>
                                </div>

                                {/* Excel */}
                                <div className="flex items-center gap-3 p-3.5 border rounded-xl hover:bg-neutral-50/10 transition-colors cursor-pointer dark:border-neutral-800">
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                                        <Download className="size-4.5" />
                                    </div>
                                    <div className="flex-1 flex flex-col gap-0.5">
                                        <span className="font-bold text-neutral-850 dark:text-neutral-200">Export ke Excel</span>
                                        <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-medium">Data untuk analisis</span>
                                    </div>
                                </div>

                                {/* CSV */}
                                <div className="flex items-center gap-3 p-3.5 border rounded-xl hover:bg-neutral-50/10 transition-colors cursor-pointer dark:border-neutral-800">
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                                        <Download className="size-4.5" />
                                    </div>
                                    <div className="flex-1 flex flex-col gap-0.5">
                                        <span className="font-bold text-neutral-850 dark:text-neutral-200">Export ke CSV</span>
                                        <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-medium">Data mentah</span>
                                    </div>
                                </div>

                            </CardContent>
                        </Card>

                        {/* Insight Otomatis */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm font-semibold">Insight Otomatis</h3>
                            </div>
                            <CardContent className="p-5 space-y-4">
                                {/* Insight 1 */}
                                <div className="flex gap-3 text-xs items-start">
                                    <span className="size-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5"></span>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-neutral-850 dark:text-neutral-200">Approval Rate Meningkat</span>
                                        <span className="text-[10px] text-neutral-450 dark:text-neutral-500 leading-relaxed font-medium">
                                            Approval rate naik 8% dibanding bulan lalu.
                                        </span>
                                    </div>
                                </div>

                                {/* Insight 2 */}
                                <div className="flex gap-3 text-xs items-start">
                                    <span className="size-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></span>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-neutral-850 dark:text-neutral-200">Modul Teknis Paling Banyak</span>
                                        <span className="text-[10px] text-neutral-450 dark:text-neutral-500 leading-relaxed font-medium">
                                            78 modul teknis diajukan bulan ini (31% dari total).
                                        </span>
                                    </div>
                                </div>

                                {/* Insight 3 */}
                                <div className="flex gap-3 text-xs items-start">
                                    <span className="size-2 rounded-full bg-purple-500 flex-shrink-0 mt-1.5"></span>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-neutral-850 dark:text-neutral-200">User Aktif Bertambah</span>
                                        <span className="text-[10px] text-neutral-450 dark:text-neutral-500 leading-relaxed font-medium">
                                            User aktif naik 9% dibanding bulan lalu.
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Jadwal Report */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 flex flex-col justify-between">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm font-semibold">Jadwal Report</h3>
                            </div>
                            <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                                <div className="space-y-3.5 text-xs font-semibold">
                                    {schedules.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center border-b pb-2.5 last:border-0 last:pb-0 dark:border-neutral-850">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-neutral-850 dark:text-neutral-200">{item.name}</span>
                                                <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium">{item.scheduleText}</span>
                                            </div>
                                            <Badge className="font-semibold rounded border-0 px-2 py-0.2 text-[8px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450">
                                                {item.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-2 border-t">
                                    <Button variant="outline" className="w-full h-9 rounded-lg text-xs font-semibold border-neutral-200 dark:border-neutral-800 text-neutral-600 flex items-center justify-center gap-1.5">
                                        <Settings className="size-3.5" />
                                        <span>Kelola Jadwal Report</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                </div>

            </div>

        </AppLayout>
    );
}
