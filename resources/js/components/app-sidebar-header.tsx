import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Bell, CircleHelp, Search } from 'lucide-react';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const page = usePage<SharedData>();
    const auth = page.props.auth;
    const getInitials = useInitials();
    const user = auth?.user;

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 dark:bg-neutral-950">
            {/* Left side: Trigger and Breadcrumbs */}
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <div className="hidden sm:block">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            {/* Center: Search input */}
            <div className="relative hidden max-w-md flex-1 px-4 md:block">
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Cari modul, pengaju, atau kode modul..."
                        className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 pr-12 pl-9 text-sm text-neutral-900 transition-all outline-none placeholder:text-neutral-400 focus:border-blue-500 focus:bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-blue-500"
                    />
                    <div className="absolute top-1/2 right-3 -translate-y-1/2 rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-500">
                        ⌘ K
                    </div>
                </div>
            </div>

            {/* Right side: Actions & User Info */}
            <div className="flex items-center gap-3">
                <div className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900">
                    <Bell className="h-5 w-5 text-neutral-600 dark:text-neutral-350" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
                        12
                    </span>
                </div>
                <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900">
                    <CircleHelp className="h-5 w-5 text-neutral-600 dark:text-neutral-350" />
                </div>
                <AppearanceToggleDropdown className="text-neutral-600 dark:text-neutral-350" />

                {user && (
                    <div className="flex items-center gap-3 border-l border-neutral-100 pl-4 dark:border-neutral-800">
                        <Avatar className="h-8 w-8 overflow-hidden rounded-full border border-neutral-200 dark:border-neutral-800">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="hidden flex-col text-left md:flex">
                            <span className="text-xs leading-tight font-semibold text-neutral-800 dark:text-neutral-200">{user.name}</span>
                            <span className="text-[10px] leading-tight font-medium text-neutral-400 capitalize dark:text-neutral-500">
                                {user.role}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

