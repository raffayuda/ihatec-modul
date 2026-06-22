import { AtmosphericBackground } from '@/components/atmospheric-background';
import InputError from '@/components/input-error';
import { InteractiveDashboardPreview, type DashboardView } from '@/components/interactive-dashboard-preview';
import { MotionThemeToggle } from '@/components/motion-theme-toggle';
import { TrainingFlowBeam } from '@/components/training-flow-beam';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppearance } from '@/hooks/use-appearance';
import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Archive,
    ArrowRight,
    ArrowUpRight,
    Bell,
    BookOpen,
    Check,
    Database,
    Eye,
    EyeOff,
    FileText,
    Github,
    Loader2,
    Lock,
    Mail,
    Menu,
    RefreshCw,
    Send,
    Server,
    ShieldCheck,
    UploadCloud,
    User,
    Users,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const { appearance, updateAppearance } = useAppearance();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [heroDashboardView, setHeroDashboardView] = useState<DashboardView>('overview');
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
        const texts = ['Menghubungkan database...', 'Sinkronisasi versi modul...', 'Menyiapkan matriks pelatihan...', 'Hampir selesai...'];
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
        <div className="min-h-screen bg-[#F8FBFF] font-sans text-[#0F172A] transition-colors duration-300 selection:bg-blue-600 selection:text-white dark:bg-[#09090b] dark:text-[#f4f4f5]">
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 1 }}
                        exit={{
                            opacity: 0,
                            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                        }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white select-none dark:bg-[#09090b]"
                    >
                        {/* Grid effect background */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

                        <div className="relative flex w-full max-w-xs flex-col items-center px-4 text-center">
                            {/* Brand logo bouncing and glowing */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{
                                    scale: 1,
                                    opacity: 1,
                                    rotate: [0, -5, 5, 0],
                                }}
                                transition={{
                                    duration: 0.8,
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                                className="relative mb-6"
                            >
                                <div className="absolute inset-0 animate-pulse rounded-2xl bg-blue-600/20 blur-xl filter" />

                                <motion.div
                                    className="relative flex size-16 items-center justify-center rounded-2xl bg-blue-600 text-4xl font-bold text-white shadow-2xl shadow-blue-600/30"
                                    animate={{
                                        y: [0, -6, 0],
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2,
                                        ease: 'easeInOut',
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
                                className="mb-1 text-xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50"
                            >
                                TrainingPD
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                transition={{ delay: 0.3 }}
                                className="text-neutral-550 mb-6 text-[10px] font-bold tracking-widest uppercase dark:text-neutral-400"
                            >
                                Training Module Management
                            </motion.p>

                            {/* Minimalist horizontal progress bar */}
                            <div className="relative mb-3 h-1 w-40 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                <motion.div
                                    initial={{ left: '-100%' }}
                                    animate={{ left: '0%' }}
                                    transition={{
                                        duration: 1.3,
                                        ease: 'easeInOut',
                                    }}
                                    className="absolute inset-y-0 w-full rounded-full bg-blue-600"
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
            <div className="relative overflow-hidden bg-gradient-to-b from-[#0865F2] via-[#3A8DFF] to-[#F8FBFF] pb-24 dark:from-[#0b2b63] dark:via-[#133c7d] dark:to-[#09090b]">
                <AtmosphericBackground />

                {/* Header Navbar */}
                <header
                    className={`fixed left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ease-in-out ${
                        isScrolled
                            ? 'top-4 w-[calc(100%-2rem)] max-w-7xl rounded-full border border-neutral-200/50 bg-white/85 px-6 py-3.5 shadow-lg shadow-black/5 backdrop-blur-xl lg:w-[calc(100%-4rem)] lg:px-8 dark:border-neutral-800/50 dark:bg-neutral-950/85 dark:shadow-black/20'
                            : 'top-0 w-full border-b border-white/10 bg-white/10 px-6 py-5 backdrop-blur-sm lg:px-8 dark:border-neutral-900/30 dark:bg-black/10'
                    }`}
                >
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
                        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
                            <div className="flex size-8.5 items-center justify-center rounded-lg bg-blue-600 text-xl font-bold text-white transition-transform group-hover:scale-105">
                                T
                            </div>
                            <span
                                className={`text-xl font-extrabold tracking-tight transition-colors ${
                                    isScrolled ? 'text-neutral-900 dark:text-white' : 'text-white'
                                }`}
                            >
                                TrainingPD
                            </span>
                        </Link>

                        <nav
                            className={`hidden items-center gap-8 text-xs font-bold transition-colors lg:flex ${
                                isScrolled ? 'text-neutral-600 dark:text-neutral-300' : 'text-white/95'
                            }`}
                        >
                            <a href="#produk" className="transition-colors hover:text-blue-500 dark:hover:text-blue-400">
                                Produk
                            </a>
                            <a href="#solusi" className="transition-colors hover:text-blue-500 dark:hover:text-blue-400">
                                Solusi
                            </a>
                            <a href="#fitur" className="transition-colors hover:text-blue-500 dark:hover:text-blue-400">
                                Fitur
                            </a>
                            <a href="#alur-kerja" className="transition-colors hover:text-blue-500 dark:hover:text-blue-400">
                                Alur Kerja
                            </a>
                            <a href="#faq" className="transition-colors hover:text-blue-500 dark:hover:text-blue-400">
                                FAQ
                            </a>
                        </nav>

                        <div className="flex shrink-0 items-center gap-4">
                            <MotionThemeToggle variant="circle" className="size-9 rounded-full" />

                            <div className={`h-5 w-px ${isScrolled ? 'bg-neutral-200 dark:bg-neutral-800' : 'bg-white/20'} hidden sm:block`}></div>

                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className={`cursor-pointer rounded-full px-5 py-2.5 text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${
                                        isScrolled
                                            ? 'bg-blue-600 text-white shadow-blue-500/10 hover:bg-blue-700'
                                            : 'bg-white text-blue-600 shadow-white/10 hover:bg-neutral-100'
                                    }`}
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            setAuthModalMode('login');
                                            setAuthModalOpen(true);
                                        }}
                                        className={`cursor-pointer text-xs font-bold transition-colors hover:underline ${
                                            isScrolled ? 'text-neutral-700 dark:text-neutral-300' : 'text-white hover:text-neutral-100'
                                        }`}
                                    >
                                        Masuk
                                    </button>
                                    <button
                                        onClick={() => {
                                            setAuthModalMode('register');
                                            setAuthModalOpen(true);
                                        }}
                                        className={`cursor-pointer rounded-full px-5 py-2.5 text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${
                                            isScrolled
                                                ? 'bg-blue-600 text-white shadow-blue-500/10 hover:bg-blue-700'
                                                : 'bg-white text-blue-600 shadow-white/10 hover:bg-neutral-100'
                                        }`}
                                    >
                                        Jadwalkan Demo
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={`p-2 transition-colors lg:hidden ${isScrolled ? 'text-neutral-600 dark:text-neutral-400' : 'text-white'}`}
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
                                className="flex flex-col gap-3.5 overflow-hidden border-b border-neutral-200 bg-white px-6 py-4 lg:hidden dark:border-neutral-800 dark:bg-[#09090b]"
                            >
                                <a
                                    href="#produk"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-xs font-bold transition-colors hover:text-blue-600"
                                >
                                    Produk
                                </a>
                                <a
                                    href="#solusi"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-xs font-bold transition-colors hover:text-blue-600"
                                >
                                    Solusi
                                </a>
                                <a
                                    href="#fitur"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-xs font-bold transition-colors hover:text-blue-600"
                                >
                                    Fitur
                                </a>
                                <a
                                    href="#alur-kerja"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-xs font-bold transition-colors hover:text-blue-600"
                                >
                                    Alur Kerja
                                </a>
                                <hr className="border-neutral-100 dark:border-neutral-800" />
                                {auth?.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="flex h-9 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => {
                                                setAuthModalMode('login');
                                                setAuthModalOpen(true);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 text-xs font-bold dark:border-neutral-800"
                                        >
                                            Masuk
                                        </button>
                                        <button
                                            onClick={() => {
                                                setAuthModalMode('register');
                                                setAuthModalOpen(true);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex h-9 cursor-pointer items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white"
                                        >
                                            Jadwalkan Demo
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>

                <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-36 pb-12 text-center lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
                        <h1 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight text-white sm:text-5xl lg:text-[52px]">
                            Kelola Modul Pelatihan dengan Lebih Mudah
                        </h1>

                        <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed font-medium text-blue-50/90 sm:text-base dark:text-neutral-300">
                            Platform terpusat untuk pengajuan modul, approval, revisi, penyimpanan file, dan matriks pelatihan dalam satu alur kerja
                            yang rapi.
                        </p>

                        <div className="mb-16 flex flex-wrap items-center justify-center gap-4.5">
                            <button
                                onClick={() => {
                                    setAuthModalMode('register');
                                    setAuthModalOpen(true);
                                }}
                                className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#020617] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-black/10 transition-all hover:scale-[1.02] hover:bg-[#0f172a]"
                            >
                                Mulai Sekarang
                                <ArrowRight className="size-4" />
                            </button>
                            <a href="#fitur" className="flex items-center gap-1.5 text-xs font-bold text-white transition-colors hover:text-blue-100">
                                Lihat Demo
                                <span className="text-sm">→</span>
                            </a>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl dark:bg-neutral-950"
                    >
                        <div className="flex items-center justify-between border-b border-neutral-200/50 bg-neutral-100 px-4 py-3 dark:border-neutral-800/50 dark:bg-neutral-900">
                            <div className="flex items-center gap-1.5">
                                <div className="size-3 rounded-full bg-red-400" />
                                <div className="size-3 rounded-full bg-yellow-400" />
                                <div className="size-3 rounded-full bg-green-400" />
                            </div>
                            <div className="mx-auto max-w-xs flex-1">
                                <div className="truncate rounded-md border border-neutral-200/50 bg-white px-3 py-1 text-[10px] font-semibold text-neutral-400 dark:border-neutral-800/30 dark:bg-neutral-950 dark:text-neutral-500">
                                    trainingpd.app
                                </div>
                            </div>
                            <div className="w-12" />
                        </div>

                        <div className="bg-white p-1 sm:p-2 dark:bg-neutral-950">
                            <InteractiveDashboardPreview activeView={heroDashboardView} onViewChange={setHeroDashboardView} variant="hero" />
                        </div>
                    </motion.div>
                </div>
            </div>
            <section className="relative overflow-hidden bg-[#FAF9F6]/30 py-24 dark:bg-[#09090b]" id="produk">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_40%)]" />
                <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-2 block text-[10px] font-bold tracking-widest text-blue-600 uppercase dark:text-blue-500"
                        >
                            TENTANG KAMI
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl font-extrabold tracking-tight text-neutral-900 lg:text-4xl dark:text-white"
                        >
                            Operasional Modul yang Lebih Efisien
                        </motion.h2>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* Card 1: Manajemen Siklus Modul */}
                        <motion.div
                            whileHover={{ y: -8, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="group flex min-h-[420px] flex-col justify-between rounded-3xl border border-neutral-200/80 bg-white/70 p-8 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-blue-500/40 hover:shadow-xl dark:border-neutral-900 dark:bg-neutral-900/35 dark:hover:border-blue-500/30"
                        >
                            {/* Visual Interactive Graphic */}
                            <div className="relative mb-6 flex w-full flex-1 flex-col justify-center overflow-hidden rounded-2xl border border-neutral-200/50 bg-neutral-50/50 p-6 select-none dark:border-neutral-900/60 dark:bg-neutral-950/50">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.02),transparent_65%)]" />

                                <div className="relative z-10 flex w-full items-center justify-between px-2">
                                    {/* Connector Line Background */}
                                    <div className="absolute top-1/2 right-4 left-4 z-0 h-[3px] -translate-y-1/2 rounded-full bg-neutral-200 dark:bg-neutral-800" />

                                    {/* Animated Glow Beam */}
                                    <motion.div
                                        className="absolute top-1/2 right-4 left-4 z-0 h-[3px] origin-left -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: [0, 1, 1, 0] }}
                                        transition={{
                                            duration: 3.5,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                            times: [0, 0.45, 0.55, 1],
                                        }}
                                    />

                                    {/* Step 1: Draf */}
                                    <div className="relative z-10 flex flex-col items-center">
                                        <motion.div
                                            className="flex size-11 items-center justify-center rounded-full border-2 border-blue-500 bg-white font-bold text-blue-600 shadow-md shadow-blue-500/10 dark:border-blue-500 dark:bg-neutral-900 dark:text-blue-400"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <BookOpen className="size-5" />
                                        </motion.div>
                                        <span className="mt-2 text-[9px] font-black tracking-wider text-blue-600 uppercase dark:text-blue-400">
                                            DRAF
                                        </span>
                                    </div>

                                    {/* Step 2: Review */}
                                    <div className="relative z-10 flex flex-col items-center">
                                        <motion.div
                                            className="flex size-11 items-center justify-center rounded-full border-2 border-neutral-200 bg-white text-neutral-400 shadow-md transition-all duration-300 group-hover:border-indigo-500 group-hover:text-indigo-500 dark:border-neutral-800 dark:bg-neutral-900"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <RefreshCw className="size-5 group-hover:animate-spin" />
                                        </motion.div>
                                        <span className="mt-2 text-[9px] font-black tracking-wider text-neutral-400 uppercase transition-colors group-hover:text-indigo-500 dark:text-neutral-500">
                                            TINJAU
                                        </span>
                                    </div>

                                    {/* Step 3: Terbit */}
                                    <div className="relative z-10 flex flex-col items-center">
                                        <motion.div
                                            className="flex size-11 items-center justify-center rounded-full border-2 border-neutral-200 bg-white text-neutral-400 shadow-md transition-all duration-300 group-hover:border-emerald-500 group-hover:text-emerald-500 dark:border-neutral-800 dark:bg-neutral-900"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <Check className="size-5" />
                                        </motion.div>
                                        <span className="mt-2 text-[9px] font-black tracking-wider text-neutral-400 uppercase transition-colors group-hover:text-emerald-500 dark:text-neutral-500">
                                            PUBLIKASI
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Content info */}
                            <div>
                                <h3 className="mb-2 text-left text-base font-extrabold text-neutral-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                    Manajemen Siklus Modul
                                </h3>
                                <p className="text-left text-xs leading-relaxed font-medium text-neutral-500 dark:text-neutral-400">
                                    Buat, tinjau, revisi, dan terbitkan modul pelatihan terpusat dalam satu alur kerja yang seragam.
                                </p>
                            </div>
                        </motion.div>

                        {/* Card 2: Tracking & Validasi Dokumen */}
                        <motion.div
                            whileHover={{ y: -8, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="group flex min-h-[420px] flex-col justify-between rounded-3xl border border-neutral-200/80 bg-white/70 p-8 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-emerald-500/40 hover:shadow-xl dark:border-neutral-900 dark:bg-neutral-900/35 dark:hover:border-emerald-500/30"
                        >
                            {/* Visual Interactive Graphic */}
                            <div className="relative mb-6 flex w-full flex-1 flex-col justify-center overflow-hidden rounded-2xl border border-neutral-200/50 bg-neutral-50/50 p-5 select-none dark:border-neutral-900/60 dark:bg-neutral-950/50">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.02),transparent_65%)]" />

                                {/* Scanning line */}
                                <motion.div
                                    className="absolute right-0 left-0 z-20 h-0.5 bg-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.5)] dark:bg-emerald-400/60"
                                    animate={{
                                        top: ['15%', '85%', '15%'],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                />

                                {/* Upload Target Representation */}
                                <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-200 bg-white/20 p-4 dark:border-neutral-800 dark:bg-neutral-900/10">
                                    <div className="relative z-10 flex w-full max-w-[180px] items-center gap-3 rounded-lg border border-neutral-200/70 bg-white p-2 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                            <FileText className="size-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-[10px] font-bold text-neutral-800 dark:text-neutral-100">
                                                modul_kepatuhan.pdf
                                            </div>
                                            <div className="dark:text-neutral-550 mt-0.5 text-[8px] font-semibold text-neutral-400">
                                                3.8 MB • PDF Dokumen
                                            </div>
                                        </div>
                                        <div className="flex size-5 shrink-0 items-center justify-center rounded-full border border-white bg-emerald-500 text-white shadow-xs dark:border-neutral-900">
                                            <Check className="size-3" />
                                        </div>
                                    </div>

                                    {/* Checked criteria badges */}
                                    <div className="mt-3.5 flex w-full max-w-[180px] items-center justify-between gap-1.5 text-[7px] font-extrabold text-neutral-400 dark:text-neutral-500">
                                        <span className="flex items-center gap-0.5 rounded border border-emerald-500/10 bg-emerald-500/5 px-1.5 py-0.5 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                            ✓ FORMAT
                                        </span>
                                        <span className="flex items-center gap-0.5 rounded border border-emerald-500/10 bg-emerald-500/5 px-1.5 py-0.5 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                            ✓ MATRIKS
                                        </span>
                                        <span className="flex items-center gap-0.5 rounded border border-emerald-500/10 bg-emerald-500/5 px-1.5 py-0.5 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                            ✓ UKURAN
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Content info */}
                            <div>
                                <h3 className="mb-2 text-left text-base font-extrabold text-neutral-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                                    Tracking & Validasi Dokumen
                                </h3>
                                <p className="text-left text-xs leading-relaxed font-medium text-neutral-500 dark:text-neutral-400">
                                    Validasi otomatis format file PDF untuk memastikan kelayakan draf modul sebelum diajukan.
                                </p>
                            </div>
                        </motion.div>

                        {/* Card 3: Notifikasi & Approval Cerdas */}
                        <motion.div
                            whileHover={{ y: -8, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="group flex min-h-[420px] flex-col justify-between rounded-3xl border border-neutral-200/80 bg-white/70 p-8 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-orange-500/40 hover:shadow-xl dark:border-neutral-900 dark:bg-neutral-900/35 dark:hover:border-orange-500/30"
                        >
                            {/* Visual Interactive Graphic */}
                            <div className="relative mb-6 flex w-full flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-neutral-200/50 bg-neutral-50/50 p-4 select-none dark:border-neutral-900/60 dark:bg-neutral-950/50">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.02),transparent_65%)]" />

                                {/* Notification Card Mockup */}
                                <div className="relative z-10 flex w-full max-w-[210px] items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                                    <motion.div
                                        className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                        whileHover={{ rotate: [0, -15, 15, -10, 10, 0] }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Bell className="size-5" />
                                        <span className="absolute top-0.5 right-0.5 size-2 animate-ping rounded-full bg-orange-500" />
                                        <span className="absolute top-0.5 right-0.5 size-2 rounded-full bg-orange-500" />
                                    </motion.div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between text-[8px] font-black tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
                                            <span>PERSETUJUAN BARU</span>
                                            <span>SEKARANG</span>
                                        </div>
                                        <div className="text-neutral-850 mt-1 text-[10px] leading-snug font-bold dark:text-neutral-200">
                                            Modul K3 Konstruksi memerlukan validasi Anda
                                        </div>
                                    </div>
                                </div>

                                {/* Slack / Multi-channel notification badges indicator */}
                                <div className="mt-3 flex items-center gap-1.5 rounded-full border border-neutral-200/50 bg-white/40 px-2 py-1 text-[8px] font-extrabold text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/25 dark:text-neutral-500">
                                    <span>Terkirim via:</span>
                                    <span className="rounded-md bg-blue-500/5 px-1.5 py-0.25 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                                        Email
                                    </span>
                                    <span className="rounded-md bg-orange-500/5 px-1.5 py-0.25 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                                        Sistem
                                    </span>
                                </div>
                            </div>

                            {/* Card Content info */}
                            <div>
                                <h3 className="mb-2 text-left text-base font-extrabold text-neutral-900 transition-colors group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
                                    Notifikasi & Approval Cerdas
                                </h3>
                                <p className="text-left text-xs leading-relaxed font-medium text-neutral-500 dark:text-neutral-400">
                                    Dapatkan pengingat otomatis dan approval real-time demi siklus validasi draf yang lebih responsif.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>{' '}
            <section
                className="relative overflow-hidden border-y border-neutral-200/50 bg-[#F8FBFF]/60 py-24 dark:border-neutral-900/50 dark:bg-neutral-950/20"
                id="fitur"
            >
                {/* Background ambient light */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.02),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.02),transparent_50%)]" />

                <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <span className="mb-2 block text-[10px] font-bold tracking-widest text-blue-600 uppercase dark:text-blue-500">
                            FITUR UTAMA
                        </span>
                        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-neutral-900 lg:text-5xl dark:text-white">
                            Semua yang Anda Butuhkan.
                            <br className="hidden sm:inline" /> Tanpa Kerumitan.
                        </h2>
                        <p className="mx-auto max-w-xl text-xs leading-relaxed font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                            Satu alur kerja terintegrasi untuk mengelola draf modul, berkas, matriks pelatihan, dan notifikasi approval secara instan.
                        </p>
                    </div>

                    {/* Top Row: 3 Columns */}
                    <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* Card 1: Kepatuhan Dokumen */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="group flex min-h-[390px] flex-col justify-between rounded-3xl border border-neutral-200/80 bg-white/70 p-8 backdrop-blur-md transition-all duration-300 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 dark:border-neutral-900 dark:bg-neutral-900/35 dark:hover:border-blue-500/30"
                        >
                            {/* Graphic at top */}
                            <div className="relative mb-6 flex w-full flex-1 flex-col justify-center overflow-hidden rounded-2xl border border-neutral-200/50 bg-neutral-50/50 p-5 select-none dark:border-neutral-900/60 dark:bg-neutral-950/50">
                                <div className="mb-4 flex items-center justify-between text-[10px] font-bold">
                                    <span className="dark:text-neutral-350 tracking-tight text-neutral-500">Status Dokumen</span>
                                    <span className="cursor-pointer text-blue-600 hover:underline dark:text-blue-400">Compliance</span>
                                </div>
                                <div className="mb-4 grid grid-cols-3 gap-2.5 text-center text-[9px] font-bold">
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-emerald-600 shadow-xs dark:border-emerald-500/15 dark:bg-emerald-500/10 dark:text-emerald-400">
                                        <div className="text-xs font-black">65%</div>
                                        <div className="mt-0.5 text-[7px] tracking-wider text-neutral-400 uppercase dark:text-neutral-500">Valid</div>
                                    </div>
                                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-amber-600 shadow-xs dark:border-amber-500/15 dark:bg-amber-500/10 dark:text-amber-400">
                                        <div className="text-xs font-black">82%</div>
                                        <div className="mt-0.5 text-[7px] tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
                                            Review
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 shadow-xs dark:border-rose-500/15 dark:bg-rose-500/10 dark:text-rose-400">
                                        <div className="text-xs font-black">22%</div>
                                        <div className="mt-0.5 text-[7px] tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
                                            Expired
                                        </div>
                                    </div>
                                </div>
                                <div className="text-neutral-550 space-y-2 text-[9px] font-semibold dark:text-neutral-400">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-emerald-500" /> Modul Aktif & Valid
                                        </span>
                                        <span className="font-extrabold text-neutral-900 dark:text-white">65 Modul</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-amber-500" /> Modul Dalam Review
                                        </span>
                                        <span className="font-extrabold text-neutral-900 dark:text-white">48 Modul</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-rose-500" /> Modul Expired
                                        </span>
                                        <span className="font-extrabold text-neutral-900 dark:text-white">15 Modul</span>
                                    </div>
                                </div>
                                {/* Unique SVG wave graph representing growth */}
                                <svg
                                    viewBox="0 0 100 25"
                                    className="stroke-round mt-4 h-8 w-full fill-none stroke-current stroke-2 text-blue-500/80 dark:text-blue-500"
                                >
                                    <path d="M0,20 C15,10 25,23 40,8 C55,-7 70,18 100,2" />
                                    <path d="M0,20 C15,10 25,23 40,8 C55,-7 70,18 100,2" className="opacity-30 blur-[2px]" />
                                </svg>
                            </div>
                            {/* Text below */}
                            <div>
                                <h3 className="mb-2 text-base font-extrabold text-neutral-900 dark:text-white">Kepatuhan Dokumen</h3>
                                <p className="dark:text-neutral-450 text-xs leading-relaxed text-neutral-500">
                                    Pantau status kepatuhan, keaktifan draf, validasi berkas, dan modul kedaluwarsa secara visual real-time.
                                </p>
                            </div>
                        </motion.div>

                        {/* Card 2: Kelola Real-Time (Mobile Phone Mockup) */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="group flex min-h-[380px] flex-col justify-between rounded-3xl border border-neutral-200/80 bg-white/70 p-8 backdrop-blur-md transition-all duration-300 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 dark:border-neutral-900 dark:bg-neutral-900/35 dark:hover:border-blue-500/30"
                        >
                            {/* Graphic at top */}
                            <div className="relative mb-6 flex w-full flex-1 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200/50 bg-neutral-50/50 p-4 dark:border-neutral-900/60 dark:bg-neutral-950/50">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_60%)]" />
                                {/* Phone container */}
                                <div className="relative z-10 flex h-44 w-28 flex-col gap-1.5 rounded-2xl border-[3px] border-neutral-200 bg-neutral-100 p-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                                    {/* Notch */}
                                    <div className="mx-auto mb-0.5 h-2 w-10 rounded-full bg-neutral-300 dark:bg-black" />
                                    {/* Mini cards */}
                                    <div className="dark:border-neutral-750/30 space-y-1 rounded-md border border-neutral-200 bg-white p-1.5 text-[6px] font-bold text-neutral-500 dark:bg-neutral-800/60 dark:text-neutral-400">
                                        <div className="flex items-center justify-between text-[5px]">
                                            <span className="text-neutral-850 font-black dark:text-white">Detail Modul</span>
                                            <span>📄</span>
                                        </div>
                                        <div className="flex h-8 w-full flex-col justify-between rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 p-1 text-white shadow-sm shadow-blue-500/20">
                                            <span className="truncate text-[5.5px] leading-none font-black">Draf Modul K3</span>
                                            <div className="flex items-end justify-between">
                                                <span className="text-[4px] opacity-80">v2.1 • Oleh Rian</span>
                                                <span className="rounded bg-white/25 px-1 py-0.25 text-[3.5px] font-semibold text-white">Review</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Mini list items */}
                                    <div className="dark:text-neutral-455 space-y-1 text-[5px] text-neutral-500">
                                        <span className="ml-0.5 font-extrabold text-neutral-800 dark:text-white">Aktivitas Terakhir</span>
                                        <div className="dark:border-neutral-850/10 flex justify-between rounded border border-neutral-200/80 bg-white px-1 py-0.5 dark:bg-neutral-800/40">
                                            <span>Modul ISO 9001</span>
                                            <span className="font-extrabold text-emerald-500">Selesai</span>
                                        </div>
                                        <div className="dark:border-neutral-850/10 flex justify-between rounded border border-neutral-200/80 bg-white px-1 py-0.5 dark:bg-neutral-800/40">
                                            <span>Modul Finansial</span>
                                            <span className="font-extrabold text-amber-500">Revisi</span>
                                        </div>
                                    </div>
                                    {/* Glowing fingerprint overlay */}
                                    <div className="pointer-events-none absolute bottom-2 left-1/2 flex size-8 -translate-x-1/2 animate-pulse items-center justify-center rounded-full border border-blue-500/30 bg-blue-600/10 text-blue-600 dark:border-blue-500/50 dark:bg-blue-600/20 dark:text-blue-400">
                                        <ShieldCheck className="size-3.5" />
                                    </div>
                                </div>
                            </div>
                            {/* Text below */}
                            <div>
                                <h3 className="mb-2 text-base font-extrabold text-neutral-900 dark:text-white">Akses Mobile Real-Time</h3>
                                <p className="text-neutral-550 dark:text-neutral-450 text-xs leading-relaxed">
                                    Akses dan setujui draf modul kapan saja dan di mana saja langsung dari perangkat seluler Anda.
                                </p>
                            </div>
                        </motion.div>

                        {/* Card 3: Notifikasi & Review Cerdas (Alert Feed) */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="group flex min-h-[380px] flex-col justify-between rounded-3xl border border-neutral-200/80 bg-white/70 p-8 backdrop-blur-md transition-all duration-300 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 dark:border-neutral-900 dark:bg-neutral-900/35 dark:hover:border-blue-500/30"
                        >
                            {/* Graphic at top */}
                            <div className="relative mb-6 flex w-full flex-1 flex-col justify-center gap-3 overflow-hidden rounded-2xl border border-neutral-200/50 bg-neutral-50/50 p-4 dark:border-neutral-900/60 dark:bg-neutral-950/50">
                                {/* Alert 1 */}
                                <div className="dark:border-neutral-855 relative flex flex-col gap-2 overflow-hidden rounded-xl border border-neutral-200 bg-white p-3 shadow-md dark:bg-neutral-900">
                                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-blue-500" />
                                    <div className="flex items-center justify-between pl-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex size-3.5 items-center justify-center rounded-full bg-blue-600/10 text-[7px] font-extrabold text-blue-600 dark:text-blue-400">
                                                M
                                            </div>
                                            <span className="text-[7.5px] font-bold text-neutral-900 dark:text-white">
                                                Monica S. mengajukan Modul
                                            </span>
                                        </div>
                                        <span className="text-neutral-450 text-[6.5px] font-semibold dark:text-neutral-500">15m lalu</span>
                                    </div>
                                    <div className="pl-1.5 text-[7px] font-medium text-neutral-500 dark:text-neutral-400">
                                        Tipe dokumen: <span className="font-semibold text-neutral-800 dark:text-white">Draf Modul K3 v1.0</span>
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-1.5 pl-1.5">
                                        <button className="cursor-pointer rounded bg-blue-600 px-2 py-0.5 text-[6.5px] font-extrabold text-white shadow-xs transition-all hover:bg-blue-700">
                                            Setujui
                                        </button>
                                        <button className="text-neutral-550 dark:hover:bg-neutral-850 cursor-pointer rounded border border-neutral-200 px-2 py-0.5 text-[6.5px] font-extrabold transition-all hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400">
                                            Tolak
                                        </button>
                                        <button className="cursor-pointer rounded border border-blue-200 px-2 py-0.5 text-[6.5px] font-extrabold text-blue-600 transition-all hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20">
                                            Revisi
                                        </button>
                                    </div>
                                </div>
                                {/* Alert 2 */}
                                <div className="dark:border-neutral-850/40 dark:text-neutral-450 flex items-center justify-between rounded-xl border border-neutral-200/60 bg-white/80 p-2.5 text-[7px] text-neutral-500 opacity-60 dark:bg-neutral-900/40">
                                    <span className="flex items-center gap-1.5">
                                        <Check className="size-3 text-emerald-500" />
                                        <span>Modul Keuangan disetujui</span>
                                    </span>
                                    <span>2j lalu</span>
                                </div>
                            </div>
                            {/* Text below */}
                            <div>
                                <h3 className="mb-2 text-base font-extrabold text-neutral-900 dark:text-white">Notifikasi & Approval</h3>
                                <p className="text-neutral-550 dark:text-neutral-450 text-xs leading-relaxed">
                                    Dapatkan pemberitahuan instan via email atau Slack untuk setiap draf modul yang membutuhkan review.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom Row: 2 Columns */}
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {/* Card 4: Integrasi Database & Cloud */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="group flex min-h-[360px] flex-col justify-between rounded-3xl border border-neutral-200/80 bg-white/70 p-8 backdrop-blur-md transition-all duration-300 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 dark:border-neutral-900 dark:bg-neutral-900/35 dark:hover:border-blue-500/30"
                        >
                            {/* Graphic at top */}
                            <div className="relative mb-6 flex w-full flex-1 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200/50 bg-neutral-50/50 bg-[radial-gradient(#00000008_1px,transparent_1px)] bg-[size:16px_16px] p-6 dark:border-neutral-900/60 dark:bg-neutral-950/50 dark:bg-[radial-gradient(#ffffff04_1px,transparent_1px)]">
                                {/* Connecting network SVG lines */}
                                <svg
                                    className="dark:text-neutral-850/60 absolute inset-0 h-full w-full text-neutral-200/80"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                                    <line x1="80%" y1="20%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                                    <line x1="20%" y1="80%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                                    <line x1="80%" y1="80%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                                    <line x1="50%" y1="12%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                                    <line x1="10%" y1="50%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                                    <line x1="90%" y1="50%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                                </svg>

                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03),transparent_50%)]" />
                                <div className="relative h-full min-h-[160px] w-full">
                                    {/* Center Node */}
                                    <div className="absolute top-[calc(50%-20px)] left-[calc(50%-20px)] z-20 flex size-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/20 transition-transform duration-300 group-hover:scale-105">
                                        <Database className="size-5" />
                                        <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
                                    </div>

                                    {/* App Nodes */}
                                    <div className="absolute top-[10%] left-[12%] flex size-8 items-center justify-center rounded-xl border border-neutral-200 bg-white text-blue-500 shadow-sm transition-transform hover:scale-110 dark:border-neutral-800 dark:bg-neutral-900">
                                        <Database className="size-4" />
                                    </div>
                                    <div className="absolute top-[10%] right-[12%] flex size-8 items-center justify-center rounded-xl border border-neutral-200 bg-white text-sky-400 shadow-sm transition-transform hover:scale-110 dark:border-neutral-800 dark:bg-neutral-900">
                                        <UploadCloud className="size-4" />
                                    </div>
                                    <div className="absolute bottom-[10%] left-[12%] flex size-8 items-center justify-center rounded-xl border border-neutral-200 bg-white text-green-500 shadow-sm transition-transform hover:scale-110 dark:border-neutral-800 dark:bg-neutral-900">
                                        <FileText className="size-4" />
                                    </div>
                                    <div className="absolute right-[12%] bottom-[10%] flex size-8 items-center justify-center rounded-xl border border-neutral-200 bg-white text-red-500 shadow-sm transition-transform hover:scale-110 dark:border-neutral-800 dark:bg-neutral-900">
                                        <Archive className="size-4" />
                                    </div>
                                    <div className="absolute top-[6%] left-[calc(50%-16px)] flex size-8 items-center justify-center rounded-xl border border-neutral-200 bg-white text-orange-500 shadow-sm transition-transform hover:scale-110 dark:border-neutral-800 dark:bg-neutral-900">
                                        <Server className="size-4" />
                                    </div>
                                    <div className="absolute top-[calc(50%-16px)] left-[4%] flex size-8 items-center justify-center rounded-xl border border-neutral-200 bg-white text-purple-500 shadow-sm transition-transform hover:scale-110 dark:border-neutral-800 dark:bg-neutral-900">
                                        <Users className="size-4" />
                                    </div>
                                    <div className="absolute top-[calc(50%-16px)] right-[4%] flex size-8 items-center justify-center rounded-xl border border-neutral-200 bg-white text-indigo-400 shadow-sm transition-transform hover:scale-110 dark:border-neutral-800 dark:bg-neutral-900">
                                        <Send className="size-4" />
                                    </div>
                                </div>
                            </div>
                            {/* Text below */}
                            <div>
                                <h3 className="mb-2 text-base font-extrabold text-neutral-900 dark:text-white">Integrasi Database & Cloud</h3>
                                <p className="text-neutral-550 dark:text-neutral-455 text-xs leading-relaxed">
                                    Sinkronisasi modul otomatis dengan Google Drive, OneDrive, dan server lokal internal perusahaan untuk penyimpanan
                                    yang aman.
                                </p>
                            </div>
                        </motion.div>

                        {/* Card 5: Kendali Pintar & Pintasan (Shortcut command palette) */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="group flex min-h-[360px] flex-col justify-between rounded-3xl border border-neutral-200/80 bg-white/70 p-8 backdrop-blur-md transition-all duration-300 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 dark:border-neutral-900 dark:bg-neutral-900/35 dark:hover:border-blue-500/30"
                        >
                            {/* Graphic at top */}
                            <div className="relative mb-6 flex w-full flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-neutral-200/50 bg-neutral-50/50 p-5 dark:border-neutral-900/60 dark:bg-neutral-950/50">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03),transparent_50%)]" />
                                {/* Command Menu */}
                                <div className="dark:border-neutral-850 relative z-10 flex w-56 scale-[0.95] flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-3 text-[7.5px] text-neutral-800 shadow-xl select-none dark:bg-neutral-900 dark:text-neutral-200">
                                    <div className="text-neutral-450 pl-1 font-semibold dark:text-neutral-500">Cari perintah atau modul...</div>
                                    <hr className="border-neutral-100 dark:border-neutral-800" />
                                    <div className="flex flex-col gap-1 font-semibold text-neutral-500 dark:text-neutral-400">
                                        <div className="flex cursor-pointer items-center justify-between rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                            <span className="flex items-center gap-1">
                                                📂 <span>Lihat draf aktif</span>
                                            </span>
                                            <span className="rounded border border-neutral-200 bg-neutral-50 px-1 py-0.5 text-[6.5px] text-neutral-400 dark:border-neutral-800 dark:bg-neutral-950">
                                                ⌘ K
                                            </span>
                                        </div>
                                        <div className="flex cursor-pointer items-center justify-between rounded bg-neutral-50 p-1 font-bold text-neutral-950 hover:bg-neutral-100 dark:bg-neutral-800/30 dark:text-white dark:hover:bg-neutral-800">
                                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                                📊 <span>Review matriks kompetensi</span>
                                            </span>
                                            <span className="dark:border-neutral-850 rounded border border-blue-200 bg-blue-50 px-1 py-0.5 text-[6.5px] text-blue-500 dark:bg-neutral-950">
                                                ⌘ M
                                            </span>
                                        </div>
                                        <div className="flex cursor-pointer items-center justify-between rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                            <span className="flex items-center gap-1">
                                                ➕ <span>Ajukan modul baru</span>
                                            </span>
                                            <span className="rounded border border-neutral-200 bg-neutral-50 px-1 py-0.5 text-[6.5px] text-neutral-400 dark:border-neutral-800 dark:bg-neutral-950">
                                                ⌘ N
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* Key Caps display */}
                                <div className="relative z-10 mt-3.5 flex scale-[0.85] items-center gap-1.5">
                                    <div className="border-neutral-250 border-b-neutral-350 rounded-lg border border-b-[3px] bg-neutral-50 px-2.5 py-1.5 text-[8px] font-black text-neutral-500 shadow-sm dark:border-neutral-800 dark:border-b-neutral-950 dark:bg-neutral-900 dark:text-neutral-400">
                                        Ctrl
                                    </div>
                                    <div className="border-neutral-250 border-b-neutral-350 rounded-lg border border-b-[3px] bg-neutral-50 px-2.5 py-1.5 text-[8px] font-black text-neutral-500 shadow-sm dark:border-neutral-800 dark:border-b-neutral-950 dark:bg-neutral-900 dark:text-neutral-400">
                                        ⌘
                                    </div>
                                    <div className="animate-pulse rounded-lg border border-b-[3px] border-blue-500 border-b-blue-700 bg-blue-600 px-2.5 py-1.5 text-[8px] font-black text-white shadow-md shadow-blue-500/20">
                                        K
                                    </div>
                                </div>
                            </div>
                            {/* Text below */}
                            <div>
                                <h3 className="mb-2 text-base font-extrabold text-neutral-900 dark:text-white">Kendali Penuh di Tangan Anda</h3>
                                <p className="text-neutral-550 dark:text-neutral-455 text-xs leading-relaxed">
                                    Navigasi secepat kilat dengan pencarian pintar global dan pintasan keyboard untuk menghemat waktu operasional
                                    Anda.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
            <section
                className="relative overflow-hidden bg-gradient-to-b from-[#EBF3FF] to-white py-24 dark:from-[#0b2045] dark:to-[#09090b]"
                id="alur-kerja"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.04),transparent_50%)]" />
                <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12 lg:px-8">
                    <div className="group order-2 mx-auto w-full max-w-md transition-transform duration-300 lg:order-1 lg:col-span-6">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/5" />
                            <TrainingFlowBeam />
                        </div>
                    </div>
                    <div className="order-1 flex flex-col justify-center text-center lg:order-2 lg:col-span-6 lg:text-left">
                        <motion.h2
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="mb-4 text-3xl leading-tight font-extrabold tracking-tight text-neutral-900 sm:text-4xl dark:text-white"
                        >
                            Kendalikan Alur Modul Pelatihan dengan Lebih Mudah
                        </motion.h2>
                        <p className="text-neutral-550 mx-auto mb-8 max-w-xl text-sm leading-relaxed font-medium sm:text-base lg:mx-0 dark:text-neutral-400">
                            Automasi proses review, approval, dan pengingat revisi agar tidak ada yang terlewat dan semua pihak selalu selaras.
                        </p>
                        <div>
                            <button
                                onClick={() => {
                                    setAuthModalMode('register');
                                    setAuthModalOpen(true);
                                }}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] hover:bg-blue-700"
                            >
                                Mulai Sekarang
                                <ArrowRight className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <section className="relative overflow-hidden bg-white py-20 dark:bg-[#09090b]">
                <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-10 text-center shadow-2xl md:flex-row md:text-left lg:p-14 dark:from-blue-900 dark:via-indigo-950 dark:to-blue-900">
                        <div className="pointer-events-none absolute -top-10 -right-10 size-64 rounded-full bg-white/5 blur-3xl" />
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="mb-4 text-3xl leading-tight font-extrabold tracking-tight text-white">
                                Siap Menyederhanakan Pengelolaan Modul Anda?
                            </h2>
                            <p className="text-xs leading-relaxed font-semibold text-blue-100/90 sm:text-sm">
                                Bergabunglah dengan departemen People Development modern yang mengotomasi operasional draf modul mereka bersama
                                TrainingPD.
                            </p>
                        </div>
                        <div className="relative z-10 flex shrink-0 items-center gap-4">
                            <button
                                onClick={() => {
                                    setAuthModalMode('login');
                                    setAuthModalOpen(true);
                                }}
                                className="cursor-pointer rounded-xl bg-white px-6 py-3.5 text-xs font-bold text-blue-600 shadow-md transition-all hover:scale-[1.02] hover:bg-neutral-100"
                            >
                                Masuk
                            </button>
                            <button
                                onClick={() => {
                                    setAuthModalMode('register');
                                    setAuthModalOpen(true);
                                }}
                                className="cursor-pointer rounded-xl bg-[#020617] px-6 py-3.5 text-xs font-bold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-[#0f172a]"
                            >
                                Mulai Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <footer className="relative overflow-hidden border-t border-neutral-200/30 bg-gradient-to-b from-neutral-50/30 to-neutral-100/50 py-16 dark:border-neutral-900/30 dark:from-[#09090b]/40 dark:to-[#020205]">
                {/* Visual glow element at the top edge of footer */}
                <div className="absolute top-0 left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

                <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 text-center md:grid-cols-4 md:text-left lg:px-8">
                    <div className="col-span-1">
                        <Link href="/" className="group mb-5 flex shrink-0 items-center justify-center gap-2.5 md:justify-start">
                            <motion.div
                                className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white"
                                whileHover={{ scale: 1.05, rotate: -5 }}
                            >
                                T
                            </motion.div>
                            <span className="text-lg font-extrabold tracking-tight text-neutral-900 dark:text-white">TrainingPD</span>
                        </Link>
                        <p className="mx-auto max-w-xs text-xs leading-relaxed font-medium text-neutral-500 md:mx-0 dark:text-neutral-400">
                            Platform terintegrasi untuk mengelola draf modul pelatihan, approval, revisi, dan penyimpanan dokumen perusahaan.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-extrabold tracking-widest text-neutral-900 uppercase dark:text-white">Produk</h4>
                        <ul className="flex flex-col space-y-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            <li>
                                <a
                                    href="#fitur"
                                    className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Pengajuan Modul
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#alur-kerja"
                                    className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Approval & Review
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#fitur"
                                    className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Database Modul
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-extrabold tracking-widest text-neutral-900 uppercase dark:text-white">Solusi</h4>
                        <ul className="flex flex-col space-y-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            <li>
                                <a
                                    href="#solusi"
                                    className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Google Drive Integrasi
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#solusi"
                                    className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Kepatuhan Dokumen
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#solusi"
                                    className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Audit & Aktivitas
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col items-center space-y-4 md:items-start">
                        <h4 className="text-xs font-extrabold tracking-widest text-neutral-900 uppercase dark:text-white">Hubungi Kami</h4>
                        <div className="space-y-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            <p>People Development Department</p>
                            <div className="pt-0.5">
                                <a
                                    href="mailto:pd@trainingpd.com"
                                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/10 bg-blue-500/5 px-3 py-1.5 font-bold text-blue-600 shadow-xs transition-all hover:scale-[1.02] hover:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400"
                                >
                                    <span>pd@trainingpd.com</span>
                                    <ArrowUpRight className="size-3" />
                                </a>
                            </div>
                        </div>

                        {/* Pulse Operational Status Badge */}
                        <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                            </span>
                            <span>PD Desk Active</span>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                            <a
                                href="https://github.com"
                                target="_blank"
                                className="flex size-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 shadow-xs transition-all hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-blue-600 dark:border-neutral-800"
                            >
                                <Github className="size-4" />
                            </a>
                            <a
                                href="#"
                                className="flex size-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 shadow-xs transition-all hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-blue-600 dark:border-neutral-800"
                            >
                                <Users className="size-4" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-6 border-t border-neutral-200/50 px-6 pt-8 text-center sm:flex-row lg:px-8 dark:border-neutral-800">
                    <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500">&copy; 2026 TrainingPD. Semua hak dilindungi.</p>
                    <div className="flex items-center gap-6 text-[10px] font-bold text-neutral-400 dark:text-neutral-500">
                        <a href="#" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                            Kebijakan Privasi
                        </a>
                        <a href="#" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                            Syarat & Ketentuan
                        </a>
                    </div>
                </div>
            </footer>
            <Dialog
                open={authModalOpen}
                onOpenChange={(open) => {
                    if (!open) setAuthModalOpen(false);
                }}
            >
                <DialogContent className="p-6 sm:max-w-[420px]">
                    <DialogHeader className="flex flex-col items-center text-center">
                        <div className="mb-3 flex items-center justify-center">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-600/30">
                                T
                            </div>
                        </div>
                        <DialogTitle className="text-xl font-extrabold tracking-tight">
                            {authModalMode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Demo Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground mt-1 text-xs font-medium">
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
    [key: string]: string | boolean;
    email: string;
    password: string;
    remember: boolean;
}

