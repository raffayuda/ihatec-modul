import { BookOpen } from 'lucide-react';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2">
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20">
                <BookOpen className="size-5" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-neutral-900 dark:text-neutral-100">Training PD</span>
                <span className="truncate text-[10px] font-medium text-neutral-500 dark:text-neutral-400">Module Management</span>
            </div>
        </div>
    );
}
