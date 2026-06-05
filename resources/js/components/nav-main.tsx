import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ label, items = [] }: { label?: string; items: NavItem[] }) {
    const page = usePage();

    if (items.length === 0) {
        return null;
    }

    return (
        <SidebarGroup className="px-2 py-1">
            {label && (
                <SidebarGroupLabel className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400/90 dark:text-neutral-500/90">
                    {label}
                </SidebarGroupLabel>
            )}
            <SidebarMenu className="space-y-0.5">
                {items.map((item) => {
                    const isActive = item.url === page.url || (item.url !== '/dashboard' && page.url.startsWith(item.url));

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={isActive} className="h-9 px-3 py-2 rounded-lg text-sm">
                                <Link href={item.url} prefetch>
                                    {item.icon && <item.icon className="size-4" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
