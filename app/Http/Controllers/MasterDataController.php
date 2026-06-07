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
     * Display master data configuration page.
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

    /**
     * Store new master data.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category' => 'required|string',
            'name' => 'required|string',
            'code' => 'required|string',
            'status' => 'required|string|in:Aktif,Nonaktif',
        ]);

        MasterData::create($validated);

        return back()->with('message', 'Data berhasil ditambahkan.');
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
