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
    RefreshCw,
    BookOpen,
    Clock,
    Plus,
    Eye,
    ArrowUpRight,
    Loader2,
    Bell
} from 'lucide-react';

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
        }, 1500);

        return () => {
            clearTimeout(timer);
            clearInterval(textInterval);
        };
    }, []);

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="min-h-screen bg-[#F8FBFF] text-[#0F172A] dark:bg-[#09090b] dark:text-[#f4f4f5] font-sans transition-colors duration-300 selection:bg-blue-600 selection:text-white">
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 1 }}
                        exit={{ 
                            opacity: 0,
                            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
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
                                className="relative mb-6"
                            >
                                <div className="absolute inset-0 bg-blue-600/20 rounded-2xl blur-xl filter animate-pulse" />
                                
                                <motion.div 
                                    className="relative size-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-2xl shadow-blue-600/30"
                                    animate={{
                                        y: [0, -6, 0]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2,
                                        ease: "easeInOut"
                                    }}
                                >
                                    T
                                </motion.div>
                            </motion.div>

                            {/* Text labels */}
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-1"
                            >
                                TrainingPD
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
                                        duration: 1.3,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute inset-y-0 w-full bg-blue-600 rounded-full"
                                />
                            </div>

                            {/* Loading state message */}
                            <motion.span
                                key={loadingText}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="text-xs font-semibold text-neutral-400 dark:text-neutral-500"
                            >
                                {loadingText}
                            </motion.span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Head title="TrainingPD - Kelola Modul Pelatihan dengan Lebih Mudah" />

            {/* Blue Sky Gradient Background Wrapper for Hero section */}
            <div className="relative overflow-hidden bg-gradient-to-b from-[#0865F2] via-[#3A8DFF] to-[#F8FBFF] dark:from-[#0b2b63] dark:via-[#133c7d] dark:to-[#09090b] pb-24">
                
                {/* Header Navbar */}
                <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
                    isScrolled 
                        ? 'bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50 py-3 shadow-sm' 
                        : 'bg-transparent py-5'
                }`}>
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="size-8.5 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition-transform">
                                T
                            </div>
                            <span className={`font-extrabold text-xl tracking-tight transition-colors ${
                                isScrolled ? 'text-neutral-900 dark:text-white' : 'text-white'
                            }`}>
                                TrainingPD
                            </span>
                        </Link>
                        
                        <nav className={`hidden lg:flex items-center gap-8 text-xs font-bold transition-colors ${
                            isScrolled ? 'text-neutral-600 dark:text-neutral-300' : 'text-white/95'
                        }`}>
                            <a href="#produk" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Produk</a>
                            <a href="#solusi" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Solusi</a>
                            <a href="#fitur" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Fitur</a>
                            <a href="#alur-kerja" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Alur Kerja</a>
                            <a href="#faq" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">FAQ</a>
                        </nav>

                        <div className="flex items-center gap-4">
                            <button onClick={toggleTheme} className={`p-2 transition-colors ${
                                isScrolled ? 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white' : 'text-white/80 hover:text-white'
                            }`}>
                                {appearance === 'dark' ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
                            </button>

                            <div className={`h-5 w-px ${isScrolled ? 'bg-neutral-200 dark:bg-neutral-800' : 'bg-white/20'} hidden sm:block`}></div>

                            {auth.user ? (
                                <Link 
                                    href={route('dashboard')} 
                                    className={`px-4.5 py-2 text-xs font-bold rounded-lg transition-all shadow-sm ${
                                        isScrolled 
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                            : 'bg-white hover:bg-neutral-100 text-blue-600'
                                    }`}
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link 
                                        href={route('login')} 
                                        className={`text-xs font-bold hover:underline transition-colors ${
                                            isScrolled ? 'text-neutral-700 dark:text-neutral-300' : 'text-white hover:text-neutral-100'
                                        }`}
                                    >
                                        Masuk
                                    </Link>
                                    <a 
                                        href="#faq"
                                        className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                                            isScrolled 
                                                ? 'border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400' 
                                                : 'border-white/40 text-white hover:bg-white/10'
                                        }`}
                                    >
                                        Jadwalkan Demo
                                    </a>
                                </div>
                            )}
                            
                            <button 
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                                className={`lg:hidden p-2 transition-colors ${
                                    isScrolled ? 'text-neutral-600 dark:text-neutral-400' : 'text-white'
                                }`}
                            >
                                {isMobileMenuOpen ? <X className="size-5.5" /> : <Menu className="size-5.5" />}
                            </button>
                        </div>
                    </div>
                    
                    {/* Mobile Navigation Menu */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="lg:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] px-6 py-4 flex flex-col gap-3.5 overflow-hidden"
                            >
                                <a href="#produk" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-xs hover:text-blue-600 transition-colors">Produk</a>
                                <a href="#solusi" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-xs hover:text-blue-600 transition-colors">Solusi</a>
                                <a href="#fitur" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-xs hover:text-blue-600 transition-colors">Fitur</a>
                                <a href="#alur-kerja" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-xs hover:text-blue-600 transition-colors">Alur Kerja</a>
                                <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-xs hover:text-blue-600 transition-colors">FAQ</a>
                                <hr className="border-neutral-100 dark:border-neutral-800" />
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="h-9 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">Dashboard</Link>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <Link href={route('login')} className="h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 font-bold text-xs flex items-center justify-center">Masuk</Link>
                                        <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="h-9 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">Jadwalkan Demo</a>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>

                {/* Hero Content Section */}
                <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-36 pb-12 flex flex-col items-center text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl"
                    >
                        <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-white leading-tight mb-6">
                            Kelola Modul Pelatihan dengan Lebih Mudah
                        </h1>
                        
                        <p className="text-sm sm:text-base text-blue-50/90 dark:text-neutral-300 leading-relaxed mb-8 max-w-2xl mx-auto font-medium">
                            Platform terpusat untuk pengajuan modul, approval, revisi, penyimpanan file, dan matriks pelatihan dalam satu alur kerja yang rapi.
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-center gap-4.5 mb-16">
                            <Link 
                                href={auth.user ? route('dashboard') : route('register')}
                                className="px-6 py-3 bg-[#020617] hover:bg-[#0f172a] text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-black/10 hover:scale-[1.02] flex items-center gap-2"
                            >
                                {auth.user ? 'Buka Dashboard' : 'Mulai Sekarang'}
                                <ArrowRight className="size-4" />
                            </Link>
                            <a 
                                href="#fitur" 
                                className="text-white hover:text-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                                Lihat Demo
                                <span className="text-sm">→</span>
                            </a>
                        </div>
                    </motion.div>

                    {/* Browser Dashboard Mockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full max-w-5xl rounded-2xl border border-white/20 shadow-2xl bg-white dark:bg-neutral-950 overflow-hidden relative"
                    >
                        {/* Browser Top Frame */}
                        <div className="flex items-center justify-between px-4 py-3 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200/50 dark:border-neutral-800/50">
                            <div className="flex items-center gap-1.5">
                                <div className="size-3 rounded-full bg-red-400" />
                                <div className="size-3 rounded-full bg-yellow-400" />
                                <div className="size-3 rounded-full bg-green-400" />
                            </div>
                            <div className="flex-1 max-w-xs mx-auto">
                                <div className="bg-white dark:bg-neutral-950 rounded-md py-1 px-3 text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold border border-neutral-200/50 dark:border-neutral-800/30 truncate">
                                    trainingpd.app
                                </div>
                            </div>
                            <div className="w-12" />
                        </div>

                        {/* Interactive dashboard preview component inside */}
                        <div className="p-1 sm:p-2 bg-white dark:bg-neutral-950">
                            <InteractiveDashboardPreview
                                activeView={heroDashboardView}
                                onViewChange={setHeroDashboardView}
                                variant="hero"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* About / Operational Section */}
            <section className="py-20 lg:py-24 bg-white dark:bg-[#09090b]" id="produk">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest block mb-2">TENTANG KAMI</span>
                        <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                            Operasional Modul yang Lebih Efisien
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Col 1 */}
                        <div className="flex flex-col items-center text-center p-6 bg-[#F8FBFF] dark:bg-neutral-900/40 rounded-2xl border border-neutral-100 dark:border-neutral-800/40">
                            <div className="size-14 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <RefreshCw className="size-6.5" />
                            </div>
                            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-3">Manajemen Siklus Modul</h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-xs">
                                Membuat, revisi, dan mengelola modul pelatihan dalam satu tempat yang terpusat.
                            </p>
                        </div>

                        {/* Col 2 */}
                        <div className="flex flex-col items-center text-center p-6 bg-[#F8FBFF] dark:bg-neutral-900/40 rounded-2xl border border-neutral-100 dark:border-neutral-800/40">
                            <div className="size-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <FileText className="size-6.5" />
                            </div>
                            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-3">Tracking & Validasi Dokumen</h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-xs">
                                Upload, pengecekan, dan validasi file dokumen secara cepat dan akurat.
                            </p>
                        </div>

                        {/* Col 3 */}
                        <div className="flex flex-col items-center text-center p-6 bg-[#F8FBFF] dark:bg-neutral-900/40 rounded-2xl border border-neutral-100 dark:border-neutral-800/40">
                            <div className="size-14 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <Bell className="size-6.5" />
                            </div>
                            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-3">Notifikasi & Approval Cerdas</h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-xs">
                                Pengingat otomatis dan approval real-time untuk mempercepat proses persetujuan.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Features Grid Section */}
            <section className="py-20 lg:py-24 bg-[#F8FBFF] dark:bg-neutral-950/30 border-y border-neutral-200/30 dark:border-neutral-900/30" id="fitur">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest block mb-2">FITUR UTAMA</span>
                        <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-4">
                            Semua yang Dibutuhkan untuk Mengelola Modul dengan Lebih Cerdas
                        </h2>
                        <p className="text-xs sm:text-sm text-neutral-550 dark:text-neutral-400 max-w-xl mx-auto font-medium">
                            Kelola modul, dokumen, matriks pelatihan, hingga revisi dalam satu platform terintegrasi.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Card 01 - Kepatuhan Dokumen */}
                        <div className="p-8 rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 flex flex-col justify-between shadow-sm">
                            <div className="mb-6">
                                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-500 font-mono">01</span>
                                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mt-1 mb-2">Kepatuhan Dokumen</h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                                    Pantau status dokumen, validasi file, dan kelengkapan modul dalam satu tampilan.
                                </p>
                            </div>
                            {/* Inner Widget Visual */}
                            <div className="bg-[#F8FBFF] dark:bg-neutral-950/50 rounded-2xl border border-neutral-100 dark:border-neutral-800/50 p-4">
                                <div className="flex items-center justify-between mb-3 text-[10px] font-bold">
                                    <span className="text-neutral-900 dark:text-white">Dokumen Compliance</span>
                                    <span className="text-blue-600 dark:text-blue-400">Detail</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-semibold mb-4">
                                    <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 p-2 rounded-lg">
                                        <div>65%</div>
                                        <div className="text-[7px] text-neutral-400 mt-0.5">Valid</div>
                                    </div>
                                    <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 p-2 rounded-lg">
                                        <div>82%</div>
                                        <div className="text-[7px] text-neutral-400 mt-0.5">Review</div>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-950/20 text-red-600 p-2 rounded-lg">
                                        <div>22%</div>
                                        <div className="text-[7px] text-neutral-400 mt-0.5">Expired</div>
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-[8px] font-semibold text-neutral-500 dark:text-neutral-400">
                                    <div className="flex justify-between">
                                        <span>• Valid</span>
                                        <span className="font-extrabold text-neutral-800 dark:text-neutral-200">65</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>• Pending Review</span>
                                        <span className="font-extrabold text-neutral-800 dark:text-neutral-200">48</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>• Expired</span>
                                        <span className="font-extrabold text-neutral-800 dark:text-neutral-200">15</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 02 - Penyimpanan File */}
                        <div className="p-8 rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 flex flex-col justify-between shadow-sm">
                            <div className="mb-6">
                                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-500 font-mono">02</span>
                                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mt-1 mb-2">Penyimpanan File</h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                                    Lihat kapasitas penyimpanan, kategori dokumen, dan akses file secara terstruktur.
                                </p>
                            </div>
                            {/* Inner Widget Visual */}
                            <div className="bg-[#F8FBFF] dark:bg-neutral-950/50 rounded-2xl border border-neutral-100 dark:border-neutral-800/50 p-4 flex gap-4 items-center">
                                <div className="size-20 shrink-0 border-[6px] border-blue-600 border-t-neutral-200 rounded-full flex flex-col items-center justify-center text-[10px] font-black">
                                    <span>1.24 GB</span>
                                    <span className="text-[6px] text-neutral-400 font-bold uppercase tracking-wider">Terpakai</span>
                                </div>
                                <div className="flex-1 space-y-1.5 text-[8px] font-bold text-neutral-500 dark:text-neutral-400">
                                    <div className="flex justify-between">
                                        <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-blue-600" /> Modul</span>
                                        <span>55%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-500" /> Dokumen</span>
                                        <span>25%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-orange-500" /> Laporan</span>
                                        <span>15%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-neutral-400" /> Lainnya</span>
                                        <span>5%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 03 - Matriks Pelatihan */}
                        <div className="p-8 rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 flex flex-col justify-between shadow-sm">
                            <div className="mb-6">
                                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-500 font-mono">03</span>
                                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mt-1 mb-2">Matriks Pelatihan</h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                                    Petakan kebutuhan pelatihan dan hubungan antar modul dengan rapi.
                                </p>
                            </div>
                            {/* Inner Widget Visual */}
                            <div className="bg-[#F8FBFF] dark:bg-neutral-950/50 rounded-2xl border border-neutral-100 dark:border-neutral-800/50 p-3 overflow-hidden">
                                <table className="w-full text-center text-[7px] border-collapse font-semibold text-neutral-500 dark:text-neutral-400">
                                    <thead>
                                        <tr className="border-b border-neutral-200/50 dark:border-neutral-800/50 pb-1.5">
                                            <th className="text-left font-bold py-1">Matriks Pelatihan</th>
                                            <th>Modul A</th>
                                            <th>Modul B</th>
                                            <th>Modul C</th>
                                            <th>Modul D</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200/30 dark:divide-neutral-800/30">
                                        <tr>
                                            <td className="text-left font-bold py-1 text-neutral-700 dark:text-neutral-300">Tim Admin</td>
                                            <td className="text-blue-600 font-extrabold">●</td>
                                            <td className="text-emerald-500 font-extrabold">●</td>
                                            <td className="text-neutral-300">○</td>
                                            <td className="text-blue-600 font-extrabold">●</td>
                                        </tr>
                                        <tr>
                                            <td className="text-left font-bold py-1 text-neutral-700 dark:text-neutral-300">Tim Operasional</td>
                                            <td className="text-blue-600 font-extrabold">●</td>
                                            <td className="text-neutral-300">○</td>
                                            <td className="text-blue-600 font-extrabold">●</td>
                                            <td className="text-neutral-300">○</td>
                                        </tr>
                                        <tr>
                                            <td className="text-left font-bold py-1 text-neutral-700 dark:text-neutral-300">Tim Quality</td>
                                            <td className="text-[#8B5CF6] font-extrabold">●</td>
                                            <td className="text-blue-600 font-extrabold">●</td>
                                            <td className="text-[#8B5CF6] font-extrabold">●</td>
                                            <td className="text-emerald-500 font-extrabold">●</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Card 04 - Riwayat Revisi */}
                        <div className="p-8 rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 flex flex-col justify-between shadow-sm">
                            <div className="mb-6">
                                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-500 font-mono">04</span>
                                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mt-1 mb-2">Riwayat Revisi</h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                                    Lacak perubahan modul, versi file, dan histori approval dengan mudah.
                                </p>
                            </div>
                            {/* Inner Widget Visual */}
                            <div className="bg-[#F8FBFF] dark:bg-neutral-950/50 rounded-2xl border border-neutral-100 dark:border-neutral-800/50 p-3.5 space-y-2.5 text-[8px] font-semibold">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-blue-50 text-blue-600 px-1 py-0.2 rounded font-bold text-[7px]">v2.0</span>
                                        <span className="text-neutral-800 dark:text-neutral-200">Perubahan konten Bab 3</span>
                                    </div>
                                    <span className="text-neutral-400 font-medium">Admin</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-purple-50 text-purple-600 px-1 py-0.2 rounded font-bold text-[7px]">v1.2</span>
                                        <span className="text-neutral-800 dark:text-neutral-200">Perbaikan format tabel</span>
                                    </div>
                                    <span className="text-neutral-400 font-medium">Tim PD</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-neutral-100 text-neutral-600 px-1 py-0.2 rounded font-bold text-[7px]">v1.1</span>
                                        <span className="text-neutral-800 dark:text-neutral-200">Update referensi dokumen</span>
                                    </div>
                                    <span className="text-neutral-400 font-medium">Tim Training</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Flow / CTA Section (Orbit Layout) */}
            <section className="py-24 bg-gradient-to-b from-[#EBF3FF] to-white dark:from-[#0d2140] dark:to-[#09090b] relative overflow-hidden" id="alur-kerja">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left Hand: Floating Visual widgets */}
                    <div className="lg:col-span-6 order-2 lg:order-1 relative h-[360px] max-w-md mx-auto w-full">
                        {/* Center decorative ring background */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="size-64 sm:size-80 rounded-full border border-dashed border-blue-500/20 dark:border-blue-400/10 animate-spin-slow" />
                        </div>

                        {/* Floating Card 1: Dokumen Modul */}
                        <div className="absolute top-8 left-0 sm:left-4 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-2xl p-4 shadow-lg w-44 hover:-translate-y-1 transition-transform">
                            <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                                <FileText className="size-4 shrink-0" />
                                <span className="font-extrabold text-[9px]">Dokumen Modul</span>
                            </div>
                            <div className="text-neutral-800 dark:text-neutral-200 text-xs font-bold mb-1">42 File</div>
                            <div className="text-neutral-400 text-[8px] font-semibold">Lihat Detail →</div>
                        </div>

                        {/* Floating Card 2: Reminder Revisi */}
                        <div className="absolute top-20 right-0 sm:right-4 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-2xl p-4 shadow-lg w-48 hover:-translate-y-1 transition-transform">
                            <div className="flex items-center gap-2 mb-2 text-orange-600 dark:text-orange-400">
                                <Clock className="size-4 shrink-0" />
                                <span className="font-extrabold text-[9px]">Reminder Revisi</span>
                            </div>
                            <div className="text-neutral-800 dark:text-neutral-200 text-[10px] font-bold mb-1 leading-snug">3 revisi menunggu tindakan</div>
                            <div className="text-neutral-400 text-[8px] font-semibold">Lihat Semua →</div>
                        </div>

                        {/* Floating Card 3: Review Performa */}
                        <div className="absolute bottom-12 left-2 sm:left-8 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-2xl p-4 shadow-lg w-52 hover:-translate-y-1 transition-transform">
                            <div className="flex items-center justify-between mb-2 text-neutral-900 dark:text-white">
                                <span className="font-extrabold text-[9px]">Review Performa</span>
                                <span className="bg-emerald-50 text-emerald-600 px-1 py-0.2 rounded text-[7px] font-bold">Admin</span>
                            </div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="size-5 rounded-full bg-blue-100 flex items-center justify-center text-[7px] font-bold text-blue-600">OP</div>
                                <span className="text-[8px] font-semibold text-neutral-700 dark:text-neutral-300">Olivia J. - Need Renewal</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="size-5 rounded-full bg-purple-100 flex items-center justify-center text-[7px] font-bold text-purple-600">MS</div>
                                <span className="text-[8px] font-semibold text-neutral-700 dark:text-neutral-300">Michael S. - Approved</span>
                            </div>
                        </div>

                        {/* Floating Card 4: Status Approval */}
                        <div className="absolute bottom-6 right-2 sm:right-8 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-2xl p-4 shadow-lg w-44 hover:-translate-y-1 transition-transform">
                            <div className="flex items-center gap-1.5 mb-2 text-emerald-500">
                                <CheckCircle2 className="size-4 shrink-0" />
                                <span className="font-extrabold text-[9px]">Status Approval</span>
                            </div>
                            <div className="text-neutral-800 dark:text-neutral-200 text-xs font-bold mb-1">98% Approved</div>
                            <div className="text-neutral-400 text-[8px] font-semibold">Lihat Detail →</div>
                        </div>
                    </div>

                    {/* Right Hand: Flow description and CTA text */}
                    <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col justify-center text-center lg:text-left">
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight mb-4">
                            Kendalikan Alur Modul Pelatihan dengan Lebih Mudah
                        </h2>
                        
                        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 font-medium">
                            Automasi proses review, approval, dan pengingat revisi agar tidak ada yang terlewat dan semua pihak selalu selaras.
                        </p>
                        
                        <div>
                            <Link 
                                href={auth.user ? route('dashboard') : route('register')}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 inline-flex items-center gap-2 hover:scale-[1.02]"
                            >
                                Mulai Sekarang
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section ("Tentang Fitur" / "Operasional Modul yang Lebih Efisien") */}
            <section className="py-20 lg:py-24 bg-white dark:bg-[#09090b]" id="solusi">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest block mb-2">TENTANG FITUR</span>
                        <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                            Operasional Modul yang Lebih Efisien
                        </h2>
                    </div>

                    {/* Benefit White Card Container */}
                    <div className="rounded-3xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x md:divide-neutral-200/60 dark:md:divide-neutral-850">
                            
                            {/* Column 1 */}
                            <div className="flex flex-col items-center md:items-start text-center md:text-left md:px-6 first:pl-0">
                                <div className="size-10 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 shrink-0 shadow-sm">
                                    <BookOpen className="size-5" />
                                </div>
                                <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">Manajemen Siklus Modul</h4>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                                    Buat, revisi, dan kelola modul pelatihan dalam satu alur kerja yang praktis.
                                </p>
                            </div>

                            {/* Column 2 */}
                            <div className="flex flex-col items-center md:items-start text-center md:text-left md:px-6">
                                <div className="size-10 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4 shrink-0 shadow-sm">
                                    <ShieldCheck className="size-5" />
                                </div>
                                <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">Tracking & Validasi Dokumen</h4>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                                    Upload, cek kelengkapan, dan verifikasi dokumen tanpa proses manual yang rumit.
                                </p>
                            </div>

                            {/* Column 3 */}
                            <div className="flex flex-col items-center md:items-start text-center md:text-left md:px-6">
                                <div className="size-10 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mb-4 shrink-0 shadow-sm">
                                    <Bell className="size-5" />
                                </div>
                                <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">Notifikasi & Approval Cerdas</h4>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                                    Dapatkan pengingat otomatis, status real-time, dan persetujuan yang lebih cepat.
                                </p>
                            </div>

                        </div>

                        {/* Progress Timeline Graphic below columns */}
                        <div className="mt-10 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[9px] font-bold text-neutral-400 select-none">
                            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-extrabold">
                                <span className="size-2 bg-blue-600 rounded-full ring-4 ring-blue-50 dark:ring-blue-900/30" />
                                Pengajuan
                            </span>
                            <div className="flex-1 h-0.5 border-t border-dashed border-neutral-200 dark:border-neutral-800 mx-3" />
                            <span className="flex items-center gap-1.5">
                                <span className="size-2 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
                                Review PD
                            </span>
                            <div className="flex-1 h-0.5 border-t border-dashed border-neutral-200 dark:border-neutral-800 mx-3" />
                            <span className="flex items-center gap-1.5">
                                <span className="size-2 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
                                Approval Manager
                            </span>
                            <div className="flex-1 h-0.5 border-t border-dashed border-neutral-200 dark:border-neutral-800 mx-3" />
                            <span className="flex items-center gap-1.5">
                                <span className="size-2 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
                                Publikasi
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Card Section */}
            <section className="py-16 bg-white dark:bg-[#09090b]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 rounded-3xl p-8 lg:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                        <div className="max-w-2xl">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
                                Siap Menyederhanakan Pengelolaan Modul?
                            </h2>
                            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-medium">
                                Bergabunglah dengan tim yang sudah meningkatkan produktivitas pelatihan mereka bersama TrainingPD.
                            </p>
                        </div>
                        <div className="shrink-0">
                            <a 
                                href="#faq"
                                className="px-6 py-3.5 bg-[#020617] hover:bg-[#0f172a] text-white text-xs font-bold rounded-xl transition-all shadow-md hover:scale-[1.02]"
                            >
                                Ajukan Demo
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Accordion Section (as fallback for Demo/FAQ requests) */}
            <section className="py-20 lg:py-24 bg-[#F8FBFF] dark:bg-neutral-950/30 border-t border-neutral-200/30 dark:border-neutral-900/30" id="faq">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest block mb-2">FAQ</span>
                        <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-4">
                            Pertanyaan yang Sering Diajukan
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: "Apa itu TrainingPD?", a: "TrainingPD adalah platform terintegrasi berbasis SaaS untuk mengelola modul pelatihan, memetakan kurikulum kompetensi (matriks pelatihan), meninjau pengajuan draf/revisi modul, serta mengarsipkan dokumen." },
                            { q: "Bagaimana integrasi Google Drive bekerja?", a: "Sistem secara otomatis menghubungkan akun Google Drive Anda. Setiap file modul PDF yang diunggah saat pengajuan akan disimpan di folder Drive pilihan Anda tanpa membebani penyimpanan proyek server lokal." },
                            { q: "Siapa saja yang bisa menggunakan portal ini?", a: "Portal ini dirancang dengan kontrol akses berbasis peran (RBAC) untuk 5 role utama: Admin (kelola sistem & user), Staf PD (ajukan modul & draf), Manager PD (approval & riwayat), Tim Training (akses database & matriks), dan User biasa (pengajuan kebutuhan khusus)." },
                            { q: "Bagaimana cara melakukan revisi modul?", a: "Buka menu tindakan di baris modul pada database, pilih 'Buat Revisi', isi catatan perubahan, dan unggah file PDF revisi yang baru. Sistem akan otomatis melacak riwayat revisi dan menaikkan versinya." }
                        ].map((faq, i) => (
                            <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 p-5 shadow-sm">
                                <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">{faq.q}</h4>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-[#09090b] border-t border-neutral-200/30 dark:border-neutral-900/30 py-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
                    <div className="col-span-1">
                        <Link href="/" className="flex items-center justify-center md:justify-start gap-2.5 mb-5 group">
                            <div className="size-7.5 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                T
                            </div>
                            <span className="font-extrabold text-lg tracking-tight text-neutral-900 dark:text-white">
                                TrainingPD
                            </span>
                        </Link>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-xs mx-auto md:mx-0">
                            Platform terintegrasi untuk mengelola modul pelatihan, approval, revisi, dan penyimpanan dokumen perusahaan.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="font-extrabold text-xs uppercase tracking-widest text-neutral-900 dark:text-white">Produk</h4>
                        <ul className="text-xs text-neutral-500 dark:text-neutral-400 space-y-3 font-semibold">
                            <li><a href="#fitur" className="hover:text-blue-600 transition-colors">Pengajuan Modul</a></li>
                            <li><a href="#alur-kerja" className="hover:text-blue-600 transition-colors">Approval & Review</a></li>
                            <li><a href="#fitur" className="hover:text-blue-600 transition-colors">Database Modul</a></li>
                            <li><a href="#fitur" className="hover:text-blue-600 transition-colors">Matriks Pelatihan</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-extrabold text-xs uppercase tracking-widest text-neutral-900 dark:text-white">Solusi</h4>
                        <ul className="text-xs text-neutral-500 dark:text-neutral-400 space-y-3 font-semibold">
                            <li><a href="#solusi" className="hover:text-blue-600 transition-colors">Google Drive Integrasi</a></li>
                            <li><a href="#solusi" className="hover:text-blue-600 transition-colors">Kepatuhan Dokumen</a></li>
                            <li><a href="#solusi" className="hover:text-blue-600 transition-colors">Audit & Aktivitas</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-extrabold text-xs uppercase tracking-widest text-neutral-900 dark:text-white">Hubungi Kami</h4>
                        <ul className="text-xs text-neutral-500 dark:text-neutral-400 space-y-3 font-semibold">
                            <li>People Development Department</li>
                            <li><a href="mailto:pd@trainingpd.com" className="hover:text-blue-600 transition-colors">pd@trainingpd.com</a></li>
                        </ul>
                        <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                            <a href="https://github.com" target="_blank" className="text-neutral-400 hover:text-blue-600 transition-colors"><Github className="size-4.5" /></a>
                            <a href="#faq" className="text-neutral-400 hover:text-blue-600 transition-colors"><Users className="size-4.5" /></a>
                        </div>
                    </div>
                </div>
                
                <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-16 pt-8 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-6 text-center">
                    <p className="text-[10px] text-neutral-400 font-bold">
                        &copy; 2026 TrainingPD. Semua hak dilindungi.
                    </p>
                    <div className="flex items-center gap-6 text-[10px] text-neutral-400 font-bold">
                        <a href="#faq" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Kebijakan Privasi</a>
                        <a href="#faq" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Syarat & Ketentuan</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}