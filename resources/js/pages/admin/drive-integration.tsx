import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { 
    Cloud, 
    CloudOff, 
    Folder, 
    FolderPlus, 
    Check, 
    RefreshCw, 
    AlertTriangle, 
    Info, 
    CheckCircle2,
} from 'lucide-react';
import React, { useState } from 'react';
import { SearchableSelect } from '@/components/ui/searchable-select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Integrasi Drive',
        href: '/admin/drive-integration',
    },
];

interface GoogleProfile {
    name: string;
    email: string;
}

interface GoogleFolder {
    id: string;
    name: string;
}

interface DriveIntegrationProps extends SharedData {
    isConnected: boolean;
    profile: GoogleProfile | null;
    folders: GoogleFolder[];
    activeFolderId: string;
    activeFolderName: string;
    isActiveFolderMissing: boolean;
    flash?: {
        message?: string;
        error?: string;
    };
}

export default function DriveIntegration() {
    const { isConnected, profile, folders, activeFolderId, activeFolderName, isActiveFolderMissing, flash } = usePage<DriveIntegrationProps>().props;

    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Form for disconnecting
    const disconnectForm = useForm({});
    
    // Form for saving selected folder
    const folderForm = useForm({
        folder_id: activeFolderId || '',
        folder_name: activeFolderName || '',
    });

    // Form for creating new folder
    const createFolderForm = useForm({
        folder_name: '',
        parent_folder_id: '',
    });

    const handleConnect = () => {
        setIsConnecting(true);
        window.location.href = route('google-drive.connect');
    };

    const handleDisconnect = () => {
        if (confirm('Yakin ingin memutuskan koneksi Google Drive? Seluruh proses upload modul akan terhenti sampai Anda menghubungkannya kembali.')) {
            disconnectForm.post(route('admin.drive-integration.disconnect'));
        }
    };

    const handleFolderSelect = (selectedId: string) => {
        if (selectedId === '') {
            folderForm.setData({
                folder_id: '',
                folder_name: 'Folder Utama (Root / My Drive)',
            });
            return;
        }

        if (selectedId === activeFolderId && !folders.some(f => f.id === activeFolderId)) {
            folderForm.setData({
                folder_id: activeFolderId,
                folder_name: activeFolderName,
            });
            return;
        }

        const selectedFolder = folders.find(f => f.id === selectedId);
        if (selectedFolder) {
            folderForm.setData({
                folder_id: selectedFolder.id,
                folder_name: selectedFolder.name,
            });
        }
    };

    const handleSaveFolder = (e: React.FormEvent) => {
        e.preventDefault();
        folderForm.post(route('admin.drive-integration.save-folder'));
    };

    const handleCreateFolder = (e: React.FormEvent) => {
        e.preventDefault();
        createFolderForm.post(route('admin.drive-integration.create-folder'), {
            onSuccess: () => {
                setIsCreateFolderOpen(false);
                createFolderForm.reset();
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Integrasi Google Drive" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-neutral-50/60 dark:bg-neutral-900/10">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                        <Cloud className="size-6 text-blue-600 dark:text-blue-500 animate-pulse" />
                        Integrasi Google Drive
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Atur penyimpanan berkas PDF modul pelatihan langsung ke akun Google Drive Anda.
                    </p>
                </div>

                {/* Flash Messages */}
                {flash?.message && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400">
                        <CheckCircle2 className="size-4.5" />
                        <span>{flash.message}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
                        <AlertTriangle className="size-4.5" />
                        <span>{flash.error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    
                    {/* LEFT COLUMN: Status & Connection */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="overflow-hidden border-neutral-200/80 bg-white shadow-md dark:border-neutral-800 dark:bg-neutral-950 relative before:absolute before:inset-x-0 before:top-0 before:h-1.5 before:bg-gradient-to-r before:from-blue-500 before:to-indigo-500">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm mb-4">Status Otorisasi</h3>
                                
                                {isConnected && profile ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30">
                                            <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300">
                                                <Cloud className="size-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0 px-2 py-0.5 text-[9px] font-bold tracking-wide mb-1 uppercase">Terhubung</Badge>
                                                <h4 className="font-bold text-xs text-neutral-800 dark:text-neutral-200 truncate">{profile.name}</h4>
                                                <p className="text-[10px] text-neutral-400 truncate">{profile.email}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                                            <p className="flex items-center gap-1.5">
                                                <Check className="size-3.5 text-emerald-600" />
                                                Akses pembacaan file aktif
                                            </p>
                                            <p className="flex items-center gap-1.5">
                                                <Check className="size-3.5 text-emerald-600" />
                                                Unggah otomatis PDF revisi modul
                                            </p>
                                            <p className="flex items-center gap-1.5">
                                                <Check className="size-3.5 text-emerald-600" />
                                                Pemilihan direktori dinamis aktif
                                            </p>
                                        </div>

                                        <div className="pt-2">
                                            <Button 
                                                onClick={handleDisconnect} 
                                                variant="destructive" 
                                                disabled={disconnectForm.processing}
                                                className="w-full text-xs font-semibold py-2 rounded-lg"
                                            >
                                                <CloudOff className="mr-1.5 size-4" /> Putuskan Koneksi
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 py-2">
                                        <div className="flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/20 dark:bg-neutral-900/10">
                                            <CloudOff className="size-10 text-neutral-300 dark:text-neutral-700 mb-3" />
                                            <h4 className="font-bold text-xs text-neutral-800 dark:text-neutral-200 mb-1">Belum Terhubung</h4>
                                            <p className="text-[10px] text-neutral-400 max-w-[200px]">Aplikasi ini memerlukan akses ke Google Drive untuk menyimpan file-file PDF modul.</p>
                                        </div>

                                        <Button 
                                            onClick={handleConnect} 
                                            disabled={isConnecting}
                                            className="w-full text-xs font-semibold py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                                        >
                                            {isConnecting ? (
                                                <>
                                                    <RefreshCw className="mr-1.5 size-4 animate-spin" /> Menghubungkan...
                                                </>
                                            ) : (
                                                <>
                                                    <Cloud className="mr-1.5 size-4" /> Hubungkan Akun Google
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Folder Configuration & How It Works */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Folder settings - Visible only when connected */}
                        {isConnected && (
                            <Card className="border-neutral-200/80 bg-white shadow-md dark:border-neutral-800 dark:bg-neutral-950">
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm mb-1">Pengaturan Folder Penyimpanan</h3>
                                    <p className="text-[11px] text-neutral-400 mb-6">Pilih folder Google Drive yang ingin digunakan sebagai wadah penyimpanan PDF modul.</p>

                                    {/* Active folder info */}
                                    <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${
                                        isActiveFolderMissing 
                                            ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30' 
                                            : 'bg-blue-50/30 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30'
                                    }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`flex size-10 items-center justify-center rounded-xl ${
                                                isActiveFolderMissing 
                                                    ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300' 
                                                    : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                                            }`}>
                                                {isActiveFolderMissing ? <AlertTriangle className="size-5" /> : <Folder className="size-5" />}
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Folder Aktif Saat Ini</span>
                                                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                                    {activeFolderName}
                                                    {isActiveFolderMissing && (
                                                        <Badge variant="outline" className="text-[9px] border-amber-200 text-amber-600 bg-amber-50 dark:border-amber-900 dark:text-amber-400 dark:bg-transparent px-1.5 py-0">
                                                            Terhapus / Di Sampah
                                                        </Badge>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="font-mono text-[9px] text-neutral-400 bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded border border-neutral-200/60 dark:border-neutral-800 select-all group-data-[collapsible=icon]:hidden">
                                            ID: {activeFolderId || 'Default'}
                                        </span>
                                    </div>

                                    {isActiveFolderMissing && (
                                        <div className="mb-6 p-3 rounded-xl border border-amber-200 bg-amber-50/50 text-amber-800 text-[11px] font-medium leading-relaxed dark:border-amber-900/40 dark:bg-amber-950/10 dark:text-amber-400 flex items-start gap-2">
                                            <Info className="size-4 flex-shrink-0 mt-0.5 text-amber-500" />
                                            <span>
                                                <strong>Perhatian:</strong> Folder ini terhapus atau berada di tempat sampah Google Drive. Berkas PDF modul baru yang disetujui sementara akan diunggah ke <strong>Folder Utama (Root / My Drive)</strong>. Silakan buat folder baru atau pilih folder aktif lain.
                                            </span>
                                        </div>
                                    )}

                                    <form onSubmit={handleSaveFolder} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                            <div className="md:col-span-3">
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500 mb-1.5">Pilih dari Google Drive Anda</label>
                                                <SearchableSelect
                                                    value={folderForm.data.folder_id}
                                                    onChange={handleFolderSelect}
                                                    options={[
                                                        { value: '', label: 'Folder Utama (Root / My Drive)' },
                                                        ...(activeFolderId && !folders.some(f => f.id === activeFolderId) ? [
                                                            { value: activeFolderId, label: `⚠️ ${activeFolderName} (Dihapus/Tidak ditemukan di Drive)` }
                                                        ] : []),
                                                        ...folders.map(folder => ({
                                                            value: folder.id,
                                                            label: `📁 ${folder.name}`
                                                        }))
                                                    ]}
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <Button 
                                                    type="submit" 
                                                    disabled={folderForm.processing}
                                                    className="w-full h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                                >
                                                    {folderForm.processing ? 'Menyimpan...' : 'Simpan Pilihan'}
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-end pt-2">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => setIsCreateFolderOpen(true)}
                                                className="text-xs font-semibold py-1.5 h-8 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300"
                                            >
                                                <FolderPlus className="mr-1.5 size-4 text-purple-500" /> Buat Folder Baru di Drive
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* How it works info card */}
                        <Card className="border-neutral-200/80 bg-white shadow-md dark:border-neutral-800 dark:bg-neutral-950">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                                    <Info className="size-4 text-blue-500" />
                                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">Bagaimana Integrasi Google Drive Bekerja?</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                    <div className="p-4.5 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/50 space-y-2">
                                        <div className="flex size-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs">1</div>
                                        <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-xs">Otorisasi</h4>
                                        <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">Hubungkan aplikasi dengan akun Google Anda menggunakan OAuth 2.0 yang aman.</p>
                                    </div>

                                    <div className="p-4.5 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/50 space-y-2">
                                        <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-xs">2</div>
                                        <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-xs">Pilih Folder</h4>
                                        <p className="text-[11px] text-neutral-400 leading-relaxed font-sans font-sans">Semua berkas modul PDF yang disetujui (Approved) akan diunggah ke folder aktif pilihan Anda.</p>
                                    </div>

                                    <div className="p-4.5 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/50 space-y-2">
                                        <div className="flex size-7 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300 font-bold text-xs">3</div>
                                        <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-xs">Google Drive ID</h4>
                                        <p className="text-[11px] text-neutral-400 leading-relaxed font-sans font-sans">ID Google Drive disimpan di database modul agar user dapat melakukan preview file secara realtime.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* ── CREATE NEW FOLDER DIALOG ── */}
            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Buat Folder Baru di Google Drive</DialogTitle>
                        <DialogDescription>
                            Folder baru akan langsung dibuat di bawah akun Google Drive terhubung Anda.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateFolder} className="mt-2 space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                        Nama Folder <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={createFolderForm.data.folder_name}
                                        onChange={(e) => createFolderForm.setData('folder_name', e.target.value)}
                                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 h-9"
                                        placeholder="Contoh: Modul Pelatihan IHATEC"
                                        required
                                    />
                                    {createFolderForm.errors.folder_name && (
                                        <p className="mt-1 text-xs text-rose-500">{createFolderForm.errors.folder_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                        Lokasi Folder (Parent)
                                    </label>
                                    <SearchableSelect
                                        value={createFolderForm.data.parent_folder_id}
                                        onChange={(val) => createFolderForm.setData('parent_folder_id', val)}
                                        options={[
                                            { value: '', label: 'Folder Utama (Root / My Drive)' },
                                            ...folders.map(folder => ({
                                                value: folder.id,
                                                label: `📁 ${folder.name}`
                                            }))
                                        ]}
                                    />
                                    {createFolderForm.errors.parent_folder_id && (
                                        <p className="mt-1 text-xs text-rose-500">{createFolderForm.errors.parent_folder_id}</p>
                                    )}
                                </div>
                                <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateFolderOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={createFolderForm.processing || !createFolderForm.data.folder_name} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                                {createFolderForm.processing ? 'Memproses...' : 'Buat & Aktifkan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
