import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

function NavItemRow({ item }: { item: NavItem }) {
    const page = usePage();

    const isChildActive = (item.children ?? []).some(
        (child) => child.url === page.url || (child.url !== '/dashboard' && page.url.startsWith(child.url)),
    );
    const isActive = item.url === page.url || (item.url !== '/dashboard' && page.url.startsWith(item.url)) || isChildActive;

    const [open, setOpen] = useState<boolean>(isActive);

    if (item.children && item.children.length > 0) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={() => setOpen((v) => !v)}
                    isActive={isActive}
                    className="h-9 px-3 py-2 rounded-lg text-sm cursor-pointer justify-between"
                >
                    <div className="flex items-center gap-2 min-w-0">
                        {item.icon && <item.icon className="size-4 flex-shrink-0" />}
                        <span className="truncate">{item.title}</span>
                    </div>
                    <ChevronRight
                        className={`size-3.5 flex-shrink-0 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
                    />
                </SidebarMenuButton>

                {open && (
                    <SidebarMenuSub className="ml-5 border-l border-neutral-200 dark:border-neutral-800 pl-2 pt-0.5 space-y-0.5">
                        {item.children.map((child) => {
                            const isChildItemActive =
                                child.url === page.url || (child.url !== '/dashboard' && page.url.startsWith(child.url.split('?')[0]));
                            return (
                                <SidebarMenuSubItem key={child.title}>
                                    <SidebarMenuSubButton asChild isActive={isChildItemActive} className="h-8 rounded-lg text-xs">
                                        <Link href={child.url} prefetch>
                                            {child.icon && <child.icon className="size-3.5" />}
                                            <span>{child.title}</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            );
                        })}
                    </SidebarMenuSub>
                )}
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive} className="h-9 px-3 py-2 rounded-lg text-sm">
                <Link href={item.url} prefetch>
                    {item.icon && <item.icon className="size-4" />}
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export function NavMain({ label, items = [] }: { label?: string; items: NavItem[] }) {
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
                {items.map((item) => (
                    <NavItemRow key={item.title} item={item} />
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
