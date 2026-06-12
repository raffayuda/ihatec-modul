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
                <header className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
                    isScrolled 
                        ? 'top-4 w-[calc(100%-2rem)] lg:w-[calc(100%-4rem)] max-w-7xl bg-white/85 dark:bg-neutral-950/85 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50 rounded-full py-3.5 px-6 lg:px-8 shadow-lg shadow-black/5 dark:shadow-black/20' 
                        : 'top-0 w-full bg-white/10 dark:bg-black/10 backdrop-blur-sm py-5 px-6 lg:px-8 border-b border-white/10 dark:border-neutral-900/30'
                }`}>
                    <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
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

                        <div className="flex items-center gap-4 shrink-0">
                            <MotionThemeToggle variant="circle" className="size-9 rounded-full" />

                            <div className={`h-5 w-px ${isScrolled ? 'bg-neutral-200 dark:bg-neutral-800' : 'bg-white/20'} hidden sm:block`}></div>

                            {auth?.user ? (
                                <Link 
                                    href={route('dashboard')} 
                                    className={`px-5 py-2.5 text-xs font-bold rounded-full transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                                        isScrolled 
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10' 
                                            : 'bg-white hover:bg-neutral-100 text-blue-600 shadow-white/10'
                                    }`}
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
                                        className={`text-xs font-bold hover:underline transition-colors cursor-pointer ${
                                            isScrolled ? 'text-neutral-700 dark:text-neutral-300' : 'text-white hover:text-neutral-100'
                                        }`}
                                    >
                                        Masuk
                                    </button>
                                    <button 
                                        onClick={() => { setAuthModalMode('register'); setAuthModalOpen(true); }}
                                        className={`px-5 py-2.5 text-xs font-bold rounded-full transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                                            isScrolled 
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10' 
                                                : 'bg-white hover:bg-neutral-100 text-blue-600 shadow-white/10'
                                        }`}
                                    >
                                        Jadwalkan Demo
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
                        {/* Card 1: Manajemen Siklus Modul */}
                        <motion.div 
                            whileHover={{ y: -8, scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="flex flex-col justify-between p-8 bg-white/70 dark:bg-neutral-900/35 backdrop-blur-md rounded-3xl border border-neutral-200/80 dark:border-neutral-900 shadow-sm hover:shadow-xl hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300 group min-h-[420px]"
                        >
                            {/* Visual Interactive Graphic */}
                            <div className="bg-neutral-50/50 dark:bg-neutral-950/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-900/60 p-6 w-full flex-1 flex flex-col justify-center mb-6 relative overflow-hidden select-none">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.02),transparent_65%)]" />
                                
                                <div className="flex items-center justify-between relative w-full px-2 z-10">
                                    {/* Connector Line Background */}
                                    <div className="absolute top-1/2 left-4 right-4 h-[3px] bg-neutral-200 dark:bg-neutral-800 -translate-y-1/2 z-0 rounded-full" />
                                    
                                    {/* Animated Glow Beam */}
                                    <motion.div 
                                        className="absolute top-1/2 left-4 right-4 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 -translate-y-1/2 z-0 origin-left rounded-full"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: [0, 1, 1, 0] }}
                                        transition={{
                                            duration: 3.5,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            times: [0, 0.45, 0.55, 1]
                                        }}
                                    />
                                    
                                    {/* Step 1: Draf */}
                                    <div className="flex flex-col items-center relative z-10">
                                        <motion.div 
                                            className="size-11 rounded-full bg-white dark:bg-neutral-900 border-2 border-blue-500 dark:border-blue-500 flex items-center justify-center shadow-md shadow-blue-500/10 text-blue-600 dark:text-blue-400 font-bold"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <BookOpen className="size-5" />
                                        </motion.div>
                                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 mt-2 tracking-wider uppercase">DRAF</span>
                                    </div>
                                    
                                    {/* Step 2: Review */}
                                    <div className="flex flex-col items-center relative z-10">
                                        <motion.div 
                                            className="size-11 rounded-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 group-hover:border-indigo-500 group-hover:text-indigo-500 flex items-center justify-center shadow-md text-neutral-400 transition-all duration-300"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <RefreshCw className="size-5 group-hover:animate-spin" />
                                        </motion.div>
                                        <span className="text-[9px] font-black text-neutral-400 dark:text-neutral-500 group-hover:text-indigo-500 mt-2 tracking-wider uppercase transition-colors">TINJAU</span>
                                    </div>
                                    
                                    {/* Step 3: Terbit */}
                                    <div className="flex flex-col items-center relative z-10">
                                        <motion.div 
                                            className="size-11 rounded-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 group-hover:border-emerald-500 group-hover:text-emerald-500 flex items-center justify-center shadow-md text-neutral-400 transition-all duration-300"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <Check className="size-5" />
                                        </motion.div>
                                        <span className="text-[9px] font-black text-neutral-400 dark:text-neutral-500 group-hover:text-emerald-500 mt-2 tracking-wider uppercase transition-colors">PUBLIKASI</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Card Content info */}
                            <div>
                                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2 text-left group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Manajemen Siklus Modul</h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed text-left">
                                    Buat, tinjau, revisi, dan terbitkan modul pelatihan terpusat dalam satu alur kerja yang seragam.
                                </p>
                            </div>
                        </motion.div>

                        {/* Card 2: Tracking & Validasi Dokumen */}
                        <motion.div 
                            whileHover={{ y: -8, scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="flex flex-col justify-between p-8 bg-white/70 dark:bg-neutral-900/35 backdrop-blur-md rounded-3xl border border-neutral-200/80 dark:border-neutral-900 shadow-sm hover:shadow-xl hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-300 group min-h-[420px]"
                        >
                            {/* Visual Interactive Graphic */}
                            <div className="bg-neutral-50/50 dark:bg-neutral-950/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-900/60 p-5 w-full flex-1 flex flex-col justify-center mb-6 relative overflow-hidden select-none">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.02),transparent_65%)]" />
                                
                                {/* Scanning line */}
                                <motion.div 
                                    className="absolute left-0 right-0 h-0.5 bg-emerald-500/50 dark:bg-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.5)] z-20"
                                    animate={{ 
                                        top: ["15%", "85%", "15%"] 
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                                
                                {/* Upload Target Representation */}
                                <div className="border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col items-center justify-center bg-white/20 dark:bg-neutral-900/10 relative overflow-hidden">
                                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 rounded-lg p-2 flex items-center gap-3 w-full max-w-[180px] shadow-sm relative z-10">
                                        <div className="size-9 bg-emerald-500/10 rounded-md flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                                            <FileText className="size-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] font-bold text-neutral-800 dark:text-neutral-100 truncate">modul_kepatuhan.pdf</div>
                                            <div className="text-[8px] text-neutral-400 dark:text-neutral-550 font-semibold mt-0.5">3.8 MB • PDF Dokumen</div>
                                        </div>
                                        <div className="size-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 border border-white dark:border-neutral-900 shadow-xs">
                                            <Check className="size-3" />
                                        </div>
                                    </div>
                                    
                                    {/* Checked criteria badges */}
                                    <div className="flex items-center gap-1.5 mt-3.5 w-full max-w-[180px] justify-between text-[7px] font-extrabold text-neutral-400 dark:text-neutral-500">
                                        <span className="flex items-center gap-0.5 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/10">✓ FORMAT</span>
                                        <span className="flex items-center gap-0.5 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/10">✓ MATRIKS</span>
                                        <span className="flex items-center gap-0.5 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/10">✓ UKURAN</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Card Content info */}
                            <div>
                                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2 text-left group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Tracking & Validasi Dokumen</h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed text-left">
                                    Validasi otomatis format file PDF untuk memastikan kelayakan draf modul sebelum diajukan.
                                </p>
                            </div>
                        </motion.div>

                        {/* Card 3: Notifikasi & Approval Cerdas */}
                        <motion.div 
                            whileHover={{ y: -8, scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="flex flex-col justify-between p-8 bg-white/70 dark:bg-neutral-900/35 backdrop-blur-md rounded-3xl border border-neutral-200/80 dark:border-neutral-900 shadow-sm hover:shadow-xl hover:border-orange-500/40 dark:hover:border-orange-500/30 transition-all duration-300 group min-h-[420px]"
                        >
                            {/* Visual Interactive Graphic */}
                            <div className="bg-neutral-50/50 dark:bg-neutral-950/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-900/60 p-4 w-full flex-1 flex flex-col justify-center items-center mb-6 relative overflow-hidden select-none">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.02),transparent_65%)]" />
                                
                                {/* Notification Card Mockup */}
                                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-md flex items-start gap-3 w-full max-w-[210px] relative z-10">
                                    <motion.div 
                                        className="size-9 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 relative"
                                        whileHover={{ rotate: [0, -15, 15, -10, 10, 0] }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Bell className="size-5" />
                                        <span className="absolute top-0.5 right-0.5 size-2 bg-orange-500 rounded-full animate-ping" />
                                        <span className="absolute top-0.5 right-0.5 size-2 bg-orange-500 rounded-full" />
                                    </motion.div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between text-[8px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                                            <span>PERSETUJUAN BARU</span>
                                            <span>SEKARANG</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-neutral-850 dark:text-neutral-200 mt-1 leading-snug">Modul K3 Konstruksi memerlukan validasi Anda</div>
                                    </div>
                                </div>
                                
                                {/* Slack / Multi-channel notification badges indicator */}
                                <div className="flex items-center gap-1.5 mt-3 text-[8px] font-extrabold text-neutral-400 dark:text-neutral-500 bg-white/40 dark:bg-neutral-900/25 px-2 py-1 rounded-full border border-neutral-200/50 dark:border-neutral-800">
                                    <span>Terkirim via:</span>
                                    <span className="text-blue-600 dark:text-blue-400 bg-blue-500/5 dark:bg-blue-500/15 px-1.5 py-0.25 rounded-md">Email</span>
                                    <span className="text-orange-600 dark:text-orange-400 bg-orange-500/5 dark:bg-orange-500/15 px-1.5 py-0.25 rounded-md">Sistem</span>
                                </div>
                            </div>
                            
                            {/* Card Content info */}
                            <div>
                                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2 text-left group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Notifikasi & Approval Cerdas</h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed text-left">
                                    Dapatkan pengingat otomatis dan approval real-time demi siklus validasi draf yang lebih responsif.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>            <section className="py-24 bg-[#F8FBFF]/60 dark:bg-neutral-950/20 border-y border-neutral-200/50 dark:border-neutral-900/50 relative overflow-hidden" id="fitur">
                {/* Background ambient light */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.02),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.02),transparent_50%)]" />

                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest block mb-2">FITUR UTAMA</span>
                        <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-4">
                            Semua yang Anda Butuhkan.<br className="hidden sm:inline" /> Tanpa Kerumitan.
                        </h2>
                        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto font-medium leading-relaxed">
                            Satu alur kerja terintegrasi untuk mengelola draf modul, berkas, matriks pelatihan, dan notifikasi approval secara instan.
                        </p>
                    </div>

                    {/* Top Row: 3 Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {/* Card 1: Kepatuhan Dokumen */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-900 bg-white/70 dark:bg-neutral-900/35 backdrop-blur-md flex flex-col justify-between hover:border-blue-500/40 dark:hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group min-h-[390px]"
                        >
                            {/* Graphic at top */}
                            <div className="bg-neutral-50/50 dark:bg-neutral-950/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-900/60 p-5 w-full flex-1 flex flex-col justify-center mb-6 relative overflow-hidden select-none">
                                <div className="flex items-center justify-between mb-4 text-[10px] font-bold">
                                    <span className="text-neutral-500 dark:text-neutral-350 tracking-tight">Status Dokumen</span>
                                    <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Compliance</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2.5 text-center text-[9px] font-bold mb-4">
                                    <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl border border-emerald-200 dark:border-emerald-500/15 shadow-xs">
                                        <div className="text-xs font-black">65%</div>
                                        <div className="text-[7px] text-neutral-400 dark:text-neutral-500 mt-0.5 uppercase tracking-wider">Valid</div>
                                    </div>
                                    <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 p-2 rounded-xl border border-amber-200 dark:border-amber-500/15 shadow-xs">
                                        <div className="text-xs font-black">82%</div>
                                        <div className="text-[7px] text-neutral-400 dark:text-neutral-500 mt-0.5 uppercase tracking-wider">Review</div>
                                    </div>
                                    <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 p-2 rounded-xl border border-rose-200 dark:border-rose-500/15 shadow-xs">
                                        <div className="text-xs font-black">22%</div>
                                        <div className="text-[7px] text-neutral-400 dark:text-neutral-500 mt-0.5 uppercase tracking-wider">Expired</div>
                                    </div>
                                </div>
                                <div className="space-y-2 text-[9px] font-semibold text-neutral-550 dark:text-neutral-400">
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
                                {/* Unique SVG wave graph representing growth */}
                                <svg viewBox="0 0 100 25" className="w-full h-8 mt-4 text-blue-500/80 dark:text-blue-500 stroke-current fill-none stroke-2 stroke-round">
                                    <path d="M0,20 C15,10 25,23 40,8 C55,-7 70,18 100,2" />
                                    <path d="M0,20 C15,10 25,23 40,8 C55,-7 70,18 100,2" className="opacity-30 blur-[2px]" />
                                </svg>
                            </div>
                            {/* Text below */}
                            <div>
                                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">Kepatuhan Dokumen</h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-450 leading-relaxed">
                                    Pantau status kepatuhan, keaktifan draf, validasi berkas, dan modul kedaluwarsa secara visual real-time.
                                </p>
                            </div>
                        </motion.div>

                        {/* Card 2: Kelola Real-Time (Mobile Phone Mockup) */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-900 bg-white/70 dark:bg-neutral-900/35 backdrop-blur-md flex flex-col justify-between hover:border-blue-500/40 dark:hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group min-h-[380px]"
                        >
                            {/* Graphic at top */}
                            <div className="bg-neutral-50/50 dark:bg-neutral-950/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-900/60 w-full flex-1 flex items-center justify-center mb-6 relative overflow-hidden p-4">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_60%)]" />
                                {/* Phone container */}
                                <div className="w-28 h-44 rounded-2xl border-[3px] border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 flex flex-col p-1.5 gap-1.5 shadow-xl relative z-10">
                                    {/* Notch */}
                                    <div className="w-10 h-2 bg-neutral-300 dark:bg-black rounded-full mx-auto mb-0.5" />
                                    {/* Mini cards */}
                                    <div className="bg-white dark:bg-neutral-800/60 rounded-md p-1.5 border border-neutral-200 dark:border-neutral-750/30 text-[6px] font-bold text-neutral-500 dark:text-neutral-400 space-y-1">
                                        <div className="flex justify-between items-center text-[5px]">
                                            <span className="text-neutral-850 dark:text-white font-black">Detail Modul</span>
                                            <span>📄</span>
                                        </div>
                                        <div className="h-8 w-full bg-gradient-to-br from-blue-600 to-indigo-600 rounded-md flex flex-col justify-between p-1 text-white shadow-sm shadow-blue-500/20">
                                            <span className="text-[5.5px] font-black leading-none truncate">Draf Modul K3</span>
                                            <div className="flex justify-between items-end">
                                                <span className="text-[4px] opacity-80">v2.1 • Oleh Rian</span>
                                                <span className="text-[3.5px] bg-white/25 px-1 py-0.25 rounded text-white font-semibold">Review</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Mini list items */}
                                    <div className="space-y-1 text-[5px] text-neutral-500 dark:text-neutral-455">
                                        <span className="font-extrabold text-neutral-800 dark:text-white ml-0.5">Aktivitas Terakhir</span>
                                        <div className="bg-white dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-850/10 rounded px-1 py-0.5 flex justify-between">
                                            <span>Modul ISO 9001</span>
                                            <span className="text-emerald-500 font-extrabold">Selesai</span>
                                        </div>
                                        <div className="bg-white dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-850/10 rounded px-1 py-0.5 flex justify-between">
                                            <span>Modul Finansial</span>
                                            <span className="text-amber-500 font-extrabold">Revisi</span>
                                        </div>
                                    </div>
                                    {/* Glowing fingerprint overlay */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 size-8 bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/30 dark:border-blue-500/50 rounded-full flex items-center justify-center animate-pulse pointer-events-none text-blue-600 dark:text-blue-400">
                                        <ShieldCheck className="size-3.5" />
                                    </div>
                                </div>
                            </div>
                            {/* Text below */}
                            <div>
                                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">Akses Mobile Real-Time</h3>
                                <p className="text-xs text-neutral-550 dark:text-neutral-450 leading-relaxed">
                                    Akses dan setujui draf modul kapan saja dan di mana saja langsung dari perangkat seluler Anda.
                                </p>
                            </div>
                        </motion.div>

                        {/* Card 3: Notifikasi & Review Cerdas (Alert Feed) */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-900 bg-white/70 dark:bg-neutral-900/35 backdrop-blur-md flex flex-col justify-between hover:border-blue-500/40 dark:hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group min-h-[380px]"
                        >
                            {/* Graphic at top */}
                            <div className="bg-neutral-50/50 dark:bg-neutral-950/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-900/60 p-4 w-full flex-1 flex flex-col justify-center gap-3 mb-6 relative overflow-hidden">
                                {/* Alert 1 */}
                                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-855 rounded-xl p-3 flex flex-col gap-2 shadow-md relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                                    <div className="flex justify-between items-center pl-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <div className="size-3.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 font-extrabold rounded-full flex items-center justify-center text-[7px]">M</div>
                                            <span className="text-[7.5px] font-bold text-neutral-900 dark:text-white">Monica S. mengajukan Modul</span>
                                        </div>
                                        <span className="text-[6.5px] text-neutral-450 dark:text-neutral-500 font-semibold">15m lalu</span>
                                    </div>
                                    <div className="text-[7px] text-neutral-500 dark:text-neutral-400 font-medium pl-1.5">
                                        Tipe dokumen: <span className="text-neutral-800 dark:text-white font-semibold">Draf Modul K3 v1.0</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5 pl-1.5">
                                        <button className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[6.5px] font-extrabold transition-all cursor-pointer shadow-xs">Setujui</button>
                                        <button className="px-2 py-0.5 border border-neutral-200 dark:border-neutral-800 text-neutral-550 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-850 rounded text-[6.5px] font-extrabold transition-all cursor-pointer">Tolak</button>
                                        <button className="px-2 py-0.5 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-[6.5px] font-extrabold transition-all cursor-pointer">Revisi</button>
                                    </div>
                                </div>
                                {/* Alert 2 */}
                                <div className="bg-white/80 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-850/40 rounded-xl p-2.5 flex items-center justify-between text-[7px] text-neutral-500 dark:text-neutral-450 opacity-60">
                                    <span className="flex items-center gap-1.5">
                                        <Check className="size-3 text-emerald-500" />
                                        <span>Modul Keuangan disetujui</span>
                                    </span>
                                    <span>2j lalu</span>
                                </div>
                            </div>
                            {/* Text below */}
                            <div>
                                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">Notifikasi & Approval</h3>
                                <p className="text-xs text-neutral-550 dark:text-neutral-450 leading-relaxed">
                                    Dapatkan pemberitahuan instan via email atau Slack untuk setiap draf modul yang membutuhkan review.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom Row: 2 Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Card 4: Integrasi Database & Cloud */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-900 bg-white/70 dark:bg-neutral-900/35 backdrop-blur-md flex flex-col justify-between hover:border-blue-500/40 dark:hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group min-h-[360px]"
                        >
                            {/* Graphic at top */}
                            <div className="bg-neutral-50/50 dark:bg-neutral-950/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-900/60 w-full flex-1 flex items-center justify-center mb-6 relative overflow-hidden p-6 bg-[radial-gradient(#00000008_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff04_1px,transparent_1px)] bg-[size:16px_16px]">
                                {/* Connecting network SVG lines */}
                                <svg className="absolute inset-0 w-full h-full text-neutral-200/80 dark:text-neutral-850/60" xmlns="http://www.w3.org/2000/svg">
                                    <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                                    <line x1="80%" y1="20%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                                    <line x1="20%" y1="80%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                                    <line x1="80%" y1="80%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                                    <line x1="50%" y1="12%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                                    <line x1="10%" y1="50%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                                    <line x1="90%" y1="50%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                                </svg>
                                
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03),transparent_50%)]" />
                                <div className="w-full h-full relative min-h-[160px]">
                                    {/* Center Node */}
                                    <div className="absolute top-[calc(50%-20px)] left-[calc(50%-20px)] size-10 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/20 flex items-center justify-center z-20 group-hover:scale-105 transition-transform duration-300">
                                        <Database className="size-5" />
                                        <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping pointer-events-none" />
                                    </div>
                                    
                                    {/* App Nodes */}
                                    <div className="absolute top-[10%] left-[12%] size-8 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-center text-blue-500 hover:scale-110 transition-transform"><Database className="size-4" /></div>
                                    <div className="absolute top-[10%] right-[12%] size-8 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-center text-sky-400 hover:scale-110 transition-transform"><UploadCloud className="size-4" /></div>
                                    <div className="absolute bottom-[10%] left-[12%] size-8 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-center text-green-500 hover:scale-110 transition-transform"><FileText className="size-4" /></div>
                                    <div className="absolute bottom-[10%] right-[12%] size-8 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-center text-red-500 hover:scale-110 transition-transform"><Archive className="size-4" /></div>
                                    <div className="absolute top-[6%] left-[calc(50%-16px)] size-8 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-center text-orange-500 hover:scale-110 transition-transform"><Server className="size-4" /></div>
                                    <div className="absolute top-[calc(50%-16px)] left-[4%] size-8 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-center text-purple-500 hover:scale-110 transition-transform"><Users className="size-4" /></div>
                                    <div className="absolute top-[calc(50%-16px)] right-[4%] size-8 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-center text-indigo-400 hover:scale-110 transition-transform"><Send className="size-4" /></div>
                                </div>
                            </div>
                            {/* Text below */}
                            <div>
                                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">Integrasi Database & Cloud</h3>
                                <p className="text-xs text-neutral-550 dark:text-neutral-455 leading-relaxed">
                                    Sinkronisasi modul otomatis dengan Google Drive, OneDrive, dan server lokal internal perusahaan untuk penyimpanan yang aman.
                                </p>
                            </div>
                        </motion.div>

                        {/* Card 5: Kendali Pintar & Pintasan (Shortcut command palette) */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-900 bg-white/70 dark:bg-neutral-900/35 backdrop-blur-md flex flex-col justify-between hover:border-blue-500/40 dark:hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group min-h-[360px]"
                        >
                            {/* Graphic at top */}
                            <div className="bg-neutral-50/50 dark:bg-neutral-950/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-900/60 w-full flex-1 flex flex-col items-center justify-center mb-6 relative overflow-hidden p-5">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03),transparent_50%)]" />
                                {/* Command Menu */}
                                <div className="w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-2xl p-3 shadow-xl relative z-10 flex flex-col gap-2 text-[7.5px] select-none scale-[0.95] text-neutral-800 dark:text-neutral-200">
                                    <div className="text-neutral-450 dark:text-neutral-500 font-semibold pl-1">Cari perintah atau modul...</div>
                                    <hr className="border-neutral-100 dark:border-neutral-800" />
                                    <div className="flex flex-col gap-1 text-neutral-500 dark:text-neutral-400 font-semibold">
                                        <div className="flex justify-between items-center p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-pointer">
                                            <span className="flex items-center gap-1">📂 <span>Lihat draf aktif</span></span>
                                            <span className="text-[6.5px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-1 py-0.5 rounded text-neutral-400">⌘ K</span>
                                        </div>
                                        <div className="flex justify-between items-center p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-pointer bg-neutral-50 dark:bg-neutral-800/30 text-neutral-950 dark:text-white font-bold">
                                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">📊 <span>Review matriks kompetensi</span></span>
                                            <span className="text-[6.5px] border border-blue-200 dark:border-neutral-850 bg-blue-50 dark:bg-neutral-950 px-1 py-0.5 rounded text-blue-500">⌘ M</span>
                                        </div>
                                        <div className="flex justify-between items-center p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-pointer">
                                            <span className="flex items-center gap-1">➕ <span>Ajukan modul baru</span></span>
                                            <span className="text-[6.5px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-1 py-0.5 rounded text-neutral-400">⌘ N</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Key Caps display */}
                                <div className="flex items-center gap-1.5 mt-3.5 relative z-10 scale-[0.85]">
                                    <div className="px-2.5 py-1.5 border border-neutral-250 dark:border-neutral-800 border-b-[3px] border-b-neutral-350 dark:border-b-neutral-950 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-[8px] font-black text-neutral-500 dark:text-neutral-400 shadow-sm">Ctrl</div>
                                    <div className="px-2.5 py-1.5 border border-neutral-250 dark:border-neutral-800 border-b-[3px] border-b-neutral-350 dark:border-b-neutral-950 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-[8px] font-black text-neutral-500 dark:text-neutral-400 shadow-sm">⌘</div>
                                    <div className="px-2.5 py-1.5 border border-blue-500 bg-blue-600 border-b-[3px] border-b-blue-700 rounded-lg text-[8px] font-black text-white shadow-md shadow-blue-500/20 animate-pulse">K</div>
                                </div>
                            </div>
                            {/* Text below */}
                            <div>
                                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">Kendali Penuh di Tangan Anda</h3>
                                <p className="text-xs text-neutral-550 dark:text-neutral-455 leading-relaxed">
                                    Navigasi secepat kilat dengan pencarian pintar global dan pintasan keyboard untuk menghemat waktu operasional Anda.
                                </p>
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

            <footer className="bg-gradient-to-b from-neutral-50/30 to-neutral-100/50 dark:from-[#09090b]/40 dark:to-[#020205] border-t border-neutral-200/30 dark:border-neutral-900/30 py-16 relative overflow-hidden">
                {/* Visual glow element at the top edge of footer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                
                <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left relative z-10">
                    <div className="col-span-1">
                        <Link href="/" className="flex items-center justify-center md:justify-start gap-2.5 mb-5 group shrink-0">
                            <motion.div 
                                className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                                whileHover={{ scale: 1.05, rotate: -5 }}
                            >
                                T
                            </motion.div>
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
                        <ul className="text-xs text-neutral-500 dark:text-neutral-400 space-y-3 font-semibold flex flex-col">
                            <li><a href="#fitur" className="hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all duration-200 inline-block">Pengajuan Modul</a></li>
                            <li><a href="#alur-kerja" className="hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all duration-200 inline-block">Approval & Review</a></li>
                            <li><a href="#fitur" className="hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all duration-200 inline-block">Database Modul</a></li>
                        </ul>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="font-extrabold text-xs uppercase tracking-widest text-neutral-900 dark:text-white">Solusi</h4>
                        <ul className="text-xs text-neutral-500 dark:text-neutral-400 space-y-3 font-semibold flex flex-col">
                            <li><a href="#solusi" className="hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all duration-200 inline-block">Google Drive Integrasi</a></li>
                            <li><a href="#solusi" className="hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all duration-200 inline-block">Kepatuhan Dokumen</a></li>
                            <li><a href="#solusi" className="hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all duration-200 inline-block">Audit & Aktivitas</a></li>
                        </ul>
                    </div>
                    
                    <div className="space-y-4 flex flex-col items-center md:items-start">
                        <h4 className="font-extrabold text-xs uppercase tracking-widest text-neutral-900 dark:text-white">Hubungi Kami</h4>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold space-y-3">
                            <p>People Development Department</p>
                            <div className="pt-0.5">
                                <a 
                                    href="mailto:pd@trainingpd.com" 
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/5 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold rounded-full border border-blue-500/10 hover:border-blue-500/20 transition-all hover:scale-[1.02] shadow-xs"
                                >
                                    <span>pd@trainingpd.com</span>
                                    <ArrowUpRight className="size-3" />
                                </a>
                            </div>
                        </div>
                        
                        {/* Pulse Operational Status Badge */}
                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 dark:text-neutral-400 font-bold mt-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span>PD Desk Active</span>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-4">
                            <a 
                                href="https://github.com" 
                                target="_blank" 
                                className="size-8 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-blue-600 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all shadow-xs"
                            >
                                <Github className="size-4" />
                            </a>
                            <a 
                                href="#" 
                                className="size-8 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-blue-600 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all shadow-xs"
                            >
                                <Users className="size-4" />
                            </a>
                        </div>
                    </div>
                </div>
                
                <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-16 pt-8 border-t border-neutral-200/50 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-6 text-center relative z-10">
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold">
                        &copy; 2026 TrainingPD. Semua hak dilindungi.
                    </p>
                    <div className="flex items-center gap-6 text-[10px] text-neutral-400 dark:text-neutral-500 font-bold">
                        <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Kebijakan Privasi</a>
                        <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Syarat & Ketentuan</a>
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


