<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\ModuleRequest;
use App\Models\MasterData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PengajuanController extends Controller
{
    /**
     * Display module requests.
     * Admin & Staf PD see all. User sees only their own.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $role = $user->role;

        $query = ModuleRequest::with(['applicant', 'relatedModule']);

        // Regular User only sees their own requests
        if ($role === 'User') {
            $query->where('applicant_id', $user->id);
        }

        $submissions = $query->orderByDesc('created_at')->get()->map(fn ($req) => [
            'id' => $req->request_number,
            'dbId' => $req->id,
            'type' => $req->type,
            'title' => $req->title,
            'applicant' => $req->applicant?->name ?? '-',
            'unit' => $req->unit ?? '-',
            'submissionDate' => Carbon::parse($req->created_at)->format('d M Y'),
            'deadline' => $req->deadline?->format('Y-m-d') ?? '', // HTML date format
            'deadlineFormatted' => $req->deadline?->format('d M Y') ?? '-',
            'status' => $req->status,
            'description' => $req->description ?? '',
            'priority' => $req->priority,
            'rejectReason' => $req->reject_reason,
            'fileName' => $req->file_name,
            'fileSize' => $req->file_size ? $this->formatFileSize($req->file_size) : null,
            'fileMime' => $req->file_mime,
            'fileUrl' => $req->file_path ? Storage::url($req->file_path) : null,
            'program' => $req->program,
            'language' => $req->language ?? 'Indonesia',
            'training_days' => $req->training_days,
            'revision_reason' => $req->revision_reason,
            'related_module_id' => $req->related_module_id,
            'relatedModuleCode' => $req->relatedModule?->code,
            'relatedModuleTitle' => $req->relatedModule?->title,
            'relatedModuleRevision' => $req->relatedModule?->current_revision,
        ]);

        // Stats
        $baseQuery = $role === 'User'
            ? ModuleRequest::where('applicant_id', $user->id)
            : ModuleRequest::query();

        $stats = [
            'total' => (clone $baseQuery)->count(),
            'waiting' => (clone $baseQuery)->where('status', 'Menunggu Approval')->count(),
            'drafting' => (clone $baseQuery)->where('status', 'Drafting')->count(),
            'finished' => (clone $baseQuery)->where('status', 'Selesai')->count(),
            'baru' => (clone $baseQuery)->where('status', 'Baru')->count(),
            'ditolak' => (clone $baseQuery)->where('status', 'Ditolak')->count(),
        ];

        // Chart data (overall, not role-filtered)
        $chartData = [
            ['name' => 'Baru', 'value' => ModuleRequest::where('status', 'Baru')->count(), 'fill' => '#3b82f6'],
            ['name' => 'Drafting', 'value' => ModuleRequest::where('status', 'Drafting')->count(), 'fill' => '#a3a3a3'],
            ['name' => 'Menunggu Approval', 'value' => ModuleRequest::where('status', 'Menunggu Approval')->count(), 'fill' => '#a855f7'],
            ['name' => 'Selesai', 'value' => ModuleRequest::where('status', 'Selesai')->count(), 'fill' => '#10b981'],
            ['name' => 'Ditolak', 'value' => ModuleRequest::where('status', 'Ditolak')->count(), 'fill' => '#f43f5e'],
        ];

        // Available modules for related_module dropdown (revision requests)
        $availableModules = collect();
        if (class_exists(Module::class)) {
            try {
                $availableModules = Module::select('id', 'code', 'title', 'current_revision')
                    ->where('status', 'Approved')
                    ->orderBy('code')
                    ->get()
                    ->map(fn ($m) => [
                        'id' => $m->id,
                        'code' => $m->code,
                        'title' => $m->title,
                        'revision' => $m->current_revision,
                    ]);
            } catch (\Exception) {
                $availableModules = collect();
            }
        }

        $trainingTypes = MasterData::where('category', 'Jenis Pelatihan')
            ->where('status', 'Aktif')
            ->orderBy('name')
            ->pluck('name')
            ->toArray();

        return Inertia::render('pengajuan', [
            'submissions' => $submissions,
            'stats' => $stats,
            'chartData' => $chartData,
            'availableModules' => $availableModules,
            'trainingTypes' => $trainingTypes,
        ]);
    }

    /**
     * Store a new module request with optional PDF upload.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:Modul Baru,Revisi Modul,Kebutuhan Khusus',
            'title' => 'required|string|max:255',
            'unit' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'priority' => 'required|in:High,Medium,Low',
            'related_module_id' => 'nullable|integer',
            'program' => 'nullable|string|max:255',
            'language' => 'nullable|string|max:255',
            'training_days' => 'nullable|integer',
            'revision_reason' => 'nullable|string',
            'file' => $request->input('type') === 'Revisi Modul' ? 'required|file|mimes:pdf|max:20480' : 'nullable|file|mimes:pdf|max:20480',
        ]);

        $requestNumber = ModuleRequest::generateRequestNumber();

        $fileData = [];
        if ($request->hasFile('file') && $request->file('file')->isValid()) {
            $file = $request->file('file');
            $slug = Str::slug($validated['title']);
            $fileName = "{$requestNumber}_{$slug}.pdf";
            $path = $file->storeAs("pengajuan/{$requestNumber}", $fileName, 'public');

            $fileData = [
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'file_mime' => $file->getMimeType(),
            ];
        }

        ModuleRequest::create([
            'request_number' => $requestNumber,
            'type' => $validated['type'],
            'title' => $validated['title'],
            'applicant_id' => Auth::id(),
            'unit' => $validated['unit'] ?? Auth::user()->unit,
            'description' => $validated['description'] ?? null,
            'deadline' => $validated['deadline'] ?? null,
            'status' => 'Baru',
            'priority' => $validated['priority'],
            'related_module_id' => $validated['related_module_id'] ?? null,
            'program' => $validated['program'] ?? null,
            'language' => $validated['language'] ?? 'Indonesia',
            'training_days' => $validated['training_days'] ?? null,
            'revision_reason' => $validated['revision_reason'] ?? null,
            ...$fileData,
        ]);

        return redirect()->route('pengajuan')
            ->with('message', "Pengajuan {$requestNumber} berhasil dibuat.");
    }

    /**
     * Upload or replace file for an existing request.
     */
    public function uploadFile(Request $request, int $id): RedirectResponse
    {
        $moduleRequest = ModuleRequest::findOrFail($id);
        $user = Auth::user();

        if ($moduleRequest->applicant_id !== $user->id && ! in_array(strtolower($user->role), ['admin', 'staf pd'])) {
            abort(403, 'Akses ditolak.');
        }

        $request->validate([
            'file' => 'required|file|mimes:pdf|max:20480',
        ]);

        // Delete old file if exists
        if ($moduleRequest->file_path && Storage::disk('public')->exists($moduleRequest->file_path)) {
            Storage::disk('public')->delete($moduleRequest->file_path);
        }

        $file = $request->file('file');
        $slug = Str::slug($moduleRequest->title);
        $fileName = "{$moduleRequest->request_number}_{$slug}.pdf";
        $path = $file->storeAs("pengajuan/{$moduleRequest->request_number}", $fileName, 'public');

        $moduleRequest->update([
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'file_mime' => $file->getMimeType(),
        ]);

        return redirect()->route('pengajuan')
            ->with('message', "File dokumen berhasil diupload untuk pengajuan {$moduleRequest->request_number}.");
    }

    /**
     * Update a module request (only if status is Baru or Drafting).
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $moduleRequest = ModuleRequest::findOrFail($id);
        $user = Auth::user();

        // Only applicant or admin can edit
        if ($moduleRequest->applicant_id !== $user->id && $user->role !== 'admin') {
            abort(403, 'Akses ditolak.');
        }

        if (! in_array($moduleRequest->status, ['Baru', 'Drafting'])) {
            return redirect()->route('pengajuan')
                ->with('error', 'Pengajuan tidak dapat diedit karena sudah melewati tahap Baru/Drafting.');
        }

        $fileRule = 'nullable|file|mimes:pdf|max:20480';
        if ($request->input('type') === 'Revisi Modul' && !$moduleRequest->file_path) {
            $fileRule = 'required|file|mimes:pdf|max:20480';
        }

        $validated = $request->validate([
            'type' => 'required|in:Modul Baru,Revisi Modul,Kebutuhan Khusus',
            'title' => 'required|string|max:255',
            'unit' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'priority' => 'required|in:High,Medium,Low',
            'status' => 'sometimes|in:Baru,Drafting,Menunggu Approval',
            'related_module_id' => 'nullable|integer',
            'program' => 'nullable|string|max:255',
            'language' => 'nullable|string|max:255',
            'training_days' => 'nullable|integer',
            'revision_reason' => 'nullable|string',
            'file' => $fileRule,
        ]);

        // Handle file replacement
        if ($request->hasFile('file') && $request->file('file')->isValid()) {
            if ($moduleRequest->file_path && Storage::disk('public')->exists($moduleRequest->file_path)) {
                Storage::disk('public')->delete($moduleRequest->file_path);
            }

            $file = $request->file('file');
            $slug = Str::slug($validated['title']);
            $fileName = "{$moduleRequest->request_number}_{$slug}.pdf";
            $path = $file->storeAs("pengajuan/{$moduleRequest->request_number}", $fileName, 'public');

            $validated['file_path'] = $path;
            $validated['file_name'] = $file->getClientOriginalName();
            $validated['file_size'] = $file->getSize();
            $validated['file_mime'] = $file->getMimeType();
        }

        unset($validated['file']);
        $moduleRequest->update($validated);

        return redirect()->route('pengajuan')
            ->with('message', "Pengajuan {$moduleRequest->request_number} berhasil diperbarui.");
    }

    /**
     * Delete a module request (only if status is Baru).
     */
    public function destroy(int $id): RedirectResponse
    {
        $moduleRequest = ModuleRequest::findOrFail($id);
        $user = Auth::user();

        if ($moduleRequest->applicant_id !== $user->id && $user->role !== 'admin') {
            abort(403, 'Akses ditolak.');
        }

        if ($moduleRequest->status !== 'Baru') {
            return redirect()->route('pengajuan')
                ->with('error', 'Pengajuan hanya dapat dihapus jika masih berstatus Baru.');
        }

        // Delete file from storage
        if ($moduleRequest->file_path && Storage::disk('public')->exists($moduleRequest->file_path)) {
            Storage::disk('public')->delete($moduleRequest->file_path);
        }

        $number = $moduleRequest->request_number;
        $moduleRequest->delete();

        return redirect()->route('pengajuan')
            ->with('message', "Pengajuan {$number} berhasil dihapus.");
    }

    /**
     * Submit a request to approval queue (change status to Menunggu Approval).
     */
    public function submit(int $id): RedirectResponse
    {
        $moduleRequest = ModuleRequest::findOrFail($id);
        $user = Auth::user();

        if ($moduleRequest->applicant_id !== $user->id && ! in_array(strtolower($user->role), ['admin', 'staf pd'])) {
            abort(403, 'Akses ditolak.');
        }

        if (! in_array($moduleRequest->status, ['Baru', 'Drafting'])) {
            return redirect()->route('pengajuan')
                ->with('error', 'Pengajuan sudah dikirim ke approval atau sudah selesai.');
        }

        $moduleRequest->update(['status' => 'Menunggu Approval']);

        return redirect()->route('pengajuan')
            ->with('message', "Pengajuan {$moduleRequest->request_number} berhasil dikirim ke antrian approval.");
    }

    /**
     * Format file size for display.
     */
    private function formatFileSize(int $bytes): string
    {
        if ($bytes < 1024) {
            return "{$bytes} B";
        } elseif ($bytes < 1048576) {
            return round($bytes / 1024, 1).' KB';
        }

        return round($bytes / 1048576, 1).' MB';
    }
}
