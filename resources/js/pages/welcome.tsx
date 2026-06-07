import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppearance } from '@/hooks/use-appearance';
import { InteractiveDashboardPreview, type DashboardView } from '@/components/interactive-dashboard-preview';
import {
    ShieldCheck,
    Check,
    Send,
    Users,
    Archive,
    Menu,
    X,
    Sun,
    Moon,
    ArrowRight,
    Github,
    Database,
    FileText,
    CheckCircle2,
    UploadCloud,
    Server,
    BarChart3,
    RefreshCw
} from 'lucide-react';

// Stepper Flow Component
const ProcessStepper = () => {
    const steps = [
        { num: 1, icon: Send, label: "Pengajuan", desc: "Pengaju mengirim modul baru atau revisi" },
        { num: 2, icon: FileText, label: "Drafting", desc: "Penyusunan & upload dokumen modul" },
        { num: 3, icon: Users, label: "Approval", desc: "Review & approval oleh Manager/PD" },
        { num: 4, icon: CheckCircle2, label: "Approved", desc: "Modul disetujui dan dipublikasikan", active: true },
        { num: 5, icon: Archive, label: "Database", desc: "Tersimpan & siap diakses tim training" },
    ];

    return (
        <div className="w-full bg-white dark:bg-[#18181b] rounded-2xl border border-gray-100 dark:border-[#27272a] shadow-lg p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-4 justify-between">
                {steps.map((step, i) => (
                    <>
                        <div key={i} className="flex flex-col items-center text-center flex-1">
                            <div className={`relative mb-3 flex size-12 items-center justify-center rounded-full border-2 ${
                                step.active 
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:border-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400' 
                                    : 'border-blue-600 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400'
                            }`}>
                                <span className={`absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                                    step.active ? 'bg-emerald-500' : 'bg-blue-600 dark:bg-blue-500'
                                }`}>
                                    {step.num}
                                </span>
                                <step.icon className="size-5" />
                            </div>
                            <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{step.label}</span>
                            <p className="mt-1 text-[10px] font-medium text-neutral-400 dark:text-neutral-500 max-w-[120px]">{step.desc}</p>
                        </div>
                        {i < steps.length - 1 && (
                            <div className="hidden lg:block w-12 h-0.5 border-t-2 border-dashed border-gray-200 dark:border-neutral-700 flex-shrink-0" />
                        )}
                    </>
                ))}
            </div>
        </div>
    );
};

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const { appearance, updateAppearance } = useAppearance();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [heroDashboardView, setHeroDashboardView] = useState<DashboardView>('overview');
    const [processDashboardView, setProcessDashboardView] = useState<DashboardView>('pengajuan');

    // Loading screen states
    const [isLoading, setIsLoading] = useState(true);
    const [loadingText, setLoadingText] = useState('Menghubungkan database...');

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const texts = [
            'Menghubungkan database...',
            'Sinkronisasi versi modul...',
            'Menyiapkan matriks pelatihan...',
            'Hampir selesai...'
        ];
        let textIdx = 0;
        const textInterval = setInterval(() => {
            if (textIdx < texts.length - 1) {
                textIdx++;
                setLoadingText(texts[textIdx]);
            }
        }, 400);

        const timer = setTimeout(() => {
            setIsLoading(false);
            clearInterval(textInterval);
        }, 1800);

        return () => {
            clearTimeout(timer);
            clearInterval(textInterval);
        };
    }, []);

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="min-h-screen bg-white text-[#18181b] dark:bg-[#09090b] dark:text-[#f4f4f5] font-['Instrument_Sans',sans-serif] selection:bg-[#FF2D20] selection:text-white transition-colors duration-300">
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 1 }}
                        exit={{ 
                            opacity: 0,
                            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                        }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-[#09090b] select-none"
                    >
                        {/* Grid effect background */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                        
                        <div className="relative flex flex-col items-center max-w-xs w-full px-4 text-center">
                            {/* Brand logo bouncing and glowing */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ 
                                    scale: 1, 
                                    opacity: 1,
                                    rotate: [0, -5, 5, 0]
                                }}
                                transition={{ 
                                    duration: 0.8,
                                    ease: [0.16, 1, 0.3, 1]
                                }}
                                className="relative mb-8"
                            >
                                <div className="absolute inset-0 bg-[#FF2D20]/20 dark:bg-[#FF2D20]/30 rounded-2xl blur-xl filter animate-pulse" />
                                
                                <motion.div 
                                    className="relative size-16 bg-[#FF2D20] rounded-2xl flex items-center justify-center text-white font-black text-4xl italic shadow-2xl shadow-[#FF2D20]/30"
                                    animate={{
                                        y: [0, -6, 0]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2,
                                        ease: "easeInOut"
                                    }}
                                >
                                    P
                                </motion.div>
                            </motion.div>

                            {/* Text labels */}
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-1"
                            >
                                Modul PD
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                transition={{ delay: 0.3 }}
                                className="text-[10px] font-bold tracking-widest uppercase text-neutral-550 dark:text-neutral-400 mb-6"
                            >
                                Training Module Management
                            </motion.p>

                            {/* Minimalist horizontal progress bar */}
                            <div className="w-40 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mb-3 relative">
                                <motion.div
                                    initial={{ left: "-100%" }}
                                    animate={{ left: "0%" }}
                                    transition={{
                                        duration: 1.6,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute inset-y-0 w-full bg-[#FF2D20] rounded-full"
                                />
                            </div>

                            {/* Loading state message */}
                            <motion.span
                                key={loadingText}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="text-xs font-semibold text-neutral-400 dark:text-neutral-550"
                            >
                                {loadingText}
                            </motion.span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <Head title="Modul PD - Portal Database Modul Pelatihan" />
            {/* Navigation */}
            <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
                isScrolled ? 'bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-gray-100 dark:border-[#18181b] py-3' : 'bg-transparent py-5'
            }`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="size-8 bg-[#FF2D20] rounded-lg flex items-center justify-center text-white font-black text-xl italic group-hover:scale-110 transition-transform">
                                P
                            </div>
                            <span className="font-extrabold text-xl tracking-tight hidden sm:block">Modul PD</span>
                        </Link>
                        
                        <nav className="hidden lg:flex items-center gap-6 text-[13px] font-semibold text-gray-600 dark:text-gray-400">
                            <a href="#features" className="hover:text-[#FF2D20] transition-colors">Fitur</a>
                            <a href="#alur" className="hover:text-[#FF2D20] transition-colors">Alur Proses</a>
                            <a href="#stats" className="hover:text-[#FF2D20] transition-colors">Statistik</a>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <button onClick={toggleTheme} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                                {appearance === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
                            </button>
                            <a href="https://github.com" target="_blank" className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                                <Github className="size-5" />
                            </a>
                        </div>

                        <div className="h-6 w-px bg-gray-200 dark:bg-[#27272a] hidden sm:block mx-1"></div>

                        {auth.user ? (
                            <Link href={route('dashboard')} className="px-5 py-2 bg-[#FF2D20] hover:bg-[#E0241A] text-white font-bold text-sm rounded-full transition-all shadow-lg shadow-[#FF2D20]/20">
                                Dashboard
                            </Link>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link href={route('login')} className="px-4 py-2 text-sm font-bold hover:text-[#FF2D20] transition-colors">
                                    Masuk
                                </Link>
                                <Link href={route('register')} className="px-5 py-2 bg-[#FF2D20] hover:bg-[#E0241A] text-white font-bold text-sm rounded-full transition-all shadow-lg shadow-[#FF2D20]/20">
                                    Coba Sekarang
                                </Link>
                            </div>
                        )}
                        
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-gray-600 dark:text-gray-400">
                            {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                        </button>
                    </div>
                </div>
                
                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-b border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#09090b] px-6 py-4 flex flex-col gap-4 overflow-hidden"
                        >
                            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-sm hover:text-[#FF2D20] transition-colors">Fitur</a>
                            <a href="#alur" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-sm hover:text-[#FF2D20] transition-colors">Alur Proses</a>
                            <a href="#stats" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-sm hover:text-[#FF2D20] transition-colors">Statistik</a>
                            <hr className="border-gray-100 dark:border-[#27272a]" />
                            {auth.user ? (
                                <Link href={route('dashboard')} className="h-10 rounded-xl bg-[#FF2D20] text-white font-bold text-sm flex items-center justify-center">Dashboard</Link>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Link href={route('login')} className="h-10 rounded-xl border border-gray-200 dark:border-[#27272a] font-bold text-sm flex items-center justify-center">Masuk</Link>
                                    <Link href={route('register')} className="h-10 rounded-xl bg-[#FF2D20] text-white font-bold text-sm flex items-center justify-center">Coba Sekarang</Link>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Hero Section */}
            <main className="pt-32 pb-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF2D20]/10 text-[#FF2D20] text-xs font-bold mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2D20] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF2D20]"></span>
                            </span>
                            Platform Digital Manajemen Modul Pelatihan
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-8">
                            Kelola <span className="text-[#FF2D20]">Database Modul</span> Pelatihan secara Digital.
                        </h1>
                        
                        <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed mb-10 max-w-xl">
                            Satu portal terpusat untuk pengajuan, approval, revisi, penyimpanan, dan pemetaan modul pelatihan. Dukung tim People Development Anda dengan sistem yang cepat dan transparan.
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4">
                            <Link 
                                href={auth.user ? route('dashboard') : route('register')}
                                className="px-8 py-4 bg-[#FF2D20] hover:bg-[#E0241A] text-white font-extrabold rounded-xl flex items-center gap-3 transition-all shadow-xl shadow-[#FF2D20]/30 hover:scale-[1.02]"
                            >
                                {auth.user ? 'Buka Dashboard' : 'Mulai Sekarang'}
                                <ArrowRight className="size-5" />
                            </Link>
                            <a href="#features" className="px-8 py-4 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] font-extrabold rounded-xl hover:bg-gray-50 dark:hover:bg-[#27272a] transition-all">
                                Lihat Fitur
                            </a>
                        </div>
                        
                        <div className="mt-12 flex items-center gap-8 grayscale opacity-40 overflow-hidden whitespace-nowrap">
                            <div className="flex items-center gap-2 font-bold text-sm"><Database className="size-4" /> 386 Modul</div>
                            <div className="flex items-center gap-2 font-bold text-sm"><CheckCircle2 className="size-4" /> 312 Approved</div>
                            <div className="flex items-center gap-2 font-bold text-sm"><Users className="size-4" /> 8 Program</div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <InteractiveDashboardPreview
                            activeView={heroDashboardView}
                            onViewChange={setHeroDashboardView}
                            variant="hero"
                        />

                        {/* Decorative Background Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-[#FF2D20]/10 rounded-full blur-[100px] -z-10 animate-pulse" />
                    </motion.div>
                </div>
            </main>

            {/* Metrics Bar */}
            <section className="py-10 bg-gray-50 dark:bg-[#09090b] border-y border-gray-100 dark:border-[#18181b]">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="text-center">
                        <div className="text-3xl font-black text-[#FF2D20]">386</div>
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">Total Modul</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-black text-emerald-500">312</div>
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">Modul Approved</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-black text-blue-500">24</div>
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">Menunggu Review</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-black text-amber-500">1.2K</div>
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">Total Dokumen</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24" id="features">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold tracking-tight mb-4">Fitur Lengkap untuk Manajemen Modul</h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Dari pengajuan hingga publikasi, semua kebutuhan pendataan modul pelatihan dalam satu platform terintegrasi.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* Feature: Digital Submission */}
                        <div className="group p-7 rounded-2xl bg-white dark:bg-[#18181b] border border-gray-100 dark:border-[#27272a] hover:border-[#FF2D20]/30 transition-all hover:shadow-xl hover:shadow-red-500/5">
                            <div className="size-12 rounded-xl bg-[#FF2D20]/10 text-[#FF2D20] flex items-center justify-center mb-5">
                                <UploadCloud className="size-6" />
                            </div>
                            <h3 className="text-lg font-extrabold mb-2 group-hover:text-[#FF2D20] transition-colors">Pengajuan Digital</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                Ajukan modul baru atau revisi secara online. Lengkapi metadata (judul, program, bahasa) dan upload file PDF langsung dari browser.
                            </p>
                        </div>

                        {/* Feature: Multi-level Approval */}
                        <div className="group p-7 rounded-2xl bg-white dark:bg-[#18181b] border border-gray-100 dark:border-[#27272a] hover:border-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/5">
                            <div className="size-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-5">
                                <ShieldCheck className="size-6" />
                            </div>
                            <h3 className="text-lg font-extrabold mb-2 group-hover:text-blue-500 transition-colors">Approval Bertingkat</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                Alur review dari Tim PD hingga Manager. Setiap keputusan tercatat dengan audit trail lengkap dan notifikasi otomatis.
                            </p>
                        </div>

                        {/* Feature: Centralized Database */}
                        <div className="group p-7 rounded-2xl bg-white dark:bg-[#18181b] border border-gray-100 dark:border-[#27272a] hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/5">
                            <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-5">
                                <Database className="size-6" />
                            </div>
                            <h3 className="text-lg font-extrabold mb-2 group-hover:text-emerald-500 transition-colors">Database Terpusat</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                Semua modul tersimpan dalam satu database dengan versioning. Cari, filter, dan akses dengan cepat berdasarkan program atau kategori.
                            </p>
                        </div>

                        {/* Feature: Version History */}
                        <div className="group p-7 rounded-2xl bg-white dark:bg-[#18181b] border border-gray-100 dark:border-[#27272a] hover:border-violet-500/30 transition-all hover:shadow-xl hover:shadow-violet-500/5">
                            <div className="size-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center mb-5">
                                <RefreshCw className="size-6" />
                            </div>
                            <h3 className="text-lg font-extrabold mb-2 group-hover:text-violet-500 transition-colors">Riwayat Revisi</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                Setiap perubahan modul tercatat dengan nomor versi. Lacak siapa yang merevisi, kapan, dan apa yang berubah.
                            </p>
                        </div>

                        {/* Feature: Training Matrix */}
                        <div className="group p-7 rounded-2xl bg-white dark:bg-[#18181b] border border-gray-100 dark:border-[#27272a] hover:border-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-500/5">
                            <div className="size-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-5">
                                <BarChart3 className="size-6" />
                            </div>
                            <h3 className="text-lg font-extrabold mb-2 group-hover:text-amber-500 transition-colors">Matriks Pelatihan</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                Petakan modul ke program pelatihan. Identifikasi kesenjangan kompetensi dan rencanakan pengembangan modul baru.
                            </p>
                        </div>

                        {/* Feature: Cloud Integration */}
                        <div className="group p-7 rounded-2xl bg-white dark:bg-[#18181b] border border-gray-100 dark:border-[#27272a] hover:border-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/5">
                            <div className="size-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-5">
                                <Server className="size-6" />
                            </div>
                            <h3 className="text-lg font-extrabold mb-2 group-hover:text-cyan-500 transition-colors">Integrasi Cloud</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                File modul otomatis tersimpan di Google Drive. Preview dan download langsung dari portal tanpa perlu mengunduh ulang.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Alur Proses Section */}
            <section className="py-24 bg-gray-50 dark:bg-[#09090b] border-y border-gray-100 dark:border-[#18181b]" id="alur">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold tracking-tight mb-4">Alur Proses Modul</h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Dari pengajuan hingga tersimpan di database, setiap modul melewati alur yang transparan dan terstandarisasi.
                        </p>
                    </div>

                    <ProcessStepper />

                    <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <div className="space-y-4">
                            {[
                                { icon: Send, title: "1. Pengajuan Modul", desc: "Pengaju mengisi detail modul (judul, program, bahasa, deskripsi) dan mengunggah file PDF. Sistem otomatis membaca jumlah halaman dan metadata.", view: 'pengajuan' as DashboardView },
                                { icon: FileText, title: "2. Review Tim PD", desc: "Tim People Development meninjau materi, relevansi kurikulum, dan format. Memberikan catatan perbaikan jika diperlukan.", view: 'review' as DashboardView },
                                { icon: Users, title: "3. Approval Manager", desc: "Manager memeriksa draf akhir dan rekomendasi Tim PD, memutuskan apakah modul disetujui, ditolak, atau perlu revisi.", view: 'approval' as DashboardView },
                                { icon: Archive, title: "4. Database & Distribusi", desc: "Modul yang disetujui otomatis masuk ke database aktif, mendapat nomor versi resmi, dan siap diakses untuk program pelatihan.", view: 'matrix' as DashboardView },
                            ].map((item, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setProcessDashboardView(item.view)}
                                    className={`flex w-full items-start gap-4 rounded-xl p-4 text-left transition-all ${
                                        processDashboardView === item.view
                                            ? 'border border-[#FF2D20]/30 bg-[#FF2D20]/5 shadow-md dark:border-[#FF2D20]/20 dark:bg-[#FF2D20]/10'
                                            : 'border border-transparent hover:bg-gray-50 dark:hover:bg-neutral-900/50'
                                    }`}
                                >
                                    <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                        processDashboardView === item.view
                                            ? 'bg-[#FF2D20] text-white'
                                            : 'bg-[#FF2D20]/10 text-[#FF2D20]'
                                    }`}>
                                        <item.icon className="size-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold mb-1">{item.title}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                </button>
                            ))}
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium pl-4">
                                Klik langkah di atas untuk melihat fitur dashboard yang sesuai →
                            </p>
                        </div>

                        <InteractiveDashboardPreview
                            activeView={processDashboardView}
                            onViewChange={setProcessDashboardView}
                            variant="inline"
                        />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24" id="stats">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    <div className="lg:col-span-5">
                        <h2 className="text-4xl font-extrabold tracking-tight mb-6">
                            Percaya diri dengan <span className="text-[#FF2D20]">data</span> yang terkelola.
                        </h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
                            Pantau pertumbuhan database modul, status approval, dan aktivitas tim secara real-time dari dashboard terpusat.
                        </p>
                        
                        <ul className="space-y-4">
                            {[
                                "Notifikasi otomatis untuk setiap perubahan status",
                                "Grafik distribusi status approval bulanan",
                                "Riwayat aktivitas lengkap per pengguna",
                                "Kapasitas penyimpanan dokumen terpantau"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="size-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-[#FF2D20] mt-1 shrink-0">
                                        <Check className="size-3 stroke-[4]" />
                                    </div>
                                    <span className="font-bold text-[15px]">{item}</span>
                                </li>
                            ))}
                        </ul>
                        
                        <Link 
                            href={auth.user ? route('dashboard') : route('register')}
                            className="mt-10 group inline-flex items-center gap-2 text-[#FF2D20] font-black text-sm uppercase tracking-widest"
                        >
                            {auth.user ? 'Buka Dashboard' : 'Mulai Sekarang'}
                            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    
                    {/* Stats Cards Grid */}
                    <div className="lg:col-span-7">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-[#FF2D20]/5 border border-[#FF2D20]/10">
                                <div className="text-4xl font-black text-[#FF2D20]">312</div>
                                <div className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-2">Modul Disetujui</div>
                                <div className="mt-3 w-full h-2 rounded-full bg-[#FF2D20]/10">
                                    <div className="h-full w-[81%] rounded-full bg-[#FF2D20]" />
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                <div className="text-4xl font-black text-emerald-500">86%</div>
                                <div className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-2">Approval Rate</div>
                                <div className="mt-3 w-full h-2 rounded-full bg-emerald-500/10">
                                    <div className="h-full w-[86%] rounded-full bg-emerald-500" />
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                <div className="text-4xl font-black text-blue-500">8</div>
                                <div className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-2">Program Pelatihan</div>
                                <div className="mt-3 w-full h-2 rounded-full bg-blue-500/10">
                                    <div className="h-full w-[100%] rounded-full bg-blue-500" />
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                                <div className="text-4xl font-black text-amber-500">28%</div>
                                <div className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-2">Kapasitas Terpakai</div>
                                <div className="mt-3 w-full h-2 rounded-full bg-amber-500/10">
                                    <div className="h-full w-[28%] rounded-full bg-amber-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gray-50 dark:bg-[#09090b] border-t border-gray-100 dark:border-[#18181b]">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-extrabold tracking-tight mb-6">
                        Siap kelola modul pelatihan <br />secara <span className="text-[#FF2D20]">lebih baik</span>?
                    </h2>
                    <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10">
                        Ribuan modul telah terkelola melalui portal ini. Mulai digitalisasi pendataan modul pelatihan tim Anda sekarang.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link 
                            href={auth.user ? route('dashboard') : route('register')}
                            className="px-8 py-4 bg-[#FF2D20] hover:bg-[#E0241A] text-white font-extrabold rounded-xl flex items-center gap-3 transition-all shadow-xl shadow-[#FF2D20]/30 hover:scale-[1.02]"
                        >
                            {auth.user ? 'Buka Dashboard' : 'Mulai Sekarang'}
                            <ArrowRight className="size-5" />
                        </Link>
                        <Link
                            href={route('login')}
                            className="px-8 py-4 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] font-extrabold rounded-xl hover:bg-gray-50 dark:hover:bg-[#27272a] transition-all"
                        >
                            Masuk ke Akun
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="size-7 bg-[#FF2D20] rounded-lg flex items-center justify-center text-white font-black italic">P</div>
                            <span className="font-extrabold text-lg tracking-tight">Modul PD</span>
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Portal digital manajemen modul pelatihan terintegrasi untuk tim People Development.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="font-extrabold text-sm uppercase tracking-widest">Fitur</h4>
                        <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-3 font-semibold">
                            <li><a href="#" className="hover:text-[#FF2D20] transition-colors">Pengajuan Modul</a></li>
                            <li><a href="#" className="hover:text-[#FF2D20] transition-colors">Approval</a></li>
                            <li><a href="#" className="hover:text-[#FF2D20] transition-colors">Database Modul</a></li>
                            <li><a href="#" className="hover:text-[#FF2D20] transition-colors">Matriks Pelatihan</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-extrabold text-sm uppercase tracking-widest">Ekosistem</h4>
                        <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-3 font-semibold">
                            <li><a href="#" className="hover:text-[#FF2D20] transition-colors">Google Drive Integration</a></li>
                            <li><a href="#" className="hover:text-[#FF2D20] transition-colors">Laporan & Analitik</a></li>
                            <li><a href="#" className="hover:text-[#FF2D20] transition-colors">Audit Trail</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-extrabold text-sm uppercase tracking-widest">Kontak</h4>
                        <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-3 font-semibold">
                            <li>People Development</li>
                            <li><a href="#" className="hover:text-[#FF2D20] transition-colors">pd@company.com</a></li>
                        </ul>
                        <div className="flex items-center gap-4 mt-4">
                            <a href="#" className="text-gray-400 hover:text-[#FF2D20] transition-colors"><Github className="size-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-[#FF2D20] transition-colors"><Users className="size-5" /></a>
                        </div>
                    </div>
                </div>
                
                <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-100 dark:border-[#18181b] flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-gray-400 font-bold">
                        &copy; {new Date().getFullYear()} Modul PD. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8 text-xs text-gray-400 font-bold">
                        <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Kebijakan Privasi</a>
                        <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Syarat & Ketentuan</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}