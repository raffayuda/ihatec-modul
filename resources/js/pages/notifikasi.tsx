import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notifikasi',
        href: '/notifikasi',
    },
];

interface NotificationItem {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    is_read: boolean;
    created_at: string;
}

interface NotifikasiProps extends SharedData {
    notifications?: NotificationItem[];
}

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
    info: { icon: Info, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    success: { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    warning: { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    error: { icon: XCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' },
};

// Sample placeholder notifications (will be replaced by real data when backend is connected)
const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
    {
        id: 1,
        title: 'Pengajuan Baru',
        message: 'Pengajuan 001/Modul Khusus/PD/VI/2026 telah berhasil dibuat dan menunggu proses.',
        type: 'info',
        is_read: false,
        created_at: '2026-06-18T10:00:00Z',
    },
    {
        id: 2,
        title: 'Modul Disetujui',
        message: 'Pengajuan revisi modul PMD-2026-0001 telah disetujui oleh Manager PD.',
        type: 'success',
        is_read: false,
        created_at: '2026-06-17T14:30:00Z',
    },
    {
        id: 3,
        title: 'Pengajuan Perlu Revisi',
        message: 'Pengajuan PMD-2026-0002 memerlukan revisi. Silakan periksa catatan dari Manager PD.',
        type: 'warning',
        is_read: true,
        created_at: '2026-06-16T09:15:00Z',
    },
    {
        id: 4,
        title: 'Pengajuan Ditolak',
        message: 'Pengajuan 002/Modul Khusus/PD/VI/2026 telah ditolak. Silakan hubungi Staf PD untuk informasi lebih lanjut.',
        type: 'error',
        is_read: true,
        created_at: '2026-06-15T16:45:00Z',
    },
];

export default function Notifikasi() {
    const { auth, notifications: serverNotifications } = usePage<NotifikasiProps>().props;

    const notifications = serverNotifications ?? SAMPLE_NOTIFICATIONS;
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifikasi" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Notifikasi</h1>
                            {unreadCount > 0 && (
                                <Badge className="rounded-full bg-blue-600 text-white border-0 px-2 py-0.5 text-xs font-semibold">
                                    {unreadCount} baru
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Pemberitahuan terkait aktivitas pengajuan, approval, dan perubahan status modul.
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800">
                            <CheckCheck className="size-3.5" />
                            Tandai semua dibaca
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="max-w-3xl">
                    {notifications.length === 0 ? (
                        <Card className="border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                                    <Bell className="size-7 text-neutral-300 dark:text-neutral-600" />
                                </div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Belum ada notifikasi</p>
                                <p className="text-xs text-neutral-400 dark:text-neutral-500">Notifikasi akan muncul di sini saat ada pembaruan pengajuan atau modul.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notif) => {
                                const config = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.info;
                                const IconComponent = config.icon;
                                return (
                                    <div
                                        key={notif.id}
                                        className={`group flex items-start gap-4 rounded-xl border px-5 py-4 transition-all cursor-pointer ${
                                            notif.is_read
                                                ? 'border-neutral-200/60 bg-white dark:border-neutral-800 dark:bg-neutral-950'
                                                : 'border-blue-100 bg-blue-50/30 dark:border-blue-900/40 dark:bg-blue-950/10 shadow-sm'
                                        }`}
                                    >
                                        <div className={`flex size-9 flex-shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
                                            <IconComponent className={`size-4 ${config.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <p className={`text-sm font-semibold ${notif.is_read ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-900 dark:text-neutral-100'}`}>
                                                    {notif.title}
                                                </p>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {!notif.is_read && (
                                                        <span className="size-2 rounded-full bg-blue-500 flex-shrink-0" />
                                                    )}
                                                    <span className="text-[10px] font-medium text-neutral-400 whitespace-nowrap">{formatDate(notif.created_at)}</span>
                                                </div>
                                            </div>
                                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{notif.message}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