interface RegisterForm {
    [key: string]: string;
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
                    <Label htmlFor="modal-email" className="ml-1 text-xs font-semibold">
                        Alamat Email
                    </Label>
                    <div className="relative">
                        <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
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
                    <Label htmlFor="modal-password" className="ml-1 text-xs font-semibold">
                        Kata Sandi
                    </Label>
                    <div className="relative">
                        <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                        <Input
                            id="modal-password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="pr-10 pl-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
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
                        <Checkbox id="modal-remember" checked={data.remember} onCheckedChange={(checked) => setData('remember', checked === true)} />
                        <Label htmlFor="modal-remember" className="cursor-pointer text-xs font-medium select-none">
                            Ingat saya
                        </Label>
                    </div>
                    <a
                        href={route('password.request')}
                        className="hover:text-blue-550 text-xs font-semibold text-blue-600 transition-colors dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Lupa kata sandi?
                    </a>
                </div>

                {/* Submit */}
                <Button type="submit" disabled={processing} className="w-full cursor-pointer font-bold">
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <span>Masuk Sekarang</span>
                </Button>
            </div>

            <div className="text-muted-foreground border-t pt-3 text-center text-xs font-medium">
                Belum memiliki akun?{' '}
                <button
                    type="button"
                    onClick={onSwitch}
                    className="cursor-pointer font-bold text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
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
                    <Label htmlFor="modal-name" className="ml-1 text-xs font-semibold">
                        Nama Lengkap
                    </Label>
                    <div className="relative">
                        <User className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
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
                    <Label htmlFor="modal-reg-email" className="ml-1 text-xs font-semibold">
                        Alamat Email
                    </Label>
                    <div className="relative">
                        <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
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
                    <Label htmlFor="modal-reg-password" className="ml-1 text-xs font-semibold">
                        Kata Sandi
                    </Label>
                    <div className="relative">
                        <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                        <Input
                            id="modal-reg-password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="••••••••"
                            className="pr-10 pl-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                {/* Confirm Password */}
                <div className="grid gap-1.5">
                    <Label htmlFor="modal-reg-confirm" className="ml-1 text-xs font-semibold">
                        Konfirmasi Kata Sandi
                    </Label>
                    <div className="relative">
                        <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                        <Input
                            id="modal-reg-confirm"
                            type={showConfirm ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="••••••••"
                            className="pr-10 pl-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                            tabIndex={-1}
                        >
                            {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password_confirmation} />
                </div>

                <Button type="submit" disabled={processing} className="mt-1 w-full cursor-pointer font-bold">
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <span>Daftar Akun</span>
                </Button>
            </div>

            <div className="text-muted-foreground border-t pt-3 text-center text-xs font-medium">
                Sudah memiliki akun?{' '}
                <button
                    type="button"
                    onClick={onSwitch}
                    className="cursor-pointer font-bold text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    Masuk
                </button>
            </div>
        </form>
    );
}
