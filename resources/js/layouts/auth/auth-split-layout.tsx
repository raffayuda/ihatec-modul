import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, FileText, Database, Cloud, Settings } from 'lucide-react';
import React, { useState } from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

const CustomMockupLogo = () => (
    <div className="flex items-center justify-center shrink-0">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="16" width="6" height="14" rx="3" transform="rotate(-45 6 16)" fill="#3B82F6" />
            <rect x="14" y="8" width="6" height="16" rx="3" transform="rotate(-45 14 8)" fill="#FFFFFF" />
            <circle cx="26" cy="8" r="3.5" fill="#FB923C" />
        </svg>
    </div>
);

const features = [
    {
        title: "Permintaan Modul Khusus",
        description: "Ajukan dan pantau permintaan modul/program pelatihan baru dengan mudah melalui form terstruktur.",
        icon: FileText
    },
    {
        title: "Database Modul & Program",
        description: "Kelola database modul dan program pelatihan secara terpusat lengkap dengan pelacakan kode revisi.",
        icon: Database
    },
    {
        title: "Integrasi Google Drive",
        description: "Penyimpanan otomatis file modul pelatihan secara aman dan terorganisir ke akun Google Drive Anda.",
        icon: Cloud
    },
    {
        title: "Manajemen Master Data",
        description: "Kelola data referensi seperti kode pelatihan, bahasa pengantar, dan tipe sertifikat secara terpusat.",
        icon: Settings
    }
];

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    const { name } = usePage<SharedData>().props;
    const [activeIdx, setActiveIdx] = useState(0);

    const handlePrev = () => {
        setActiveIdx((prev) => (prev === 0 ? features.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIdx((prev) => (prev === features.length - 1 ? 0 : prev + 1));
    };

    const FeatureIcon = features[activeIdx].icon;

    return (
        <div className="relative min-h-screen w-screen flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans overflow-x-hidden bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-[#1e1b4b]">
            
            {/* Colorful Mesh Gradients in the Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Neon blur blobs */}
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#0865F2]/25 blur-[120px]" />
                <div className="absolute top-[40%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[#3A8DFF]/20 blur-[130px]" />
                <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-500/15 blur-[120px]" />
                
                {/* Diagonal grid lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            {/* The Main Container Card */}
            <div className="relative z-10 w-full max-w-5xl bg-[#11131a]/85 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl p-6 md:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 overflow-visible">
                
                {/* Left Side: Form Container */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-8 min-h-[460px]">
                    {/* Header Branding */}
                    <div className="flex items-center gap-3">
                        <Link href={route('home')} className="flex items-center gap-2.5 group">
                            <CustomMockupLogo />
                            <span className="text-xl font-extrabold tracking-tight text-white group-hover:opacity-90 transition-opacity">
                                {name || 'TrainingPD'}
                            </span>
                        </Link>
                    </div>

                    {/* Middle Section: Title, Description, and children forms */}
                    <div className="space-y-6 my-auto">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black tracking-tight text-white">{title}</h1>
                            <p className="text-sm text-neutral-400 font-medium">{description}</p>
                        </div>

                        {/* Forms Children Slot */}
                        <div className="w-full">
                            {children}
                        </div>
                    </div>

                    {/* Bottom footer with copyright, centered */}
                    <div className="pt-6 border-t border-white/5 flex items-center justify-center text-xs font-semibold text-neutral-500">
                        <span>© 2026 TrainingPD. All rights reserved.</span>
                    </div>
                </div>

                {/* Right Side: Interactive Features & Overlapping Card */}
                <div className="lg:col-span-5 hidden lg:flex flex-col justify-between p-8 bg-[#07080a] border border-white/5 rounded-3xl relative overflow-visible h-[480px] w-full max-w-[380px] justify-self-end shadow-2xl">
                    
                    {/* Background Ambient SVG Star Shape */}
                    <div className="absolute right-0 bottom-4 w-56 h-56 text-blue-500/10 pointer-events-none z-0 select-none">
                        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full animate-[spin_120s_linear_infinite]">
                            <path d="M50 0 L52 35 L85 15 L58 42 L100 50 L58 58 L85 85 L42 58 L50 100 L58 58 L15 85 L42 42 L0 50 L42 58 L15 15 L35 52 Z" />
                        </svg>
                    </div>

                    {/* Content Layer */}
                    <div className="relative z-10 space-y-6">
                        <h3 className="text-xl font-bold tracking-tight text-white leading-tight">
                            Fitur Utama Aplikasi
                        </h3>
                        
                        {/* Feature Icon */}
                        <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 filter drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                            <FeatureIcon className="size-6" />
                        </div>

                        {/* Feature Detail */}
                        <div className="min-h-[120px] relative">
                            <AnimatePresence mode="wait">
                                <motion.h4
                                    key={activeIdx + '-title'}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-base font-bold text-white"
                                >
                                    {features[activeIdx].title}
                                </motion.h4>
                            </AnimatePresence>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={activeIdx + '-desc'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: 0.1, duration: 0.3 }}
                                    className="text-xs text-neutral-400 mt-2.5 leading-relaxed font-medium"
                                >
                                    {features[activeIdx].description}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="relative z-10 flex items-center gap-3">
                        <button 
                            onClick={handlePrev}
                            className="size-9 rounded-lg bg-[#f07b71] hover:bg-[#e06b61] text-white flex items-center justify-center transition-colors shadow-md shadow-[#f07b71]/20 cursor-pointer"
                        >
                            <ArrowLeft className="size-4" />
                        </button>
                        <button 
                            onClick={handleNext}
                            className="size-9 rounded-lg bg-[#0e4835] hover:bg-[#0a3a2a] text-[#10B981] flex items-center justify-center transition-colors shadow-md shadow-[#0e4835]/20 cursor-pointer"
                        >
                            <ArrowRight className="size-4" />
                        </button>
                    </div>

                    {/* Overlapping White Badge at the Bottom Right corner */}
                    <div className="absolute -bottom-6 -right-6 bg-white text-[#0f172a] p-5 rounded-2xl max-w-[230px] shadow-2xl border border-neutral-100/50 flex flex-col gap-2 z-20 hover:scale-[1.02] transition-transform">
                        <h5 className="text-[11px] font-extrabold leading-snug tracking-tight text-neutral-900">
                            Kelola kurikulum & modul dalam satu platform
                        </h5>
                        <p className="text-[9px] font-semibold text-neutral-500 leading-normal">
                            Mulai langkah transformasi digital manajemen pelatihan organisasi Anda sekarang.
                        </p>
                        
                        {/* Status Indicator instead of stacked avatars */}
                        <div className="flex items-center gap-1.5 pt-1.5">
                            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Sistem Terintegrasi</span>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}
