import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { 
    BarChart3, 
    CheckSquare, 
    Database, 
    FileText, 
    Grid, 
    Layers, 
    LayoutGrid, 
    Settings, 
    Users, 
    History, 
    FlaskConical,
    FilePlus,
    RotateCcw,
    ClipboardList,
    Bell,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const page = usePage<SharedData>();
    const role = page.props.auth?.user?.role || 'User';

    // Normalize role to lowercase for consistent comparisons
    const roleLower = role.toLowerCase();

    // ── Admin Menu ──────────────────────────────────────────────────────────
    const adminItems: NavItem[] = [
        { title: 'Dashboard Admin', url: '/dashboard', icon: LayoutGrid },
        { title: 'Manajemen User', url: '/manajemen-user', icon: Users },
        { title: 'Pengajuan Modul', url: '/pengajuan', icon: FileText },
        { title: 'Approval Modul', url: '/approval', icon: CheckSquare },
        { title: 'Database Modul', url: '/database', icon: Database },
        { title: 'Matriks Pelatihan', url: '/matriks', icon: Grid },
        { title: 'Manajemen Modul', url: '/master-data', icon: Layers },
        // { title: 'Audit Log', url: '/audit-log', icon: History },
        { title: 'Report', url: '/report', icon: BarChart3 },
        { title: 'Pengaturan', url: '/settings', icon: Settings },
    ];

    // ── Manager PD Menu ─────────────────────────────────────────────────────
    const managerItems: NavItem[] = [
        { title: 'Dashboard Manager PD', url: '/dashboard', icon: LayoutGrid },
        { title: 'Approval Modul', url: '/approval', icon: CheckSquare },
        { title: 'Database Modul', url: '/database', icon: Database },
        { title: 'Matriks Pelatihan', url: '/matriks', icon: Grid },
        { title: 'Formula Modul', url: '/formula', icon: FlaskConical },
        { title: 'Report', url: '/report', icon: BarChart3 },
        { title: 'Pengaturan', url: '/settings', icon: Settings },
    ];

    // ── Staf PD Menu ────────────────────────────────────────────────────────
    const stafPdItems: NavItem[] = [
        { title: 'Dashboard Staf PD', url: '/dashboard', icon: LayoutGrid },
        { title: 'Pengajuan Modul', url: '/pengajuan', icon: FilePlus },
        { title: 'Database Modul', url: '/database', icon: Database },
        { title: 'Matriks Pelatihan', url: '/matriks', icon: Grid },
        { title: 'Formula Modul', url: '/formula', icon: FlaskConical },
        { title: 'Pengaturan', url: '/settings', icon: Settings },
    ];

    // ── Tim Training Menu ───────────────────────────────────────────────────
    const timTrainingItems: NavItem[] = [
        { title: 'Dashboard Tim Training', url: '/dashboard', icon: LayoutGrid },
        { title: 'Database Modul', url: '/database', icon: Database },
        { title: 'Matriks Pelatihan', url: '/matriks', icon: Grid },
        { title: 'Formula Modul', url: '/formula', icon: FlaskConical },
        { title: 'Report', url: '/report', icon: BarChart3 },
        { title: 'Pengaturan', url: '/settings', icon: Settings },
    ];

    // ── User (Pengaju) Menu ─────────────────────────────────────────────────
    const userItems: NavItem[] = [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
        { title: 'Pengajuan Modul', url: '/pengajuan', icon: ClipboardList },
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

    // Group: "Menu Utama" vs "Master Data" vs "Laporan & Lainnya"
    const masterDataTitles = ['Manajemen User', 'Manajemen Modul'];
    const lainnyaTitles = ['Report', 'Pengaturan'];
    const menuUtamaItems = allItems.filter((item) => !lainnyaTitles.includes(item.title) && !masterDataTitles.includes(item.title));
    const masterDataItems = allItems.filter((item) => masterDataTitles.includes(item.title));
    const lainnyaItems = allItems.filter((item) => lainnyaTitles.includes(item.title));

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
                {masterDataItems.length > 0 && (
                    <NavMain label="Master Data" items={masterDataItems} />
                )}
                <NavMain label="Menu Utama" items={menuUtamaItems} />
                <NavMain label="Laporan & Lainnya" items={lainnyaItems} />
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
