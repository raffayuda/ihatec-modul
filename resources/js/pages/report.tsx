import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { SearchableSelect } from '@/components/ui/searchable-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { BarChart3, Calendar, Check, Download, Edit3, FileText, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Label, Line, LineChart, Pie, PieChart, XAxis, YAxis } from 'recharts';

interface ReportProps extends SharedData {
    metrics?: {
        modulBulanIni: number;
        approvalRate: number;
        pengajuanSelesai: number;
        userAktif: number;
    };
    trendData?: Array<{ name: string; pengajuan: number; approval: number }>;
    distributionData?: Array<{ category: string; count: number; fill: string }>;
    statusData?: Array<{ name: string; value: number; percentage: number; fill: string }>;
    activityTitle?: string;
    activityData?: Array<{ name: string; value: number; fill: string }>;
    savedReports?: Array<{ id: string; name: string; period: string; author: string; format: string; lastGenerated: string }>;
    filters?: {
        unit: string;
        type: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Report',
        href: '/report',
    },
];

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
    const { props } = usePage<ReportProps>();

    const metrics = props.metrics || {
        modulBulanIni: 0,
        approvalRate: 100,
        pengajuanSelesai: 0,
        userAktif: 0,
    };
    const trendData = props.trendData || [];
    const distributionData = props.distributionData || [];
    const statusData = props.statusData || [];
    const activityTitle = props.activityTitle || 'Aktivitas User per Unit';
    const activityData = props.activityData || [];
    // Filters
    const dateRangeText = '01 Jun 2026 - 30 Jun 2026';
    const activeFilters = props.filters || { unit: 'Semua Unit', type: 'Semua Jenis Report' };
    const [unitFilter, setUnitFilter] = useState(activeFilters.unit);
    const [typeFilter, setTypeFilter] = useState(activeFilters.type);
    const [formatFilter, setFormatFilter] = useState('Semua Format');

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const handleUnitFilterChange = (unit: string) => {
        setUnitFilter(unit);
        router.get(route('report'), { unit, type: typeFilter }, { preserveState: true });
    };

    const handleTypeFilterChange = (type: string) => {
        setTypeFilter(type);
        router.get(route('report'), { unit: unitFilter, type }, { preserveState: true });
    };

    // Handle manual generate report
    const handleGenerateReport = () => {
        window.open(route('report.export', { type: 'requests', unit: unitFilter }));
        setToastMessage(`Laporan berhasil di-generate dan diunduh.`);
        setTimeout(() => setToastMessage(null), 4000);
    };

    const handleExport = (type: 'modules' | 'requests') => {
        window.open(route('report.export', { type, unit: unitFilter }));
    };

    // Find item values inside statusData:
    const statusAktif = statusData.find((s) => s.name === 'Aktif') || { value: 0, percentage: 0 };
    const statusMenunggu = statusData.find((s) => s.name === 'Menunggu Approval') || { value: 0, percentage: 0 };
    const statusDraft = statusData.find((s) => s.name === 'Draft') || { value: 0, percentage: 0 };
    const statusNonaktif = statusData.find((s) => s.name === 'Nonaktif') || { value: 0, percentage: 0 };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Report & Analisa" />

            <div className="flex h-full flex-1 flex-col gap-6 bg-neutral-50/60 p-6 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Report</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Laporan performa modul, approval, pengajuan, dan aktivitas pengguna.
                    </p>
                </div>

                {/* Toast message */}
                {toastMessage && (
                    <div className="animate-in fade-in flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-sm duration-300 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400">
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
                                <span className="mt-0.5 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{metrics.modulBulanIni}</span>
                                <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-500">
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
                                <span className="mt-0.5 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{metrics.approvalRate}%</span>
                                <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-500">
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
                                <span className="mt-0.5 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{metrics.pengajuanSelesai}</span>
                                <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-500">
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
                                <span className="mt-0.5 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{metrics.userAktif}</span>
                                <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-500">
                                    <span>↑ 9% dari bulan lalu</span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter items */}
                <Card className="overflow-hidden border-neutral-200/80 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Left pickers */}
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                <Calendar className="size-3.5" />
                                <span>{dateRangeText}</span>
                            </div>

                            <div className="w-48">
                                <SearchableSelect
                                    value={unitFilter}
                                    onChange={(val) => handleUnitFilterChange(val)}
                                    options={[
                                        'Semua Unit',
                                        'IT & Digital',
                                        'Pengembangan SDM',
                                        'Keuangan',
                                        'Operasional',
                                        'Teknis Laboratorium',
                                        'Pemasaran',
                                    ]}
                                />
                            </div>

                            <div className="w-48">
                                <SearchableSelect
                                    value={typeFilter}
                                    onChange={(val) => handleTypeFilterChange(val)}
                                    options={['Semua Jenis Report', 'Laporan Modul', 'Laporan Performa']}
                                />
                            </div>

                            <div className="w-40">
                                <SearchableSelect
                                    value={formatFilter}
                                    onChange={(val) => setFormatFilter(val)}
                                    options={['Semua Format', 'PDF', 'Excel', 'CSV']}
                                />
                            </div>
                        </div>

                        {/* Generate Trigger */}
                        <Button
                            onClick={handleGenerateReport}
                            size="sm"
                            className="flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                            <BarChart3 className="size-4" />
                            <span>Generate Report</span>
                        </Button>
                    </div>
                </Card>

                {/* Dashboard Split Column Area */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Charts & Reports tables (Left 3 columns) */}
                    <div className="space-y-6 lg:col-span-3">
                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Tren Pengajuan & Approval */}
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                                <div className="border-b border-neutral-100 bg-neutral-50/10 px-5 py-4 dark:border-neutral-800">
                                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Tren Pengajuan & Approval</h3>
                                </div>
                                <CardContent className="flex flex-col gap-4 p-5">
                                    <div className="h-40 w-full">
                                        <ChartContainer config={chartConfig} className="h-40 w-full">
                                            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                    className="stroke-neutral-100 dark:stroke-neutral-800"
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    dy={8}
                                                    className="fill-neutral-400 text-[10px] font-bold dark:fill-neutral-500"
                                                />
                                                <YAxis
                                                    tickLine={false}
                                                    axisLine={false}
                                                    dx={-8}
                                                    className="fill-neutral-400 text-[10px] font-bold dark:fill-neutral-500"
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
                                        <div className="flex items-center gap-1">
                                            <span className="size-2 rounded bg-blue-500"></span>
                                            <span>Pengajuan</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="size-2 rounded bg-emerald-500"></span>
                                            <span>Approval</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Distribusi Modul per Jenis Pelatihan */}
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                                <div className="border-b border-neutral-100 bg-neutral-50/10 px-5 py-4 dark:border-neutral-800">
                                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                        Distribusi Modul per Jenis Pelatihan
                                    </h3>
                                </div>
                                <CardContent className="p-5">
                                    <div className="h-40 w-full">
                                        <ChartContainer config={chartConfig} className="h-40 w-full">
                                            <BarChart data={distributionData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                    className="stroke-neutral-100 dark:stroke-neutral-800"
                                                />
                                                <XAxis
                                                    dataKey="category"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    dy={8}
                                                    className="fill-neutral-400 text-[10px] font-bold dark:fill-neutral-500"
                                                />
                                                <YAxis
                                                    tickLine={false}
                                                    axisLine={false}
                                                    dx={-8}
                                                    className="fill-neutral-400 text-[10px] font-bold dark:fill-neutral-500"
                                                />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={24}>
                                                    {distributionData.map((entry, index) => (
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
                                <div className="border-b border-neutral-100 bg-neutral-50/10 px-5 py-4 dark:border-neutral-800">
                                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Status Modul</h3>
                                </div>
                                <CardContent className="flex flex-col items-center justify-center gap-6 p-5 sm:flex-row">
                                    <div className="relative flex h-28 w-28 flex-shrink-0 items-center justify-center">
                                        <ChartContainer config={chartConfig} className="h-28 w-28 flex-shrink-0">
                                            <PieChart>
                                                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                                <Pie
                                                    data={statusData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    innerRadius={28}
                                                    outerRadius={38}
                                                    strokeWidth={0}
                                                >
                                                    {statusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                    <Label
                                                        content={({ viewBox }) => {
                                                            if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                                                const total = statusData.reduce((acc, curr) => acc + curr.value, 0);
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
                                                                            className="fill-muted-foreground text-[7px] font-bold tracking-wider text-neutral-400 uppercase dark:fill-neutral-500"
                                                                        >
                                                                            Total Modul
                                                                        </text>
                                                                    </g>
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </Pie>
                                            </PieChart>
                                        </ChartContainer>
                                    </div>

                                    {/* Legends */}
                                    <div className="w-full flex-1 space-y-2 text-[10px] font-semibold">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-emerald-500"></span>
                                                <span className="text-neutral-500 dark:text-neutral-400">Aktif</span>
                                            </div>
                                            <span className="text-neutral-800 dark:text-neutral-200">
                                                {statusAktif.value}{' '}
                                                <span className="ml-1 text-[9px] font-normal text-neutral-400">({statusAktif.percentage}%)</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-blue-500"></span>
                                                <span className="text-neutral-500 dark:text-neutral-400">Menunggu Approval</span>
                                            </div>
                                            <span className="text-neutral-800 dark:text-neutral-200">
                                                {statusMenunggu.value}{' '}
                                                <span className="ml-1 text-[9px] font-normal text-neutral-400">({statusMenunggu.percentage}%)</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-amber-500"></span>
                                                <span className="text-neutral-500 dark:text-neutral-400">Draft</span>
                                            </div>
                                            <span className="text-neutral-800 dark:text-neutral-200">
                                                {statusDraft.value}{' '}
                                                <span className="ml-1 text-[9px] font-normal text-neutral-400">({statusDraft.percentage}%)</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
                                                <span className="text-neutral-500 dark:text-neutral-400">Nonaktif</span>
                                            </div>
                                            <span className="text-neutral-800 dark:text-neutral-200">
                                                {statusNonaktif.value}{' '}
                                                <span className="ml-1 text-[9px] font-normal text-neutral-400">({statusNonaktif.percentage}%)</span>
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Aktivitas User per Unit */}
                            <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                                <div className="border-b border-neutral-100 bg-neutral-50/10 px-5 py-4 dark:border-neutral-800">
                                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{activityTitle}</h3>
                                </div>
                                <CardContent className="p-5">
                                    <ChartContainer config={chartConfig} className="h-40 w-full">
                                        <BarChart data={activityData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                horizontal={false}
                                                className="stroke-neutral-100 dark:stroke-neutral-800"
                                            />
                                            <XAxis
                                                type="number"
                                                tickLine={false}
                                                axisLine={false}
                                                className="fill-neutral-400 text-[10px] font-bold dark:fill-neutral-500"
                                            />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                tickLine={false}
                                                axisLine={false}
                                                className="dark:fill-neutral-350 fill-neutral-600 text-[9px] font-bold"
                                                width={90}
                                            />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={12}>
                                                {activityData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right column (1/3 width) - Quick exports, Insight, Scheduled report list */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* Quick Export formats */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 bg-neutral-50/10 px-5 py-4 dark:border-neutral-800">
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Quick Export</h3>
                            </div>
                            <CardContent className="space-y-3 p-5 text-xs">
                                {/* PDF */}
                                <div
                                    onClick={() => window.print()}
                                    className="flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors hover:bg-neutral-50/10 dark:border-neutral-800"
                                >
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40">
                                        <FileText className="size-4.5" />
                                    </div>
                                    <div className="flex flex-1 flex-col gap-0.5">
                                        <span className="text-neutral-850 font-bold dark:text-neutral-200">Export ke PDF</span>
                                        <span className="text-neutral-450 text-[10px] font-medium dark:text-neutral-500">Dokumen siap cetak</span>
                                    </div>
                                </div>

                                {/* Excel */}
                                <div
                                    onClick={() => handleExport('modules')}
                                    className="flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors hover:bg-neutral-50/10 dark:border-neutral-800"
                                >
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                                        <Download className="size-4.5" />
                                    </div>
                                    <div className="flex flex-1 flex-col gap-0.5">
                                        <span className="text-neutral-850 font-bold dark:text-neutral-200">Export ke Excel</span>
                                        <span className="text-neutral-450 text-[10px] font-medium dark:text-neutral-500">Data untuk analisis</span>
                                    </div>
                                </div>

                                {/* CSV */}
                                <div
                                    onClick={() => handleExport('requests')}
                                    className="flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors hover:bg-neutral-50/10 dark:border-neutral-800"
                                >
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                                        <Download className="size-4.5" />
                                    </div>
                                    <div className="flex flex-1 flex-col gap-0.5">
                                        <span className="text-neutral-850 font-bold dark:text-neutral-200">Export ke CSV</span>
                                        <span className="text-neutral-450 text-[10px] font-medium dark:text-neutral-500">Data mentah</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Insight Otomatis */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 bg-neutral-50/10 px-5 py-4 dark:border-neutral-800">
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Insight Otomatis</h3>
                            </div>
                            <CardContent className="space-y-4 p-5">
                                {/* Insight 1 */}
                                <div className="flex items-start gap-3 text-xs">
                                    <span className="mt-1.5 size-2 flex-shrink-0 rounded-full bg-emerald-500"></span>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-neutral-850 font-bold dark:text-neutral-200">Approval Rate Meningkat</span>
                                        <span className="text-neutral-450 text-[10px] leading-relaxed font-medium dark:text-neutral-500">
                                            Approval rate naik 8% dibanding bulan lalu.
                                        </span>
                                    </div>
                                </div>

                                {/* Insight 2 */}
                                <div className="flex items-start gap-3 text-xs">
                                    <span className="mt-1.5 size-2 flex-shrink-0 rounded-full bg-blue-500"></span>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-neutral-850 font-bold dark:text-neutral-200">Modul Teknis Paling Banyak</span>
                                        <span className="text-neutral-450 text-[10px] leading-relaxed font-medium dark:text-neutral-500">
                                            78 modul teknis diajukan bulan ini (31% dari total).
                                        </span>
                                    </div>
                                </div>

                                {/* Insight 3 */}
                                <div className="flex items-start gap-3 text-xs">
                                    <span className="mt-1.5 size-2 flex-shrink-0 rounded-full bg-purple-500"></span>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-neutral-850 font-bold dark:text-neutral-200">User Aktif Bertambah</span>
                                        <span className="text-neutral-450 text-[10px] leading-relaxed font-medium dark:text-neutral-500">
                                            User aktif naik 9% dibanding bulan lalu.
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
