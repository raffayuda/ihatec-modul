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
    Shield, 
    History, 
    HardDrive, 
    Link2 
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const page = usePage<SharedData>();
    const role = page.props.auth?.user?.role || 'User';

    // Build the dynamic sidebar items list
    const items: NavItem[] = [
        {
            title: role === 'admin' ? 'Dashboard Admin' : 'Dashboard',
            url: '/dashboard',
            icon: LayoutGrid,
        }
    ];

    if (role === 'admin') {
        items.push(
            {
                title: 'Manajemen User',
                url: '/manajemen-user',
                icon: Users,
            },
        );
    }

    items.push({
        title: 'Pengajuan Modul',
        url: '/pengajuan',
        icon: FileText,
    });

    if (role === 'admin' || role === 'manager PD') {
        items.push({
            title: role === 'admin' ? 'Approval Modul' : 'Approval',
            url: '/approval',
            icon: CheckSquare,
        });
    }

    items.push(
        {
            title: 'Database Modul',
            url: '/database',
            icon: Database,
        },
        {
            title: 'Matriks Pelatihan',
            url: '/matriks',
            icon: Grid,
        }
    );

    if (role === 'admin') {
        items.push(
            {
                title: 'Master Data',
                url: '/master-data',
                icon: Layers,
            },
            {
                title: 'Audit Log',
                url: '/audit-log',
                icon: History,
            }
        );
    }

    items.push({
        title: 'Report',
        url: '/report',
        icon: BarChart3,
    });
    items.push({
        title: 'Pengaturan',
        url: '/settings',
        icon: Settings,
    });

    // If role is User, restrict to only basic options
    const filteredNavItems = role === 'User'
        ? items.filter(item => ['Dashboard', 'Pengajuan Modul', 'Pengaturan'].includes(item.title))
        : items;

    // Split filtered items into groups
    const menuUtamaGroup = [
        'Dashboard', 
        'Dashboard Admin', 
        'Manajemen User', 
        'Role & Permission', 
        'Pengajuan Modul', 
        'Approval', 
        'Approval Modul', 
        'Database Modul', 
        'Matriks Pelatihan', 
        'Master Data', 
        'Audit Log'
    ];
    const menuUtamaItems = filteredNavItems.filter((item) => menuUtamaGroup.includes(item.title));
    const lainnyaItems = filteredNavItems.filter((item) => !menuUtamaGroup.includes(item.title));

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
