<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\ModuleRequest;
use App\Models\ModuleRevision;
use App\Services\GoogleDriveOAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalController extends Controller
{
    protected GoogleDriveOAuthService $driveService;

    public function __construct(GoogleDriveOAuthService $driveService)
    {
        $this->driveService = $driveService;
    }

    /**
     * Show the approval queue.
     * Only admin and Manager PD can access.
     */
    public function index(): Response
    {
        $user = Auth::user();

        if (! in_array(strtolower($user->role), ['admin', 'manager pd'])) {
            abort(403, 'Akses ditolak.');
        }

        // Pending queue
        $queue = ModuleRequest::with(['applicant', 'relatedModule'])
            ->where('status', 'Menunggu Approval')
            ->orderBy('created_at')
            ->get()
            ->map(fn ($req) => $this->formatRequest($req));

        // History (already processed)
        $history = ModuleRequest::with(['applicant', 'processor', 'relatedModule'])
            ->whereIn('status', ['Selesai', 'Ditolak'])
            ->orderByDesc('processed_at')
            ->limit(50)
            ->get()
            ->map(fn ($req) => $this->formatRequest($req));

        // Stats
        $stats = [
            'pending' => ModuleRequest::where('status', 'Menunggu Approval')->count(),
            'approved' => ModuleRequest::where('status', 'Selesai')->count(),
            'rejected' => ModuleRequest::where('status', 'Ditolak')->count(),
            'total' => ModuleRequest::count(),
        ];

        return Inertia::render('approval', [
            'queue' => $queue,
            'history' => $history,
            'stats' => $stats,
        ]);
    }

    /**
     * Approve a module request.
     *
     * Alur 8.1 (Modul Baru): Creates a new entry in modules table.
     * Alur 8.2 (Revisi Modul): Increments revision code and stores history.
     * Alur 8.3 (Kebutuhan Khusus): Simply marks as Selesai.
     */
    public function approve(Request $request, int $id): RedirectResponse
    {
        $user = Auth::user();

        if (! in_array(strtolower($user->role), ['admin', 'manager pd'])) {
            abort(403, 'Akses ditolak.');
        }

        $moduleRequest = ModuleRequest::with('relatedModule')->findOrFail($id);

        if ($moduleRequest->status !== 'Menunggu Approval') {
            return redirect()->route('approval')
                ->with('error', 'Pengajuan ini tidak sedang menunggu approval.');
        }

        // ── 8.1: Modul Baru → create entry in modules ───────────────────────
        if ($moduleRequest->type === 'Modul Baru') {
            $moduleCode = Module::generateCode();

            // Move file from pengajuan storage to modules storage
            $newFilePath = null;
            $newFileName = null;
            $newFileSize = null;
            $pageCount = 1;
            $driveFileId = null;

            if ($moduleRequest->file_path && Storage::disk('public')->exists($moduleRequest->file_path)) {
                $newDir = "modules/{$moduleCode}/revisi-1.0";
                $newFileName = "{$moduleCode}_v1.0.pdf";
                $newFilePath = "{$newDir}/{$newFileName}";

                Storage::disk('public')->copy($moduleRequest->file_path, $newFilePath);
                $newFileSize = $this->formatBytes(Storage::disk('public')->size($newFilePath));

                $absolutePath = Storage::disk('public')->path($newFilePath);
                $pageCount = $this->getPdfPageCount($absolutePath);

                // Upload to Google Drive (non-fatal)
                try {
                    $driveFileId = $this->driveService->uploadFile($absolutePath, $moduleCode.'.pdf');
                } catch (\Exception $e) {
                    Log::error('Google Drive Upload Failed during Approval', ['error' => $e->getMessage()]);
                }
            }

            $module = Module::create([
                'code' => $moduleCode,
                'title' => $moduleRequest->title,
                'program' => $moduleRequest->program ?? $moduleRequest->unit ?? 'Umum',
                'language' => $moduleRequest->language ?? 'Indonesia',
                'description' => $moduleRequest->description,
                'status' => 'Approved',
                'current_revision' => '1.0',
                'file_path' => $newFilePath,
                'file_name' => $newFileName ?? $moduleRequest->file_name,
                'file_size' => $newFileSize ?? $moduleRequest->file_size,
                'file_pages' => $pageCount,
                'drive_file_id' => $driveFileId,
                'approved_by' => $user->id,
                'approved_at' => now(),
                'source_request_id' => $moduleRequest->id,
                'created_by' => $moduleRequest->applicant_id,
            ]);

            // Create initial revision record (history entry)
            ModuleRevision::create([
                'module_id' => $module->id,
                'revision' => '1.0',
                'note' => 'Rilis pertama — approved oleh '.$user->name,
                'reason' => $moduleRequest->description,
                'author_name' => $moduleRequest->applicant?->name ?? 'Sistem',
                'status' => 'Approved',
                'file_path' => $newFilePath,
                'file_name' => $newFileName ?? $moduleRequest->file_name,
                'file_size' => $newFileSize ?? $moduleRequest->file_size,
                'file_pages' => $pageCount,
                'drive_file_id' => $driveFileId,
                'created_by' => $moduleRequest->applicant_id,
            ]);
        }

        // ── 8.2: Revisi Modul → increment revision on existing module ────────
        elseif ($moduleRequest->type === 'Revisi Modul' && $moduleRequest->relatedModule) {
            $existingModule = $moduleRequest->relatedModule;
            $newRevision = Module::incrementRevision($existingModule->current_revision);

            // Move/copy new file
            $newFilePath = null;
            $newFileName = null;
            $newFileSize = null;
            $pageCount = 1;
            $driveFileId = null;

            if ($moduleRequest->file_path && Storage::disk('public')->exists($moduleRequest->file_path)) {
                $newDir = "modules/{$existingModule->code}/revisi-{$newRevision}";
                $newFileName = "{$existingModule->code}_v{$newRevision}.pdf";
                $newFilePath = "{$newDir}/{$newFileName}";

                Storage::disk('public')->copy($moduleRequest->file_path, $newFilePath);
                $newFileSize = $this->formatBytes(Storage::disk('public')->size($newFilePath));

                $absolutePath = Storage::disk('public')->path($newFilePath);
                $pageCount = $this->getPdfPageCount($absolutePath);

                // Upload to Google Drive (non-fatal)
                try {
                    $driveFileId = $this->driveService->uploadFile($absolutePath, $existingModule->code.'.pdf');
                } catch (\Exception $e) {
                    Log::error('Google Drive Upload Failed during Approval', ['error' => $e->getMessage()]);
                }
            }

            // Save old revision as history before updating
            ModuleRevision::create([
                'module_id' => $existingModule->id,
                'revision' => $newRevision,
                'note' => 'Revisi approved oleh '.$user->name,
                'reason' => $moduleRequest->revision_reason ?? $moduleRequest->description,
                'author_name' => $moduleRequest->applicant?->name ?? 'Sistem',
                'status' => 'Approved',
                'file_path' => $newFilePath,
                'file_name' => $newFileName ?? $moduleRequest->file_name,
                'file_size' => $newFileSize ?? $moduleRequest->file_size,
                'file_pages' => $pageCount,
                'drive_file_id' => $driveFileId,
                'created_by' => $moduleRequest->applicant_id,
            ]);

            // Update module to new revision (old file stays in history)
            $existingModule->update([
                'current_revision' => $newRevision,
                'status' => 'Approved',
                'file_path' => $newFilePath ?? $existingModule->file_path,
                'file_name' => $newFileName ?? $existingModule->file_name,
                'file_size' => $newFileSize ?? $existingModule->file_size,
                'file_pages' => $pageCount,
                'drive_file_id' => $driveFileId ?? $existingModule->drive_file_id,
                'approved_by' => $user->id,
                'approved_at' => now(),
            ]);
        }

        // ── Mark request as Selesai ───────────────────────────────────────────
        $moduleRequest->update([
            'status' => 'Selesai',
            'processed_by' => $user->id,
            'processed_at' => now(),
            'reject_reason' => null,
        ]);

        $successMsg = match ($moduleRequest->type) {
            'Modul Baru' => "Pengajuan {$moduleRequest->request_number} disetujui. Modul baru berhasil masuk ke Database Modul.",
            'Revisi Modul' => "Pengajuan {$moduleRequest->request_number} disetujui. Revisi modul berhasil diperbarui.",
            default => "Pengajuan {$moduleRequest->request_number} berhasil disetujui.",
        };

        return redirect()->route('approval')->with('message', $successMsg);
    }

    /**
     * Reject a module request with a reason.
     */
    public function reject(Request $request, int $id): RedirectResponse
    {
        $user = Auth::user();

        if (! in_array(strtolower($user->role), ['admin', 'manager pd'])) {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validate([
            'reject_reason' => 'required|string|min:10|max:1000',
        ], [
            'reject_reason.required' => 'Alasan penolakan wajib diisi.',
            'reject_reason.min' => 'Alasan penolakan minimal 10 karakter.',
        ]);

        $moduleRequest = ModuleRequest::findOrFail($id);

        if ($moduleRequest->status !== 'Menunggu Approval') {
            return redirect()->route('approval')
                ->with('error', 'Pengajuan ini tidak sedang menunggu approval.');
        }

        $moduleRequest->update([
            'status' => 'Ditolak',
            'reject_reason' => $validated['reject_reason'],
            'processed_by' => $user->id,
            'processed_at' => now(),
        ]);

        return redirect()->route('approval')
            ->with('message', "Pengajuan {$moduleRequest->request_number} telah ditolak.");
    }

    /**
     * Format a ModuleRequest for the frontend.
     *
     * @return array<string, mixed>
     */
    private function formatRequest(ModuleRequest $req): array
    {
        return [
            'id' => $req->request_number,
            'dbId' => $req->id,
            'title' => $req->title,
            'type' => $req->type,
            'applicant' => $req->applicant?->name ?? '-',
            'unit' => $req->unit ?? '-',
            'priority' => $req->priority,
            'submittedAt' => Carbon::parse($req->created_at)->format('d M Y H:i'),
            'deadline' => $req->deadline?->format('d M Y') ?? '-',
            'status' => $req->status,
            'description' => $req->description ?? '',
            'rejectReason' => $req->reject_reason,
            'processedBy' => $req->processor?->name,
            'processedAt' => $req->processed_at ? Carbon::parse($req->processed_at)->format('d M Y H:i') : null,
            // File
            'fileName' => $req->file_name,
            'fileSize' => $req->file_size ? (is_numeric($req->file_size) ? $this->formatBytes((int) $req->file_size) : $req->file_size) : null,
            'fileMime' => $req->file_mime,
            'fileUrl' => $req->file_path ? Storage::url($req->file_path) : null,
            // New fields
            'program' => $req->program,
            'language' => $req->language ?? 'Indonesia',
            'training_days' => $req->training_days,
            'revision_reason' => $req->revision_reason,
            'related_module_id' => $req->related_module_id,
            'relatedModuleCode' => $req->relatedModule?->code,
            'relatedModuleTitle' => $req->relatedModule?->title,
            'relatedModuleRevision' => $req->relatedModule?->current_revision,
        ];
    }

    /**
     * Format bytes to human-readable string.
     */
    private function formatBytes(int $bytes, int $precision = 1): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
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
