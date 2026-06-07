import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Layers,
    BookOpen,
    Clock,
    CheckCircle2,
    Download,
    Printer,
    ChevronRight,
    Search,
    AlertCircle,
    Play
} from 'lucide-react';
import React, { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Formula Modul',
        href: '/formula',
    },
];

interface ModuleRequirement {
    code: string;
    title: string;
    revision: string;
    days: number;
    type: 'Wajib' | 'Opsional';
    description: string;
}

interface ProgramFormula {
    id: string;
    name: string;
    targetCompetency: string;
    totalDays: number;
    modules: ModuleRequirement[];
}

export default function FormulaModul() {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;
    const role = user?.role || 'User';

    // Mock dataset for training program formulas
    const formulas: ProgramFormula[] = [
        {
            id: '1',
            name: 'IT & Digital',
            targetCompetency: 'Certified Junior Systems & IT Specialist',
            totalDays: 12,
            modules: [
                { code: 'ILN.1.8', title: 'Interpretasi Sistem dan Implementasi ISO 17025', revision: '2.1', days: 5, type: 'Wajib', description: 'Panduan teknis dan implementasi persyaratan umum kompetensi laboratorium pengujian dan kalibrasi.' },
                { code: 'TRACE.01', title: 'Traceability Rantai Pasok Halal', revision: '1.0', days: 3, type: 'Wajib', description: 'Prinsip ketertelusuran produk dari bahan baku hingga produk sampai ke konsumen.' },
                { code: 'LAB.SAFE', title: 'Keselamatan dan Kesehatan Kerja Laboratorium', revision: '1.3', days: 4, type: 'Opsional', description: 'Pedoman keselamatan penggunaan bahan kimia berbahaya dan K3 laboratorium.' }
            ]
        },
        {
            id: '2',
            name: 'Pengembangan SDM',
            targetCompetency: 'Human Resources & Competency Development Officer',
            totalDays: 14,
            modules: [
                { code: 'ILN.1.8', title: 'Interpretasi Sistem dan Implementasi ISO 17025', revision: '2.1', days: 5, type: 'Wajib', description: 'Persyaratan umum kompetensi laboratorium sesuai standar ISO/IEC 17025:2017.' },
                { code: 'SJPH', title: 'Sistem Jaminan Produk Halal (SJPH)', revision: '1.3', days: 6, type: 'Wajib', description: 'Acuan standard implementasi jaminan produk halal di industri pangan dan farmasi.' },
                { code: 'HALAL.AWARE', title: 'Halal Awareness', revision: '1.1', days: 3, type: 'Wajib', description: 'Pengenalan konsep dasar halal dan haram untuk staf korporat.' }
            ]
        },
        {
            id: '3',
            name: 'Operasional',
            targetCompetency: 'Operational Quality Control Executive',
            totalDays: 13,
            modules: [
                { code: 'ILN.1.8', title: 'Interpretasi Sistem dan Implementasi ISO 17025', revision: '2.1', days: 5, type: 'Wajib', description: 'Implementasi standar laboratorium pengujian dan kalibrasi.' },
                { code: 'CPPOB.02', title: 'Cara Produksi Pangan Olahan yang Baik', revision: '2.0', days: 4, type: 'Wajib', description: 'Pedoman industri pengolahan pangan aman, bermutu, dan higienis.' },
                { code: 'SAMPL.01', title: 'Teknik Pengambilan Sampel', revision: '1.0', days: 4, type: 'Opsional', description: 'Tata cara pengambilan contoh uji di lapangan untuk analisis laboratorium.' }
            ]
        },
        {
            id: '4',
            name: 'Keuangan',
            targetCompetency: 'Financial System Compliance Auditor',
            totalDays: 11,
            modules: [
                { code: 'ILN.1.8', title: 'Interpretasi Sistem dan Implementasi ISO 17025', revision: '2.1', days: 5, type: 'Wajib', description: 'Sistem dan manajemen laboratorium berstandar ISO 17025.' },
                { code: 'SJPH', title: 'Sistem Jaminan Produk Halal (SJPH)', revision: '1.3', days: 6, type: 'Wajib', description: 'Standardisasi implementasi jaminan produk halal secara menyeluruh.' }
            ]
        },
        {
            id: '5',
            name: 'Auditor Halal',
            targetCompetency: 'Lead Auditor Halal & SJPH Compliance',
            totalDays: 17,
            modules: [
                { code: 'SJPH', title: 'Sistem Jaminan Produk Halal (SJPH)', revision: '1.3', days: 6, type: 'Wajib', description: 'Kriteria standard implementasi jaminan produk halal industri pangan/BPJPH.' },
                { code: 'AUD.HALAL', title: 'Auditor Halal', revision: '3.0', days: 8, type: 'Wajib', description: 'Kompetensi kerja auditor halal, audit lapangan, dan pelaporan.' },
                { code: 'HALAL.AWARE', title: 'Halal Awareness', revision: '1.1', days: 3, type: 'Opsional', description: 'Konsep dasar produk halal untuk peninjauan regulasi.' }
            ]
        },
        {
            id: '6',
            name: 'SJPH Internal',
            targetCompetency: 'Halal Supervisor & SJPH Internal Auditor',
            totalDays: 13,
            modules: [
                { code: 'SJPH', title: 'Sistem Jaminan Produk Halal (SJPH)', revision: '1.3', days: 6, type: 'Wajib', description: 'Kriteria implementasi jaminan halal di industri.' },
                { code: 'PPH.01', title: 'Pemeriksaan Bahan PPH', revision: '1.2', days: 4, type: 'Wajib', description: 'Prosedur pemeriksaan bahan baku baku dan kritis halal.' },
                { code: 'HALAL.AWARE', title: 'Halal Awareness', revision: '1.1', days: 3, type: 'Opsional', description: 'Pengenalan standard halal BPJPH.' }
            ]
        }
    ];

    const [selectedProgramId, setSelectedProgramId] = useState('1');
    const [searchQuery, setSearchQuery] = useState('');

    const activeFormula = useMemo(() => {
        return formulas.find(f => f.id === selectedProgramId) || formulas[0];
    }, [selectedProgramId, formulas]);

    const filteredModules = useMemo(() => {
        return activeFormula.modules.filter(m => 
            m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [activeFormula, searchQuery]);

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = () => {
        alert('Formula kurikulum berhasil diekspor ke Excel!');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Formula Modul Pelatihan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10 print:bg-white print:p-0">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                            Formula Modul Pelatihan
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Formula komposisi modul wajib dan opsional untuk membentuk kompetensi program pelatihan.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handlePrint}
                            variant="outline"
                            size="sm"
                            className="h-9 px-3 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold"
                        >
                            <Printer className="mr-1.5 size-4" />
                            Cetak Formula
                        </Button>
                        <Button
                            onClick={handleExportExcel}
                            variant="outline"
                            size="sm"
                            className="h-9 px-3 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold"
                        >
                            <Download className="mr-1.5 size-4" />
                            Export Excel
                        </Button>
                    </div>
                </div>

                {/* Selection & Search Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 print:hidden shadow-sm">
                    <div className="flex flex-1 flex-col sm:flex-row items-start sm:items-center gap-3">
                        <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 shrink-0">
                            Program Pelatihan:
                        </label>
                        <select
                            value={selectedProgramId}
                            onChange={(e) => setSelectedProgramId(e.target.value)}
                            className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 outline-none w-full sm:w-60 font-semibold"
                        >
                            {formulas.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari modul dalam formula..."
                            className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                        />
                    </div>
                </div>

                {/* Main Content: Curriculum Formula Visualizer */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    
                    {/* Left Column: Visual Formula Breakdown */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm overflow-hidden">
                            <div className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Visualisasi Kombinasi Formula</h3>
                            </div>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-8 relative">
                                    
                                    {/* Map modules as formula elements */}
                                    {activeFormula.modules.map((m, idx) => (
                                        <React.Fragment key={m.code}>
                                            <div className="flex flex-col items-center">
                                                <div className={`size-24 rounded-2xl flex flex-col items-center justify-center p-3 text-center border shadow-sm transition-transform hover:scale-105 ${
                                                    m.type === 'Wajib'
                                                        ? 'bg-blue-50/50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-300'
                                                        : 'bg-emerald-50/50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-300'
                                                }`}>
                                                    <span className="text-[10px] font-black">{m.code}</span>
                                                    <span className="text-[9px] font-bold line-clamp-2 mt-1 leading-snug">{m.title}</span>
                                                    <Badge className={`mt-2 text-[7px] font-semibold border-0 ${
                                                        m.type === 'Wajib' 
                                                            ? 'bg-blue-600 text-white dark:bg-blue-500' 
                                                            : 'bg-emerald-600 text-white dark:bg-emerald-500'
                                                    }`}>
                                                        {m.days} Hari • {m.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                            {idx < activeFormula.modules.length - 1 && (
                                                <div className="text-neutral-400 font-extrabold text-2xl px-1 select-none">+</div>
                                            )}
                                        </React.Fragment>
                                    ))}

                                    <div className="text-neutral-400 font-extrabold text-2xl px-1 select-none">=</div>

                                    {/* Final Target Outcome Card */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-32 h-24 rounded-2xl flex flex-col items-center justify-center p-3 text-center border border-purple-200 bg-purple-50/50 text-purple-800 dark:bg-purple-950/20 dark:border-purple-900 dark:text-purple-300 shadow-md shadow-purple-500/5 animate-pulse">
                                            <Layers className="size-5 text-purple-600 dark:text-purple-400 mb-1" />
                                            <span className="text-[9px] font-extrabold uppercase tracking-wider">Kompetensi</span>
                                            <span className="text-[8px] font-bold mt-1 line-clamp-2 leading-snug">{activeFormula.targetCompetency}</span>
                                        </div>
                                    </div>

                                </div>
                                
                                <div className="border-t border-neutral-100 pt-4 dark:border-neutral-800 text-center text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                    Sistem Formula: <span className="text-blue-600 dark:text-blue-400 font-bold">{activeFormula.modules.filter(m => m.type === 'Wajib').length} Modul Wajib</span> + <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeFormula.modules.filter(m => m.type === 'Opsional').length} Modul Opsional</span> = {activeFormula.totalDays} Hari Pelatihan Terpadu
                                </div>
                            </CardContent>
                        </Card>

                        {/* Module table list */}
                        <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm overflow-hidden">
                            <div className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Daftar Modul yang Diperlukan</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-neutral-100 bg-neutral-50/50 font-semibold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                            <th className="px-6 py-3.5">Kode</th>
                                            <th className="px-6 py-3.5">Judul Modul</th>
                                            <th className="px-6 py-3.5">Status</th>
                                            <th className="px-6 py-3.5">Revisi</th>
                                            <th className="px-6 py-3.5">Durasi</th>
                                            <th className="px-6 py-3.5">Deskripsi Singkat</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {filteredModules.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-8 text-neutral-400 font-medium dark:text-neutral-500">
                                                    Tidak ada modul yang cocok dengan pencarian.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredModules.map((m) => (
                                                <tr key={m.code} className="hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{m.code}</td>
                                                    <td className="px-6 py-4 font-semibold text-neutral-800 dark:text-neutral-200">{m.title}</td>
                                                    <td className="px-6 py-4">
                                                        <Badge className={`rounded-md border-0 px-2 py-0.5 text-[9px] font-bold ${
                                                            m.type === 'Wajib'
                                                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                                                                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                        }`}>
                                                            {m.type}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 font-medium">v{m.revision}</td>
                                                    <td className="px-6 py-4 font-semibold text-neutral-700 dark:text-neutral-300">{m.days} Hari</td>
                                                    <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs truncate" title={m.description}>{m.description}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Meta Information & Summary */}
                    <div className="space-y-6">
                        
                        {/* Program Meta Information */}
                        <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm flex flex-col justify-between">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Target & Kompetensi</h3>
                            </div>
                            <CardContent className="p-5 space-y-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase">Nama Program</span>
                                    <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200">{activeFormula.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase">Sertifikasi & Gelar Kompetensi</span>
                                    <p className="text-sm font-extrabold text-purple-700 dark:text-purple-400">{activeFormula.targetCompetency}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase">Total Durasi Pembelajaran</span>
                                    <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                        <Clock className="size-4 text-blue-600 dark:text-blue-400" />
                                        <span>{activeFormula.totalDays} Hari Kursus Aktif</span>
                                    </p>
                                </div>
                                <div className="space-y-1 border-t pt-3 dark:border-neutral-800">
                                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase">Persyaratan Kelulusan</span>
                                    <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400 font-medium">
                                        Peserta pelatihan wajib menyelesaikan seluruh modul berstatus <span className="font-bold text-blue-600">Wajib</span> dan setidaknya 1 modul <span className="font-bold text-emerald-600">Opsional</span>, diikuti dengan ujian sertifikasi kelulusan program.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Compliance check card */}
                        <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm">
                            <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Status Kepatuhan Audit</h3>
                            </div>
                            <CardContent className="p-5 flex flex-col gap-4">
                                <div className="flex items-start gap-3 rounded-xl border border-emerald-200/50 bg-emerald-50/30 p-3.5 dark:border-emerald-950/40 dark:bg-emerald-950/10">
                                    <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-550 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Kurikulum Sesuai Standar</h4>
                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold leading-relaxed mt-0.5">
                                            Seluruh modul wajib memiliki versi revisi approved yang aktif di database modul.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-xl border border-blue-200/50 bg-blue-50/30 p-3.5 dark:border-blue-950/40 dark:bg-blue-950/10">
                                    <AlertCircle className="size-5 text-blue-600 dark:text-blue-550 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold text-blue-800 dark:text-blue-400">Informasi Pembaharuan</h4>
                                        <p className="text-[10px] text-blue-600 dark:text-blue-550 font-semibold leading-relaxed mt-0.5">
                                            Revisi modul otomatis merefleksikan perubahan di halaman formula ini secara real-time.
                                        </p>
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
