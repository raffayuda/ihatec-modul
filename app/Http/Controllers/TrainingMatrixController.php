<?php

namespace App\Http\Controllers;

use App\Models\TrainingMatrix;
use App\Models\MasterData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Validation\Rules\File;

class TrainingMatrixController extends Controller
{
    /**
     * Display the training matrix list and relevant master options.
     */
    public function index(Request $request): Response
    {
        $query = TrainingMatrix::query();

        if ($request->has('search') && !empty($request->input('search'))) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('kode', 'like', "%{$search}%")
                  ->orWhere('nama_pelatihan', 'like', "%{$search}%")
                  ->orWhere('keterangan', 'like', "%{$search}%");
            });
        }

        $matrixList = $query->orderBy('id', 'desc')->get()->map(function ($item) {
            return [
                'id' => (string) $item->id,
                'kode' => $item->kode,
                'nama_pelatihan' => $item->nama_pelatihan,
                'link_modul' => $item->link_modul,
                'master_sa' => $item->master_sa,
                'master_sertifikat_name' => $item->master_sertifikat_name,
                'master_sertifikat_url' => $item->master_sertifikat_path ? route('matriks.download', $item->id) : null,
                'tipe_pelatihan' => $item->tipe_pelatihan,
                'jenis_sertifikat' => $item->jenis_sertifikat,
                'keterangan' => $item->keterangan,
                'pic_periksa_lk' => $item->pic_periksa_lk,
                'tipe_sertifikat_sihalal' => $item->tipe_sertifikat_sihalal,
                'harga_dasar_tte' => $item->harga_dasar_tte,
                'status' => $item->status,
            ];
        });

        // Query active master data choices for dropdowns
        $kodePelatihanOptions = MasterData::where('category', 'Kode Pelatihan')
            ->where('status', 'Aktif')
            ->orderBy('code')
            ->get(['code', 'name'])
            ->map(fn($item) => [
                'value' => $item->code,
                'label' => $item->code . ' - ' . $item->name,
                'name' => $item->name
            ])
            ->toArray();

        $tipePelatihanOptions = MasterData::where('category', 'Tipe Pelatihan')
            ->where('status', 'Aktif')
            ->orderBy('name')
            ->pluck('name')
            ->toArray();

        $jenisSertifikatOptions = MasterData::where('category', 'Jenis Sertifikat')
            ->where('status', 'Aktif')
            ->orderBy('name')
            ->pluck('name')
            ->toArray();

        $picPeriksaLkOptions = MasterData::where('category', 'PIC Periksa LK')
            ->where('status', 'Aktif')
            ->orderBy('name')
            ->pluck('name')
            ->toArray();

        $tipeSertifikatSihalalOptions = MasterData::where('category', 'Tipe Sertifikat di Sihalal')
            ->where('status', 'Aktif')
            ->orderBy('name')
            ->pluck('name')
            ->toArray();

        return Inertia::render('matriks', [
            'matrixList' => $matrixList,
            'kodePelatihanOptions' => $kodePelatihanOptions,
            'tipePelatihanOptions' => $tipePelatihanOptions,
            'jenisSertifikatOptions' => $jenisSertifikatOptions,
            'picPeriksaLkOptions' => $picPeriksaLkOptions,
            'tipeSertifikatSihalalOptions' => $tipeSertifikatSihalalOptions,
        ]);
    }

    /**
     * Store a new training matrix row.
     */
    public function store(Request $request): RedirectResponse
    {
        if (! $this->isPdUser()) {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validate([
            'kode' => 'required|string',
            'link_modul' => 'nullable|url',
            'master_sa' => 'nullable|url',
            'master_sertifikat' => 'nullable|file|mimes:pdf,png,jpg,jpeg,doc,docx,xls,xlsx|max:10240',
            'tipe_pelatihan' => 'nullable|string',
            'jenis_sertifikat' => 'nullable|string',
            'keterangan' => 'nullable|string',
            'pic_periksa_lk' => 'nullable|string',
            'tipe_sertifikat_sihalal' => 'nullable|string',
            'harga_dasar_tte' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|in:Aktif,Nonaktif',
        ]);

        // Auto-populate nama_pelatihan from master data if matches
        $master = MasterData::where('category', 'Kode Pelatihan')
            ->where('code', $validated['kode'])
            ->first();
        $namaPelatihan = $master ? $master->name : $validated['kode'];

        $fileData = [];
        if ($request->hasFile('master_sertifikat') && $request->file('master_sertifikat')->isValid()) {
            $file = $request->file('master_sertifikat');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('sertifikat', $fileName, 'public');
            $fileData = [
                'master_sertifikat_name' => $file->getClientOriginalName(),
                'master_sertifikat_path' => $path,
            ];
        }

        TrainingMatrix::create(array_merge($validated, [
            'nama_pelatihan' => $namaPelatihan,
            'status' => $validated['status'] ?? 'Aktif',
        ], $fileData));

        return redirect()->route('matriks')->with('message', 'Matriks Pelatihan berhasil ditambahkan.');
    }

    /**
     * Update a training matrix row.
     */
    public function update(Request $request, $id): RedirectResponse
    {
        if (! $this->isPdUser()) {
            abort(403, 'Akses ditolak.');
        }

        $matrix = TrainingMatrix::findOrFail($id);

        $validated = $request->validate([
            'kode' => 'required|string',
            'link_modul' => 'nullable|url',
            'master_sa' => 'nullable|url',
            'master_sertifikat' => 'nullable|file|mimes:pdf,png,jpg,jpeg,doc,docx,xls,xlsx|max:10240',
            'tipe_pelatihan' => 'nullable|string',
            'jenis_sertifikat' => 'nullable|string',
            'keterangan' => 'nullable|string',
            'pic_periksa_lk' => 'nullable|string',
            'tipe_sertifikat_sihalal' => 'nullable|string',
            'harga_dasar_tte' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|in:Aktif,Nonaktif',
        ]);

        $master = MasterData::where('category', 'Kode Pelatihan')
            ->where('code', $validated['kode'])
            ->first();
        $namaPelatihan = $master ? $master->name : $validated['kode'];

        $fileData = [];
        if ($request->hasFile('master_sertifikat') && $request->file('master_sertifikat')->isValid()) {
            // Delete old file
            if ($matrix->master_sertifikat_path && Storage::disk('public')->exists($matrix->master_sertifikat_path)) {
                Storage::disk('public')->delete($matrix->master_sertifikat_path);
            }

            $file = $request->file('master_sertifikat');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('sertifikat', $fileName, 'public');
            $fileData = [
                'master_sertifikat_name' => $file->getClientOriginalName(),
                'master_sertifikat_path' => $path,
            ];
        }

        $matrix->update(array_merge($validated, [
            'nama_pelatihan' => $namaPelatihan,
        ], $fileData));

        return redirect()->route('matriks')->with('message', 'Matriks Pelatihan berhasil diperbarui.');
    }

    /**
     * Toggle active/non-active status.
     */
    public function toggleStatus($id): RedirectResponse
    {
        if (! $this->isPdUser()) {
            abort(403, 'Akses ditolak.');
        }

        $matrix = TrainingMatrix::findOrFail($id);
        $matrix->status = $matrix->status === 'Aktif' ? 'Nonaktif' : 'Aktif';
        $matrix->save();

        return redirect()->route('matriks')->with('message', 'Status matriks pelatihan berhasil diubah.');
    }

    /**
     * Delete training matrix row.
     */
    public function destroy($id): RedirectResponse
    {
        if (! $this->isPdUser()) {
            abort(403, 'Akses ditolak.');
        }

        $matrix = TrainingMatrix::findOrFail($id);

        if ($matrix->master_sertifikat_path && Storage::disk('public')->exists($matrix->master_sertifikat_path)) {
            Storage::disk('public')->delete($matrix->master_sertifikat_path);
        }

        $matrix->delete();

        return redirect()->route('matriks')->with('message', 'Matriks Pelatihan berhasil dihapus.');
    }

    /**
     * Securely download master certificate files.
     */
    public function downloadFile($id)
    {
        $matrix = TrainingMatrix::findOrFail($id);

        if ($matrix->master_sertifikat_path && Storage::disk('public')->exists($matrix->master_sertifikat_path)) {
            return response()->download(
                Storage::disk('public')->path($matrix->master_sertifikat_path),
                $matrix->master_sertifikat_name
            );
        }

        abort(404, 'File sertifikat tidak ditemukan.');
    }

    /**
     * Export all rows to Excel.
     */
    public function export()
    {
        $filename = 'export-matriks-pelatihan-' . date('Y-m-d') . '.xlsx';
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Matriks Pelatihan');

        $headers = [
            'KODE',
            'NAMA PELATIHAN',
            'LINK MODUL',
            'MASTER SA',
            'MASTER SERTIFIKAT',
            'TIPE PELATIHAN',
            'JENIS SERTIFIKAT',
            'KETERANGAN',
            'PIC PERIKSA LK',
            'TIPE SERTIFIKAT DI SIHALAL',
            'HARGA DASAR TTE',
            'STATUS'
        ];

        // Header style
        $headerStyle = [
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '0F67EA'],
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT,
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
            ],
        ];

        // Write Headers
        foreach ($headers as $colIndex => $header) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex + 1);
            $sheet->setCellValue($colLetter . '1', $header);
        }

        $sheet->getStyle('A1:L1')->applyFromArray($headerStyle);
        $sheet->getRowDimension('1')->setRowHeight(28);

        // Fetch Data
        $data = TrainingMatrix::orderBy('id', 'desc')->get();
        $rowNumber = 2;

        foreach ($data as $item) {
            $sheet->setCellValue('A' . $rowNumber, $item->kode);
            $sheet->setCellValue('B' . $rowNumber, $item->nama_pelatihan);
            $sheet->setCellValue('C' . $rowNumber, $item->link_modul);
            $sheet->setCellValue('D' . $rowNumber, $item->master_sa);
            $sheet->setCellValue('E' . $rowNumber, $item->master_sertifikat_name);
            $sheet->setCellValue('F' . $rowNumber, $item->tipe_pelatihan);
            $sheet->setCellValue('G' . $rowNumber, $item->jenis_sertifikat);
            $sheet->setCellValue('H' . $rowNumber, $item->keterangan);
            $sheet->setCellValue('I' . $rowNumber, $item->pic_periksa_lk);
            $sheet->setCellValue('J' . $rowNumber, $item->tipe_sertifikat_sihalal);
            $sheet->setCellValue('K' . $rowNumber, $item->harga_dasar_tte);
            $sheet->setCellValue('L' . $rowNumber, $item->status);

            // soft border
            $sheet->getStyle('A' . $rowNumber . ':L' . $rowNumber)
                ->getBorders()
                ->getBottom()
                ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN)
                ->getColor()
                ->setRGB('E5E7EB');
            
            $sheet->getRowDimension($rowNumber)->setRowHeight(20);
            $rowNumber++;
        }

        // Auto-fit columns
        foreach (range(1, 12) as $colIndex) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex);
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

    /**
     * Download template Excel file for imports.
     */
    public function downloadTemplate()
    {
        $filename = 'template-import-matriks-pelatihan.xlsx';
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Import');

        $headers = [
            'Kode Pelatihan',
            'Link Modul',
            'Master SA',
            'Tipe Pelatihan',
            'Jenis Sertifikat',
            'Keterangan',
            'PIC Periksa LK',
            'Tipe Sertifikat di Sihalal',
            'Harga Dasar TTE'
        ];

        // Header style
        $headerStyle = [
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '0F67EA'],
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT,
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
            ],
        ];

        // Write Headers
        foreach ($headers as $colIndex => $header) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex + 1);
            $sheet->setCellValue($colLetter . '1', $header);
        }

        $sheet->getStyle('A1:I1')->applyFromArray($headerStyle);
        $sheet->getRowDimension('1')->setRowHeight(28);

        // Sample row
        $sheet->setCellValue('A2', 'AUD.HALAL');
        $sheet->setCellValue('B2', 'https://example.com/link-modul-auditor');
        $sheet->setCellValue('C2', 'https://example.com/link-sa-auditor');
        $sheet->setCellValue('D2', 'Regular');
        $sheet->setCellValue('E2', 'Jenis Sertifikat A');
        $sheet->setCellValue('F2', 'Keterangan isi modul Auditor Halal.');
        $sheet->setCellValue('G2', 'PIC A');
        $sheet->setCellValue('H2', 'Tipe A');
        $sheet->setCellValue('I2', '150000');

        $sheet->getStyle('A2:I2')
            ->getBorders()
            ->getBottom()
            ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN)
            ->getColor()
            ->setRGB('E5E7EB');
        
        $sheet->getRowDimension('2')->setRowHeight(20);

        // Auto-fit columns
        foreach (range(1, 9) as $colIndex) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex);
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

    /**
     * Import matrix rows from Excel.
     */
    public function import(Request $request): RedirectResponse
    {
        if (! $this->isPdUser()) {
            abort(403, 'Akses ditolak.');
        }

        $request->validate([
            'file' => [
                'required',
                File::types(['xlsx', 'xls'])->max(10 * 1024),
            ],
        ]);

        $file = $request->file('file');

        try {
            $spreadsheet = IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $maxRow = $sheet->getHighestRow();
            $maxCol = $sheet->getHighestColumn();
            $maxColIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($maxCol);

            // Read Headers
            $headers = [];
            for ($col = 1; $col <= $maxColIndex; $col++) {
                $headerVal = $sheet->getCell([$col, 1])->getValue();
                $headers[$col] = $this->normalizeHeader((string) $headerVal);
            }

            $rows = [];
            for ($row = 2; $row <= $maxRow; $row++) {
                $rowData = [];
                $hasData = false;
                for ($col = 1; $col <= $maxColIndex; $col++) {
                    $val = $sheet->getCell([$col, $row])->getValue();
                    $key = $headers[$col] ?? 'col_' . $col;
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
            return back()->withErrors(['file' => 'Gagal membaca file Excel: ' . $e->getMessage()]);
        }

        if (count($rows) === 0) {
            return back()->withErrors(['file' => 'File import tidak memiliki data.']);
        }

        $importedCount = DB::transaction(function () use ($rows) {
            $count = 0;
            foreach ($rows as $row) {
                $kode = trim((string) ($row['kode'] ?? ''));
                if (empty($kode)) {
                    continue;
                }

                // Get name from master data
                $master = MasterData::where('category', 'Kode Pelatihan')
                    ->where('code', $kode)
                    ->first();
                $namaPelatihan = $master ? $master->name : $kode;

                TrainingMatrix::updateOrCreate(
                    ['kode' => $kode],
                    [
                        'nama_pelatihan' => $namaPelatihan,
                        'link_modul' => trim((string) ($row['link_modul'] ?? '')) ?: null,
                        'master_sa' => trim((string) ($row['master_sa'] ?? '')) ?: null,
                        'tipe_pelatihan' => trim((string) ($row['tipe_pelatihan'] ?? '')) ?: null,
                        'jenis_sertifikat' => trim((string) ($row['jenis_sertifikat'] ?? '')) ?: null,
                        'keterangan' => trim((string) ($row['keterangan'] ?? '')) ?: null,
                        'pic_periksa_lk' => trim((string) ($row['pic_periksa_lk'] ?? '')) ?: null,
                        'tipe_sertifikat_sihalal' => trim((string) ($row['tipe_sertifikat_sihalal'] ?? '')) ?: null,
                        'harga_dasar_tte' => is_numeric($row['harga_dasar_tte'] ?? null) ? (int) $row['harga_dasar_tte'] : null,
                        'status' => 'Aktif',
                    ]
                );
                $count++;
            }
            return $count;
        });

        if ($importedCount === 0) {
            return back()->withErrors(['file' => 'Tidak ada data valid yang diimpor.']);
        }

        return redirect()->route('matriks')->with('message', "{$importedCount} matriks pelatihan berhasil diimpor.");
    }

    /**
     * Check if authenticated user belongs to PD roles.
     */
    private function isPdUser(): bool
    {
        $role = Auth::user()->role;
        return in_array(strtolower($role), ['admin', 'manager pd', 'staf pd']);
    }

    /**
     * Helper to normalize Excel header.
     */
    private function normalizeHeader(string $header): string
    {
        $header = preg_replace('/[\x{FEFF}\x{200B}]/u', '', $header);
        $header = trim(strtolower($header));
        
        $map = [
            'kode pelatihan' => 'kode',
            'kode' => 'kode',
            'nama pelatihan' => 'nama_pelatihan',
            'link modul' => 'link_modul',
            'master sa' => 'master_sa',
            'master sertifikat' => 'master_sertifikat',
            'tipe pelatihan' => 'tipe_pelatihan',
            'jenis sertifikat' => 'jenis_sertifikat',
            'keterangan' => 'keterangan',
            'pic periksa lk' => 'pic_periksa_lk',
            'tipe sertifikat di sihalal' => 'tipe_sertifikat_sihalal',
            'harga dasar tte' => 'harga_dasar_tte',
        ];

        return $map[$header] ?? str_replace(' ', '_', $header);
    }
}
