import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Label } from 'recharts';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useAppearance } from '@/hooks/use-appearance';
import {
    BookOpen,
    ShieldCheck,
    Folder,
    GraduationCap,
    TrendingUp,
    Check,
    Send,
    Users,
    Archive,
    Rocket,
    Menu,
    X,
    Bell,
    LayoutDashboard,
    FileText,
    Settings,
    HelpCircle,
    Mail,
    Sun,
    Moon
} from 'lucide-react';

const CubeIcon = ({ className = "size-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#357ae8" className="fill-blue-500 dark:fill-blue-400" />
        <path d="M2 17L12 22V12L2 7V17Z" fill="#1b52ca" className="fill-blue-600 dark:fill-blue-500" />
        <path d="M22 17L12 22V12L22 7V17Z" fill="#4d8cf4" className="fill-blue-400 dark:fill-blue-300" />
    </svg>
);

// Interactive Features Data
const featuresData = [
    {
        id: 0,
        title: "Pengajuan Modul",
        icon: FileText,
        badge: "Cepat & Paperless",
        desc: "Ajukan modul baru atau revisi secara digital dengan form terstandarisasi. Pengaju dapat melampirkan berkas, memilih program pelatihan, dan memberikan deskripsi detail.",
        bullets: [
            "Form input terstandarisasi untuk keseragaman",
            "Mendukung lampiran file dokumen (PDF, Word)",
            "Riwayat revisi dan status langsung terpantau",
            "Notifikasi otomatis ke tim reviewer"
        ],
        colorClass: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
        borderClass: "border-blue-200 dark:border-blue-900/50",
        bgGradient: "from-blue-500/10 to-indigo-500/5",
        mockup: (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-md space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                    <span className="text-xs font-bold text-neutral-850 dark:text-neutral-100">Form Pengajuan Baru</span>
                    <span className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-350 px-2 py-0.5 rounded-full font-semibold">Draft</span>
                </div>
                <div className="space-y-2">
                    <div className="space-y-1">
                        <label className="text-[8px] font-bold text-neutral-400 dark:text-neutral-500">Judul Modul</label>
                        <div className="h-7 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded px-2 flex items-center text-[9px] text-neutral-600 dark:text-neutral-355">
                            Pelayanan Pelanggan Prima v2
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[8px] font-bold text-neutral-400 dark:text-neutral-500">Program</label>
                            <div className="h-7 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded px-2 flex items-center text-[9px] text-neutral-600 dark:text-neutral-355">
                                Soft Skills
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-bold text-neutral-400 dark:text-neutral-500">Lampiran</label>
                            <div className="h-7 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 border-dashed rounded px-2 flex items-center justify-between text-[9px] text-neutral-450 dark:text-neutral-400">
                                <span>modul_cs.pdf</span>
                                <Check className="size-3 text-emerald-500" />
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-7 bg-blue-600 dark:bg-blue-500 text-white rounded text-[9px] font-bold flex items-center justify-center gap-1">
                        <span>Kirim Pengajuan</span>
                        <Send className="size-2.5" />
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 1,
        title: "Approval Modul",
        icon: ShieldCheck,
        badge: "Transparan & Akuntabel",
        desc: "Proses peninjauan bertingkat mulai dari Tim PD hingga Manager. Reviewer dapat menyetujui, meminta revisi dengan catatan spesifik, atau menolak pengajuan.",
        bullets: [
            "Alur approval bertingkat sesuai kewenangan",
            "Kolom komentar revisi yang terdokumentasi",
            "Sistem approval sekali-klik untuk efisiensi",
            "Audit trail lengkap untuk setiap keputusan"
        ],
        colorClass: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
        borderClass: "border-emerald-200 dark:border-emerald-900/50",
        bgGradient: "from-emerald-500/10 to-teal-500/5",
        mockup: (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-md space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                    <span className="text-xs font-bold text-neutral-850 dark:text-neutral-100">Persetujuan Modul</span>
                    <span className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-350 px-2 py-0.5 rounded-full font-semibold">Menunggu Review</span>
                </div>
                <div className="space-y-2 text-[9px]">
                    <div className="bg-neutral-50 dark:bg-neutral-950 p-2 rounded border border-neutral-250 dark:border-neutral-800 space-y-1">
                        <div className="flex justify-between font-bold text-neutral-855 dark:text-neutral-100">
                            <span>Modul Leadership 101</span>
                            <span className="text-neutral-400 dark:text-neutral-500">Oleh: Budi S.</span>
                        </div>
                        <p className="text-[8px] text-neutral-450 dark:text-neutral-400">Harap tinjau lampiran modul bab 3 mengenai delegasi.</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1 h-7 bg-emerald-600 dark:bg-emerald-500 text-white rounded font-bold flex items-center justify-center">Approve</div>
                        <div className="flex-1 h-7 bg-amber-500 dark:bg-amber-600 text-white rounded font-bold flex items-center justify-center">Minta Revisi</div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 2,
        title: "Database Modul",
        icon: Folder,
        badge: "Terpusat & Aman",
        desc: "Dokumen modul disimpan dengan sistem versioning yang ketat. Semua berkas tersimpan dengan aman, rapi, dan mudah dicari menggunakan filter kategori.",
        bullets: [
            "Pencarian cepat dengan filter kategori and program",
            "Riwayat versi dokumen (version history) yang lengkap",
            "Manajemen arsip modul non-aktif",
            "Akses berkas aman hanya untuk user terotorisasi"
        ],
        colorClass: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400",
        borderClass: "border-purple-200 dark:border-purple-900/50",
        bgGradient: "from-purple-500/10 to-pink-500/5",
        mockup: (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-md space-y-2">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                    <span className="text-xs font-bold text-neutral-850 dark:text-neutral-100">Katalog Modul Aktif</span>
                    <span className="text-[8px] text-neutral-400 dark:text-neutral-500">Total: 386 Modul</span>
                </div>
                <div className="space-y-1.5 text-[8px] font-semibold">
                    <div className="flex items-center justify-between p-1.5 bg-neutral-50 dark:bg-neutral-950 rounded border border-neutral-150 dark:border-neutral-850">
                        <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-250">
                            <FileText className="size-3 text-blue-500" />
                            <span>Komunikasi Efektif.pdf</span>
                        </div>
                        <span className="text-neutral-400 dark:text-neutral-500">v3.2</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-neutral-50 dark:bg-neutral-950 rounded border border-neutral-150 dark:border-neutral-850">
                        <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-250">
                            <FileText className="size-3 text-blue-500" />
                            <span>Manajemen Konflik.pdf</span>
                        </div>
                        <span className="text-neutral-400 dark:text-neutral-500">v1.0</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-neutral-50 dark:bg-neutral-950 rounded border border-neutral-150 dark:border-neutral-850">
                        <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-250">
                            <FileText className="size-3 text-blue-500" />
                            <span>Pemecahan Masalah.pdf</span>
                        </div>
                        <span className="text-neutral-400 dark:text-neutral-500">v2.1</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 3,
        title: "Matriks Pelatihan",
        icon: BookOpen,
        badge: "Pemetaan & Monitoring",
        desc: "Petakan seluruh kompetensi, modul, dan program pelatihan dalam bentuk matriks interaktif. Memudahkan pemantauan ketersediaan modul untuk setiap program.",
        bullets: [
            "Visualisasi relasi modul dan program pelatihan",
            "Identifikasi cepat celah kompetensi (skills gap)",
            "Filter matriks berdasarkan unit kerja atau kategori",
            "Ekspor laporan matriks untuk perencanaan training tahunan"
        ],
        colorClass: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
        borderClass: "border-amber-200 dark:border-amber-900/50",
        bgGradient: "from-amber-500/10 to-orange-500/5",
        mockup: (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-md space-y-2">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1">
                    <span className="text-xs font-bold text-neutral-850 dark:text-neutral-100">Matriks Program & Modul</span>
                </div>
                <div className="space-y-1.5 text-[8px] text-neutral-800 dark:text-neutral-250">
                    <div className="grid grid-cols-4 gap-1 font-bold text-neutral-400 dark:text-neutral-500 border-b border-neutral-100 dark:border-neutral-800 pb-1">
                        <span>Program</span>
                        <span className="text-center">Modul A</span>
                        <span className="text-center">Modul B</span>
                        <span className="text-center">Modul C</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 py-1 border-b border-neutral-50 dark:border-neutral-900 font-semibold">
                        <span>Induksi</span>
                        <span className="text-center text-emerald-500 font-bold">✓</span>
                        <span className="text-center text-emerald-500 font-bold">✓</span>
                        <span className="text-center text-neutral-355">-</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 py-1 font-semibold">
                        <span>Supervisor</span>
                        <span className="text-center text-neutral-355">-</span>
                        <span className="text-center text-emerald-500 font-bold">✓</span>
                        <span className="text-center text-emerald-500 font-bold">✓</span>
                    </div>
                </div>
            </div>
        )
    }
];

// Interactive Flow Steps Data
const flowStepsData = [
    {
        id: 1,
        title: "Ajukan Modul",
        actor: "Pengaju / Trainer",
        desc: "Pengaju mengisi detail modul (judul, deskripsi, program) dan mengunggah draf modul pelatihan dalam format PDF atau Word.",
        requirements: "Draf dokumen modul, metadata program, deskripsi tujuan pelatihan.",
        duration: "10 - 15 Menit",
        output: "Pengajuan berstatus 'Review' terdaftar di sistem.",
        icon: Send,
        colorClass: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
    },
    {
        id: 2,
        title: "Review Tim PD",
        actor: "Tim People Development (PD)",
        desc: "Tim PD meninjau materi, relevansi dengan kurikulum, dan kesesuaian format. Memberikan catatan perbaikan jika diperlukan.",
        requirements: "Draf modul yang diajukan.",
        duration: "1 - 2 Hari Kerja",
        output: "Catatan rekomendasi dan perubahan status ke 'Review Manager'.",
        icon: Users,
        colorClass: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400"
    },
    {
        id: 3,
        title: "Approval Manager",
        actor: "Manager People Development / Unit",
        desc: "Manager memeriksa draf akhir dan rekomendasi dari Tim PD untuk memutuskan apakah modul disetujui, ditolak, atau perlu direvisi.",
        requirements: "Draf modul beserta rekomendasi hasil review Tim PD.",
        duration: "1 Hari Kerja",
        output: "Persetujuan final (Approved), Penolakan (Rejected), atau Permintaan Revisi (Revisi).",
        icon: ShieldCheck,
        colorClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
    },
    {
        id: 4,
        title: "Distribusi & Arsip",
        actor: "Administrator Sistem",
        desc: "Modul yang disetujui otomatis masuk ke katalog database aktif, mendapatkan nomor versi resmi, dan dapat diakses untuk program pelatihan.",
        requirements: "Modul dengan status persetujuan 'Approved'.",
        duration: "Otomatis (Sistem)",
        output: "Dokumen terpublikasi di katalog dan tercatat dalam matriks pelatihan.",
        icon: Archive,
        colorClass: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
    }
];

// Navigation menu links mapping
const navLinks = [
    { name: 'Beranda', href: '#', id: 'beranda' },
    { name: 'Fitur', href: '#fitur', id: 'fitur' },
    { name: 'Alur', href: '#alur', id: 'alur' },
    { name: 'Tentang', href: '#tentang', id: 'tentang' },
    { name: 'Kontak', href: '#kontak', id: 'kontak' }
];

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);
    const [activeStep, setActiveStep] = useState(1);
    const [activeSection, setActiveSection] = useState('beranda');

    // Theme Appearance State Hook
    const { appearance, updateAppearance } = useAppearance();

    // Contact Form States
    const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    // Framer Motion Scroll Progress
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Detect active section on scroll using IntersectionObserver
    useEffect(() => {
        const sections = ['beranda', 'fitur', 'alur', 'tentang', 'kontak'];
        
        const observerOptions = {
            root: null,
            rootMargin: '-30% 0px -50% 0px', // Sweet spot triggers when section is in viewport center
            threshold: 0
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        // Set 'beranda' when scrolled very close to top
        const handleScroll = () => {
            if (window.scrollY < 80) {
                setActiveSection('beranda');
            }
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setContactForm({ ...contactForm, [e.target.name]: e.target.value });
        if (formErrors[e.target.name]) {
            setFormErrors({ ...formErrors, [e.target.name]: '' });
        }
    };

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        const errors: { [key: string]: string } = {};
        if (!contactForm.name.trim()) errors.name = "Nama lengkap wajib diisi";
        if (!contactForm.email.trim()) {
            errors.email = "Alamat email wajib diisi";
        } else if (!/\S+@\S+\.\S+/.test(contactForm.email)) {
            errors.email = "Format email tidak valid";
        }
        if (!contactForm.subject.trim()) errors.subject = "Subjek pesan wajib diisi";
        if (!contactForm.message.trim()) errors.message = "Isi pesan wajib diisi";

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitSuccess(true);
            setContactForm({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => {
                setSubmitSuccess(false);
            }, 5000);
        }, 1500);
    };

    // Mock Dashboard Data
    const mockChartData = [
        { name: 'Approved', value: 52, fill: '#10b981' },
        { name: 'Review', value: 24, fill: '#3b82f6' },
        { name: 'Revisi', value: 12, fill: '#f59e0b' },
        { name: 'Rejected', value: 8, fill: '#ef4444' },
    ];

    const mockSubmissions = [
        { title: 'Komunikasi Efektif', author: 'Budi Santoso', date: '20 Mei 2024', status: 'Review', badgeColor: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50' },
        { title: 'Manajemen Waktu', author: 'Siti Aisyah', date: '18 Mei 2024', status: 'Review', badgeColor: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50' },
        { title: 'Leadership Dasar', author: 'Rudi Hermawan', date: '17 Mei 2024', status: 'Approved', badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50' },
        { title: 'Pelayanan Prima', author: 'Dewi Lestari', date: '15 Mei 2024', status: 'Revisi', badgeColor: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50' },
        { title: 'Problem Solving', author: 'Agus Setiawan', date: '14 Mei 2024', status: 'Rejected', badgeColor: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50' },
    ];

    // Click handler for smooth scrolling
    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1) || 'beranda';
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <>
            <Head title="Training PD - Landing Page">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            </Head>

            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-500 z-[100] origin-left"
                style={{ scaleX }}
            />

            <div id="beranda" className="min-h-screen bg-neutral-50/50 text-neutral-800 font-['Outfit',sans-serif] selection:bg-blue-600 selection:text-white dark:bg-neutral-900 dark:text-neutral-200 transition-colors duration-300 scroll-mt-16">
                
                {/* 1. HEADER / NAVBAR */}
                <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/60 transition-colors">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <CubeIcon className="size-7 transition-transform duration-300 group-hover:rotate-12" />
                            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                                Training PD
                            </span>
                        </Link>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            {navLinks.map((link) => {
                                const isActive = activeSection === link.id;
                                return (
                                    <a
                                        key={link.id}
                                        href={link.href}
                                        onClick={(e) => handleNavClick(e, link.href)}
                                        className={`transition-colors pb-1 border-b-2 font-medium relative ${
                                            isActive
                                                ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                                                : 'text-neutral-600 dark:text-neutral-400 border-transparent hover:text-blue-600 dark:hover:text-blue-400'
                                        }`}
                                    >
                                        {link.name}
                                        {isActive && (
                                            <motion.span
                                                layoutId="activeNavIndicator"
                                                className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-400"
                                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                    </a>
                                );
                            })}
                        </nav>

                        {/* CTAs */}
                        <div className="hidden md:flex items-center gap-3">
                            {/* Theme Toggle Switcher */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 mr-1 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer flex items-center justify-center"
                                title={appearance === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                            >
                                {appearance === 'dark' ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
                            </button>

                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="h-9.5 px-4.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide flex items-center justify-center transition-all duration-300 shadow-md shadow-blue-500/10 dark:bg-blue-500 dark:hover:bg-blue-600"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="h-9.5 px-4.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-350 font-semibold text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center justify-center"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="h-9.5 px-4.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide flex items-center justify-center transition-all duration-300 shadow-md shadow-blue-500/10 dark:bg-blue-500 dark:hover:bg-blue-600"
                                    >
                                        Coba Demo
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Header elements (Theme + Trigger Menu) */}
                        <div className="flex items-center gap-2 md:hidden">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer flex items-center justify-center"
                                title={appearance === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                            >
                                {appearance === 'dark' ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
                            </button>
                            <button 
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                            >
                                {isMobileMenuOpen ? <X className="size-5.5" /> : <Menu className="size-5.5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation Drawer */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-6 py-4 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
                            {navLinks.map((link) => {
                                const isActive = activeSection === link.id;
                                return (
                                    <a
                                        key={link.id}
                                        href={link.href}
                                        onClick={(e) => {
                                            setIsMobileMenuOpen(false);
                                            handleNavClick(e, link.href);
                                        }}
                                        className={`font-semibold py-1 transition-colors ${
                                            isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-neutral-600 dark:text-neutral-400'
                                        }`}
                                    >
                                        {link.name}
                                    </a>
                                );
                            })}
                            <hr className="border-neutral-150 dark:border-neutral-850" />
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="h-10 rounded-xl bg-blue-600 text-white font-semibold text-sm flex items-center justify-center"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Link
                                        href={route('login')}
                                        className="h-10 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-355 font-semibold text-sm flex items-center justify-center"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="h-10 rounded-xl bg-blue-600 text-white font-semibold text-sm flex items-center justify-center"
                                    >
                                        Coba Demo
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </header>

                {/* 2. HERO SECTION */}
                <section className="relative py-12 lg:py-20 overflow-hidden">
                    
                    {/* Background Blobs */}
                    <div className="absolute top-1/4 left-0 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-400/10 dark:bg-blue-500/5 blur-3xl" />
                    <div className="absolute top-1/3 right-0 translate-x-1/3 w-96 h-96 rounded-full bg-indigo-400/10 dark:bg-indigo-500/5 blur-3xl" />

                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
                        
                        {/* Copy Column (Left) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-5 flex flex-col gap-6 text-center lg:text-left"
                        >
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
                                Kelola Modul Pelatihan Lebih Cepat dan Terstruktur
                            </h1>
                            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-455 leading-relaxed font-semibold">
                                Training PD membantu Anda mengelola pengajuan modul baru, revisi modul, approval, database modul, dan matriks pelatihan dalam satu sistem terintegrasi.
                            </p>
                            
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-2">
                                <Link
                                    href={auth.user ? route('dashboard') : route('register')}
                                    className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center transition-all duration-300 shadow-lg shadow-blue-500/20 dark:bg-blue-500 dark:hover:bg-blue-600"
                                >
                                    Mulai Sekarang
                                </Link>
                                <a
                                    href="#fitur"
                                    onClick={(e) => handleNavClick(e, '#fitur')}
                                    className="h-11 px-6 rounded-xl bg-white border border-neutral-200 dark:bg-neutral-950 dark:border-neutral-800 text-neutral-700 dark:text-neutral-350 font-bold text-xs tracking-wider uppercase flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                                >
                                    Lihat Fitur
                                </a>
                            </div>

                            {/* Checkmark List */}
                            <div className="flex flex-col gap-3 mt-4 text-xs font-semibold text-neutral-600 dark:text-neutral-450">
                                <div className="flex items-center gap-2.5 justify-center lg:justify-start">
                                    <div className="flex size-5 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                        <Check className="size-3.5 stroke-[3]" />
                                    </div>
                                    <span>Alur approval lebih rapi</span>
                                </div>
                                <div className="flex items-center gap-2.5 justify-center lg:justify-start">
                                    <div className="flex size-5 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                        <Check className="size-3.5 stroke-[3]" />
                                    </div>
                                    <span>Dokumen terpusat</span>
                                </div>
                                <div className="flex items-center gap-2.5 justify-center lg:justify-start">
                                    <div className="flex size-5 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                        <Check className="size-3.5 stroke-[3]" />
                                    </div>
                                    <span>Mudah dipantau admin dan tim</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Interactive App Mockup (Right) */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.15 }}
                            className="lg:col-span-7 select-none"
                        >
                            <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-2xl overflow-hidden aspect-[1.38] flex transition-all duration-300">
                                
                                {/* Mock Sidebar */}
                                <aside className="w-[120px] sm:w-[150px] border-r border-neutral-100 dark:border-neutral-900 p-2 sm:p-3 flex flex-col justify-between flex-shrink-0 bg-neutral-50/50 dark:bg-neutral-950/50">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-1.5 px-1.5 py-1">
                                            <CubeIcon className="size-4.5" />
                                            <span className="text-[10px] sm:text-xs font-bold text-neutral-850 dark:text-white">Training PD</span>
                                        </div>
                                        <div className="space-y-1 text-[8px] sm:text-[10px] font-semibold">
                                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                                <LayoutDashboard className="size-3 sm:size-3.5" />
                                                <span>Dashboard</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-2 py-1.5 text-neutral-500 dark:text-neutral-455 hover:bg-neutral-100/60 dark:hover:bg-neutral-900/40 rounded-lg">
                                                <Send className="size-3 sm:size-3.5" />
                                                <span>Pengajuan</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-2 py-1.5 text-neutral-500 dark:text-neutral-455 hover:bg-neutral-100/60 dark:hover:bg-neutral-900/40 rounded-lg">
                                                <ShieldCheck className="size-3 sm:size-3.5" />
                                                <span>Approval</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-2 py-1.5 text-neutral-500 dark:text-neutral-455 hover:bg-neutral-100/60 dark:hover:bg-neutral-900/40 rounded-lg">
                                                <Folder className="size-3 sm:size-3.5" />
                                                <span>Database</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-2 py-1.5 text-neutral-500 dark:text-neutral-455 hover:bg-neutral-100/60 dark:hover:bg-neutral-900/40 rounded-lg">
                                                <GraduationCap className="size-3 sm:size-3.5" />
                                                <span>Matriks</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1.5 text-[8px] sm:text-[10px] font-semibold text-neutral-450 dark:text-neutral-600 border-t border-neutral-100 dark:border-neutral-900">
                                        <Settings className="size-3" />
                                        <span>Pengaturan</span>
                                    </div>
                                </aside>

                                {/* Mock Main Area */}
                                <main className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-950">
                                    
                                    {/* Mock Top bar */}
                                    <header className="h-10 sm:h-12 border-b border-neutral-100 dark:border-neutral-900 px-4 flex items-center justify-between">
                                        <span className="text-[10px] sm:text-xs font-bold text-neutral-900 dark:text-white">Dashboard</span>
                                        <div className="flex items-center gap-2">
                                            <Bell className="size-3 sm:size-3.5 text-neutral-400" />
                                            <div className="size-5 sm:size-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[7px] sm:text-[9px] font-bold">AD</div>
                                        </div>
                                    </header>

                                    {/* Mock Content */}
                                    <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4">
                                        
                                        {/* Mock Metric Row */}
                                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-[7px] sm:text-[10px] font-semibold">
                                            <div className="border border-neutral-150 dark:border-neutral-850 p-1.5 rounded-lg flex items-center gap-1.5">
                                                <div className="size-5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-600 flex items-center justify-center flex-shrink-0"><Folder className="size-3" /></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] sm:text-xs font-extrabold">386</span>
                                                    <span className="text-[6px] sm:text-[8px] text-neutral-400 dark:text-neutral-500 font-medium">Modul</span>
                                                </div>
                                            </div>
                                            <div className="border border-neutral-150 dark:border-neutral-850 p-1.5 rounded-lg flex items-center gap-1.5">
                                                <div className="size-5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center flex-shrink-0"><Send className="size-3" /></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] sm:text-xs font-extrabold">96</span>
                                                    <span className="text-[6px] sm:text-[8px] text-neutral-400 dark:text-neutral-500 font-medium">Pengajuan</span>
                                                </div>
                                            </div>
                                            <div className="border border-neutral-150 dark:border-neutral-850 p-1.5 rounded-lg flex items-center gap-1.5">
                                                <div className="size-5 rounded-md bg-violet-50 dark:bg-violet-950/30 text-violet-600 flex items-center justify-center flex-shrink-0"><ShieldCheck className="size-3" /></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] sm:text-xs font-extrabold">86%</span>
                                                    <span className="text-[6px] sm:text-[8px] text-neutral-400 dark:text-neutral-500 font-medium">Approval</span>
                                                </div>
                                            </div>
                                            <div className="border border-neutral-150 dark:border-neutral-850 p-1.5 rounded-lg flex items-center gap-1.5">
                                                <div className="size-5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-600 flex items-center justify-center flex-shrink-0"><GraduationCap className="size-3" /></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] sm:text-xs font-extrabold">42</span>
                                                    <span className="text-[6px] sm:text-[8px] text-neutral-400 dark:text-neutral-500 font-medium">Program</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mock Charts & Table Row */}
                                        <div className="grid grid-cols-12 gap-3">
                                            
                                            {/* Table Column */}
                                            <div className="col-span-8 border border-neutral-150 dark:border-neutral-850 rounded-xl p-2 sm:p-3 space-y-2">
                                                <span className="text-[8px] sm:text-[10px] font-bold block text-neutral-850 dark:text-neutral-100">Pengajuan Terbaru</span>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-[6px] sm:text-[9px] border-collapse">
                                                        <thead>
                                                            <tr className="border-b border-neutral-100 dark:border-neutral-900 font-semibold text-neutral-455">
                                                                <th className="pb-1 font-semibold">Judul Modul</th>
                                                                <th className="pb-1 font-semibold">Pengaju</th>
                                                                <th className="pb-1 font-semibold text-right">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-neutral-50 dark:divide-neutral-900">
                                                            {mockSubmissions.map((sub, idx) => (
                                                                <tr key={idx} className="text-neutral-600 dark:text-neutral-350">
                                                                    <td className="py-1 sm:py-1.5 font-bold text-neutral-800 dark:text-neutral-200">{sub.title}</td>
                                                                    <td className="py-1 sm:py-1.5 font-medium">{sub.author}</td>
                                                                    <td className="py-1 sm:py-1.5 text-right">
                                                                        <span className={`text-[5px] sm:text-[7px] font-bold px-1.5 py-0.5 rounded border ${sub.badgeColor}`}>
                                                                            {sub.status}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Chart Column */}
                                            <div className="col-span-4 border border-neutral-150 dark:border-neutral-850 rounded-xl p-2 sm:p-3 flex flex-col items-center justify-between">
                                                <span className="text-[7px] sm:text-[9px] font-bold block self-start text-neutral-850 dark:text-neutral-100">Distribusi Status</span>
                                                <div className="relative size-14 sm:size-20 flex items-center justify-center">
                                                    <PieChart width={80} height={80}>
                                                        <Pie
                                                            data={mockChartData}
                                                            dataKey="value"
                                                            innerRadius={18}
                                                            outerRadius={28}
                                                            strokeWidth={0}
                                                        >
                                                            {mockChartData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                                            ))}
                                                            <Label
                                                                content={({ viewBox }) => {
                                                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                                        return (
                                                                            <g>
                                                                                <text
                                                                                    x={viewBox.cx}
                                                                                    y={viewBox.cy}
                                                                                    textAnchor="middle"
                                                                                    dominantBaseline="middle"
                                                                                    className="fill-foreground text-[8px] font-extrabold text-neutral-800 dark:fill-neutral-100"
                                                                                >
                                                                                    96
                                                                                </text>
                                                                                <text
                                                                                    x={viewBox.cx}
                                                                                    y={(viewBox.cy || 0) + 7}
                                                                                    textAnchor="middle"
                                                                                    dominantBaseline="middle"
                                                                                    className="fill-muted-foreground text-[4px] font-bold text-neutral-450 dark:text-neutral-550 uppercase tracking-wider"
                                                                                >
                                                                                    Total
                                                                                </text>
                                                                            </g>
                                                                        )
                                                                    }
                                                                }}
                                                            />
                                                        </Pie>
                                                    </PieChart>
                                                </div>
                                                <div className="w-full grid grid-cols-2 gap-1 text-[5px] sm:text-[7px] text-neutral-450 dark:text-neutral-550 font-semibold mt-1">
                                                    <div className="flex items-center gap-1"><span className="size-1 rounded-full bg-emerald-500"></span><span>Appr (54%)</span></div>
                                                    <div className="flex items-center gap-1"><span className="size-1 rounded-full bg-blue-500"></span><span>Rev (25%)</span></div>
                                                    <div className="flex items-center gap-1"><span className="size-1 rounded-full bg-amber-500"></span><span>Revi (13%)</span></div>
                                                    <div className="flex items-center gap-1"><span className="size-1 rounded-full bg-red-500"></span><span>Rej (8%)</span></div>
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </main>

                            </div>
                        </motion.div>

                    </div>
                </section>

                {/* 3. KEY METRICS INDICATORS ROW */}
                <section className="py-8 bg-white dark:bg-neutral-950 border-y border-neutral-200/50 dark:border-neutral-800/60 transition-colors">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        {/* Metric 1 */}
                        <div className="flex items-center gap-4 justify-center">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex-shrink-0">
                                <Folder className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">386</span>
                                <span className="text-xs font-semibold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mt-0.5">Modul Tersimpan</span>
                            </div>
                        </div>

                        {/* Metric 2 */}
                        <div className="flex items-center gap-4 justify-center">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex-shrink-0">
                                <FileText className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">96</span>
                                <span className="text-xs font-semibold text-neutral-455 dark:text-neutral-500 uppercase tracking-wider mt-0.5">Pengajuan</span>
                            </div>
                        </div>

                        {/* Metric 3 */}
                        <div className="flex items-center gap-4 justify-center">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400 flex-shrink-0">
                                <TrendingUp className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">86%</span>
                                <span className="text-xs font-semibold text-neutral-455 dark:text-neutral-500 uppercase tracking-wider mt-0.5">Approval Rate</span>
                            </div>
                        </div>

                        {/* Metric 4 */}
                        <div className="flex items-center gap-4 justify-center">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 flex-shrink-0">
                                <GraduationCap className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">42</span>
                                <span className="text-xs font-semibold text-neutral-455 dark:text-neutral-500 uppercase tracking-wider mt-0.5">Program Pelatihan</span>
                            </div>
                        </div>

                    </div>
                </section>

                {/* 4. FITUR UTAMA SECTION - UPGRADED & INTERACTIVE WITH MOTION REVEAL */}
                <motion.section 
                    id="fitur" 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="py-16 lg:py-24 relative overflow-hidden scroll-mt-16 bg-neutral-50/20 dark:bg-neutral-900/10"
                >
                    <div className="max-w-7xl mx-auto px-6 space-y-12">
                        
                        {/* Section Header */}
                        <div className="text-center max-w-xl mx-auto flex flex-col gap-3">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-200/50 dark:border-blue-900/30 self-center">
                                Fitur Unggulan
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                                Jelajahi Fitur Utama Kami
                            </h2>
                            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-semibold leading-relaxed">
                                Klik salah satu tab fitur di bawah untuk melihat detail fungsi dan draf simulasi sistem.
                            </p>
                        </div>

                        {/* Feature Explorer Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            
                            {/* Left Column: Interactive Selector List */}
                            <div className="lg:col-span-5 flex flex-col gap-3 w-full">
                                {featuresData.map((feat, idx) => {
                                    const IconComponent = feat.icon;
                                    const isActive = activeFeature === idx;
                                    return (
                                        <button
                                            key={feat.id}
                                            onClick={() => setActiveFeature(idx)}
                                            className={`w-full text-left p-4.5 rounded-2xl border flex items-center gap-4 transition-all duration-300 relative overflow-hidden cursor-pointer ${
                                                isActive
                                                    ? 'bg-white border-blue-200 shadow-lg dark:bg-neutral-950 dark:border-blue-900/60 shadow-blue-500/5'
                                                    : 'bg-transparent border-neutral-200/60 dark:border-neutral-800/60 hover:bg-white/50 dark:hover:bg-neutral-950/30'
                                            }`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeFeatureBg"
                                                    className="absolute inset-0 bg-gradient-to-r from-blue-50/20 to-indigo-50/5 dark:from-blue-950/20 dark:to-neutral-900/10 -z-10"
                                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                />
                                            )}
                                            <div className={`flex aspect-square size-11 items-center justify-center rounded-xl transition-colors ${
                                                isActive ? feat.colorClass : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-450'
                                            }`}>
                                                <IconComponent className="size-5.5" />
                                            </div>
                                            <div className="space-y-0.5 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-neutral-900 dark:text-white text-sm">{feat.title}</span>
                                                    {isActive && (
                                                        <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200/40 dark:border-blue-900/40">Active</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-neutral-455 dark:text-neutral-500 leading-normal line-clamp-1 font-medium">
                                                    {feat.desc}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Right Column: Display Feature Details */}
                            <div className="lg:col-span-7 bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-6 relative min-h-[350px] transition-all duration-300">
                                <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 size-32 rounded-full bg-blue-500/5 blur-2xl" />
                                
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-900 pb-4 relative z-10">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-900/50">
                                            {featuresData[activeFeature].badge}
                                        </span>
                                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{featuresData[activeFeature].title}</h3>
                                    </div>
                                    <div className="text-xs font-bold text-neutral-455 dark:text-neutral-500">
                                        Fitur #{activeFeature + 1} / 4
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
                                    {/* Copy details */}
                                    <div className="md:col-span-6 space-y-4">
                                        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-455 leading-relaxed font-semibold">
                                            {featuresData[activeFeature].desc}
                                        </p>
                                        <ul className="space-y-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                            {featuresData[activeFeature].bullets.map((bullet, idx) => (
                                                <li key={idx} className="flex items-start gap-2.5">
                                                    <div className="flex size-4.5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mt-0.5 flex-shrink-0">
                                                        <Check className="size-3 stroke-[3]" />
                                                    </div>
                                                    <span>{bullet}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Interative simulated screen */}
                                    <div className="md:col-span-6">
                                        {featuresData[activeFeature].mockup}
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>
                </motion.section>

                {/* 5. ALUR KERJA SECTION - INTERACTIVE WITH MOTION REVEAL */}
                <motion.section 
                    id="alur" 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="py-16 lg:py-24 bg-white dark:bg-neutral-950 border-y border-neutral-200/40 dark:border-neutral-900 scroll-mt-16 transition-colors"
                >
                    <div className="max-w-7xl mx-auto px-6 space-y-12">
                        
                        {/* Section Header */}
                        <div className="text-center max-w-xl mx-auto flex flex-col gap-3">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-200/50 dark:border-blue-900/30 self-center">
                                Workflow Sistem
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                                Alur Kerja Sederhana
                            </h2>
                            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-semibold leading-relaxed">
                                Klik setiap langkah alur kerja di bawah untuk melihat rincian detail pelaku, durasi, dan berkas keluaran.
                            </p>
                        </div>

                        {/* Interactive Steps Horizontal Timeline */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative z-10">
                            {flowStepsData.map((step, idx) => {
                                const IconComp = step.icon;
                                const isActive = activeStep === step.id;
                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => setActiveStep(step.id)}
                                        className={`p-5 rounded-2xl border text-left flex flex-col gap-4 relative transition-all duration-300 cursor-pointer ${
                                            isActive
                                                ? 'bg-neutral-50 border-blue-500 shadow-md dark:bg-neutral-900 dark:border-blue-500'
                                                : 'bg-neutral-50/30 border-neutral-200/60 dark:bg-neutral-900/20 dark:border-neutral-850 hover:border-neutral-300 dark:hover:border-neutral-800'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className={`size-6 rounded-full font-bold text-[10px] flex items-center justify-center transition-colors ${
                                                isActive ? 'bg-blue-600 text-white' : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-850 dark:text-neutral-400'
                                            }`}>
                                                {step.id}
                                            </div>
                                            <div className={`flex aspect-square size-8 items-center justify-center rounded-lg ${step.colorClass}`}>
                                                <IconComp className="size-4" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm">{step.title}</h4>
                                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold">{step.actor}</span>
                                        </div>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeStepIndicator"
                                                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-50 border-b border-r border-blue-500 dark:bg-neutral-900 rotate-45 hidden md:block"
                                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Timeline Step Details Card */}
                        <div className="bg-neutral-50 border border-neutral-200/70 dark:bg-neutral-900/40 dark:border-neutral-850 p-6 rounded-2xl shadow-sm transition-all duration-300">
                            {flowStepsData.map((step) => {
                                if (step.id !== activeStep) return null;
                                return (
                                    <div key={step.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-in fade-in duration-300">
                                        <div className="md:col-span-4 space-y-2.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-900/50">Langkah {step.id}</span>
                                                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">• {step.actor}</span>
                                            </div>
                                            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">{step.title}</h3>
                                            <p className="text-xs text-neutral-550 dark:text-neutral-450 leading-relaxed font-semibold">
                                                {step.desc}
                                            </p>
                                        </div>

                                        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-neutral-150 dark:border-neutral-850 md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Persyaratan Input</span>
                                                <p className="text-xs text-neutral-750 dark:text-neutral-300 font-bold leading-normal">{step.requirements}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Rata-rata Durasi</span>
                                                <p className="text-xs text-neutral-750 dark:text-neutral-300 font-bold leading-normal">{step.duration}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Hasil Keluaran</span>
                                                <p className="text-xs text-neutral-750 dark:text-neutral-300 font-bold leading-normal">{step.output}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </motion.section>

                {/* 5.5. DEDICATED TENTANG SECTION WITH MOTION REVEAL */}
                <motion.section 
                    id="tentang" 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="py-16 lg:py-24 relative overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/40 scroll-mt-16 border-b border-neutral-200/50 dark:border-neutral-800/60 transition-colors"
                >
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Left: Values & Stats */}
                        <div className="lg:col-span-6 space-y-8">
                            <div className="space-y-3">
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-200/50 dark:border-blue-900/30">
                                    Visi & Misi Kami
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                                    Menghubungkan Kompetensi, Kurikulum, dan Kolaborasi
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-450 leading-relaxed font-semibold">
                                    Training PD lahir dari kebutuhan akan transparansi dan efisiensi dalam mengelola modul pelatihan. Kami menyederhanakan birokrasi manual menjadi alur digital yang efisien dan termonitor dengan baik.
                                </p>
                            </div>

                            {/* Grid Values */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/80 rounded-xl space-y-2">
                                    <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-450 flex items-center justify-center">
                                        <TrendingUp className="size-4.5" />
                                    </div>
                                    <h4 className="font-bold text-neutral-900 dark:text-white text-xs">Transformasi Cepat</h4>
                                    <p className="text-[10px] text-neutral-455 leading-relaxed">
                                        Mengurangi waktu tunggu approval modul dari berminggu-minggu menjadi hitungan hari kerja.
                                    </p>
                                </div>

                                <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/80 rounded-xl space-y-2">
                                    <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 flex items-center justify-center">
                                        <ShieldCheck className="size-4.5" />
                                    </div>
                                    <h4 className="font-bold text-neutral-900 dark:text-white text-xs">Keamanan & Keaslian</h4>
                                    <p className="text-[10px] text-neutral-455 leading-relaxed">
                                        Setiap dokumen modul tersimpan rapi dengan riwayat versi resmi guna menghindari kebingungan dokumen.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Visual Illustration & Performance Stats */}
                        <div className="lg:col-span-6 bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/80 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
                            <h3 className="font-extrabold text-neutral-900 dark:text-white text-lg">Dampak untuk Organisasi</h3>
                            
                            <div className="space-y-4">
                                {/* Stat Progress Bar 1 */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span>Kecepatan Alur Kerja</span>
                                        <span className="text-blue-600 dark:text-blue-450">10x Lebih Cepat</span>
                                    </div>
                                    <div className="h-2 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '92%' }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className="h-full bg-blue-600 rounded-full"
                                        />
                                    </div>
                                </div>

                                {/* Stat Progress Bar 2 */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span>Digitalisasi Dokumen</span>
                                        <span className="text-emerald-600 dark:text-emerald-450">100% Paperless</span>
                                    </div>
                                    <div className="h-2 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '100%' }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className="h-full bg-emerald-500 rounded-full"
                                        />
                                    </div>
                                </div>

                                {/* Stat Progress Bar 3 */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span>Akurasi & Validitas Matriks</span>
                                        <span className="text-violet-600 dark:text-violet-455">99.8% Tepat</span>
                                    </div>
                                    <div className="h-2 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '99%' }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className="h-full bg-violet-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-900 flex justify-between text-center">
                                <div>
                                    <span className="block text-2xl font-black text-blue-600 dark:text-blue-400">80%</span>
                                    <span className="text-[10px] font-bold text-neutral-450">Reduksi Birokrasi</span>
                                </div>
                                <div className="border-r border-neutral-100 dark:border-neutral-900"></div>
                                <div>
                                    <span className="block text-2xl font-black text-emerald-500">24/7</span>
                                    <span className="text-[10px] font-bold text-neutral-450">Akses Real-Time</span>
                                </div>
                                <div className="border-r border-neutral-100 dark:border-neutral-900"></div>
                                <div>
                                    <span className="block text-2xl font-black text-violet-500">0%</span>
                                    <span className="text-[10px] font-bold text-neutral-455">Dokumen Hilang</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </motion.section>

                {/* 5.8. DEDICATED KONTAK SECTION WITH MOTION REVEAL */}
                <motion.section 
                    id="kontak" 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="py-16 lg:py-24 relative overflow-hidden bg-white dark:bg-neutral-950 scroll-mt-16 transition-colors"
                >
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        {/* Left: Contact Info */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="space-y-3 text-center lg:text-left">
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-200/50 dark:border-blue-900/30">
                                    Hubungi Kami
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                                    Hubungi Tim Kami
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-455 leading-relaxed font-semibold">
                                    Punya pertanyaan seputar platform atau ingin menjadwalkan konsultasi khusus? Silakan hubungi kami atau kirimkan pesan lewat form.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Info Card 1 */}
                                <div className="flex gap-4 p-4 border border-neutral-150 dark:border-neutral-850 rounded-xl bg-neutral-50/30 dark:bg-neutral-900/10">
                                    <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-450 flex items-center justify-center flex-shrink-0">
                                        <Mail className="size-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 dark:text-white text-xs">Kirim Email</h4>
                                        <a href="mailto:info@trainingpd.co.id" className="text-xs text-neutral-500 hover:text-blue-600 dark:text-neutral-450 dark:hover:text-blue-400 font-semibold transition-colors">
                                            info@trainingpd.co.id
                                        </a>
                                    </div>
                                </div>

                                {/* Info Card 2 */}
                                <div className="flex gap-4 p-4 border border-neutral-150 dark:border-neutral-850 rounded-xl bg-neutral-50/30 dark:bg-neutral-900/10">
                                    <div className="size-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 flex items-center justify-center flex-shrink-0">
                                        <HelpCircle className="size-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 dark:text-white text-xs">Pusat Bantuan</h4>
                                        <span className="text-xs text-neutral-500 dark:text-neutral-455 font-semibold">
                                            +62 (21) 555-0199
                                        </span>
                                    </div>
                                </div>

                                {/* Info Card 3 */}
                                <div className="flex gap-4 p-4 border border-neutral-150 dark:border-neutral-850 rounded-xl bg-neutral-50/30 dark:bg-neutral-900/10">
                                    <div className="size-10 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-455 flex items-center justify-center flex-shrink-0">
                                        <CubeIcon className="size-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 dark:text-white text-xs">Lokasi Kantor</h4>
                                        <span className="text-xs text-neutral-500 dark:text-neutral-455 font-semibold">
                                            Gedung Training PD, Jl. Jendral Sudirman No. 86, Jakarta
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Contact Form */}
                        <div className="lg:col-span-7 bg-neutral-50/50 dark:bg-neutral-900/20 border border-neutral-200/60 dark:border-neutral-850 p-6 sm:p-8 rounded-2xl shadow-sm">
                            <form onSubmit={handleContactSubmit} className="space-y-4">
                                
                                {submitSuccess && (
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-250 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-350 rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
                                        <div className="size-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                                            <Check className="size-3.5 stroke-[3]" />
                                        </div>
                                        <div className="text-xs font-semibold">
                                            <p className="font-bold text-emerald-900 dark:text-emerald-355">Pesan Berhasil Dikirim!</p>
                                            <p className="text-emerald-700/80 dark:text-emerald-400/80">Tim kami akan segera menghubungi Anda kembali.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={contactForm.name}
                                            onChange={handleContactChange}
                                            className={`w-full h-10 px-3.5 bg-white dark:bg-neutral-950 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${formErrors.name ? 'border-red-500 dark:border-red-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-blue-500'}`}
                                            placeholder="Contoh: Budi Santoso"
                                        />
                                        {formErrors.name && <span className="text-[10px] font-bold text-red-500 block">{formErrors.name}</span>}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Alamat Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={contactForm.email}
                                            onChange={handleContactChange}
                                            className={`w-full h-10 px-3.5 bg-white dark:bg-neutral-950 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${formErrors.email ? 'border-red-500 dark:border-red-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-blue-500'}`}
                                            placeholder="Contoh: budi@company.com"
                                        />
                                        {formErrors.email && <span className="text-[10px] font-bold text-red-500 block">{formErrors.email}</span>}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Subjek</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={contactForm.subject}
                                        onChange={handleContactChange}
                                        className={`w-full h-10 px-3.5 bg-white dark:bg-neutral-950 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${formErrors.subject ? 'border-red-500 dark:border-red-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-blue-500'}`}
                                        placeholder="Contoh: Kemitraan Lisensi / Penjadwalan Demo"
                                    />
                                    {formErrors.subject && <span className="text-[10px] font-bold text-red-500 block">{formErrors.subject}</span>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-neutral-500 dark:text-neutral-455">Pesan</label>
                                    <textarea
                                        name="message"
                                        value={contactForm.message}
                                        onChange={handleContactChange}
                                        rows={4}
                                        className={`w-full p-3.5 bg-white dark:bg-neutral-950 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none ${formErrors.message ? 'border-red-500 dark:border-red-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-blue-500'}`}
                                        placeholder="Tuliskan pesan Anda di sini..."
                                    />
                                    {formErrors.message && <span className="text-[10px] font-bold text-red-500 block">{formErrors.message}</span>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-blue-500/10 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Mengirim...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Kirim Pesan</span>
                                            <Send className="size-3.5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.section>

                {/* 6. CALL TO ACTION (CTA) SECTION */}
                <section className="py-16 lg:py-20 relative overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/20">
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-3xl p-8 lg:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 text-white">
                            
                            {/* Copy Columns */}
                            <div className="flex items-center gap-6 text-center lg:text-left">
                                <div className="flex aspect-square size-14 items-center justify-center rounded-2xl bg-white/10 text-white flex-shrink-0 hidden sm:flex">
                                    <Rocket className="size-7.5 animate-bounce" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                        Mulai Digitalisasi Pengelolaan Modul Pelatihan
                                    </h3>
                                    <p className="text-xs sm:text-sm text-blue-100 font-semibold leading-relaxed">
                                        Tingkatkan efisiensi, transparansi, dan kualitas pelatihan organisasi Anda.
                                    </p>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-center">
                                <Link
                                    href={route('register')}
                                    className="h-11 px-6 rounded-xl bg-white hover:bg-neutral-50 text-blue-600 font-bold text-xs tracking-wider uppercase flex items-center justify-center transition-colors w-full sm:w-auto font-Outfit font-bold"
                                >
                                    Jadwalkan Demo
                                </Link>
                                <a
                                    href="#kontak"
                                    onClick={(e) => handleNavClick(e, '#kontak')}
                                    className="h-11 px-6 rounded-xl border border-white/30 hover:border-white/60 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center hover:bg-white/5 transition-all w-full sm:w-auto font-Outfit font-bold"
                                >
                                    Hubungi Kami
                                </a>
                            </div>

                        </div>
                    </div>
                </section>

                {/* 7. FOOTER */}
                <footer className="bg-neutral-50 border-t border-neutral-200/50 dark:bg-neutral-950 dark:border-neutral-900 py-12 transition-colors">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        
                        {/* Branding & Logo */}
                        <div className="flex flex-col gap-3 text-center md:text-left max-w-sm">
                            <Link href="/" className="flex items-center justify-center md:justify-start gap-2.5">
                                <CubeIcon className="size-6.5" />
                                <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                                    Training PD
                                </span>
                            </Link>
                            <p className="text-[11px] sm:text-xs text-neutral-450 dark:text-neutral-500 font-semibold leading-relaxed">
                                Platform pengelolaan modul pelatihan terintegrasi untuk organisasi modern.
                            </p>
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold mt-1">
                                &copy; {new Date().getFullYear()} Training PD. All rights reserved.
                            </span>
                        </div>

                        {/* Navigation maps */}
                        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-neutral-500 dark:text-neutral-450">
                            <a href="#fitur" onClick={(e) => handleNavClick(e, '#fitur')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Fitur</a>
                            <a href="#alur" onClick={(e) => handleNavClick(e, '#alur')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Alur</a>
                            <a href="#tentang" onClick={(e) => handleNavClick(e, '#tentang')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tentang</a>
                            <a href="#kontak" onClick={(e) => handleNavClick(e, '#kontak')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Kontak</a>
                            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy</a>
                        </div>

                    </div>
                </footer>

            </div>
        </>
    );
}
