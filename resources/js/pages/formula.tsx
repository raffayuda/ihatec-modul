import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    BookOpen,
    CheckCircle2,
    Search,
    Plus,
    Trash2,
    Check,
    FileCode2
} from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Formula Modul',
        href: '/formula',
    },
];

// Interface definitions
interface ModuleItem {
    code: string;
    title: string;
    revision: string;
    date: string;
}

interface FormulaItem {
    trainingCode: string;
    modules: ModuleItem[];
}

interface FormulaModulProps {
    trainingCodes?: string[];
    modulesDatabase?: ModuleItem[];
    initialFormulas?: FormulaItem[];
}

export default function FormulaModul({
    trainingCodes = [],
    modulesDatabase = [],
    initialFormulas = [],
}: FormulaModulProps) {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;
    const userRole = user?.role || 'User';

    // 1. Master Database Kode Pelatihan (from database props)
    const masterTrainingCodes = useMemo(() => {
        return trainingCodes.length > 0 ? trainingCodes : [
            '1.11 Pelatihan Penyelia Halal Berbasis SKKNI',
            '1.12 Pelatihan Auditor Halal',
            '1.13 Pelatihan Penyelia Halal Internasional',
            '2.01 Pelatihan K3 Laboratorium',
            '2.02 Pelatihan ISO 17025'
        ];
    }, [trainingCodes]);

    // 2. Modules list (from database props is modulesDatabase)
    
    // 3. Current active formulas (local React state populated from Laravel backend)
    const [formulas, setFormulas] = useState<FormulaItem[]>(initialFormulas);

    useEffect(() => {
        setFormulas(initialFormulas);
    }, [initialFormulas]);

    // Active Tab/View state: Admin view if role is Admin/Staf, otherwise default to Training view
    const initialView = useMemo(() => {
        const roleLower = userRole.toLowerCase();
        if (roleLower === 'admin' || roleLower === 'staf pd') {
            return 'admin';
        }
        return 'training';
    }, [userRole]);

    const [activeTab, setActiveTab] = useState<'admin' | 'training'>(initialView);

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ==========================================
    // ADMIN PD STATE & HANDLERS
    // ==========================================
    const [adminSelectedTraining, setAdminSelectedTraining] = useState('');
    const [adminModules, setAdminModules] = useState<Array<{ code: string; title: string; revision: string; date: string }>>([
        { code: '', title: '', revision: '', date: '' }
    ]);
    const [trainingSearchQuery, setTrainingSearchQuery] = useState('');

    // Initialize values when masterTrainingCodes loads
    useEffect(() => {
        if (masterTrainingCodes.length > 0) {
            if (!adminSelectedTraining || !masterTrainingCodes.includes(adminSelectedTraining)) {
                setAdminSelectedTraining(masterTrainingCodes[0]);
            }
            if (!trainingSearchQuery || !masterTrainingCodes.includes(trainingSearchQuery)) {
                setTrainingSearchQuery(masterTrainingCodes[0]);
            }
        }
    }, [masterTrainingCodes, adminSelectedTraining, trainingSearchQuery]);

    // Sync form values when selected training changes (auto-load existing formula)
    useEffect(() => {
        if (adminSelectedTraining) {
            const existing = formulas.find(f => f.trainingCode === adminSelectedTraining);
            if (existing && existing.modules.length > 0) {
                setAdminModules(existing.modules);
            } else {
                setAdminModules([{ code: '', title: '', revision: '', date: '' }]);
            }
        }
    }, [adminSelectedTraining, formulas]);

    const handleNewForm = () => {
        setAdminModules([{ code: '', title: '', revision: '', date: '' }]);
        triggerToast('Formulir berhasil direset!', 'success');
    };

    const handleAddRow = () => {
        setAdminModules(prev => [...prev, { code: '', title: '', revision: '', date: '' }]);
    };

    const handleRemoveRow = (index: number) => {
        if (adminModules.length <= 1) {
            triggerToast('Harus memiliki minimal 1 baris modul!', 'error');
            return;
        }
        setAdminModules(prev => prev.filter((_, idx) => idx !== index));
    };

    const handleModuleChange = (index: number, code: string) => {
        const matched = modulesDatabase.find(m => m.code === code);
        setAdminModules(prev => prev.map((item, idx) => {
            if (idx === index) {
                return matched 
                    ? { code: matched.code, title: matched.title, revision: matched.revision, date: matched.date }
                    : { code: '', title: '', revision: '', date: '' };
            }
            return item;
        }));
    };

    const handleCreateFormula = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        const validModules = adminModules.filter(m => m.code !== '');
        if (validModules.length === 0) {
            triggerToast('Mohon pilih minimal satu modul pelatihan!', 'error');
            return;
        }

        router.post('/formula', {
            trainingCode: adminSelectedTraining,
            modules: validModules
        }, {
            onSuccess: () => {
                triggerToast('Formula Modul berhasil disimpan ke database!', 'success');
            },
            onError: (err) => {
                const firstError = Object.values(err)[0] as string;
                triggerToast(firstError || 'Gagal menyimpan Formula Modul!', 'error');
            }
        });
    };

    // ==========================================
    // TRAINING VIEW STATE & HANDLERS
    // ==========================================

    const trainingActiveFormula = useMemo(() => {
        return formulas.find(f => f.trainingCode === trainingSearchQuery) || null;
    }, [formulas, trainingSearchQuery]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Database Formula Modul" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                            Database Formula Modul
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Kelola kombinasi dan formula modul untuk setiap program pelatihan.
                        </p>
                    </div>

                    {/* Tab Switcher / Role Simulation Toggle */}
                    {(userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'staf pd') && (
                        <div className="flex items-center gap-1 rounded-xl bg-neutral-100 dark:bg-neutral-950 p-1 border border-neutral-200 dark:border-neutral-800 self-start sm:self-center">
                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                    activeTab === 'admin'
                                        ? 'bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white shadow-sm'
                                        : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                                }`}
                            >
                                Tampilan Admin PD
                            </button>
                            <button
                                onClick={() => setActiveTab('training')}
                                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                    activeTab === 'training'
                                        ? 'bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white shadow-sm'
                                        : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                                }`}
                            >
                                Tampilan Training
                            </button>
                        </div>
                    )}
                </div>

                {/* Local Toast Alert */}
                {toast && (
                    <div className={`fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-xl border p-4 text-sm font-semibold shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300 ${
                        toast.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300'
                            : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300'
                    }`}>
                        <CheckCircle2 className={`size-4.5 ${toast.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} />
                        <span>{toast.message}</span>
                    </div>
                )}

                {/* Main Content Areas */}
                {activeTab === 'admin' ? (
                    // ==========================================
                    // ADMIN PD VIEW
                    // ==========================================
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm overflow-hidden">
                            <div className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800 bg-neutral-50/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileCode2 className="size-5 text-blue-600 dark:text-blue-500" />
                                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">TAMPILAN ADMIN PD</h3>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleNewForm}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs border-neutral-200 dark:border-neutral-800"
                                >
                                    New
                                </Button>
                            </div>

                            <CardContent className="p-6">
                                <form onSubmit={handleCreateFormula} className="space-y-6">
                                    {/* Training Selection dropdown */}
                                    <div className="space-y-2 max-w-xl">
                                        <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                                            Kode Pelatihan
                                        </label>
                                        <SearchableSelect
                                            value={adminSelectedTraining}
                                            onChange={(val) => setAdminSelectedTraining(val)}
                                            options={masterTrainingCodes}
                                            nullLabel="-- Pilih Kode Pelatihan --"
                                        />
                                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                                            Pilihan dari master database kode pelatihan.
                                        </p>
                                    </div>

                                    {/* Modules row list table */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                                            List Modul
                                        </label>

                                        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20">
                                            <table className="w-full min-w-[700px] text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50 font-bold text-neutral-500 dark:text-neutral-400">
                                                        <th className="px-4 py-3 text-center w-14">Aksi</th>
                                                        <th className="px-4 py-3">Kode & Nama Modul</th>
                                                        <th className="px-4 py-3 w-40">Kode Revisi</th>
                                                        <th className="px-4 py-3 w-48">Tanggal Berlaku</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                                    {adminModules.map((item, index) => (
                                                        <tr key={index} className="bg-white dark:bg-neutral-950">
                                                            {/* Trash Aksi */}
                                                            <td className="px-4 py-3 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveRow(index)}
                                                                    className="size-7 rounded flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/35 transition-colors"
                                                                    title="Hapus Modul"
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </button>
                                                            </td>

                                                            {/* Dropdown module */}
                                                            <td className="px-4 py-3">
                                                                <SearchableSelect
                                                                    value={item.code}
                                                                    onChange={(val) => handleModuleChange(index, val)}
                                                                    options={(modulesDatabase || []).map((dbMod) => ({
                                                                        value: dbMod.code,
                                                                        label: `${dbMod.code} - ${dbMod.title}`,
                                                                    }))}
                                                                    nullLabel="-- Pilih dari database modul --"
                                                                />
                                                            </td>

                                                            {/* Revision code (autofill read only) */}
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="text"
                                                                    readOnly
                                                                    disabled
                                                                    value={item.revision}
                                                                    placeholder="Otomatis menyesuaikan"
                                                                    className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-100 dark:bg-neutral-900/60 px-3 text-xs text-neutral-550 dark:text-neutral-400 font-bold outline-none"
                                                                />
                                                            </td>

                                                            {/* Date active (autofill read only) */}
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="text"
                                                                    readOnly
                                                                    disabled
                                                                    value={item.date}
                                                                    placeholder="Otomatis menyesuaikan"
                                                                    className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-100 dark:bg-neutral-900/60 px-3 text-xs text-neutral-550 dark:text-neutral-400 font-semibold outline-none"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Add row helper button */}
                                        <div className="pt-2">
                                            <Button
                                                type="button"
                                                onClick={handleAddRow}
                                                size="sm"
                                                variant="outline"
                                                className="h-8 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center gap-1.5 shadow-sm"
                                            >
                                                <Plus className="size-3.5" />
                                                <span>Add</span>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                                        <Button
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 text-xs font-semibold h-10 px-5 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                                        >
                                            <Check className="size-4" />
                                            <span>Create Formula Modul</span>
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    // ==========================================
                    // TRAINING VIEW
                    // ==========================================
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <Card className="border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm overflow-hidden">
                            <div className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800 bg-neutral-50/10">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="size-5 text-blue-600 dark:text-blue-500" />
                                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">TAMPILAN TRAINING</h3>
                                </div>
                            </div>

                            <CardContent className="p-6 space-y-6">
                                {/* Search component block */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-neutral-150 bg-neutral-50/40 dark:border-neutral-850 dark:bg-neutral-900/30">
                                    <div className="flex items-center gap-2">
                                        <Search className="size-4 text-neutral-400 dark:text-neutral-500" />
                                        <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">Search Kode & Nama Pelatihan</span>
                                    </div>
                                    <div className="w-full sm:w-80">
                                        <SearchableSelect
                                            value={trainingSearchQuery}
                                            onChange={(val) => setTrainingSearchQuery(val)}
                                            options={masterTrainingCodes}
                                        />
                                    </div>
                                </div>

                                {/* Results display */}
                                <div className="space-y-4">
                                    {/* Displayed Kode Pelatihan */}
                                    <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-neutral-100 bg-neutral-50/10 dark:border-neutral-800">
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Kode Pelatihan</span>
                                        <span className="text-sm font-extrabold text-neutral-800 dark:text-neutral-100">
                                            {trainingSearchQuery}
                                        </span>
                                    </div>

                                    {/* Table modules list outcome */}
                                    <div className="space-y-2">
                                        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                                            List Modul
                                        </span>
                                        
                                        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                                            <table className="w-full min-w-[600px] text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="border-b border-neutral-100 bg-neutral-50/50 font-bold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/30">
                                                        <th className="px-5 py-3.5">Kode & Nama Modul</th>
                                                        <th className="px-5 py-3.5 w-48">Kode Revisi</th>
                                                        <th className="px-5 py-3.5 w-56">Tanggal Berlaku</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                                    {!trainingActiveFormula || trainingActiveFormula.modules.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={3} className="text-center py-10 text-neutral-400 font-medium dark:text-neutral-500">
                                                                Belum ada formula modul yang dibuat untuk pelatihan ini.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        trainingActiveFormula.modules.map((m) => (
                                                            <tr key={m.code} className="hover:bg-neutral-50/10 dark:hover:bg-neutral-900/5 transition-colors">
                                                                <td className="px-5 py-4">
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                                                            {m.code}
                                                                        </span>
                                                                        <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                                                                            {m.title}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-5 py-4 font-bold text-neutral-700 dark:text-neutral-300">
                                                                    {m.revision}
                                                                </td>
                                                                <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400 font-semibold">
                                                                    {m.date}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
