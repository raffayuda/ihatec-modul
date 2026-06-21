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
        { title: 'Jenis Perubahan', url: '/master-data/jenis-perubahan', icon: FileEdit },
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
        { title: 'Database Program Pelatihan', url: '/database-program', icon: Database },
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
        { title: 'Database Program Pelatihan', url: '/database-program', icon: Database },
        { title: 'Report', url: '/report', icon: BarChart3 },
        { title: 'Notifikasi', url: '/notifikasi', icon: Bell },
    ];

    // ── Staf PD ──────────────────────────────────────────────────────────────
    const stafPdItems: NavItem[] = [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
        { title: 'Permintaan Modul Khusus', url: '/pengajuan', icon: FileText },
        { title: 'Perubahan Modul', url: '/perubahan-modul', icon: FileEdit },
        { title: 'Database Modul', url: '/database', icon: Database },
        { title: 'Database Program Pelatihan', url: '/database-program', icon: Database },
        { title: 'Formula Modul', url: '/formula', icon: FlaskConical },
        { title: 'Matriks Pelatihan', url: '/matriks', icon: Grid },
        { title: 'Notifikasi', url: '/notifikasi', icon: Bell },
    ];

    // ── Tim Training ─────────────────────────────────────────────────────────
    const timTrainingItems: NavItem[] = [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
        { title: 'Formula Modul', url: '/formula', icon: FlaskConical },
        { title: 'Matriks Pelatihan', url: '/matriks', icon: Grid },
    ];

    // ── User (Pengaju) ───────────────────────────────────────────────────────
    const userItems: NavItem[] = [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
        { title: 'Permintaan Modul Khusus', url: '/pengajuan', icon: FilePlus },
        { title: 'Notifikasi', url: '/notifikasi', icon: Bell },
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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
