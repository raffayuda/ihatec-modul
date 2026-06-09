import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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

const testimonials = [
    {
        quote: "Pengelolaan modul pelatihan kini jauh lebih cepat dan terstruktur. Semua pengajuan dan revisi terpantau secara real-time.",
        author: "Budi Santoso",
        role: "Manager PD di IHATEC"
    },
    {
        quote: "Sistem approval berjenjang sangat membantu kami memastikan standar materi tetap terjaga tanpa birokrasi yang rumit.",
        author: "Siti Rahma",
        role: "Validator Kurikulum"
    },
    {
        quote: "Mencari modul versi terbaru sangat mudah berkat integrasi Google Drive. Tidak ada lagi dokumen yang tertukar.",
        author: "Rian Hidayat",
        role: "Instruktur Pelatihan"
    }
];

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    const { name } = usePage<SharedData>().props;
    const [activeIdx, setActiveIdx] = useState(0);

    const handlePrev = () => {
        setActiveIdx((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIdx((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    };

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

                    {/* Bottom: Decortive Mock Social Logins */}
                    <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-neutral-500">
                        <span>© 2026 TrainingPD. All rights reserved.</span>
                        <div className="flex items-center gap-3">
                            <button className="size-8.5 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer">
                                <svg className="size-4.5 text-[#EA4335]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                </svg>
                            </button>
                            <button className="size-8.5 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer">
                                <svg className="size-4.5 text-[#24292F]" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.523-10-10-10z" />
                                </svg>
                            </button>
                            <button className="size-8.5 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer">
                                <svg className="size-4.5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Interactive Testimonial & Overlapping Card */}
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
                            Apa Kata Pengguna Kami.
                        </h3>
                        
                        {/* Huge double quote mark */}
                        <div className="text-4xl font-serif text-blue-400 select-none leading-none">
                            “
                        </div>

                        {/* Testimonial Quote */}
                        <div className="min-h-[120px] relative">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={activeIdx}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-sm text-neutral-300 leading-relaxed font-medium"
                                >
                                    {testimonials[activeIdx].quote}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                        
                        {/* Author info */}
                        <div className="space-y-0.5">
                            <AnimatePresence mode="wait">
                                <motion.h4
                                    key={activeIdx + '-author'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-sm font-bold text-white"
                                >
                                    {testimonials[activeIdx].author}
                                </motion.h4>
                            </AnimatePresence>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={activeIdx + '-role'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.5 }}
                                    exit={{ opacity: 0 }}
                                    className="text-[11px] text-neutral-400 font-semibold"
                                >
                                    {testimonials[activeIdx].role}
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
                        
                        {/* Stacked avatars */}
                        <div className="flex items-center -space-x-1.5 pt-1.5">
                            <div className="size-5.5 rounded-full border border-white bg-neutral-200 overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face" alt="User 1" className="size-full object-cover" />
                            </div>
                            <div className="size-5.5 rounded-full border border-white bg-neutral-300 overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face" alt="User 2" className="size-full object-cover" />
                            </div>
                            <div className="size-5.5 rounded-full border border-white bg-neutral-400 overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face" alt="User 3" className="size-full object-cover" />
                            </div>
                            <div className="size-5.5 rounded-full border border-white bg-neutral-900 flex items-center justify-center text-[8px] font-bold text-white">
                                +2
                            </div>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}
