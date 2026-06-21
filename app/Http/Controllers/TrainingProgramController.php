<?php

namespace App\Http\Controllers;

use App\Models\TrainingProgram;
use App\Models\TrainingProgramRevision;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class TrainingProgramController extends Controller
{
    public function index(): Response
    {
        $programsRaw = TrainingProgram::with(['revisions' => function ($q) {
            $q->orderBy('id', 'desc');
        }])->orderBy('updated_at', 'desc')->get();

        $programs = $programsRaw->map(function ($p) {
            return [
                'id' => $p->code,
                'code' => $p->code,
                'name' => $p->name,
                'revisionCode' => $p->revision_code,
                'effectiveDate' => $p->effective_date ? $p->effective_date->format('d M Y') : '-',
                'status' => $p->status,
                'fileSize' => $p->file_size ?? '0 B',
                'filePages' => $p->file_pages,
                'description' => $p->description ?? '',
                'updatedAt' => $this->formatIndonesianDate($p->updated_at),
                'revisionsHistory' => $p->revisions->map(function ($rev) {
                    return [
                        'id' => $rev->id,
                        'revisionCode' => $rev->revision_code,
                        'effectiveDate' => $rev->effective_date ? $rev->effective_date->format('d M Y') : '-',
                        'date' => $this->formatIndonesianDate($rev->created_at),
                        'author' => $rev->author_name,
                        'note' => $rev->note ?? '',
                        'status' => $rev->status,
                    ];
                })->toArray(),
            ];
        });

        $metrics = [
            'total' => TrainingProgram::count(),
            'aktif' => TrainingProgram::where('status', 'Aktif')->count(),
            'nonAktif' => TrainingProgram::where('status', 'Non Aktif')->count(),
        ];

        return Inertia::render('database-program', [
            'programs' => $programs,
            'metrics' => $metrics,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (! in_array(strtolower(Auth::user()->role), ['admin', 'staf pd'])) {
            abort(403, 'Akses ditolak.');
        }

        $request->validate([
            'code' => 'required|string|unique:training_programs,code',
            'name' => 'required|string',
            'revision_code' => 'required|string',
            'effective_date' => 'nullable|date',
            'description' => 'nullable|string',
            'file' => 'required|file|mimes:pdf|max:20480',
        ]);

        $code = strtoupper($request->input('code'));
        $file = $request->file('file');
        $fileSizeStr = $this->formatBytes($file->getSize());
        $filePath = $file->storeAs('training-programs', $code.'.pdf', 'public');
        $absolutePath = Storage::disk('public')->path($filePath);
        $pageCount = $this->getPdfPageCount($absolutePath);

        $program = TrainingProgram::create([
            'code' => $code,
            'name' => $request->input('name'),
            'revision_code' => $request->input('revision_code'),
            'effective_date' => $request->input('effective_date'),
            'status' => 'Aktif',
            'description' => $request->input('description'),
            'file_path' => $filePath,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $fileSizeStr,
            'file_pages' => $pageCount,
            'created_by' => Auth::id(),
        ]);

        TrainingProgramRevision::create([
            'training_program_id' => $program->id,
            'revision_code' => $request->input('revision_code'),
            'effective_date' => $request->input('effective_date'),
            'note' => 'Rilis pertama program pelatihan.',
            'author_name' => Auth::user()->name ?? 'System Admin',
            'status' => 'Aktif',
            'file_path' => $filePath,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $fileSizeStr,
            'file_pages' => $pageCount,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('database-program')->with('message', "Program {$program->code} berhasil ditambahkan.");
    }

    public function update(Request $request, string $code): RedirectResponse
    {
        if (! in_array(strtolower(Auth::user()->role), ['admin', 'staf pd'])) {
            abort(403, 'Akses ditolak.');
        }

        $program = TrainingProgram::where('code', $code)->firstOrFail();

        $request->validate([
            'code' => 'required|string|unique:training_programs,code,'.$program->id,
            'name' => 'required|string',
            'revision_code' => 'required|string',
            'effective_date' => 'nullable|date',
            'description' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf|max:20480',
        ]);

        $newCode = strtoupper($request->input('code'));
        $file = $request->file('file');

        $updateData = [
            'code' => $newCode,
            'name' => $request->input('name'),
            'revision_code' => $request->input('revision_code'),
            'effective_date' => $request->input('effective_date'),
            'description' => $request->input('description'),
        ];

        if ($file || $newCode !== $program->code) {
            if ($program->file_path) {
                Storage::disk('public')->delete($program->file_path);
            }
        }

        if ($file) {
            $fileSizeStr = $this->formatBytes($file->getSize());
            $filePath = $file->storeAs('training-programs', $newCode.'.pdf', 'public');
            $absolutePath = Storage::disk('public')->path($filePath);
            $pageCount = $this->getPdfPageCount($absolutePath);

            $updateData['file_name'] = $file->getClientOriginalName();
            $updateData['file_size'] = $fileSizeStr;
            $updateData['file_pages'] = $pageCount;
            $updateData['file_path'] = $filePath;

            $latestRevision = $program->revisions()->first();
            if ($latestRevision) {
                if ($latestRevision->file_path) {
                    Storage::disk('public')->delete($latestRevision->file_path);
                }
                $latestRevision->update([
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $fileSizeStr,
                    'file_pages' => $pageCount,
                    'file_path' => $filePath,
                ]);
            }
        } elseif ($newCode !== $program->code) {
            if ($program->file_path && Storage::disk('public')->exists($program->file_path)) {
                $newFilePath = 'training-programs/'.$newCode.'.pdf';
                Storage::disk('public')->move($program->file_path, $newFilePath);
                $updateData['file_path'] = $newFilePath;

                $latestRevision = $program->revisions()->first();
                if ($latestRevision) {
                    $latestRevision->update(['file_path' => $newFilePath]);
                }
            }
        }

        $program->update($updateData);

        return redirect()->route('database-program')->with('message', "Program {$newCode} berhasil diperbarui.");
    }

    public function revision(Request $request, string $code): RedirectResponse
    {
        if (! in_array(strtolower(Auth::user()->role), ['admin', 'staf pd'])) {
            abort(403, 'Akses ditolak.');
        }

        $request->validate([
            'revision_code' => 'required|string',
            'effective_date' => 'nullable|date',
            'note' => 'required|string',
            'file' => 'required|file|mimes:pdf|max:20480',
        ]);

        $program = TrainingProgram::where('code', $code)->firstOrFail();
        $newRevision = $request->input('revision_code');

        $file = $request->file('file');
        $fileSizeStr = $this->formatBytes($file->getSize());
        $filePath = $file->storeAs('training-programs', $program->code.'-'.$newRevision.'.pdf', 'public');
        $absolutePath = Storage::disk('public')->path($filePath);
        $pageCount = $this->getPdfPageCount($absolutePath);

        TrainingProgramRevision::create([
            'training_program_id' => $program->id,
            'revision_code' => $newRevision,
            'effective_date' => $request->input('effective_date'),
            'note' => $request->input('note'),
            'author_name' => Auth::user()->name ?? 'System Admin',
            'status' => 'Aktif',
            'file_path' => $filePath,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $fileSizeStr,
            'file_pages' => $pageCount,
            'created_by' => Auth::id(),
        ]);

        $mainFilePath = 'training-programs/'.$program->code.'.pdf';
        if (Storage::disk('public')->exists($mainFilePath)) {
            Storage::disk('public')->delete($mainFilePath);
        }
        Storage::disk('public')->copy($filePath, $mainFilePath);

        $program->update([
            'revision_code' => $newRevision,
            'effective_date' => $request->input('effective_date'),
            'file_path' => $mainFilePath,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $fileSizeStr,
            'file_pages' => $pageCount,
            'status' => 'Aktif',
        ]);

        return redirect()->route('database-program')->with('message', "Revisi {$newRevision} untuk program {$program->code} berhasil ditambahkan.");
    }

    public function toggleStatus(string $code): RedirectResponse
    {
        if (! in_array(strtolower(Auth::user()->role), ['admin', 'staf pd'])) {
            abort(403, 'Akses ditolak.');
        }

        $program = TrainingProgram::where('code', $code)->firstOrFail();
        $newStatus = $program->status === 'Aktif' ? 'Non Aktif' : 'Aktif';
        $program->update(['status' => $newStatus]);

        return redirect()->route('database-program')->with('message', "Status program {$code} berhasil diubah ke {$newStatus}.");
    }

    public function destroy(string $code): RedirectResponse
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Akses ditolak. Hanya Administrator yang dapat menghapus program.');
        }

        $program = TrainingProgram::where('code', $code)->firstOrFail();

        $filePaths = $program->revisions()->pluck('file_path')
            ->merge([$program->file_path])
            ->filter()
            ->unique();

        foreach ($filePaths as $filePath) {
            Storage::disk('public')->delete($filePath);
        }

        $program->delete();

        return redirect()->route('database-program')->with('message', "Program {$code} berhasil dihapus.");
    }

    public function download(string $code)
    {
        $program = TrainingProgram::where('code', $code)->firstOrFail();

        if ($program->file_path && Storage::disk('public')->exists($program->file_path)) {
            return Storage::disk('public')->download($program->file_path, ($program->file_name ?? $code).'.pdf');
        }

        return back()->withErrors(['error' => 'File tidak tersedia.']);
    }

    public function preview(string $code)
    {
        $program = TrainingProgram::where('code', $code)->firstOrFail();

        if ($program->file_path && Storage::disk('public')->exists($program->file_path)) {
            return response()->file(
                Storage::disk('public')->path($program->file_path),
                ['Content-Type' => 'application/pdf', 'Content-Disposition' => 'inline; filename="'.$code.'.pdf"']
            );
        }

        return response()->json(['error' => 'File tidak tersedia.'], 404);
    }

    public function downloadRevision(int $id)
    {
        $revision = TrainingProgramRevision::findOrFail($id);

        if ($revision->file_path && Storage::disk('public')->exists($revision->file_path)) {
            return Storage::disk('public')->download($revision->file_path, ($revision->file_name ?? "revision-{$revision->revision_code}").'.pdf');
        }

        return back()->withErrors(['error' => 'File revisi tidak tersedia.']);
    }

    public function previewRevision(int $id)
    {
        $revision = TrainingProgramRevision::findOrFail($id);

        if ($revision->file_path && Storage::disk('public')->exists($revision->file_path)) {
            return response()->file(
                Storage::disk('public')->path($revision->file_path),
                ['Content-Type' => 'application/pdf', 'Content-Disposition' => 'inline; filename="revision-'.$revision->revision_code.'.pdf"']
            );
        }

        return response()->json(['error' => 'File revisi tidak tersedia.'], 404);
    }

    public function export()
    {
        $programs = TrainingProgram::orderBy('code')->get();
        $filename = 'database-program-pelatihan-'.now()->format('Ymd-His').'.xlsx';

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Database Program Pelatihan');

        $headers = ['No', 'Kode Program', 'Nama Program', 'Kode Revisi', 'Tanggal Berlaku', 'Status', 'Ukuran File', 'Deskripsi'];

        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0F67EA']],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_LEFT,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ];

        foreach ($headers as $colIndex => $header) {
            $colLetter = Coordinate::stringFromColumnIndex($colIndex + 1);
            $sheet->setCellValue($colLetter.'1', $header);
        }

        $sheet->getStyle('A1:H1')->applyFromArray($headerStyle);
        $sheet->getRowDimension('1')->setRowHeight(28);

        $rowNumber = 2;
        foreach ($programs as $index => $program) {
            $sheet->setCellValue('A'.$rowNumber, $index + 1);
            $sheet->setCellValue('B'.$rowNumber, $program->code);
            $sheet->setCellValue('C'.$rowNumber, $program->name);
            $sheet->setCellValue('D'.$rowNumber, $program->revision_code);
            $sheet->setCellValue('E'.$rowNumber, $program->effective_date ? $program->effective_date->format('d/m/Y') : '');
            $sheet->setCellValue('F'.$rowNumber, $program->status);
            $sheet->setCellValue('G'.$rowNumber, $program->file_size);
            $sheet->setCellValue('H'.$rowNumber, $program->description);

            $sheet->getStyle('A'.$rowNumber.':H'.$rowNumber)->getBorders()->getBottom()
                ->setBorderStyle(Border::BORDER_THIN)
                ->getColor()->setRGB('E5E7EB');
            $sheet->getRowDimension($rowNumber)->setRowHeight(20);
            $rowNumber++;
        }

        foreach (range(1, 8) as $colIndex) {
            $colLetter = Coordinate::stringFromColumnIndex($colIndex);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    public function template()
    {
        $filename = 'template-import-database-program-pelatihan.xlsx';

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Import');

        $headers = ['Kode Program', 'Nama Program', 'Kode Revisi', 'Tanggal Berlaku', 'Status', 'Deskripsi'];

        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0F67EA']],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_LEFT,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ];

        foreach ($headers as $colIndex => $header) {
            $colLetter = Coordinate::stringFromColumnIndex($colIndex + 1);
            $sheet->setCellValue($colLetter.'1', $header);
        }

        $sheet->getStyle('A1:F1')->applyFromArray($headerStyle);
        $sheet->getRowDimension('1')->setRowHeight(28);

        $sheet->setCellValue('A2', 'PGT-ISO17025-2026');
        $sheet->setCellValue('B2', 'Program Pelatihan ISO 17025');
        $sheet->setCellValue('C2', '1.0');
        $sheet->setCellValue('D2', '01/01/2026');
        $sheet->setCellValue('E2', 'Aktif');
        $sheet->setCellValue('F2', 'Program pelatihan terkait implementasi ISO 17025.');

        $sheet->getStyle('A2:F2')->getBorders()->getBottom()
            ->setBorderStyle(Border::BORDER_THIN)
            ->getColor()->setRGB('E5E7EB');
        $sheet->getRowDimension('2')->setRowHeight(20);

        foreach (range(1, 6) as $colIndex) {
            $colLetter = Coordinate::stringFromColumnIndex($colIndex);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        if (! in_array(strtolower(Auth::user()->role), ['admin', 'staf pd'])) {
            abort(403, 'Akses ditolak.');
        }

        $request->validate([
            'file' => ['required', File::types(['xlsx', 'xls'])->max(10 * 1024)],
        ]);

        $file = $request->file('file');

        try {
            $spreadsheet = IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $maxRow = $sheet->getHighestRow();
            $maxCol = $sheet->getHighestColumn();
            $maxColIndex = Coordinate::columnIndexFromString($maxCol);

            $headers = [];
            for ($col = 1; $col <= $maxColIndex; $col++) {
                $headerVal = $sheet->getCell([$col, 1])->getValue();
                $headers[$col] = $this->normalizeImportHeader((string) $headerVal);
            }

            $rows = [];
            for ($row = 2; $row <= $maxRow; $row++) {
                $rowData = [];
                $hasData = false;
                for ($col = 1; $col <= $maxColIndex; $col++) {
                    $val = $sheet->getCell([$col, $row])->getValue();
                    $key = $headers[$col] ?? 'col_'.$col;
                    $rowData[$key] = $val !== null ? trim((string) $val) : '';
                    if ($rowData[$key] !== '') {
                        $hasData = true;
                    }
                }
                if ($hasData) {
                    $rows[] = $rowData;
                }
            }
        } catch (\Exception $e) {
            return back()->withErrors(['file' => 'Gagal membaca file Excel: '.$e->getMessage()]);
        }

        if (count($rows) === 0) {
            return back()->withErrors(['file' => 'File import tidak memiliki baris data.']);
        }

        $imported = DB::transaction(function () use ($rows) {
            $count = 0;

            foreach ($rows as $row) {
                $code = strtoupper(trim((string) ($row['code'] ?? '')));
                $name = trim((string) ($row['name'] ?? ''));

                if ($code === '' || $name === '') {
                    continue;
                }

                $revisionCode = trim((string) ($row['revision_code'] ?? '0.0')) ?: '0.0';
                $status = trim((string) ($row['status'] ?? 'Aktif')) ?: 'Aktif';
                if (! in_array($status, ['Aktif', 'Non Aktif'], true)) {
                    $status = 'Aktif';
                }

                $effectiveDateRaw = trim((string) ($row['effective_date'] ?? ''));
                $effectiveDate = null;
                if ($effectiveDateRaw !== '') {
                    try {
                        $effectiveDate = Carbon::createFromFormat('d/m/Y', $effectiveDateRaw)->format('Y-m-d');
                    } catch (\Exception $e) {
                        try {
                            $effectiveDate = Carbon::parse($effectiveDateRaw)->format('Y-m-d');
                        } catch (\Exception $e2) {
                            $effectiveDate = null;
                        }
                    }
                }

                $program = TrainingProgram::updateOrCreate(
                    ['code' => $code],
                    [
                        'name' => $name,
                        'revision_code' => $revisionCode,
                        'effective_date' => $effectiveDate,
                        'status' => $status,
                        'description' => trim((string) ($row['description'] ?? '')),
                        'created_by' => Auth::id(),
                    ],
                );

                $program->revisions()->firstOrCreate(
                    ['revision_code' => $revisionCode],
                    [
                        'effective_date' => $effectiveDate,
                        'note' => 'Diimpor dari file Excel.',
                        'author_name' => Auth::user()->name ?? 'System Admin',
                        'status' => $status,
                        'created_by' => Auth::id(),
                    ],
                );

                $count++;
            }

            return $count;
        });

        if ($imported === 0) {
            return back()->withErrors(['file' => 'Tidak ada data valid yang dapat diimpor. Pastikan kolom Kode Program dan Nama Program terisi.']);
        }

        return redirect()->route('database-program')->with('message', "{$imported} program berhasil diimpor.");
    }

    protected function normalizeImportHeader(string $header): string
    {
        $header = preg_replace('/[\x{FEFF}\x{200B}]/u', '', $header);
        $header = trim(strtolower($header));

        $map = [
            'kode program' => 'code',
            'kode' => 'code',
            'code' => 'code',
            'nama program' => 'name',
            'nama' => 'name',
            'name' => 'name',
            'kode revisi' => 'revision_code',
            'revisi' => 'revision_code',
            'revision' => 'revision_code',
            'revision code' => 'revision_code',
            'tanggal berlaku' => 'effective_date',
            'effective date' => 'effective_date',
            'tanggal' => 'effective_date',
            'status' => 'status',
            'deskripsi' => 'description',
            'description' => 'description',
        ];

        return $map[$header] ?? str_replace(' ', '_', $header);
    }

    protected function formatIndonesianDate($date): string
    {
        $months = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
            7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
        ];
        $carbon = Carbon::parse($date);

        return "{$carbon->day} {$months[$carbon->month]} {$carbon->year} {$carbon->format('H:i')}";
    }

    protected function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision).' '.$units[$pow];
    }

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
