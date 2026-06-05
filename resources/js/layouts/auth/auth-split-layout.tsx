import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp } from 'lucide-react';
import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

const CubeIcon = ({ className = "size-8" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#357ae8" />
        <path d="M2 17L12 22V12L2 7V17Z" fill="#1b52ca" />
        <path d="M22 17L12 22V12L22 7V17Z" fill="#4d8cf4" />
    </svg>
);

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-screen w-screen grid-cols-1 overflow-hidden lg:grid-cols-12 font-['Outfit',sans-serif] bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200">
            
            {/* Left side panel (hidden on mobile, span 5 cols) */}
            <div className="relative hidden h-full flex-col justify-between p-10 text-white lg:col-span-5 lg:flex bg-gradient-to-br from-blue-950 via-slate-900 to-zinc-950 overflow-hidden border-r border-neutral-200/10 dark:border-neutral-900/50">
                {/* Visual Ambient Glows */}
                <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

                {/* Top header branding */}
                <Link href={route('home')} className="relative z-20 flex items-center gap-3 group">
                    <CubeIcon className="size-8 transition-transform duration-300 group-hover:rotate-12" />
                    <span className="text-xl font-bold tracking-tight text-white">
                        {name || 'Training PD'}
                    </span>
                </Link>

                {/* Center Content: Impact Card & Highlights */}
                <div className="relative z-20 my-auto max-w-md space-y-8">
                    <div className="space-y-4">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                            Matriks & Kurikulum
                        </span>
                        <h2 className="text-2xl font-black text-white leading-snug">
                            Solusi Cerdas Pengelolaan Modul Pelatihan Organisasi Anda
                        </h2>
                        <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                            Training PD membantu menyederhanakan alur pengajuan, peninjauan, dan pengesahan draf modul agar terdokumentasi rapi dan terukur secara otomatis.
                        </p>
                    </div>

                    {/* Glassmorphic Value Highlights */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl space-y-4">
                        <div className="flex gap-3.5">
                            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 flex-shrink-0">
                                <TrendingUp className="size-4.5" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-xs font-bold text-neutral-100">Persetujuan 10x Lebih Cepat</h4>
                                <p className="text-[10px] text-neutral-450 leading-relaxed font-semibold">Alur review terstruktur memangkas birokrasi manual secara signifikan.</p>
                            </div>
                        </div>

                        <div className="flex gap-3.5 border-t border-white/5 pt-3.5">
                            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-450 flex-shrink-0">
                                <ShieldCheck className="size-4.5" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-xs font-bold text-neutral-100">Dokumen Versi Resmi & Aman</h4>
                                <p className="text-[10px] text-neutral-450 leading-relaxed font-semibold">Tiap revisi terversioning otomatis untuk menghindari kebingungan dokumen.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer block */}
                {quote && (
                    <div className="relative z-20 mt-auto border-t border-white/5 pt-4">
                        <blockquote className="space-y-1.5">
                            <p className="text-xs italic text-neutral-300 leading-normal">&ldquo;{quote.message}&rdquo;</p>
                            <footer className="text-[10px] font-bold text-neutral-400">— {quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>

            {/* Right side panel (form container, span 7 cols) */}
            <div className="flex items-center justify-center p-6 sm:p-10 lg:col-span-7 bg-white dark:bg-neutral-950 overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-sm space-y-6"
                >
                    {/* Header for mobile view ports only */}
                    <div className="flex flex-col items-center gap-2 lg:hidden mb-6">
                        <Link href={route('home')} className="flex items-center gap-2.5">
                            <CubeIcon className="size-8" />
                            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">Training PD</span>
                        </Link>
                    </div>

                    {/* Text Title & Subtitle */}
                    <div className="space-y-1.5 text-center sm:text-left">
                        <h1 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">{title}</h1>
                        <p className="text-xs text-neutral-450 dark:text-neutral-500 font-semibold">{description}</p>
                    </div>

                    {/* Forms Children Slot */}
                    <div className="bg-transparent">
                        {children}
                    </div>
                </motion.div>
            </div>
            
        </div>
    );
}
