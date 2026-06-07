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
use Illuminate\Support\Facades\Log;
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
            
            // Kebutuhan Khusus fields
            'jenis_kebutuhan' => $req->jenis_kebutuhan,
            'nama_instansi' => $req->nama_instansi,
            'judul_program' => $req->judul_program,
            'jam_khusus' => $req->jam_khusus,
            'pre_post_test' => $req->pre_post_test,
            'keterangan_kebutuhan' => $req->keterangan_kebutuhan,
            
            // Processing fields
            'link_modul' => $req->link_modul,
            'tanggal_realisasi' => $req->tanggal_realisasi?->format('Y-m-d') ?? '',
            'tanggal_realisasi_formatted' => $req->tanggal_realisasi?->format('d M Y') ?? '-',
            'tanggal_kebutuhan_baru' => $req->tanggal_kebutuhan_baru?->format('Y-m-d') ?? '',
            'tanggal_kebutuhan_baru_formatted' => $req->tanggal_kebutuhan_baru?->format('d M Y') ?? '-',
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

        // Retrieve lists from MasterData
        $trainingTypes = MasterData::whereIn('category', ['Jenis Pelatihan', 'Kode Pelatihan'])
            ->where('status', 'Aktif')
            ->orderBy('name')
            ->pluck('name')
            ->toArray();

        $jenisKebutuhanOptions = MasterData::where('category', 'Jenis Kebutuhan Modul')
            ->where('status', 'Aktif')
            ->orderBy('name')
            ->pluck('name')
            ->toArray();

        $bahasaPengantarOptions = MasterData::where('category', 'Bahasa Pengantar')
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
            'jenisKebutuhanOptions' => $jenisKebutuhanOptions,
            'bahasaPengantarOptions' => $bahasaPengantarOptions,
        ]);
    }

    /**
     * Store a new module request with optional PDF upload.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        if ($user->role === 'User' && $request->input('type') !== 'Kebutuhan Khusus') {
            abort(403, 'Akses ditolak. User hanya diperbolehkan mengajukan Modul Kebutuhan Khusus.');
        }

        if ($request->input('type') === 'Kebutuhan Khusus') {
            $minDate = now()->addDays(14)->startOfDay();
            $deadline = Carbon::parse($request->input('deadline'));
            if ($deadline->lt($minDate)) {
                return back()->withErrors(['deadline' => 'Tanggal kebutuhan khusus minimal harus 14 hari dari hari ini.'])->withInput();
            }
        }

        $validated = $request->validate([
            'type' => 'required|in:Modul Baru,Revisi Modul,Kebutuhan Khusus',
            'title' => $request->input('type') === 'Kebutuhan Khusus' ? 'nullable|string|max:255' : 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'priority' => 'required|in:High,Medium,Low',
            'related_module_id' => 'nullable|integer',
            'program' => 'nullable|string|max:255',
            'language' => 'nullable|string|max:255',
            'training_days' => 'nullable|integer',
            'revision_reason' => 'nullable|string',
            'file' => $request->input('type') === 'Revisi Modul' ? 'required|file|mimes:pdf|max:20480' : 'nullable|file|mimes:pdf|max:20480',
            
            // Kebutuhan Khusus fields
            'jenis_kebutuhan' => 'required_if:type,Kebutuhan Khusus|string|nullable',
            'nama_instansi' => 'nullable|string|max:255',
            'judul_program' => 'required_if:type,Kebutuhan Khusus|string|nullable',
            'jam_khusus' => 'required_if:type,Kebutuhan Khusus|string|nullable',
            'pre_post_test' => 'required_if:type,Kebutuhan Khusus|string|nullable',
            'keterangan_kebutuhan' => 'nullable|string',
        ]);

        if ($validated['type'] === 'Kebutuhan Khusus') {
            $validated['title'] = $validated['judul_program'];
        }

        $requestNumber = ModuleRequest::generateRequestNumber($validated['type']);

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
            'unit' => null, // Hapus unit kerja dari pengajuan
            'description' => $validated['description'] ?? null,
            'deadline' => $validated['deadline'] ?? null,
            'status' => 'Baru',
            'priority' => $validated['priority'],
            'related_module_id' => $validated['related_module_id'] ?? null,
            'program' => $validated['program'] ?? null,
            'language' => $validated['language'] ?? 'Indonesia',
            'training_days' => $validated['training_days'] ?? null,
            'revision_reason' => $validated['revision_reason'] ?? null,
            
            // Kebutuhan Khusus fields
            'jenis_kebutuhan' => $validated['jenis_kebutuhan'] ?? null,
            'nama_instansi' => $validated['nama_instansi'] ?? null,
            'judul_program' => $validated['judul_program'] ?? null,
            'jam_khusus' => $validated['jam_khusus'] ?? null,
            'pre_post_test' => $validated['pre_post_test'] ?? null,
            'keterangan_kebutuhan' => $validated['keterangan_kebutuhan'] ?? null,
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
     * Update a module request (only if status is Baru or Drafting for applicants, or anytime for Admin/Staf PD processing).
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $moduleRequest = ModuleRequest::findOrFail($id);
        $user = Auth::user();

        $isProcessor = in_array(strtolower($user->role), ['admin', 'staf pd']);

        // Only applicant or admin/staf pd can edit
        if ($moduleRequest->applicant_id !== $user->id && !$isProcessor) {
            abort(403, 'Akses ditolak.');
        }

        // Processing by Admin or Staf PD (setting link, realisasi date, status, etc.)
        if ($isProcessor && ($request->has('link_modul') || $request->has('tanggal_realisasi') || in_array($request->input('status'), ['Selesai', 'Batal', 'Hold']))) {
            $validated = $request->validate([
                'status' => 'required|in:Baru,Drafting,Menunggu Approval,Selesai,Batal,Hold',
                'link_modul' => 'required_if:status,Selesai|nullable|url|max:255',
                'tanggal_realisasi' => 'required_if:status,Selesai|nullable|date',
                'tanggal_kebutuhan_baru' => 'required_if:status,Hold|nullable|date',
                'reject_reason' => 'required|string|max:1000',
            ], [
                'link_modul.required_if' => 'Link Modul wajib diisi jika status Selesai.',
                'link_modul.url' => 'Link Modul harus berupa URL yang valid.',
                'tanggal_realisasi.required_if' => 'Tanggal Realisasi wajib diisi jika status Selesai.',
                'tanggal_kebutuhan_baru.required_if' => 'Tanggal Kebutuhan Baru wajib diisi jika status Hold.',
                'reject_reason.required' => 'Keterangan wajib diisi.',
            ]);

            $oldStatus = $moduleRequest->status;

            $validated['processed_by'] = $user->id;
            $validated['processed_at'] = now();

            $moduleRequest->update($validated);

            // Send email if status changed to Selesai, Batal, or Hold
            if ($oldStatus !== $moduleRequest->status && in_array($moduleRequest->status, ['Selesai', 'Batal', 'Hold'])) {
                try {
                    $emailsToNotify = collect();
                    if ($moduleRequest->applicant && $moduleRequest->applicant->email) {
                        $emailsToNotify->push($moduleRequest->applicant->email);
                    }
                    $managerEmails = \App\Models\User::whereRaw('LOWER(role) = ?', ['manager pd'])
                        ->where('status', 'Aktif')
                        ->pluck('email');
                    $emailsToNotify = $emailsToNotify->merge($managerEmails)->unique()->filter();

                    if ($emailsToNotify->isNotEmpty()) {
                        \Illuminate\Support\Facades\Mail::to($emailsToNotify)
                            ->send(new \App\Mail\ModuleRequestProcessedMail($moduleRequest));
                    }
                } catch (\Exception $e) {
                    Log::error('Gagal mengirim email notifikasi processing Kebutuhan Khusus: ' . $e->getMessage());
                }
            }

            return redirect()->route('pengajuan')
                ->with('message', "Pengajuan {$moduleRequest->request_number} berhasil diproses.");
        }

        // Regular applicant editing the request
        if ($moduleRequest->applicant_id === $user->id && ! in_array($moduleRequest->status, ['Baru', 'Drafting'])) {
            return redirect()->route('pengajuan')
                ->with('error', 'Pengajuan tidak dapat diedit karena sudah melewati tahap Baru/Drafting.');
        }

        if ($request->input('type') === 'Kebutuhan Khusus') {
            $minDate = now()->addDays(14)->startOfDay();
            $deadline = Carbon::parse($request->input('deadline'));
            if ($deadline->lt($minDate)) {
                return back()->withErrors(['deadline' => 'Tanggal kebutuhan khusus minimal harus 14 hari dari hari ini.'])->withInput();
            }
        }

        $fileRule = 'nullable|file|mimes:pdf|max:20480';
        if ($request->input('type') === 'Revisi Modul' && !$moduleRequest->file_path) {
            $fileRule = 'required|file|mimes:pdf|max:20480';
        }

        $validated = $request->validate([
            'type' => 'required|in:Modul Baru,Revisi Modul,Kebutuhan Khusus',
            'title' => $request->input('type') === 'Kebutuhan Khusus' ? 'nullable|string|max:255' : 'required|string|max:255',
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

            // Kebutuhan Khusus fields
            'jenis_kebutuhan' => 'required_if:type,Kebutuhan Khusus|string|nullable',
            'nama_instansi' => 'nullable|string|max:255',
            'judul_program' => 'required_if:type,Kebutuhan Khusus|string|nullable',
            'jam_khusus' => 'required_if:type,Kebutuhan Khusus|string|nullable',
            'pre_post_test' => 'required_if:type,Kebutuhan Khusus|string|nullable',
            'keterangan_kebutuhan' => 'nullable|string',
        ]);

        if ($validated['type'] === 'Kebutuhan Khusus') {
            $validated['title'] = $validated['judul_program'];
        }

        $validated['unit'] = null; // Hapus unit kerja dari pengajuan

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

        try {
            // Kirim email ke pemohon
            if ($moduleRequest->applicant && $moduleRequest->applicant->email) {
                \Illuminate\Support\Facades\Mail::to($moduleRequest->applicant->email)
                    ->send(new \App\Mail\ModuleRequestSubmittedMail($moduleRequest));
            }

            // Kirim email ke semua Manager PD
            $managerEmails = \App\Models\User::whereRaw('LOWER(role) = ?', ['manager pd'])
                ->where('status', 'Aktif')
                ->pluck('email');
            
            if ($managerEmails->isNotEmpty()) {
                \Illuminate\Support\Facades\Mail::to($managerEmails)
                    ->send(new \App\Mail\ModuleRequestSubmittedMail($moduleRequest));
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Gagal mengirim email notifikasi submit: ' . $e->getMessage());
        }

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
