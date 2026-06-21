<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\ModuleRequest;
use App\Models\MasterData;
use App\Models\Setting;
use App\Models\TrainingProgram;
use App\Models\TrainingProgramRevision;
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
     * Display Permintaan Modul Khusus only (type = Kebutuhan Khusus).
     */
    public function index(): Response
    {
        $user = Auth::user();
        $role = $user->role;

        if (! in_array(strtolower($role), ['admin', 'staf pd', 'user'])) {
            abort(403, 'Akses ditolak.');
        }

        $query = ModuleRequest::with(['applicant', 'relatedModule'])
            ->where('type', 'Kebutuhan Khusus');

        // Regular User only sees their own requests
        if ($role === 'User') {
            $query->where('applicant_id', $user->id);
        }

        return $this->renderPengajuan($user, $query, 'pengajuan');
    }

    /**
     * Display Perubahan Modul — new structured format for the mockup-based UI.
     */
    public function indexPerubahan(): Response
    {
        $user = Auth::user();

        if (! in_array(strtolower($user->role), ['admin', 'staf pd'])) {
            abort(403, 'Akses ditolak.');
        }

        $submissions = ModuleRequest::with(['applicant'])
            ->whereIn('type', ['Modul Baru', 'Revisi Modul', 'Program Baru', 'Revisi Program'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($req) => [
                'id'                     => $req->request_number,
                'dbId'                   => $req->id,
                'noPerubahan'            => $req->request_number,
                'tglPengajuan'           => Carbon::parse($req->created_at)->format('d M Y'),
                'jenisPerubahan'         => $req->type,
                'kategoriModul'          => $req->program ?? 'Baru',  // stored in program field temporarily
                'referensiKhusus'        => $req->revision_reason ?? '',
                'detailPermintaan'       => $req->description ?? '',
                'keteranganKebutuhan'    => $req->keterangan_kebutuhan ?? '',
                'jenisKebutuhanPelatihan'=> $req->jenis_kebutuhan ?? '',
                'bahasaPengantar'        => $req->language ?? 'Indonesia',
                'jenisModul'             => $req->jenis_modul ? json_decode($req->jenis_modul, true) : [],
                'modulRows'              => $req->modul_rows ? json_decode($req->modul_rows, true) : [],
                'programRows'            => $req->program_rows ? json_decode($req->program_rows, true) : [],
                'status'                 => $req->status,
                'rejectReason'           => $req->reject_reason,
                'approvedBy'             => $req->approved_by,
                'approvedAt'             => $req->approved_at ? Carbon::parse($req->approved_at)->format('d M Y H:i') : null,
            ]);

        // Build masterData for the form from TrainingProgram database
        $kodeProgramList = TrainingProgram::where('status', 'Aktif')
            ->orderBy('code')
            ->get()
            ->map(fn ($tp) => [
                'code' => $tp->code,
                'name' => $tp->name,
                'revision' => $tp->revision_code ?? '1.0',
            ])
            ->toArray();

        $modulesList = Module::orderBy('code')->get()->map(fn ($m) => [
            'code' => $m->code,
            'title' => $m->title,
            'revision' => $m->current_revision ?? '00',
        ])->toArray();

        $masterData = [
            'jenisPerubahan'  => MasterData::where('category', 'Jenis Perubahan')->where('status', 'Aktif')->orderBy('name')->pluck('name')->toArray() ?: ['Modul', 'Program'],
            'bahasaPengantar' => MasterData::where('category', 'Bahasa Pengantar')->where('status', 'Aktif')->orderBy('name')->pluck('name')->toArray() ?: ['Indonesia', 'Inggris'],
            'jenisModul'      => MasterData::where('category', 'Jenis Modul')->where('status', 'Aktif')->orderBy('name')->pluck('name')->toArray() ?: ['Modul', 'Lembar Kerja', 'Post Test'],
            'jenisKebutuhan'  => MasterData::where('category', 'Jenis Kebutuhan Modul')->where('status', 'Aktif')->orderBy('name')->pluck('name')->toArray() ?: ['Pelatihan Inhouse', 'Pelatihan Internal', 'Seminar'],
            'kodeProgram'     => $kodeProgramList,
            'modules'         => $modulesList,
            'pengajuanKhusus' => ModuleRequest::where('type', 'Kebutuhan Khusus')
                ->whereIn('status', ['Baru', 'Drafting'])
                ->orderByDesc('created_at')
                ->get()
                ->map(fn ($req) => [
                    'id'              => $req->request_number,
                    'dbId'            => $req->id,
                    'detail'          => $req->description ?? '',
                    'jenisKebutuhan'  => $req->jenis_kebutuhan ?? '',
                    'bahasaPengantar' => $req->language ?? 'Indonesia',
                    'jenisModul'      => $req->jenis_modul ? json_decode($req->jenis_modul, true) : [],
                ])
                ->toArray(),
        ];

        return Inertia::render('perubahan-modul', [
            'submissions' => $submissions,
            'masterData'  => $masterData,
        ]);
    }

    /**
     * Store a new Perubahan Modul request (new format with modul/program rows).
     */
    public function storePerubahan(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'jenis_perubahan'           => 'required|string',
            'kategori_modul'            => 'required|string',
            'referensi_khusus'          => 'nullable|string',
            'detail_permintaan'         => 'nullable|string',
            'keterangan_kebutuhan'      => 'nullable|string',
            'jenis_kebutuhan_pelatihan' => 'nullable|string',
            'bahasa_pengantar'          => 'nullable|string',
            'jenis_modul'               => 'nullable|array',
            'modul_rows'                => 'nullable|array',
            'program_rows'              => 'nullable|array',
            'submit_for_approval'       => 'nullable|boolean',
        ]);

        $isProgram = str_contains(strtolower($validated['jenis_perubahan']), 'program');
        $prefix = $isProgram ? 'Program' : 'Modul';
        $month = now()->format('m');
        $year  = now()->format('Y');
        $count = ModuleRequest::whereIn('type', ['Modul Baru', 'Revisi Modul', 'Program Baru', 'Revisi Program'])
            ->whereYear('created_at', $year)->count() + 1;
        $requestNumber = sprintf('%03d/%s/PD/%s/%s', $count, $prefix, $month, $year);

        $status = ($validated['submit_for_approval'] ?? false) ? 'Menunggu Approval' : 'Draft';

        $title = $validated['jenis_perubahan'];
        if (!$isProgram && !empty($validated['modul_rows'])) {
            $firstRow = $validated['modul_rows'][0];
            if (isset($firstRow['namaModul']) && !empty($firstRow['namaModul'])) {
                $title .= ' - ' . $firstRow['namaModul'];
            }
        } elseif ($isProgram && !empty($validated['program_rows'])) {
            $firstRow = $validated['program_rows'][0];
            if (isset($firstRow['namaProgram']) && !empty($firstRow['namaProgram'])) {
                $title .= ' - ' . $firstRow['namaProgram'];
            }
        }

        $modulRows = $request->input('modul_rows', []);
        $uploadedFiles = $request->file('modul_rows');
        if (is_array($uploadedFiles)) {
            foreach ($uploadedFiles as $index => $rowFiles) {
                if (isset($rowFiles['fileModul'])) {
                    $file = $rowFiles['fileModul'];
                    $code = $modulRows[$index]['kodeModul'] ?? 'MOD';
                    $fileName = $code . '-' . time() . '.pdf';
                    $path = $file->storeAs('modules', $fileName, 'public');
                    $modulRows[$index]['linkModul'] = Storage::url($path);
                }
            }
        }

        $programRows = $request->input('program_rows', []);
        $uploadedProgramFiles = $request->file('program_rows');
        if (is_array($uploadedProgramFiles)) {
            foreach ($uploadedProgramFiles as $index => $rowFiles) {
                if (isset($rowFiles['fileProgram'])) {
                    $file = $rowFiles['fileProgram'];
                    $code = $programRows[$index]['kodeProgram'] ?? 'PROG';
                    $fileName = $code . '-' . time() . '.pdf';
                    $path = $file->storeAs('programs', $fileName, 'public');
                    $programRows[$index]['linkProgram'] = Storage::url($path);
                }
            }
        }

        ModuleRequest::create([
            'request_number'      => $requestNumber,
            'type'                => $validated['jenis_perubahan'],
            'title'               => $title,
            'applicant_id'        => $user->id,
            'status'              => $status,
            'program'             => $validated['kategori_modul'],         // reuse program field for kategori
            'revision_reason'     => $validated['referensi_khusus'] ?? null,
            'description'         => $validated['detail_permintaan'] ?? null,
            'keterangan_kebutuhan'=> $validated['keterangan_kebutuhan'] ?? null,
            'jenis_kebutuhan'     => $validated['jenis_kebutuhan_pelatihan'] ?? null,
            'language'            => $validated['bahasa_pengantar'] ?? 'Indonesia',
            'jenis_modul'         => json_encode($validated['jenis_modul'] ?? []),
            'modul_rows'          => json_encode($modulRows),
            'program_rows'        => json_encode($programRows),
        ]);

        $redirectRoute = $isProgram ? 'perubahan-modul' : 'perubahan-modul';

        return redirect()->route($redirectRoute)->with('message', 'Pengajuan berhasil disimpan.');
    }

    /**
     * Approve a Perubahan Modul request.
     */
    public function approvePerubahan(Request $request, int $id): RedirectResponse
    {
        $user = Auth::user();

        if (! in_array(strtolower($user->role), ['admin', 'manager pd'])) {
            abort(403, 'Hanya Manager PD atau Admin yang dapat menyetujui.');
        }

        $req = ModuleRequest::findOrFail($id);

        \Illuminate\Support\Facades\DB::transaction(function () use ($req, $user) {
            $req->update([
                'status'      => 'Disetujui',
                'approved_by' => $user->name,
                'approved_at' => now(),
            ]);

            $isProgram = str_contains(strtolower($req->type), 'program');

            if (!$isProgram) {
                // Parse modul_rows
                $rows = json_decode($req->modul_rows, true) ?: [];
                foreach ($rows as $row) {
                    $code = strtoupper(trim($row['kodeModul'] ?? ''));
                    $title = trim($row['namaModul'] ?? '');
                    if (empty($code) || empty($title)) {
                        continue;
                    }

                    $revision = $row['kodeRevisi'] ?? '1.0';
                    $filePath = $row['linkModul'] ?? null;
                    if ($filePath) {
                        $relativeFilePath = str_replace('/storage/', '', $filePath);
                    } else {
                        $relativeFilePath = null;
                    }

                    // Look up existing module
                    $module = Module::where('code', $code)->first();
                    if ($module) {
                        // Update existing module
                        $module->update([
                            'title' => $title,
                            'current_revision' => $revision,
                            'file_path' => $relativeFilePath ?? $module->file_path,
                            'status' => 'Approved',
                            'approved_by' => Auth::id(),
                            'approved_at' => now(),
                        ]);
                    } else {
                        // Create new module
                        $module = Module::create([
                            'code' => $code,
                            'title' => $title,
                            'program' => 'Lainnya',
                            'language' => $req->language ?? 'Indonesia',
                            'status' => 'Approved',
                            'current_revision' => $revision,
                            'file_path' => $relativeFilePath,
                            'approved_by' => Auth::id(),
                            'approved_at' => now(),
                            'created_by' => $req->applicant_id,
                        ]);
                    }

                    // Create module revision history
                    \App\Models\ModuleRevision::create([
                        'module_id' => $module->id,
                        'revision' => $revision,
                        'note' => $row['alasanPerubahan'] ?? 'Perubahan disetujui.',
                        'author_name' => $req->applicant?->name ?? 'Staf PD',
                        'status' => 'Approved',
                        'file_path' => $relativeFilePath,
                        'created_by' => $req->applicant_id,
                    ]);
                }
            } else {
                // For Program, update TrainingProgram and TrainingProgramRevision
                $rows = json_decode($req->program_rows, true) ?: [];
                foreach ($rows as $row) {
                    $code = strtoupper(trim($row['kodeProgram'] ?? ''));
                    $name = trim($row['namaProgram'] ?? '');
                    if (empty($code) || empty($name)) {
                        continue;
                    }

                    $revision = $row['kodeRevisi'] ?? '1.0';
                    $filePath = $row['linkProgram'] ?? null;
                    if ($filePath) {
                        $relativeFilePath = str_replace('/storage/', '', $filePath);
                    } else {
                        $relativeFilePath = null;
                    }

                    $fileSizeStr = null;
                    $pageCount = 1;
                    if ($relativeFilePath && Storage::disk('public')->exists($relativeFilePath)) {
                        $size = Storage::disk('public')->size($relativeFilePath);
                        $fileSizeStr = $this->formatFileSize($size);
                        
                        $absolutePath = Storage::disk('public')->path($relativeFilePath);
                        $pageCount = $this->getPdfPageCount($absolutePath);
                    }

                    $effectiveDate = null;
                    if (!empty($row['tanggalBerlaku'])) {
                        try {
                            $effectiveDate = Carbon::parse($row['tanggalBerlaku'])->format('Y-m-d');
                        } catch (\Exception $e) {
                            $effectiveDate = null;
                        }
                    }

                    // Look up existing program
                    $program = TrainingProgram::where('code', $code)->first();
                    if ($program) {
                        // Delete old file if it's different
                        if ($relativeFilePath && $program->file_path && $program->file_path !== $relativeFilePath) {
                            Storage::disk('public')->delete($program->file_path);
                        }

                        $program->update([
                            'name' => $name,
                            'revision_code' => $revision,
                            'effective_date' => $effectiveDate,
                            'status' => 'Aktif',
                            'description' => $row['alasanPerubahan'] ?? $program->description,
                            'file_path' => $relativeFilePath ?? $program->file_path,
                            'file_name' => $relativeFilePath ? basename($relativeFilePath) : $program->file_name,
                            'file_size' => $fileSizeStr ?? $program->file_size,
                            'file_pages' => $relativeFilePath ? $pageCount : $program->file_pages,
                        ]);
                    } else {
                        // Create new program
                        $program = TrainingProgram::create([
                            'code' => $code,
                            'name' => $name,
                            'revision_code' => $revision,
                            'effective_date' => $effectiveDate,
                            'status' => 'Aktif',
                            'description' => $row['alasanPerubahan'] ?? null,
                            'file_path' => $relativeFilePath,
                            'file_name' => $relativeFilePath ? basename($relativeFilePath) : null,
                            'file_size' => $fileSizeStr,
                            'file_pages' => $relativeFilePath ? $pageCount : null,
                            'created_by' => $req->applicant_id,
                        ]);
                    }

                    // Create program revision history
                    TrainingProgramRevision::create([
                        'training_program_id' => $program->id,
                        'revision_code' => $revision,
                        'effective_date' => $effectiveDate,
                        'note' => $row['alasanPerubahan'] ?? 'Perubahan disetujui.',
                        'author_name' => $req->applicant?->name ?? 'Staf PD',
                        'status' => 'Aktif',
                        'file_path' => $relativeFilePath,
                        'file_name' => $relativeFilePath ? basename($relativeFilePath) : null,
                        'file_size' => $fileSizeStr,
                        'file_pages' => $relativeFilePath ? $pageCount : null,
                        'created_by' => $req->applicant_id,
                    ]);
                }
            }
        });

        return redirect()->route('perubahan-modul')->with('message', 'Pengajuan berhasil disetujui.');
    }

    /**
     * Reject a Perubahan Modul request.
     */
    public function rejectPerubahan(Request $request, int $id): RedirectResponse
    {
        $user = Auth::user();

        if (! in_array(strtolower($user->role), ['admin', 'manager pd'])) {
            abort(403, 'Hanya Manager PD atau Admin yang dapat menolak.');
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $req = ModuleRequest::findOrFail($id);
        $req->update([
            'status'        => 'Ditolak',
            'reject_reason' => $validated['reason'],
        ]);

        return redirect()->route('perubahan-modul')->with('message', 'Pengajuan telah ditolak.');
    }


    /**
     * Shared render logic for both index and indexPerubahan.
     */
    private function renderPengajuan($user, $query, string $page): Response
    {
        $role = $user->role;

        $submissions = (clone $query)->orderByDesc('created_at')->get()->map(fn ($req) => [
            'id' => $req->request_number,
            'dbId' => $req->id,
            'type' => $req->type,
            'title' => $req->title,
            'applicant' => $req->applicant?->name ?? '-',
            'unit' => $req->unit ?? '-',
            'submissionDate' => Carbon::parse($req->created_at)->format('d M Y'),
            'deadline' => $req->deadline?->format('Y-m-d') ?? '',
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

        $baseQuery = clone $query;

        $stats = [
            'total' => (clone $baseQuery)->count(),
            'process' => (clone $baseQuery)->whereIn('status', ['Baru', 'Drafting'])->count(),
            'waiting' => (clone $baseQuery)->where('status', 'Menunggu Approval')->count(),
            'done' => (clone $baseQuery)->where('status', 'Selesai')->count(),
            'hold' => (clone $baseQuery)->where('status', 'Hold')->count(),
            'cancel' => (clone $baseQuery)->whereIn('status', ['Batal', 'Ditolak'])->count(),
        ];

        $chartData = [
            ['name' => 'Process', 'value' => (clone $baseQuery)->whereIn('status', ['Baru', 'Drafting'])->count(), 'fill' => '#3b82f6'],
            ['name' => 'Menunggu Approval', 'value' => (clone $baseQuery)->where('status', 'Menunggu Approval')->count(), 'fill' => '#a855f7'],
            ['name' => 'Hold', 'value' => (clone $baseQuery)->where('status', 'Hold')->count(), 'fill' => '#f59e0b'],
            ['name' => 'Done', 'value' => (clone $baseQuery)->where('status', 'Selesai')->count(), 'fill' => '#10b981'],
            ['name' => 'Cancel', 'value' => (clone $baseQuery)->whereIn('status', ['Batal', 'Ditolak'])->count(), 'fill' => '#f43f5e'],
        ];

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

        $refreshToken = Setting::get('google_refresh_token')
            ?? config('services.google.refresh_token')
            ?? env('GOOGLE_REFRESH_TOKEN');
        $isDriveConnected = ! empty($refreshToken);

        return Inertia::render($page, [
            'submissions' => $submissions,
            'stats' => $stats,
            'chartData' => $chartData,
            'availableModules' => $availableModules,
            'trainingTypes' => $trainingTypes,
            'jenisKebutuhanOptions' => $jenisKebutuhanOptions,
            'bahasaPengantarOptions' => $bahasaPengantarOptions,
            'isDriveConnected' => $isDriveConnected,
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

            $validated = $request->validate([
                'type' => 'required|in:Kebutuhan Khusus',
                'jenis_kebutuhan' => 'required|string',
                'language' => 'required|string',
                'judul_program' => 'required|string|max:255',
                'description' => 'required|string',
                'deadline' => 'required|date',
                'priority' => 'nullable|in:High,Medium,Low',
                
                // Pelatihan Inhouse specific validation
                'nama_instansi' => 'required_if:jenis_kebutuhan,Pelatihan Inhouse|nullable|string|max:255',
                'jam_khusus' => 'required_if:jenis_kebutuhan,Pelatihan Inhouse|nullable|numeric',
                'pre_post_test' => 'required_if:jenis_kebutuhan,Pelatihan Inhouse|nullable|string',

                // Pelatihan Internal or Seminar specific validation
                'keterangan_kebutuhan' => 'required_if:jenis_kebutuhan,Pelatihan Internal,Seminar|nullable|string',
            ], [
                'jenis_kebutuhan.required' => 'Jenis Kebutuhan Modul wajib dipilih.',
                'language.required' => 'Bahasa Pengantar wajib dipilih.',
                'judul_program.required' => 'Judul Program Pelatihan wajib diisi.',
                'description.required' => 'Detail Permintaan Modul Khusus wajib diisi.',
                'deadline.required' => 'Tanggal Kebutuhan wajib diisi.',
                'nama_instansi.required_if' => 'Nama Instansi wajib diisi untuk Pelatihan Inhouse.',
                'jam_khusus.required_if' => 'Request Jam Khusus Pelatihan wajib diisi untuk Pelatihan Inhouse.',
                'jam_khusus.numeric' => 'Request Jam Khusus Pelatihan harus berupa angka.',
                'pre_post_test.required_if' => 'Permintaan Pre & Post Test wajib diisi untuk Pelatihan Inhouse.',
                'keterangan_kebutuhan.required_if' => 'Keterangan Kebutuhan wajib diisi untuk Pelatihan Internal / Seminar.',
            ]);

            $validated['title'] = $validated['judul_program'];
        } else {
            $validated = $request->validate([
                'type' => 'required|in:Modul Baru,Revisi Modul',
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'deadline' => 'nullable|date',
                'priority' => 'nullable|in:High,Medium,Low',
                'related_module_id' => 'nullable|integer',
                'program' => 'nullable|string|max:255',
                'language' => 'nullable|string|max:255',
                'training_days' => 'nullable|integer',
                'revision_reason' => 'nullable|string',
                'file' => $request->input('type') === 'Revisi Modul' ? 'required|file|mimes:pdf|max:20480' : 'nullable|file|mimes:pdf|max:20480',
            ]);
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
            'unit' => null,
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

        $redirectRoute = $validated['type'] === 'Kebutuhan Khusus' ? 'pengajuan' : 'perubahan-modul';

        return redirect()->route($redirectRoute)
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
     * Update a module request for the standard /pengajuan route.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        return $this->updateById($request, $id, 'pengajuan');
    }

    public function updatePerubahan(Request $request, int $id): RedirectResponse
    {
        $moduleRequest = ModuleRequest::findOrFail($id);
        $user = Auth::user();

        // Only applicant, admin or staf pd can edit
        if ($moduleRequest->applicant_id !== $user->id && ! in_array(strtolower($user->role), ['admin', 'staf pd'])) {
            abort(403, 'Akses ditolak.');
        }

        // Only editable in Draft or Baru status
        if ($moduleRequest->applicant_id === $user->id && ! in_array($moduleRequest->status, ['Baru', 'Draft', 'Drafting'])) {
            return redirect()->route('perubahan-modul')->with('error', 'Pengajuan tidak dapat diedit karena sudah diajukan/diproses.');
        }

        $validated = $request->validate([
            'jenis_perubahan'           => 'required|string',
            'kategori_modul'            => 'required|string',
            'referensi_khusus'          => 'nullable|string',
            'detail_permintaan'         => 'nullable|string',
            'keterangan_kebutuhan'      => 'nullable|string',
            'jenis_kebutuhan_pelatihan' => 'nullable|string',
            'bahasa_pengantar'          => 'nullable|string',
            'jenis_modul'               => 'nullable|array',
            'modul_rows'                => 'nullable|array',
            'program_rows'              => 'nullable|array',
            'submit_for_approval'       => 'nullable|boolean',
        ]);

        $isProgram = str_contains(strtolower($validated['jenis_perubahan']), 'program');
        
        $title = $validated['jenis_perubahan'];
        if (!$isProgram && !empty($validated['modul_rows'])) {
            $firstRow = $validated['modul_rows'][0];
            if (isset($firstRow['namaModul']) && !empty($firstRow['namaModul'])) {
                $title .= ' - ' . $firstRow['namaModul'];
            }
        } elseif ($isProgram && !empty($validated['program_rows'])) {
            $firstRow = $validated['program_rows'][0];
            if (isset($firstRow['namaProgram']) && !empty($firstRow['namaProgram'])) {
                $title .= ' - ' . $firstRow['namaProgram'];
            }
        }

        $status = ($validated['submit_for_approval'] ?? false) ? 'Menunggu Approval' : $moduleRequest->status;

        $modulRows = $request->input('modul_rows', []);
        $uploadedFiles = $request->file('modul_rows');
        if (is_array($uploadedFiles)) {
            foreach ($uploadedFiles as $index => $rowFiles) {
                if (isset($rowFiles['fileModul'])) {
                    $file = $rowFiles['fileModul'];
                    $code = $modulRows[$index]['kodeModul'] ?? 'MOD';
                    $fileName = $code . '-' . time() . '.pdf';
                    $path = $file->storeAs('modules', $fileName, 'public');
                    $modulRows[$index]['linkModul'] = Storage::url($path);
                }
            }
        }

        $programRows = $request->input('program_rows', []);
        $uploadedProgramFiles = $request->file('program_rows');
        if (is_array($uploadedProgramFiles)) {
            foreach ($uploadedProgramFiles as $index => $rowFiles) {
                if (isset($rowFiles['fileProgram'])) {
                    $file = $rowFiles['fileProgram'];
                    $code = $programRows[$index]['kodeProgram'] ?? 'PROG';
                    $fileName = $code . '-' . time() . '.pdf';
                    $path = $file->storeAs('programs', $fileName, 'public');
                    $programRows[$index]['linkProgram'] = Storage::url($path);
                }
            }
        }

        $moduleRequest->update([
            'title'               => $title,
            'type'                => $validated['jenis_perubahan'],
            'status'              => $status,
            'program'             => $validated['kategori_modul'],
            'revision_reason'     => $validated['referensi_khusus'] ?? null,
            'description'         => $validated['detail_permintaan'] ?? null,
            'keterangan_kebutuhan'=> $validated['keterangan_kebutuhan'] ?? null,
            'jenis_kebutuhan'     => $validated['jenis_kebutuhan_pelatihan'] ?? null,
            'language'            => $validated['bahasa_pengantar'] ?? 'Indonesia',
            'jenis_modul'         => json_encode($validated['jenis_modul'] ?? []),
            'modul_rows'          => json_encode($modulRows),
            'program_rows'        => json_encode($programRows),
        ]);

        return redirect()->route('perubahan-modul')->with('message', 'Pengajuan berhasil diperbarui.');
    }

    /**
     * Shared update logic for both pengajuan and perubahan-modul.
     */
    private function updateById(Request $request, int $id, string $redirectRoute): RedirectResponse
    {
        $moduleRequest = ModuleRequest::findOrFail($id);
        $user = Auth::user();

        $isProcessor = in_array(strtolower($user->role), ['admin', 'staf pd']);

        // Only applicant or admin/staf pd can edit
        if ($moduleRequest->applicant_id !== $user->id && !$isProcessor) {
            abort(403, 'Akses ditolak.');
        }

        // Processing Kebutuhan Khusus by Admin or Staf PD (or cancellation by User)
        if ($moduleRequest->type === 'Kebutuhan Khusus' && ($request->has('link_modul') || $request->has('tanggal_realisasi') || $request->has('tanggal_kebutuhan_baru') || in_array($request->input('status'), ['Baru', 'Selesai', 'Batal', 'Hold']))) {
            if (!$isProcessor) {
                // Regular User can cancel their own request if status is 'Baru' (representing 'Process')
                if ($user->id === $moduleRequest->applicant_id && $moduleRequest->status === 'Baru' && $request->input('status') === 'Batal') {
                    $oldStatus = $moduleRequest->status;
                    $moduleRequest->update([
                        'status' => 'Batal',
                        'reject_reason' => 'Dibatalkan oleh Pengaju',
                        'processed_by' => $user->id,
                        'processed_at' => now(),
                    ]);

                    // Send email notification for cancellation
                    try {
                        $emailsToNotify = collect([$user->email]);
                        $managerEmails = \App\Models\User::whereRaw('LOWER(role) = ?', ['manager pd'])
                            ->where('status', 'Aktif')
                            ->pluck('email');
                        $emailsToNotify = $emailsToNotify->merge($managerEmails)->unique()->filter();

                        if ($emailsToNotify->isNotEmpty()) {
                            \Illuminate\Support\Facades\Mail::to($emailsToNotify)
                                ->send(new \App\Mail\ModuleRequestProcessedMail($moduleRequest));
                        }
                    } catch (\Exception $e) {
                        Log::error('Gagal mengirim email: ' . $e->getMessage());
                    }

                    return redirect()->route($redirectRoute)->with('message', 'Pengajuan berhasil dibatalkan.');
                }
                abort(403, 'Akses ditolak.');
            }

            // Staf PD / Admin processing Kebutuhan Khusus
            $validated = $request->validate([
                'status' => 'required|in:Baru,Selesai,Batal,Hold',
                'link_modul' => 'required_if:status,Selesai|nullable|url|max:255',
                'tanggal_realisasi' => 'required_if:status,Selesai|nullable|date',
                'tanggal_kebutuhan_baru' => 'required_if:status,Hold|nullable|date',
                'reject_reason' => 'required|string|max:1000',
            ], [
                'link_modul.required_if' => 'Link Modul wajib diisi jika status Done.',
                'link_modul.url' => 'Link Modul harus berupa URL yang valid.',
                'tanggal_realisasi.required_if' => 'Tanggal Realisasi wajib diisi jika status Done.',
                'tanggal_kebutuhan_baru.required_if' => 'Tanggal Kebutuhan Baru wajib diisi jika status Hold.',
                'reject_reason.required' => 'Keterangan wajib diisi.',
            ]);

            $oldStatus = $moduleRequest->status;
            $validated['processed_by'] = $user->id;
            $validated['processed_at'] = now();

            $moduleRequest->update($validated);

            // Send email if status changed to Selesai, Batal or Hold
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

            return redirect()->route($redirectRoute)
                ->with('message', "Pengajuan {$moduleRequest->request_number} berhasil diproses.");
        }

        // Processing by Admin or Staf PD for other request types (setting link, realisasi date, status, etc.)
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

            return redirect()->route($redirectRoute)
                ->with('message', "Pengajuan {$moduleRequest->request_number} berhasil diproses.");
        }

        // Regular applicant editing the request or Admin fixing typos
        $isAdmin = strtolower($user->role) === 'admin';
        if ($moduleRequest->applicant_id === $user->id && !$isAdmin && ! in_array($moduleRequest->status, ['Baru', 'Drafting'])) {
            return redirect()->route($redirectRoute)
                ->with('error', 'Pengajuan tidak dapat diedit karena sudah diproses.');
        }

        if ($request->input('type') === 'Kebutuhan Khusus') {
            // Only validate deadline constraint for user/non-admin if it has changed
            $deadline = Carbon::parse($request->input('deadline'));
            if (!$isAdmin) {
                $minDate = now()->addDays(14)->startOfDay();
                if ($deadline->lt($minDate)) {
                    return back()->withErrors(['deadline' => 'Tanggal kebutuhan khusus minimal harus 14 hari dari hari ini.'])->withInput();
                }
            }

            $validated = $request->validate([
                'jenis_kebutuhan' => 'required|string',
                'language' => 'required|string',
                'judul_program' => 'required|string|max:255',
                'description' => 'required|string',
                'deadline' => 'required|date',
                'priority' => 'nullable|in:High,Medium,Low',
                
                // Pelatihan Inhouse specific validation
                'nama_instansi' => 'required_if:jenis_kebutuhan,Pelatihan Inhouse|nullable|string|max:255',
                'jam_khusus' => 'required_if:jenis_kebutuhan,Pelatihan Inhouse|nullable|numeric',
                'pre_post_test' => 'required_if:jenis_kebutuhan,Pelatihan Inhouse|nullable|string',

                // Pelatihan Internal or Seminar specific validation
                'keterangan_kebutuhan' => 'required_if:jenis_kebutuhan,Pelatihan Internal,Seminar|nullable|string',
            ], [
                'jenis_kebutuhan.required' => 'Jenis Kebutuhan Modul wajib dipilih.',
                'language.required' => 'Bahasa Pengantar wajib dipilih.',
                'judul_program.required' => 'Judul Program Pelatihan wajib diisi.',
                'description.required' => 'Detail Permintaan Modul Khusus wajib diisi.',
                'deadline.required' => 'Tanggal Kebutuhan wajib diisi.',
                'nama_instansi.required_if' => 'Nama Instansi wajib diisi untuk Pelatihan Inhouse.',
                'jam_khusus.required_if' => 'Request Jam Khusus Pelatihan wajib diisi untuk Pelatihan Inhouse.',
                'jam_khusus.numeric' => 'Request Jam Khusus Pelatihan harus berupa angka.',
                'pre_post_test.required_if' => 'Permintaan Pre & Post Test wajib diisi untuk Pelatihan Inhouse.',
                'keterangan_kebutuhan.required_if' => 'Keterangan Kebutuhan wajib diisi untuk Pelatihan Internal / Seminar.',
            ]);

            $validated['title'] = $validated['judul_program'];
        } else {
            $fileRule = 'nullable|file|mimes:pdf|max:20480';
            if ($request->input('type') === 'Revisi Modul' && !$moduleRequest->file_path) {
                $fileRule = 'required|file|mimes:pdf|max:20480';
            }

            $validated = $request->validate([
                'type' => 'required|in:Modul Baru,Revisi Modul,Kebutuhan Khusus',
                'title' => $request->input('type') === 'Kebutuhan Khusus' ? 'nullable|string|max:255' : 'required|string|max:255',
                'description' => 'nullable|string',
                'deadline' => 'nullable|date',
                'priority' => 'nullable|in:High,Medium,Low',
                'status' => 'sometimes|in:Baru,Drafting,Menunggu Approval',
                'related_module_id' => 'nullable|integer',
                'program' => 'nullable|string|max:255',
                'language' => 'nullable|string|max:255',
                'training_days' => 'nullable|integer',
                'revision_reason' => 'nullable|string',
                'file' => $fileRule,
            ]);
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

        return redirect()->route($redirectRoute)
            ->with('message', "Pengajuan {$moduleRequest->request_number} berhasil diperbarui.");
    }

    /**
     * Delete a module request (only if status is Baru).
     */
    public function destroy(int $id): RedirectResponse
    {
        return $this->destroyById($id, 'pengajuan');
    }

    /**
     * Delete a perubahan modul request.
     */
    public function destroyPerubahan(int $id): RedirectResponse
    {
        return $this->destroyById($id, 'perubahan-modul');
    }

    private function destroyById(int $id, string $redirectRoute): RedirectResponse
    {
        $moduleRequest = ModuleRequest::findOrFail($id);
        $user = Auth::user();

        if ($moduleRequest->applicant_id !== $user->id && ! in_array(strtolower($user->role), ['admin', 'staf pd'])) {
            abort(403, 'Akses ditolak.');
        }

        if (! in_array($moduleRequest->status, ['Baru', 'Draft', 'Drafting'])) {
            return redirect()->route($redirectRoute)
                ->with('error', 'Pengajuan hanya dapat dihapus jika masih berstatus Baru atau Draft.');
        }

        if ($moduleRequest->file_path && Storage::disk('public')->exists($moduleRequest->file_path)) {
            Storage::disk('public')->delete($moduleRequest->file_path);
        }

        $number = $moduleRequest->request_number;
        $moduleRequest->delete();

        return redirect()->route($redirectRoute)
            ->with('message', "Pengajuan {$number} berhasil dihapus.");
    }

    /**
     * Submit a Permintaan Modul Khusus to approval queue.
     */
    public function submit(int $id): RedirectResponse
    {
        return $this->submitById($id, 'pengajuan');
    }

    /**
     * Submit a Perubahan Modul to approval queue.
     */
    public function submitPerubahan(int $id): RedirectResponse
    {
        return $this->submitById($id, 'perubahan-modul');
    }

    private function submitById(int $id, string $redirectRoute): RedirectResponse
    {
        $moduleRequest = ModuleRequest::findOrFail($id);
        $user = Auth::user();

        if ($moduleRequest->applicant_id !== $user->id && ! in_array(strtolower($user->role), ['admin', 'staf pd'])) {
            abort(403, 'Akses ditolak.');
        }

        if (! in_array($moduleRequest->status, ['Baru', 'Draft', 'Drafting'])) {
            return redirect()->route($redirectRoute)
                ->with('error', 'Pengajuan sudah dikirim ke approval atau sudah selesai.');
        }

        $moduleRequest->update(['status' => 'Menunggu Approval']);

        try {
            if ($moduleRequest->applicant && $moduleRequest->applicant->email) {
                \Illuminate\Support\Facades\Mail::to($moduleRequest->applicant->email)
                    ->send(new \App\Mail\ModuleRequestSubmittedMail($moduleRequest));
            }

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

        return redirect()->route($redirectRoute)
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

    /**
     * Get PDF page count.
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

        return $count > 0 ? $count : 1;
    }
}
