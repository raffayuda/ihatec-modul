<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\ModuleRevision;
use App\Models\Setting;
use App\Services\GoogleDriveOAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    protected GoogleDriveOAuthService $driveService;

    public function __construct(GoogleDriveOAuthService $driveService)
    {
        $this->driveService = $driveService;
    }

    /**
     * Display a listing of the modules.
     */
    public function index(): Response
    {
        $modulesRaw = Module::with(['revisions' => function ($q) {
            $q->orderBy('id', 'desc');
        }])->orderBy('updated_at', 'desc')->get();

        // Format modules exactly as required by React component
        $modules = $modulesRaw->map(function ($m) {
            return [
                'id' => $m->code,
                'title' => $m->title,
                'program' => $m->program,
                'revision' => $m->current_revision,
                'language' => $m->language,
                'updatedAt' => $this->formatIndonesianDate($m->updated_at),
                'status' => $m->status,
                'fileSize' => $m->file_size ?? '0 B',
                'filePages' => $m->file_pages,
                'description' => $m->description ?? '',
                'revisionsHistory' => $m->revisions->map(function ($rev) {
                    return [
                        'version' => $rev->revision,
                        'date' => $this->formatIndonesianDate($rev->created_at).' WIB',
                        'author' => $rev->author_name,
                        'note' => $rev->note ?? '',
                        'status' => $rev->status,
                    ];
                })->toArray(),
            ];
        });

        // Compute metrics
        $metrics = [
            'total' => Module::count(),
            'approved' => Module::where('status', 'Approved')->count(),
            'revisi' => Module::where('status', 'Revisi')->count(),
            'arsip' => Module::where('status', 'Arsip')->count(),
        ];

        // Compute categories chart data
        $categoriesData = Module::selectRaw('program, count(*) as value')
            ->groupBy('program')
            ->get();

        $colorMap = [
            'Regulasi & Kepatuhan' => '#3b82f6',
            'Teknis Laboratorium' => '#a855f7',
            'Sertifikasi & Auditor' => '#ec4899',
            'Manajerial & Kepemimpinan' => '#f59e0b',
            'Teknis Produksi' => '#10b981',
            'Supply Chain & Logistik' => '#38bdf8',
            'K3 & Keamanan' => '#ef4444',
            'Pengembangan SDM' => '#14b8a6',
            'Lainnya' => '#6b7280',
        ];

        $categories = $categoriesData->map(function ($c) use ($colorMap) {
            return [
                'name' => $c->program,
                'value' => (int) $c->value,
                'fill' => $colorMap[$c->program] ?? '#6b7280',
            ];
        });

        // Compute popular modules by page view (can seed or mock count)
        $popularModules = $modules->take(5)->map(function ($m, $index) {
            $views = [2842, 2196, 1896, 1654, 1502];

            return [
                'id' => $m['id'],
                'title' => $m['title'],
                'views' => $views[$index] ?? 1000,
            ];
        });

        $refreshToken = Setting::get('google_refresh_token') 
            ?? config('services.google.refresh_token') 
            ?? env('GOOGLE_REFRESH_TOKEN');
        $isDriveConnected = !empty($refreshToken);

        return Inertia::render('database', [
            'modules' => $modules,
            'metrics' => $metrics,
            'categories' => $categories,
            'popular' => $popularModules,
            'isDriveConnected' => $isDriveConnected,
        ]);
    }

    /**
     * Store a newly created module.
     */
    public function store(Request $request)
    {
        if (! in_array(Auth::user()->role, ['admin', 'staf pd', 'Staf PD'])) {
            abort(403, 'Akses ditolak. Peran Anda tidak diizinkan untuk menambahkan modul.');
        }

        $refreshToken = Setting::get('google_refresh_token') 
            ?? config('services.google.refresh_token') 
            ?? env('GOOGLE_REFRESH_TOKEN');

        if (empty($refreshToken)) {
            return back()->withErrors(['error' => 'Tidak dapat menyimpan modul. Akun Google Drive belum terhubung. Silakan hubungi Administrator untuk menghubungkan Google Drive.']);
        }

        $request->validate([
            'code' => 'required|string|unique:modules,code',
            'title' => 'required|string',
            'program' => 'required|string',
            'language' => 'required|string',
            'description' => 'nullable|string',
            'file' => 'required|file|mimes:pdf|max:20480',
        ]);

        $code = strtoupper($request->input('code'));
        $file = $request->file('file');
        $fileSizeStr = $this->formatBytes($file->getSize());

        // Store temporarily
        $tempPath = $file->store('temp_uploads', 'public');
        $absolutePath = Storage::disk('public')->path($tempPath);
        $pageCount = $this->getPdfPageCount($absolutePath);

        // Upload to Google Drive (FATAL if fails)
        try {
            $driveFileId = $this->driveService->uploadFile($absolutePath, $code.'.pdf');
        } catch (\Exception $e) {
            // Clean up temp file
            Storage::disk('public')->delete($tempPath);
            return back()->withErrors(['error' => 'Gagal mengunggah ke Google Drive: '.$e->getMessage()]);
        }

        // Clean up temp file
        Storage::disk('public')->delete($tempPath);

        $module = Module::create([
            'code' => $code,
            'title' => $request->input('title'),
            'program' => $request->input('program'),
            'language' => $request->input('language'),
            'description' => $request->input('description'),
            'status' => 'Approved',
            'current_revision' => '1.0',
            'file_path' => null,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $fileSizeStr,
            'file_pages' => $pageCount,
            'drive_file_id' => $driveFileId,
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'created_by' => Auth::id(),
        ]);

        ModuleRevision::create([
            'module_id' => $module->id,
            'revision' => '1.0',
            'note' => 'Rilis pertama modul baru.',
            'author_name' => Auth::user()->name ?? 'System Admin',
            'status' => 'Approved',
            'file_path' => null,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $fileSizeStr,
            'file_pages' => $pageCount,
            'drive_file_id' => $driveFileId,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('database')->with('message', "Modul {$module->code} berhasil ditambahkan.");
    }

    /**
     * Download the PDF from Google Drive.
     */
    public function download(string $code)
    {
        $module = Module::where('code', $code)->firstOrFail();

        // Priority: local public storage → pdf_cache → Google Drive
        if ($module->file_path && Storage::disk('public')->exists($module->file_path)) {
            return Storage::disk('public')->download($module->file_path, ($module->file_name ?? $code).'.pdf');
        }

        $cachePath = storage_path('app/pdf_cache/'.$module->code.'.pdf');
        if (file_exists($cachePath)) {
            return response()->download($cachePath, $module->code.'.pdf', ['Content-Type' => 'application/pdf']);
        }

        if (empty($module->drive_file_id)) {
            return back()->withErrors(['error' => 'File tidak tersedia.']);
        }

        try {
            $content = $this->driveService->downloadFile($module->drive_file_id);

            return response($content)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="'.$code.'.pdf"');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal mengunduh file: '.$e->getMessage()]);
        }
    }

    /**
     * Preview the PDF inline.
     */
    public function preview(string $code)
    {
        $module = Module::where('code', $code)->firstOrFail();

        // Priority: local public storage → pdf_cache → Google Drive
        if ($module->file_path && Storage::disk('public')->exists($module->file_path)) {
            return response()->file(
                Storage::disk('public')->path($module->file_path),
                ['Content-Type' => 'application/pdf', 'Content-Disposition' => 'inline; filename="'.$code.'.pdf"']
            );
        }

        $cachePath = storage_path('app/pdf_cache/'.$module->code.'.pdf');
        if (file_exists($cachePath)) {
            return response()->file($cachePath, ['Content-Type' => 'application/pdf', 'Content-Disposition' => 'inline; filename="'.$code.'.pdf"']);
        }

        if (empty($module->drive_file_id)) {
            return response()->json(['error' => 'File tidak tersedia.'], 404);
        }

        try {
            $content = $this->driveService->downloadFile($module->drive_file_id);

            return response($content)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'inline; filename="'.$code.'.pdf"');
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal preview file: '.$e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified module.
     */
    public function destroy(string $code)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Akses ditolak. Hanya Administrator yang dapat menghapus modul.');
        }

        $module = Module::where('code', $code)->firstOrFail();

        // Delete associated files from Google Drive
        $driveFileIds = $module->revisions()->pluck('drive_file_id')
            ->merge([$module->drive_file_id])
            ->filter()
            ->unique();

        foreach ($driveFileIds as $fileId) {
            try {
                $this->driveService->deleteFile($fileId);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning("Gagal menghapus file Google Drive {$fileId} saat menghapus modul {$code}: " . $e->getMessage());
            }
        }

        // Delete local cache if it exists
        $cachePath = storage_path('app/pdf_cache/'.$module->code.'.pdf');
        if (file_exists($cachePath)) {
            @unlink($cachePath);
        }

        $module->delete();

        return redirect()->route('database')->with('message', "Modul {$code} berhasil dihapus.");
    }

    /**
     * Update the specified module.
     */
    public function update(Request $request, string $code)
    {
        if (! in_array(Auth::user()->role, ['admin', 'staf pd', 'Staf PD'])) {
            abort(403, 'Akses ditolak. Peran Anda tidak diizinkan untuk mengubah modul.');
        }

        $module = Module::where('code', $code)->firstOrFail();

        $request->validate([
            'code' => 'required|string|unique:modules,code,' . $module->id,
            'title' => 'required|string',
            'program' => 'required|string',
            'language' => 'required|string',
            'description' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf|max:20480',
        ]);

        $newCode = strtoupper($request->input('code'));
        $oldDriveFileId = $module->drive_file_id;
        $file = $request->file('file');

        $updateData = [
            'code' => $newCode,
            'title' => $request->input('title'),
            'program' => $request->input('program'),
            'language' => $request->input('language'),
            'description' => $request->input('description'),
        ];

        // Delete cache file if code changes or new file is uploaded
        if ($newCode !== $module->code || $file) {
            $cachePath = storage_path('app/pdf_cache/' . $module->code . '.pdf');
            if (file_exists($cachePath)) {
                @unlink($cachePath);
            }
            $newCachePath = storage_path('app/pdf_cache/' . $newCode . '.pdf');
            if (file_exists($newCachePath)) {
                @unlink($newCachePath);
            }
        }

        if ($file) {
            $fileSizeStr = $this->formatBytes($file->getSize());

            // Store temporarily
            $tempPath = $file->store('temp_uploads', 'public');
            $absolutePath = Storage::disk('public')->path($tempPath);
            $pageCount = $this->getPdfPageCount($absolutePath);

            // Upload new file to Google Drive
            try {
                $driveFileId = $this->driveService->uploadFile($absolutePath, $newCode.'.pdf');
            } catch (\Exception $e) {
                Storage::disk('public')->delete($tempPath);
                return back()->withErrors(['error' => 'Gagal mengunggah file baru ke Google Drive: '.$e->getMessage()]);
            }

            // Clean up temp file
            Storage::disk('public')->delete($tempPath);

            // Delete old file from Google Drive
            if (!empty($oldDriveFileId)) {
                try {
                    $this->driveService->deleteFile($oldDriveFileId);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning("Gagal menghapus file lama Google Drive {$oldDriveFileId} saat memperbarui modul {$code}: " . $e->getMessage());
                }
            }

            $updateData['file_name'] = $file->getClientOriginalName();
            $updateData['file_size'] = $fileSizeStr;
            $updateData['file_pages'] = $pageCount;
            $updateData['drive_file_id'] = $driveFileId;
            $updateData['file_path'] = null;

            // Update the latest revision record
            $latestRevision = $module->revisions()->first();
            if ($latestRevision) {
                $oldRevFileId = $latestRevision->drive_file_id;
                if (!empty($oldRevFileId) && $oldRevFileId !== $oldDriveFileId) {
                    try {
                        $this->driveService->deleteFile($oldRevFileId);
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::warning("Gagal menghapus file revisi lama Google Drive {$oldRevFileId}: " . $e->getMessage());
                    }
                }

                $latestRevision->update([
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $fileSizeStr,
                    'file_pages' => $pageCount,
                    'drive_file_id' => $driveFileId,
                    'file_path' => null,
                ]);
            }
        }

        $module->update($updateData);

        return redirect()->route('database')->with('message', "Modul {$newCode} berhasil diperbarui.");
    }


    /**
     * Archive the specified module.
     */
    public function archive(string $code)
    {
        if (! in_array(strtolower(Auth::user()->role), ['admin', 'staf pd'])) {
            abort(403, 'Akses ditolak. Peran Anda tidak diizinkan untuk mengarsipkan modul.');
        }

        $module = Module::where('code', $code)->firstOrFail();
        $module->update(['status' => 'Arsip']);

        // Update the status of revisions to 'Arsip' as well
        $module->revisions()->update(['status' => 'Arsip']);

        return redirect()->route('database')->with('message', "Modul {$code} berhasil diarsipkan.");
    }

    /**
     * Unarchive the specified module.
     */
    public function unarchive(string $code)
    {
        if (! in_array(strtolower(Auth::user()->role), ['admin', 'staf pd'])) {
            abort(403, 'Akses ditolak. Peran Anda tidak diizinkan untuk mengaktifkan kembali modul.');
        }

        $module = Module::where('code', $code)->firstOrFail();
        $module->update(['status' => 'Approved']);

        // Update the status of revisions to 'Approved' as well
        $module->revisions()->update(['status' => 'Approved']);

        return redirect()->route('database')->with('message', "Modul {$code} berhasil diaktifkan kembali.");
    }

    /**
     * Create a new revision of the specified module.
     */
    public function revision(Request $request, string $code)
    {
        if (! in_array(Auth::user()->role, ['admin', 'staf pd', 'Staf PD'])) {
            abort(403, 'Akses ditolak. Peran Anda tidak diizinkan untuk merevisi modul.');
        }

        $refreshToken = Setting::get('google_refresh_token') 
            ?? config('services.google.refresh_token') 
            ?? env('GOOGLE_REFRESH_TOKEN');

        if (empty($refreshToken)) {
            return back()->withErrors(['error' => 'Tidak dapat merevisi modul. Akun Google Drive belum terhubung. Silakan hubungi Administrator untuk menghubungkan Google Drive.']);
        }

        $request->validate([
            'revision' => 'required|string',
            'note' => 'required|string',
            'file' => 'required|file|mimes:pdf|max:20480',
        ]);

        $module = Module::where('code', $code)->firstOrFail();
        $newRevision = $request->input('revision');

        $file = $request->file('file');
        $fileSizeStr = $this->formatBytes($file->getSize());

        // Store temporarily
        $tempPath = $file->store('temp_uploads', 'public');
        $absolutePath = Storage::disk('public')->path($tempPath);
        $pageCount = $this->getPdfPageCount($absolutePath);

        // Upload to Google Drive (FATAL if fails)
        try {
            $driveFileId = $this->driveService->uploadFile($absolutePath, $module->code.'.pdf');
        } catch (\Exception $e) {
            // Clean up temp file
            Storage::disk('public')->delete($tempPath);
            return back()->withErrors(['error' => 'Gagal mengunggah ke Google Drive: '.$e->getMessage()]);
        }

        // Clean up temp file
        Storage::disk('public')->delete($tempPath);

        // Save revision history
        ModuleRevision::create([
            'module_id' => $module->id,
            'revision' => $newRevision,
            'note' => $request->input('note'),
            'author_name' => Auth::user()->name ?? 'System Admin',
            'status' => 'Approved',
            'file_path' => null,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $fileSizeStr,
            'file_pages' => $pageCount,
            'drive_file_id' => $driveFileId,
            'created_by' => Auth::id(),
        ]);

        // Update module to new revision (old file stays in ModuleRevision history)
        $module->update([
            'current_revision' => $newRevision,
            'file_path' => null,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $fileSizeStr,
            'file_pages' => $pageCount,
            'drive_file_id' => $driveFileId,
            'status' => 'Approved',
        ]);

        return redirect()->route('database')->with('message', "Revisi {$newRevision} untuk modul {$module->code} berhasil ditambahkan.");
    }

    /**
     * Format Indonesian date.
     */
    protected function formatIndonesianDate($date): string
    {
        $months = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
            7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
        ];
        $carbon = Carbon::parse($date);
        $day = $carbon->day;
        $month = $months[$carbon->month];
        $year = $carbon->year;
        $time = $carbon->format('H:i');

        return "{$day} {$month} {$year} {$time}";
    }

    /**
     * Format file size.
     */
    protected function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision).' '.$units[$pow];
    }

    /**
     * Parse PDF page count.
     */
    protected function getPdfPageCount(string $filePath): int
    {
        $content = @file_get_contents($filePath);
        if ($content === false) {
            return 1;
        }
        if (preg_match('/\/Count\s+(\d+)/', $content, $matches)) {
            return (int) $matches[1];
        }
        $count = preg_match_all('/\/Type\s*\/Page\b/', $content, $matches);
        if ($count > 0) {
            return $count;
        }

        return 1;
    }
}
