import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    BookOpen,
    ShieldCheck,
    PieChart,
    TrendingUp,
    Search,
    RefreshCw,
    Settings,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    FileSpreadsheet,
    Download,
    Plus,
    Upload,
    ChevronRight as ChevronRightIcon,
    PlusCircle
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import React, { useState, useMemo } from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Label } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Matriks Pelatihan',
        href: '/matriks',
    },
];

type MatrixStatus = 'Wajib' | 'Opsional' | 'Belum Ada';

interface MatrixRow {
    id: string;
    program: string;
    m1: MatrixStatus;
    m2: MatrixStatus;
    m3: MatrixStatus;
    m4: MatrixStatus;
    m5: MatrixStatus;
    m6: MatrixStatus;
}

interface GapItem {
    program: string;
    count: number;
}

interface LogItem {
    id: string;
    text: string;
    author: string;
    date: string;
    time: string;
    type: 'add' | 'edit' | 'delete';
}

export default function MatriksPelatihan() {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;
    const role = user?.role || 'User';

    // Initial matrix rows matching the screenshot
    const [rows, setRows] = useState<MatrixRow[]>([
        { id: '1', program: 'IT & Digital', m1: 'Wajib', m2: 'Wajib', m3: 'Opsional', m4: 'Wajib', m5: 'Belum Ada', m6: 'Opsional' },
        { id: '2', program: 'Pengembangan SDM', m1: 'Wajib', m2: 'Wajib', m3: 'Wajib', m4: 'Opsional', m5: 'Wajib', m6: 'Belum Ada' },
        { id: '3', program: 'Operasional', m1: 'Wajib', m2: 'Opsional', m3: 'Wajib', m4: 'Belum Ada', m5: 'Opsional', m6: 'Wajib' },
        { id: '4', program: 'Keuangan', m1: 'Wajib', m2: 'Wajib', m3: 'Belum Ada', m4: 'Wajib', m5: 'Wajib', m6: 'Opsional' },
        { id: '5', program: 'Auditor Halal', m1: 'Wajib', m2: 'Wajib', m3: 'Wajib', m4: 'Opsional', m5: 'Belum Ada', m6: 'Wajib' },
        { id: '6', program: 'SJPH Internal', m1: 'Opsional', m2: 'Wajib', m3: 'Opsional', m4: 'Wajib', m5: 'Belum Ada', m6: 'Opsional' }
    ]);

    // Gap modules
    const [gaps, setGaps] = useState<GapItem[]>([
        { program: 'Operasional', count: 2 },
        { program: 'SJPH Internal', count: 2 },
        { program: 'Auditor Halal', count: 1 },
        { program: 'Pengembangan SDM', count: 1 },
        { program: 'Keuangan', count: 1 }
    ]);

    // Log updates
    const [logs, setLogs] = useState<LogItem[]>([
        { id: '1', text: 'Menambahkan modul "Cyber Security Awareness" ke IT & Digital (M3)', author: 'Raffa', date: '22 Mei 2024', time: '10:24', type: 'add' },
        { id: '2', text: 'Mengubah status modul "Analisis Data" pada Keuangan (M3) menjadi Belum Ada', author: 'Dewi Lestari', date: '21 Mei 2024', time: '15:42', type: 'edit' },
        { id: '3', text: 'Menambahkan modul "Audit Internal" ke Auditor Halal (M6)', author: 'Andi Pratama', date: '20 Mei 2024', time: '09:18', type: 'add' },
        { id: '4', text: 'Mengubah modul "Kepemimpinan" pada Operasional (M2) menjadi Opsional', author: 'Mega Kusuma', date: '19 Mei 2024', time: '14:33', type: 'edit' },
        { id: '5', text: 'Menambahkan modul "Manajemen Risiko" ke Pengembangan SDM (M5)', author: 'Siti Lestari', date: '18 Mei 2024', time: '11:07', type: 'add' }
    ]);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [programFilter, setProgramFilter] = useState('Semua Program');
    const [unitFilter, setUnitFilter] = useState('Semua Unit / Jabatan');
    const [categoryFilter, setCategoryFilter] = useState('Semua Kategori');

    // Dialog Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newProgramName, setNewProgramName] = useState('');
    const [newM1, setNewM1] = useState<MatrixStatus>('Wajib');
    const [newM2, setNewM2] = useState<MatrixStatus>('Wajib');
    const [newM3, setNewM3] = useState<MatrixStatus>('Belum Ada');
    const [newM4, setNewM4] = useState<MatrixStatus>('Wajib');
    const [newM5, setNewM5] = useState<MatrixStatus>('Belum Ada');
    const [newM6, setNewM6] = useState<MatrixStatus>('Opsional');

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Reset Filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setProgramFilter('Semua Program');
        setUnitFilter('Semua Unit / Jabatan');
        setCategoryFilter('Semua Kategori');
    };

    // Filter list
    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            const matchesSearch = 
                row.program.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesProgram = programFilter === 'Semua Program' || row.program === programFilter;
            const matchesUnit = unitFilter === 'Semua Unit / Jabatan' || row.program === unitFilter;

            return matchesSearch && matchesProgram && matchesUnit;
        });
    }, [rows, searchQuery, programFilter, unitFilter]);

    // Add mapping handler
    const handleAddMapping = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProgramName.trim()) return;

        const newRow: MatrixRow = {
            id: String(rows.length + 1),
            program: newProgramName,
            m1: newM1,
            m2: newM2,
            m3: newM3,
            m4: newM4,
            m5: newM5,
            m6: newM6
        };

        setRows(prev => [...prev, newRow]);
        setIsAddModalOpen(false);

        // Add log
        const newLog: LogItem = {
            id: String(logs.length + 1),
            text: `Menambahkan mapping matriks program "${newProgramName}"`,
            author: user?.name?.split(' ')[0] || 'Raffa',
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            type: 'add'
        };
        setLogs(prev => [newLog, ...prev]);

        setNewProgramName('');

        setToastMessage(`Mapping program ${newProgramName} berhasil ditambahkan.`);
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Render matrix status icon
    const renderStatusIcon = (status: MatrixStatus) => {
        if (status === 'Wajib') {
            return (
                <div className="flex items-center justify-center size-5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mx-auto" title="Wajib">
                    <CheckCircle2 className="size-3.5" />
                </div>
            );
        } else if (status === 'Opsional') {
            return (
                <div className="flex items-center justify-center size-5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-800 mx-auto" title="Opsional">
                    <div className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                </div>
            );
        } else {
            return (
                <div className="flex items-center justify-center size-5 rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 mx-auto" title="Belum Ada">
                    <div className="w-2 h-0.5 bg-neutral-400 dark:bg-neutral-600 rounded-full" />
                </div>
            );
        }
    };

    const chartConfig = {
        lengkap: { label: 'Lengkap', color: '#10b981' },
        opsional: { label: 'Opsional Tersedia', color: '#3b82f6' },
        belum: { label: 'Belum Ada', color: '#737373' },
    } satisfies ChartConfig;

    const coverageChartData = useMemo(() => [
        { name: 'Lengkap', value: 232, fill: '#10b981' },
        { name: 'Opsional Tersedia', value: 35, fill: '#3b82f6' },
        { name: 'Belum Ada', value: 10, fill: '#737373' },
    ], []);

    const totalCoverage = useMemo(() => {
        return coverageChartData.reduce((acc, curr) => acc + curr.value, 0);
    }, [coverageChartData]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Matriks Pelatihan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                        Matriks Pelatihan
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Pemetaan program pelatihan dengan modul wajib, opsional, dan status ketersediaan.
                    </p>
                </div>

                {/* Toast message */}
                {toastMessage && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400 shadow-sm animate-in fade-in duration-300">
                        <CheckCircle2 className="size-4.5" />
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* Metrics Indicator Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {/* Total Program */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <BookOpen className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Total Program</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">42</span>
                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold mt-0.5">Program aktif terdaftar</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Modul Wajib */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <ShieldCheck className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Total Modul Wajib</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">55</span>
                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold mt-0.5">Modul wajib tersedia</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Modul Opsional */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                                <PieChart className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Total Modul Opsional</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">37</span>
                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold mt-0.5">Modul opsional tersedia</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Coverage */}
                    <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                                <TrendingUp className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Coverage</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">92%</span>
                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold mt-0.5">Rata-rata pemenuhan</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Dashboard Split Column Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    
                    {/* Main content Area (Left 3 columns) */}
                    <div className="lg:col-span-3 space-y-6">
                        
                        {/* Filter Bar and Grid table card */}
                        <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm overflow-hidden">
                            {/* Filters */}
                            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/10 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                                
                                {/* Search input */}
                                <div className="relative flex-1 max-w-xs">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari program, unit, atau modul..."
                                        className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                    />
                                </div>

                                {/* Select filter group */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <select
                                        value={programFilter}
                                        onChange={(e) => setProgramFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Program">Semua Program</option>
                                        {rows.map(r => (
                                            <option key={r.id} value={r.program}>{r.program}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={unitFilter}
                                        onChange={(e) => setUnitFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Unit / Jabatan">Semua Unit / Jabatan</option>
                                        <option value="IT & Digital">IT & Digital</option>
                                        <option value="Pengembangan SDM">Pengembangan SDM</option>
                                        <option value="Operasional">Operasional</option>
                                        <option value="Keuangan">Keuangan</option>
                                        <option value="Auditor Halal">Auditor Halal</option>
                                        <option value="SJPH Internal">SJPH Internal</option>
                                    </select>

                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none"
                                    >
                                        <option value="Semua Kategori">Semua Kategori</option>
                                        <option value="Wajib">Wajib</option>
                                        <option value="Opsional">Opsional</option>
                                        <option value="Belum Ada">Belum Ada</option>
                                    </select>

                                    <Button
                                        onClick={handleResetFilters}
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 font-semibold"
                                    >
                                        <RefreshCw className="mr-1.5 size-3.5" />
                                        Reset Filter
                                    </Button>

                                    <Button
                                        onClick={() => setIsAddModalOpen(true)}
                                        size="sm"
                                        className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Settings className="size-4" />
                                        <span>Kelola Matriks</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Matrix Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px] border-collapse text-xs text-left">
                                    <thead>
                                        <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                            <th className="px-6 py-4">Program / Unit</th>
                                            <th className="px-6 py-4 text-center">M1</th>
                                            <th className="px-6 py-4 text-center">M2</th>
                                            <th className="px-6 py-4 text-center">M3</th>
                                            <th className="px-6 py-4 text-center">M4</th>
                                            <th className="px-6 py-4 text-center">M5</th>
                                            <th className="px-6 py-4 text-center">M6</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {filteredRows.map((row) => (
                                            <tr key={row.id} className="hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                                    <span className="size-2 rounded bg-blue-500 flex-shrink-0"></span>
                                                    <span>{row.program}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">{renderStatusIcon(row.m1)}</td>
                                                <td className="px-6 py-4 text-center">{renderStatusIcon(row.m2)}</td>
                                                <td className="px-6 py-4 text-center">{renderStatusIcon(row.m3)}</td>
                                                <td className="px-6 py-4 text-center">{renderStatusIcon(row.m4)}</td>
                                                <td className="px-6 py-4 text-center">{renderStatusIcon(row.m5)}</td>
                                                <td className="px-6 py-4 text-center">{renderStatusIcon(row.m6)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Legend footer */}
                            <div className="p-4 border-t border-neutral-100 bg-neutral-50/25 dark:border-neutral-800 flex items-center gap-6 text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                                <div className="flex items-center gap-2">
                                    <div className="flex size-4 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"><CheckCircle2 className="size-3" /></div>
                                    <span>Wajib</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex size-4 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-dashed border-blue-300 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-400"><div className="size-1 rounded-full bg-blue-600 dark:bg-blue-400" /></div>
                                    <span>Opsional</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex size-4 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600"><div className="w-1.5 h-0.5 bg-neutral-400 dark:bg-neutral-600 rounded-full" /></div>
                                    <span>Belum Ada</span>
                                </div>
                            </div>
                        </Card>

                        {/* Logs section */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/10">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Perubahan Matriks Terbaru</h3>
                                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                    Lihat Semua Aktivitas
                                </button>
                            </div>
                            <CardContent className="p-5">
                                <div className="relative pl-5 border-l border-neutral-100 dark:border-neutral-800 space-y-4.5 text-xs">
                                    {logs.map((log) => (
                                        <div key={log.id} className="relative">
                                            <span className={`absolute -left-[26px] top-1 flex size-3 items-center justify-center rounded-full ring-4 ring-white dark:ring-neutral-950 ${
                                                log.type === 'add'
                                                    ? 'bg-emerald-500'
                                                    : log.type === 'edit'
                                                    ? 'bg-blue-500'
                                                    : 'bg-rose-500'
                                            }`}></span>
                                            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{log.text}</span>
                                                    <span className="text-[10px] text-neutral-400 dark:text-neutral-550">Reviewer: {log.author}</span>
                                                </div>
                                                <span className="text-[10px] text-neutral-450 dark:text-neutral-500 sm:text-right mt-1 sm:mt-0 font-medium">{log.date} {log.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right column (1/3 width) - Coverage Summary & Gap */}
                    <div className="space-y-6 lg:col-span-1">
                        
                        {/* Coverage Donut Chart */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 flex flex-col justify-between">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Ringkasan Coverage</h3>
                            </div>
                            <CardContent className="p-5 flex flex-col items-center justify-center gap-6">
                                {/* SVG Donut */}
                                <div className="relative flex h-28 w-28 items-center justify-center flex-shrink-0">
                                    <ChartContainer config={chartConfig} className="h-28 w-28 flex-shrink-0">
                                        <RechartsPieChart>
                                            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                            <Pie
                                                data={coverageChartData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={28}
                                                outerRadius={38}
                                                strokeWidth={0}
                                            >
                                                {coverageChartData.map((entry, index) => (
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
                                                                        className="fill-foreground text-lg font-extrabold text-neutral-800 dark:fill-neutral-100"
                                                                    >
                                                                        {totalCoverage}
                                                                    </text>
                                                                    <text
                                                                        x={viewBox.cx}
                                                                        y={(viewBox.cy || 0) + 12}
                                                                        textAnchor="middle"
                                                                        dominantBaseline="middle"
                                                                        className="fill-muted-foreground text-[7px] font-bold text-neutral-400 dark:fill-neutral-500 uppercase tracking-wider"
                                                                    >
                                                                        Total
                                                                    </text>
                                                                </g>
                                                            )
                                                        }
                                                    }}
                                                />
                                            </Pie>
                                        </RechartsPieChart>
                                    </ChartContainer>
                                </div>

                                {/* Legends */}
                                <div className="w-full space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2.5 rounded-full bg-emerald-500"></span>
                                            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Lengkap <span className="text-neutral-400 font-normal text-[10px] ml-1">(Wajib Terpenuhi)</span></span>
                                        </div>
                                        <span className="font-bold text-neutral-800 dark:text-neutral-200">232 <span className="text-neutral-450 font-normal text-[10px] ml-1">({((232 / totalCoverage) * 100).toFixed(0)}%)</span></span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2.5 rounded-full bg-blue-500"></span>
                                            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Opsional Tersedia</span>
                                        </div>
                                        <span className="font-bold text-neutral-800 dark:text-neutral-200">35 <span className="text-neutral-450 font-normal text-[10px] ml-1">({((35 / totalCoverage) * 100).toFixed(0)}%)</span></span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
                                            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Belum Ada</span>
                                        </div>
                                        <span className="font-bold text-neutral-800 dark:text-neutral-200">10 <span className="text-neutral-450 font-normal text-[10px] ml-1">({((10 / totalCoverage) * 100).toFixed(0)}%)</span></span>
                                    </div>
                                    <div className="border-t pt-2 mt-1 flex justify-between items-center text-[10px] font-bold text-neutral-400 dark:text-neutral-550 uppercase">
                                        <span>Total Kombinasi</span>
                                        <span>{totalCoverage}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Gap Modul List */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Gap Modul</h3>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Program dengan modul wajib yang belum tersedia.</p>
                            </div>
                            <CardContent className="p-5 space-y-3">
                                <div className="space-y-2.5">
                                    {gaps.map((g, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 border-b pb-2 last:border-0 last:pb-0 dark:border-neutral-800 cursor-pointer hover:text-blue-600 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <div className="flex size-5 items-center justify-center rounded bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 text-[10px]">!</div>
                                                <span>{g.program}</span>
                                            </div>
                                            <span className="text-rose-600 font-extrabold text-[10px] flex items-center gap-1">
                                                <span>{g.count} modul</span>
                                                <ChevronRightIcon className="size-3" />
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-2 border-t text-center">
                                    <button className="text-blue-600 hover:text-blue-700 text-xs font-semibold dark:text-blue-400 dark:hover:text-blue-300">
                                        Lihat Semua Gap
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions Grid */}
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Quick Action</h3>
                            </div>
                            <CardContent className="p-5 grid grid-cols-3 gap-2 text-center text-[10px]">
                                {/* Import Matriks */}
                                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/20 hover:bg-neutral-50 dark:hover:bg-neutral-900 gap-2 font-semibold text-neutral-700 dark:text-neutral-300 transition-colors">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                        <Upload className="size-4" />
                                    </div>
                                    <span>Import Matriks</span>
                                </button>
                                
                                {/* Export Excel */}
                                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/20 hover:bg-neutral-50 dark:hover:bg-neutral-900 gap-2 font-semibold text-neutral-700 dark:text-neutral-300 transition-colors">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                                        <Download className="size-4" />
                                    </div>
                                    <span>Export Excel</span>
                                </button>

                                {/* Tambah Mapping */}
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/20 hover:bg-neutral-50 dark:hover:bg-neutral-900 gap-2 font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
                                >
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                                        <PlusCircle className="size-4" />
                                    </div>
                                    <span>Tambah Mapping</span>
                                </button>
                            </CardContent>
                        </Card>

                    </div>

                </div>

            </div>

            {/* Modal: Tambah Mapping */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <PlusCircle className="size-5 text-blue-600 dark:text-blue-400" />
                            <span>Tambah Mapping Program</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                            Posisikan modul wajib, opsional, atau belum tersedia pada program pelatihan terpilih.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddMapping} className="space-y-4 py-2 text-xs">
                        {/* Program Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                                Nama Program / Unit Kerja
                            </label>
                            <input
                                type="text"
                                required
                                value={newProgramName}
                                onChange={(e) => setNewProgramName(e.target.value)}
                                placeholder="Contoh: Manajemen Layanan IT"
                                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                        </div>

                        {/* Modul M1 - M3 */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Status M1</label>
                                <select value={newM1} onChange={(e) => setNewM1(e.target.value as MatrixStatus)} className="w-full h-9 rounded-lg border bg-neutral-50 px-2 outline-none dark:bg-neutral-900 dark:border-neutral-800">
                                    <option value="Wajib">Wajib</option>
                                    <option value="Opsional">Opsional</option>
                                    <option value="Belum Ada">Belum Ada</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Status M2</label>
                                <select value={newM2} onChange={(e) => setNewM2(e.target.value as MatrixStatus)} className="w-full h-9 rounded-lg border bg-neutral-50 px-2 outline-none dark:bg-neutral-900 dark:border-neutral-800">
                                    <option value="Wajib">Wajib</option>
                                    <option value="Opsional">Opsional</option>
                                    <option value="Belum Ada">Belum Ada</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Status M3</label>
                                <select value={newM3} onChange={(e) => setNewM3(e.target.value as MatrixStatus)} className="w-full h-9 rounded-lg border bg-neutral-50 px-2 outline-none dark:bg-neutral-900 dark:border-neutral-800">
                                    <option value="Wajib">Wajib</option>
                                    <option value="Opsional">Opsional</option>
                                    <option value="Belum Ada">Belum Ada</option>
                                </select>
                            </div>
                        </div>

                        {/* Modul M4 - M6 */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Status M4</label>
                                <select value={newM4} onChange={(e) => setNewM4(e.target.value as MatrixStatus)} className="w-full h-9 rounded-lg border bg-neutral-50 px-2 outline-none dark:bg-neutral-900 dark:border-neutral-800">
                                    <option value="Wajib">Wajib</option>
                                    <option value="Opsional">Opsional</option>
                                    <option value="Belum Ada">Belum Ada</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Status M5</label>
                                <select value={newM5} onChange={(e) => setNewM5(e.target.value as MatrixStatus)} className="w-full h-9 rounded-lg border bg-neutral-50 px-2 outline-none dark:bg-neutral-900 dark:border-neutral-800">
                                    <option value="Wajib">Wajib</option>
                                    <option value="Opsional">Opsional</option>
                                    <option value="Belum Ada">Belum Ada</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Status M6</label>
                                <select value={newM6} onChange={(e) => setNewM6(e.target.value as MatrixStatus)} className="w-full h-9 rounded-lg border bg-neutral-50 px-2 outline-none dark:bg-neutral-900 dark:border-neutral-800">
                                    <option value="Wajib">Wajib</option>
                                    <option value="Opsional">Opsional</option>
                                    <option value="Belum Ada">Belum Ada</option>
                                </select>
                            </div>
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
                                Simpan Mapping
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
const circumference = 226.195;
