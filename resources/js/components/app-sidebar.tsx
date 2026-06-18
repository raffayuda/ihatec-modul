import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    BookOpen,
    CheckSquare,
    Cloud,
    Database,
    FileText,
    FilePlus,
    FileEdit,
    FlaskConical,
    Globe,
    GraduationCap,
    Grid,
    LayoutGrid,
    Layers,
    Settings,
    Users,
    ShieldCheck,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const page = usePage<SharedData>();
    const role = page.props.auth?.user?.role || 'User';
    const roleLower = role.trim().toLowerCase();

    // ── Shared sub-items for Role & Master Data dropdown ────────────────────
    const masterDataChildren: NavItem[] = [
        { title: 'Manajemen User', url: '/manajemen-user', icon: Users },
        { title: 'Jenis Kebutuhan Modul', url: '/master-data/jenis-kebutuhan', icon: BookOpen },
        { title: 'Kode Pelatihan', url: '/master-data/kode-pelatihan', icon: Layers },
        { title: 'Jenis Modul', url: '/master-data/jenis-modul', icon: GraduationCap },
        { title: 'Bahasa Pengantar', url: '/master-data/bahasa-pengantar', icon: Globe },
        { title: 'Tipe Pelatihan', url: '/master-data/tipe-pelatihan', icon: Layers },
        { title: 'Tipe Sertifikat di Sihalal', url: '/master-data/tipe-sertifikat-sihalal', icon: ShieldCheck },
        { title: 'Jenis Sertifikat', url: '/master-data/jenis-sertifikat', icon: BookOpen },
        { title: 'PIC Periksa LK', url: '/master-data/pic-periksa-lk', icon: Users },
        { title: 'Kode Program', url: '/master-data/kode-program', icon: Database },
    ];

    // ── Admin ────────────────────────────────────────────────────────────────
    const adminItems: NavItem[] = [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
        {
            title: 'Role & Master Data',
            url: '/master-data',
            icon: ShieldCheck,
            children: masterDataChildren,
        },
        { title: 'Permintaan Modul Khusus', url: '/pengajuan', icon: FileText },
        { title: 'Perubahan Modul', url: '/perubahan-modul', icon: FileEdit },
        { title: 'Approval Modul', url: '/approval', icon: CheckSquare },
        { title: 'Database Modul', url: '/database', icon: Database },
        { title: 'Formula Modul', url: '/formula', icon: FlaskConical },
        { title: 'Matriks Pelatihan', url: '/matriks', icon: Grid },
        { title: 'Report', url: '/report', icon: BarChart3 },
        { title: 'Notifikasi', url: '/notifikasi', icon: Bell },
        { title: 'Integrasi Drive', url: '/admin/drive-integration', icon: Cloud },
        { title: 'Pengaturan', url: '/settings', icon: Settings },
    ];

    // ── Manager PD ───────────────────────────────────────────────────────────
    const managerItems: NavItem[] = [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
        { title: 'Approval Modul', url: '/approval', icon: CheckSquare },
        { title: 'Database Modul', url: '/database', icon: Database },
        { title: 'Report', url: '/report', icon: BarChart3 },
        { title: 'Notifikasi', url: '/notifikasi', icon: Bell },
        { title: 'Pengaturan', url: '/settings', icon: Settings },
    ];

    // ── Staf PD ──────────────────────────────────────────────────────────────
    const stafPdItems: NavItem[] = [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
        { title: 'Permintaan Modul Khusus', url: '/pengajuan', icon: FileText },
        { title: 'Perubahan Modul', url: '/perubahan-modul', icon: FileEdit },
        { title: 'Database Modul', url: '/database', icon: Database },
        { title: 'Formula Modul', url: '/formula', icon: FlaskConical },
        { title: 'Matriks Pelatihan', url: '/matriks', icon: Grid },
        { title: 'Notifikasi', url: '/notifikasi', icon: Bell },
        { title: 'Pengaturan', url: '/settings', icon: Settings },
    ];

    // ── Tim Training ─────────────────────────────────────────────────────────
    const timTrainingItems: NavItem[] = [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
        { title: 'Database Modul', url: '/database', icon: Database },
        { title: 'Formula Modul', url: '/formula', icon: FlaskConical },
        { title: 'Matriks Pelatihan', url: '/matriks', icon: Grid },
        { title: 'Report', url: '/report', icon: BarChart3 },
        { title: 'Notifikasi', url: '/notifikasi', icon: Bell },
        { title: 'Pengaturan', url: '/settings', icon: Settings },
    ];

    // ── User (Pengaju) ───────────────────────────────────────────────────────
    const userItems: NavItem[] = [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
        { title: 'Permintaan Modul Khusus', url: '/pengajuan', icon: FilePlus },
        { title: 'Notifikasi', url: '/notifikasi', icon: Bell },
        { title: 'Pengaturan', url: '/settings', icon: Settings },
    ];

    // Select menu based on role
    let allItems: NavItem[];
    if (roleLower === 'admin') {
        allItems = adminItems;
    } else if (roleLower === 'manager pd') {
        allItems = managerItems;
    } else if (roleLower === 'staf pd') {
        allItems = stafPdItems;
    } else if (roleLower === 'tim training') {
        allItems = timTrainingItems;
    } else {
        allItems = userItems;
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-0 py-2">
                <NavMain items={allItems} />
            </SidebarContent>

            <SidebarFooter className="gap-4">
                {/* Storage Card Widget in Sidebar */}
                <div className="mx-2 rounded-xl border border-neutral-100 bg-neutral-50/50 p-3.5 group-data-[collapsible=icon]:hidden dark:border-neutral-800 dark:bg-neutral-900/50">
                    <div className="mb-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">Penyimpanan (PDF)</div>
                    <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <div className="h-full rounded-full bg-blue-600 dark:bg-blue-500" style={{ width: '28%' }}></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                        <span>28.4 GB / 100 GB</span>
                        <span>28%</span>
                    </div>
                    <button className="mt-2 text-left text-[10px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                        Lihat Detail
                    </button>
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
