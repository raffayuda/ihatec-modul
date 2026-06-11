import { type SharedData } from '@/types';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
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
    ArrowRight,
    Github,
    Database,
    FileText,
    UploadCloud,
    Server,
    BarChart3,
    RefreshCw,
    BookOpen,
    Plus,
    Eye,
    ArrowUpRight,
    Loader2,
    Bell,
    Mail,
    Lock,
    User,
    EyeOff
} from 'lucide-react';
import { MotionThemeToggle } from '@/components/motion-theme-toggle';
import { TrainingFlowBeam } from '@/components/training-flow-beam';
import { AtmosphericBackground } from '@/components/atmospheric-background';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const { appearance, updateAppearance } = useAppearance();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [heroDashboardView, setHeroDashboardView] = useState<DashboardView>('overview');
    const [processDashboardView, setProcessDashboardView] = useState<DashboardView>('pengajuan');
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

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
                <AtmosphericBackground />
                
                {/* Header Navbar */}
                <header className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
                    isScrolled 
                        ? 'top-4 w-[calc(100%-2rem)] lg:w-[calc(100%-4rem)] max-w-7xl bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-xl border border-white/20 dark:border-neutral-800/50 rounded-2xl py-2.5 shadow-lg shadow-black/5 dark:shadow-black/20' 
                        : 'top-0 w-full bg-transparent py-5 border-b border-transparent'
                }`}>
                    <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
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
                        </nav>

                        <div className="flex items-center gap-4">
                            <MotionThemeToggle variant="diamond" className="size-9" />

                            <div className={`h-5 w-px ${isScrolled ? 'bg-neutral-200 dark:bg-neutral-800' : 'bg-white/20'} hidden sm:block`}></div>

                            {auth?.user ? (
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
                                    <button 
                                        onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
                                        className={`text-xs font-bold hover:underline transition-colors cursor-pointer ${
                                            isScrolled ? 'text-neutral-700 dark:text-neutral-300' : 'text-white hover:text-neutral-100'
                                        }`}
                                    >
                                        Masuk
                                    </button>
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
                                <hr className="border-neutral-100 dark:border-neutral-800" />
                                {auth?.user ? (
                                    <Link href={route('dashboard')} className="h-9 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">Dashboard</Link>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                                            className="h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 font-bold text-xs flex items-center justify-center cursor-pointer"
                                        >
                                            Masuk
                                        </button>
                                        <button 
                                            onClick={() => { setAuthModalMode('register'); setAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                                            className="h-9 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                                        >
                                            Jadwalkan Demo
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>

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
                            <button 
                                onClick={() => { setAuthModalMode('register'); setAuthModalOpen(true); }}
                                className="px-6 py-3 bg-[#020617] hover:bg-[#0f172a] text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-black/10 hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
                            >
                                Mulai Sekarang
                                <ArrowRight className="size-4" />
                            </button>
                            <a 
                                href="#fitur" 
                                className="text-white hover:text-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                                Lihat Demo
                                <span className="text-sm">→</span>
                            </a>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full max-w-5xl rounded-2xl border border-white/20 shadow-2xl bg-white dark:bg-neutral-950 overflow-hidden relative"
                    >
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

            <section className="py-24 bg-[#FAF9F6]/30 dark:bg-[#09090b] relative overflow-hidden" id="produk">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_40%)]" />
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest block mb-2"
                        >
                            TENTANG KAMI
                        </motion.span>
                        <motion.h2 
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white"
                        >
                            Operasional Modul yang Lebih Efisien
                        </motion.h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div 
                            whileHover={{ y: -8, scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="flex flex-col items-center text-center p-8 bg-white/50 dark:bg-neutral-900/35 backdrop-blur-md rounded-3xl border border-neutral-200/50 dark:border-neutral-850/50 shadow-xs hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 group"
                        >
                            <div className="size-16 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                                <RefreshCw className="size-7 animate-[spin_20s_linear_infinite]" />
                            </div>
                            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-3">Manajemen Siklus Modul</h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-xs">
                                Buat, tinjau, revisi, dan terbitkan modul pelatihan terpusat dalam satu alur kerja yang seragam.
                            </p>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -8, scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="flex flex-col items-center text-center p-8 bg-white/50 dark:bg-neutral-900/35 backdrop-blur-md rounded-3xl border border-neutral-200/50 dark:border-neutral-850/50 shadow-xs hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 group"
                        >
                            <div className="size-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                                <FileText className="size-7" />
                            </div>
                            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-3">Tracking & Validasi Dokumen</h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-xs">
                                Validasi otomatis format file PDF untuk memastikan kelayakan draf modul sebelum diajukan.
                            </p>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -8, scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="flex flex-col items-center text-center p-8 bg-white/50 dark:bg-neutral-900/35 backdrop-blur-md rounded-3xl border border-neutral-200/50 dark:border-neutral-850/50 shadow-xs hover:shadow-xl hover:border-orange-500/30 transition-all duration-300 group"
                        >
                            <div className="size-16 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                                <Bell className="size-7" />
                            </div>
                            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-3">Notifikasi & Approval Cerdas</h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-xs">
                                Dapatkan pengingat otomatis dan approval real-time demi siklus validasi draf yang lebih responsif.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-[#F8FBFF]/60 dark:bg-neutral-950/20 border-y border-neutral-200/30 dark:border-neutral-900/30 relative" id="fitur">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.02),transparent_40%)]" />
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest block mb-2">FITUR UTAMA</span>
                        <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-4">
                            Semua yang Dibutuhkan untuk Mengelola Modul dengan Lebih Cerdas
                        </h2>
                        <p className="text-xs sm:text-sm text-neutral-550 dark:text-neutral-400 max-w-xl mx-auto font-medium">
                            Kelola modul, dokumen, matriks pelatihan, hingga revisi dalam satu platform terintegrasi.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <motion.div 
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="lg:col-span-7 p-8 rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900/80 backdrop-blur-xs flex flex-col justify-between shadow-xs hover:shadow-xl hover:border-blue-500/20 transition-all duration-300 group"
                        >
                            <div className="mb-8">
                                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-500 font-mono tracking-wider block mb-1">01 / ANALITIK</span>
                                <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white mb-2">Kepatuhan Dokumen</h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-md">
                                    Pantau status kepatuhan, keaktifan draf, validasi berkas, dan modul kedaluwarsa secara visual.
                                </p>
                            </div>
                            <div className="bg-[#F8FBFF]/60 dark:bg-neutral-950/50 rounded-2xl border border-neutral-100 dark:border-neutral-800/50 p-5 group-hover:scale-[1.01] transition-transform duration-300">
                                <div className="flex items-center justify-between mb-4 text-[10px] font-bold">
                                    <span className="text-neutral-900 dark:text-white tracking-tight">Dokumen Compliance</span>
                                    <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">Detail Analitik</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-center text-[9px] font-bold mb-5">
                                    <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
                                        <div className="text-xs font-black">65%</div>
                                        <div className="text-[7px] text-neutral-400 dark:text-neutral-500 mt-0.5 uppercase tracking-wider">Valid</div>
                                    </div>
                                    <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-2.5 rounded-xl border border-amber-500/20">
                                        <div className="text-xs font-black">82%</div>
                                        <div className="text-[7px] text-neutral-400 dark:text-neutral-500 mt-0.5 uppercase tracking-wider">Review</div>
                                    </div>
                                    <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 p-2.5 rounded-xl border border-rose-500/20">
                                        <div className="text-xs font-black">22%</div>
                                        <div className="text-[7px] text-neutral-400 dark:text-neutral-500 mt-0.5 uppercase tracking-wider">Expired</div>
                                    </div>
                                </div>
                                <div className="space-y-2 text-[9px] font-semibold text-neutral-555 dark:text-neutral-400">
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" /> Modul Aktif & Valid</span>
                                        <span className="font-extrabold text-neutral-900 dark:text-white">65 Modul</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500" /> Modul Dalam Review</span>
                                        <span className="font-extrabold text-neutral-900 dark:text-white">48 Modul</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-rose-500" /> Modul Expired</span>
                                        <span className="font-extrabold text-neutral-900 dark:text-white">15 Modul</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="lg:col-span-5 p-8 rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900/80 backdrop-blur-xs flex flex-col justify-between shadow-xs hover:shadow-xl hover:border-blue-500/20 transition-all duration-300 group"
                        >
                            <div className="mb-8">
                                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-500 font-mono tracking-wider block mb-1">02 / INFRASTRUKTUR</span>
                                <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white mb-2">Penyimpanan Cloud</h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                                    Visualisasikan kapasitas penyimpanan terpakai secara cloud untuk semua berkas.
                                </p>
                            </div>
                            <div className="bg-[#F8FBFF]/60 dark:bg-neutral-950/50 rounded-2xl border border-neutral-100 dark:border-neutral-800/50 p-5 flex flex-col sm:flex-row gap-5 items-center group-hover:scale-[1.01] transition-transform duration-300">
                                <div className="size-24 shrink-0 border-[8px] border-blue-600 border-t-neutral-200 dark:border-t-neutral-800 rounded-full flex flex-col items-center justify-center text-[11px] font-black shadow-lg shadow-blue-500/10">
                                    <span className="text-blue-600 dark:text-blue-400">1.24 GB</span>
                                    <span className="text-[6px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">Terpakai</span>
                                </div>
                                <div className="flex-1 w-full space-y-2 text-[9px] font-bold text-neutral-500 dark:text-neutral-400">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-blue-600" /> Modul Utama</span>
                                            <span>55%</span>
                                        </div>
                                        <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600 rounded-full" style={{ width: '55%' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-500" /> Lampiran & PDF</span>
                                            <span>25%</span>
                                        </div>
                                        <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '25%' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-orange-500" /> Log Laporan</span>
                                            <span>15%</span>
                                        </div>
                                        <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-500 rounded-full" style={{ width: '15%' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="lg:col-span-5 p-8 rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900/80 backdrop-blur-xs flex flex-col justify-between shadow-xs hover:shadow-xl hover:border-blue-500/20 transition-all duration-300 group"
                        >
                            <div className="mb-8">
                                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-500 font-mono tracking-wider block mb-1">03 / KOLABORASI</span>
                                <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white mb-2">Matriks Kompetensi</h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                                    Petakan kurikulum pelatihan dan ketergantungan antar modul departemen.
                                </p>
                            </div>
                            <div className="bg-[#F8FBFF]/60 dark:bg-neutral-950/50 rounded-2xl border border-neutral-100 dark:border-neutral-800/50 p-4 overflow-hidden group-hover:scale-[1.01] transition-transform duration-300">
                                <table className="w-full text-center text-[7px] border-collapse font-bold text-neutral-500 dark:text-neutral-400">
                                    <thead>
                                        <tr className="border-b border-neutral-200/50 dark:border-neutral-800/50 pb-2">
                                            <th className="text-left font-extrabold py-1.5 text-[8px] text-neutral-900 dark:text-white">Matriks Pelatihan</th>
                                            <th className="py-1.5">M-A</th>
                                            <th className="py-1.5">M-B</th>
                                            <th className="py-1.5">M-C</th>
                                            <th className="py-1.5">M-D</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200/20 dark:divide-neutral-800/20">
                                        <tr>
                                            <td className="text-left py-2 text-neutral-700 dark:text-neutral-300 font-extrabold">Tim Admin</td>
                                            <td className="text-blue-600 dark:text-blue-400 font-black text-[9px]">●</td>
                                            <td className="text-emerald-500 font-black text-[9px]">●</td>
                                            <td className="text-neutral-300 dark:text-neutral-700">○</td>
                                            <td className="text-blue-600 dark:text-blue-400 font-black text-[9px]">●</td>
                                        </tr>
                                        <tr>
                                            <td className="text-left py-2 text-neutral-700 dark:text-neutral-300 font-extrabold">Tim Ops</td>
                                            <td className="text-blue-600 dark:text-blue-400 font-black text-[9px]">●</td>
                                            <td className="text-neutral-300 dark:text-neutral-700">○</td>
                                            <td className="text-blue-600 dark:text-blue-400 font-black text-[9px]">●</td>
                                            <td className="text-neutral-300 dark:text-neutral-700">○</td>
                                        </tr>
                                        <tr>
                                            <td className="text-left py-2 text-neutral-700 dark:text-neutral-300 font-extrabold">Tim Quality</td>
                                            <td className="text-indigo-500 font-black text-[9px]">●</td>
                                            <td className="text-blue-600 dark:text-blue-400 font-black text-[9px]">●</td>
                                            <td className="text-indigo-500 font-black text-[9px]">●</td>
                                            <td className="text-emerald-500 font-black text-[9px]">●</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="lg:col-span-7 p-8 rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900/80 backdrop-blur-xs flex flex-col justify-between shadow-xs hover:shadow-xl hover:border-blue-500/20 transition-all duration-300 group"
                        >
                            <div className="mb-8">
                                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-500 font-mono tracking-wider block mb-1">04 / VERSIONING</span>
                                <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white mb-2">Histori Perubahan</h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-md">
                                    Lacak perbaikan berkas, kronologi versi, komentar revisi, dan riwayat persetujuan secara detail.
                                </p>
                            </div>
                            <div className="bg-[#F8FBFF]/60 dark:bg-neutral-950/50 rounded-2xl border border-neutral-100 dark:border-neutral-800/50 p-4.5 space-y-3 text-[9px] font-bold group-hover:scale-[1.01] transition-transform duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span className="bg-blue-600/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg border border-blue-500/10 font-extrabold text-[8px]">v2.0</span>
                                        <span className="text-neutral-800 dark:text-neutral-200">Perbaikan konten Modul A Bab 3</span>
                                    </div>
                                    <span className="text-neutral-450 dark:text-neutral-500 font-medium text-[8px]">Admin • 1 jam lalu</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span className="bg-purple-600/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-lg border border-purple-500/10 font-extrabold text-[8px]">v1.2</span>
                                        <span className="text-neutral-800 dark:text-neutral-200">Revisi format parameter matriks</span>
                                    </div>
                                    <span className="text-neutral-450 dark:text-neutral-500 font-medium text-[8px]">Staf PD • Kemarin</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50 font-extrabold text-[8px]">v1.1</span>
                                        <span className="text-neutral-800 dark:text-neutral-200">Sinkronisasi folder Google Drive</span>
                                    </div>
                                    <span className="text-neutral-450 dark:text-neutral-500 font-medium text-[8px]">Tim Ops • 3 hari lalu</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-gradient-to-b from-[#EBF3FF] to-white dark:from-[#0b2045] dark:to-[#09090b] relative overflow-hidden" id="alur-kerja">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.04),transparent_50%)]" />
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-6 order-2 lg:order-1 max-w-md mx-auto w-full group transition-transform duration-300">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/5 blur-3xl rounded-full" />
                            <TrainingFlowBeam />
                        </div>
                    </div>
                    <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col justify-center text-center lg:text-left">
                        <motion.h2 
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight mb-4"
                        >
                            Kendalikan Alur Modul Pelatihan dengan Lebih Mudah
                        </motion.h2>
                        <p className="text-sm sm:text-base text-neutral-550 dark:text-neutral-400 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 font-medium">
                            Automasi proses review, approval, dan pengingat revisi agar tidak ada yang terlewat dan semua pihak selalu selaras.
                        </p>
                        <div>
                            <button 
                                onClick={() => { setAuthModalMode('register'); setAuthModalOpen(true); }}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/25 inline-flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
                            >
                                Mulai Sekarang
                                <ArrowRight className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-white dark:bg-[#09090b] relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 dark:from-blue-900 dark:via-indigo-950 dark:to-blue-900 rounded-3xl p-10 lg:p-14 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                        <div className="absolute -right-10 -top-10 size-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="max-w-2xl relative z-10">
                            <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                                Siap Menyederhanakan Pengelolaan Modul Anda?
                            </h2>
                            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-semibold">
                                Bergabunglah dengan departemen People Development modern yang mengotomasi operasional draf modul mereka bersama TrainingPD.
                            </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-4 relative z-10">
                            <button
                                onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
                                className="px-6 py-3.5 bg-white hover:bg-neutral-100 text-blue-600 text-xs font-bold rounded-xl transition-all shadow-md hover:scale-[1.02] cursor-pointer"
                            >
                                Masuk
                            </button>
                            <button
                                onClick={() => { setAuthModalMode('register'); setAuthModalOpen(true); }}
                                className="px-6 py-3.5 bg-[#020617] hover:bg-[#0f172a] text-white text-xs font-bold rounded-xl transition-all shadow-md hover:scale-[1.02] cursor-pointer"
                            >
                                Mulai Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            </section>

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
                            Platform terintegrasi untuk mengelola draf modul pelatihan, approval, revisi, dan penyimpanan dokumen perusahaan.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-extrabold text-xs uppercase tracking-widest text-neutral-900 dark:text-white">Produk</h4>
                        <ul className="text-xs text-neutral-500 dark:text-neutral-400 space-y-3 font-semibold">
                            <li><a href="#fitur" className="hover:text-blue-600 transition-colors">Pengajuan Modul</a></li>
                            <li><a href="#alur-kerja" className="hover:text-blue-600 transition-colors">Approval & Review</a></li>
                            <li><a href="#fitur" className="hover:text-blue-600 transition-colors">Database Modul</a></li>
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
                            <a href="#" className="text-neutral-400 hover:text-blue-600 transition-colors"><Users className="size-4.5" /></a>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-16 pt-8 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-6 text-center">
                    <p className="text-[10px] text-neutral-400 font-bold">
                        &copy; 2026 TrainingPD. Semua hak dilindungi.
                    </p>
                    <div className="flex items-center gap-6 text-[10px] text-neutral-400 font-bold">
                        <a href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Kebijakan Privasi</a>
                        <a href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Syarat & Ketentuan</a>
                    </div>
                </div>
            </footer>
            
            <Dialog open={authModalOpen} onOpenChange={(open) => { if (!open) setAuthModalOpen(false); }}>
                <DialogContent className="sm:max-w-[420px] p-6">
                    <DialogHeader className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center mb-3">
                            <div className="size-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/30">
                                T
                            </div>
                        </div>
                        <DialogTitle className="text-xl font-extrabold tracking-tight">
                            {authModalMode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Demo Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1 font-medium">
                            {authModalMode === 'login' 
                                ? 'Silakan masuk untuk mengakses dashboard.' 
                                : 'Silakan isi detail data diri untuk mencoba demo platform.'}
                        </DialogDescription>
                    </DialogHeader>

                    {authModalMode === 'login' ? (
                        <WelcomeLoginForm onSwitch={() => setAuthModalMode('register')} />
                    ) : (
                        <WelcomeRegisterForm onSwitch={() => setAuthModalMode('login')} />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ── Auth Forms using standard shadcnUI components ────────────────────────────

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

function WelcomeLoginForm({ onSwitch }: { onSwitch: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid gap-4">
                {/* Email */}
                <div className="grid gap-1.5">
                    <Label htmlFor="modal-email" className="text-xs font-semibold ml-1">
                        Alamat Email
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <Input
                            id="modal-email"
                            type="email"
                            required
                            autoFocus
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="budi@company.com"
                            className="pl-10"
                        />
                    </div>
                    <InputError message={errors.email} />
                </div>

                {/* Password */}
                <div className="grid gap-1.5">
                    <Label htmlFor="modal-password" className="text-xs font-semibold ml-1">
                        Kata Sandi
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <Input
                            id="modal-password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="modal-remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                        />
                        <Label htmlFor="modal-remember" className="text-xs font-medium select-none cursor-pointer">
                            Ingat saya
                        </Label>
                    </div>
                    <a
                        href={route('password.request')}
                        className="text-xs text-blue-600 hover:text-blue-550 font-semibold transition-colors dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Lupa kata sandi?
                    </a>
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    disabled={processing}
                    className="w-full font-bold cursor-pointer"
                >
                    {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    <span>Masuk Sekarang</span>
                </Button>
            </div>

            <div className="text-center text-xs font-medium text-muted-foreground pt-3 border-t">
                Belum memiliki akun?{' '}
                <button
                    type="button"
                    onClick={onSwitch}
                    className="text-blue-600 hover:text-blue-500 font-bold transition-colors cursor-pointer dark:text-blue-400 dark:hover:text-blue-300"
                >
                    Daftar Demo
                </button>
            </div>
        </form>
    );
}

function WelcomeRegisterForm({ onSwitch }: { onSwitch: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid gap-3.5">
                {/* Name */}
                <div className="grid gap-1.5">
                    <Label htmlFor="modal-name" className="text-xs font-semibold ml-1">
                        Nama Lengkap
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <Input
                            id="modal-name"
                            type="text"
                            required
                            autoFocus
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Contoh: Budi Santoso"
                            className="pl-10"
                        />
                    </div>
                    <InputError message={errors.name} />
                </div>

                {/* Email */}
                <div className="grid gap-1.5">
                    <Label htmlFor="modal-reg-email" className="text-xs font-semibold ml-1">
                        Alamat Email
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <Input
                            id="modal-reg-email"
                            type="email"
                            required
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="budi@company.com"
                            className="pl-10"
                        />
                    </div>
                    <InputError message={errors.email} />
                </div>

                {/* Password */}
                <div className="grid gap-1.5">
                    <Label htmlFor="modal-reg-password" className="text-xs font-semibold ml-1">
                        Kata Sandi
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <Input
                            id="modal-reg-password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                {/* Confirm Password */}
                <div className="grid gap-1.5">
                    <Label htmlFor="modal-reg-confirm" className="text-xs font-semibold ml-1">
                        Konfirmasi Kata Sandi
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <Input
                            id="modal-reg-confirm"
                            type={showConfirm ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                        >
                            {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password_confirmation} />
                </div>

                <Button
                    type="submit"
                    disabled={processing}
                    className="w-full font-bold cursor-pointer mt-1"
                >
                    {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    <span>Daftar Akun</span>
                </Button>
            </div>

            <div className="text-center text-xs font-medium text-muted-foreground pt-3 border-t">
                Sudah memiliki akun?{' '}
                <button
                    type="button"
                    onClick={onSwitch}
                    className="text-blue-600 hover:text-blue-500 font-bold transition-colors cursor-pointer dark:text-blue-400 dark:hover:text-blue-300"
                >
                    Masuk
                </button>
            </div>
        </form>
    );
}


