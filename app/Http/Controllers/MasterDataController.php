<?php

namespace App\Http\Controllers;

use App\Models\MasterData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class MasterDataController extends Controller
{
    /**
     * Display master data overview (landing page).
     */
    public function index(): Response
    {
        $dataList = MasterData::orderBy('id', 'desc')->get()->map(function ($item) {
            return [
                'id' => (string) $item->id,
                'name' => $item->name,
                'category' => $item->category,
                'code' => $item->code,
                'status' => $item->status,
                'updatedAt' => $item->updated_at ? $item->updated_at->format('d M Y H:i') : '-',
            ];
        });

        return Inertia::render('master-data', [
            'dataList' => $dataList,
        ]);
    }

    // ── Individual category page methods ──────────────────────────────────────

    public function jenisKebutuhan(): Response
    {
        return $this->renderCategory('Jenis Kebutuhan Modul', 'master-data/jenis-kebutuhan');
    }

    public function kodePelatihan(): Response
    {
        return $this->renderCategory('Kode Pelatihan', 'master-data/kode-pelatihan');
    }

    public function jenisModul(): Response
    {
        return $this->renderCategory('Jenis Modul', 'master-data/jenis-modul');
    }

    public function bahasaPengantar(): Response
    {
        return $this->renderCategory('Bahasa Pengantar', 'master-data/bahasa-pengantar');
    }

    public function tipePelatihan(): Response
    {
        return $this->renderCategory('Tipe Pelatihan', 'master-data/tipe-pelatihan');
    }

    public function tipeSertifikatSihalal(): Response
    {
        return $this->renderCategory('Tipe Sertifikat di Sihalal', 'master-data/tipe-sertifikat-sihalal');
    }

    public function jenisSertifikat(): Response
    {
        return $this->renderCategory('Jenis Sertifikat', 'master-data/jenis-sertifikat');
    }

    public function picPeriksaLk(): Response
    {
        return $this->renderCategory('PIC Periksa LK', 'master-data/pic-periksa-lk');
    }

    public function kodeProgram(): Response
    {
        return $this->renderCategory('Kode Program', 'master-data/kode-program');
    }

    public function jenisPerubahan(): Response
    {
        return $this->renderCategory('Jenis Perubahan', 'master-data/jenis-perubahan');
    }

    /**
     * Render a category-filtered master data page.
     */
    private function renderCategory(string $category, string $component): Response
    {
        $dataList = MasterData::where('category', $category)
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn ($item) => [
                'id' => (string) $item->id,
                'name' => $item->name,
                'category' => $item->category,
                'code' => $item->code,
                'status' => $item->status,
                'updatedAt' => $item->updated_at ? $item->updated_at->format('d M Y H:i') : '-',
            ]);

        return Inertia::render($component, [
            'dataList' => $dataList,
        ]);
    }

    /**
     * Store new master data.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category' => 'required|string',
            'name' => 'required|string',
            'code' => 'nullable|string',
            'status' => 'required|string|in:Aktif,Nonaktif',
        ]);

        MasterData::create($validated);

        return back()->with('message', 'Data berhasil ditambahkan.');
    }

    /**
     * Update master data.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $item = MasterData::findOrFail($id);
        $validated = $request->validate([
            'category' => 'required|string',
            'name' => 'required|string',
            'code' => 'nullable|string',
            'status' => 'required|string|in:Aktif,Nonaktif',
        ]);

        $item->update($validated);

        return back()->with('message', 'Data berhasil diperbarui.');
    }

    /**
     * Download CSV template for Kode Pelatihan.
     */
    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_kode_pelatihan.csv"',
        ];

        $callback = function() {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Nama Pelatihan', 'Kode Pelatihan']);
            fputcsv($file, ['Interpretasi Sistem dan Implementasi ISO 17025', 'ILN.1.8']);
            fputcsv($file, ['Sistem Jaminan Produk Halal (SJPH)', 'SJPH']);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Import Kode Pelatihan data from CSV.
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('file');
        $filePath = $file->getRealPath();

        $fileHandle = fopen($filePath, 'r');
        
        // Skip header
        fgetcsv($fileHandle);

        $importedCount = 0;
        while (($row = fgetcsv($fileHandle)) !== false) {
            if (count($row) >= 2) {
                $name = trim($row[0]);
                $code = trim($row[1]);

                if (!empty($name) && !empty($code)) {
                    MasterData::updateOrCreate(
                        [
                            'category' => 'Kode Pelatihan',
                            'code' => $code,
                        ],
                        [
                            'name' => $name,
                            'status' => 'Aktif',
                        ]
                    );
                    $importedCount++;
                }
            }
        }
        fclose($fileHandle);

        return back()->with('message', "Berhasil mengimpor {$importedCount} data kode pelatihan.");
    }

    /**
     * Delete multiple master data entries at once.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', []);
        
        if (empty($ids)) {
            return back()->with('error', 'Tidak ada data yang dipilih untuk dihapus.');
        }

        $count = MasterData::whereIn('id', $ids)->delete();

        return back()->with('message', "{$count} data berhasil dihapus.");
    }

    /**
     * Delete master data.
     */
    public function destroy(int $id): RedirectResponse
    {
        $item = MasterData::findOrFail($id);
        $item->delete();

        return back()->with('message', 'Data berhasil dihapus.');
    }
}
