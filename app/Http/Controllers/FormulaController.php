<?php

namespace App\Http\Controllers;

use App\Models\MasterData;
use App\Models\Module;
use App\Models\TrainingModule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FormulaController extends Controller
{
    /**
     * Display a listing of formulas and options.
     */
    public function index(): Response
    {
        // 1. Get training codes from master data category 'Kode Pelatihan'
        $trainingCodesRaw = MasterData::where('category', 'Kode Pelatihan')
            ->where('status', 'Aktif')
            ->orderBy('code', 'asc')
            ->get();

        $trainingCodes = $trainingCodesRaw->map(function ($c) {
            return $c->code . ' - ' . $c->name;
        })->toArray();

        // Fallback default list if database is empty
        if (empty($trainingCodes)) {
            $trainingCodes = [
                '1.11 Pelatihan Penyelia Halal Berbasis SKKNI',
                '1.12 Pelatihan Auditor Halal',
                '1.13 Pelatihan Penyelia Halal Internasional',
                '2.01 Pelatihan K3 Laboratorium',
                '2.02 Pelatihan ISO 17025'
            ];
        }

        // 2. Get approved modules from database
        $modulesRaw = Module::where('status', 'Approved')
            ->orderBy('code', 'asc')
            ->get();

        $modulesDatabase = $modulesRaw->map(function ($m) {
            return [
                'code' => $m->code,
                'title' => $m->title,
                'revision' => $m->current_revision,
                'date' => $m->updated_at ? $m->updated_at->format('d-M-y') : now()->format('d-M-y'),
            ];
        })->toArray();

        // 3. Get formulas from database
        $trainingModules = TrainingModule::with('module')->get();
        $grouped = $trainingModules->groupBy('training_code');
        $initialFormulas = [];

        foreach ($grouped as $trainingCode => $items) {
            $modules = [];
            foreach ($items as $item) {
                if ($item->module) {
                    $modules[] = [
                        'code' => $item->module->code,
                        'title' => $item->module->title,
                        'revision' => $item->module->current_revision,
                        'date' => $item->module->updated_at ? $item->module->updated_at->format('d-M-y') : now()->format('d-M-y'),
                    ];
                }
            }
            $initialFormulas[] = [
                'trainingCode' => $trainingCode,
                'modules' => $modules,
            ];
        }

        return Inertia::render('formula', [
            'trainingCodes' => $trainingCodes,
            'modulesDatabase' => $modulesDatabase,
            'initialFormulas' => $initialFormulas,
        ]);
    }

    /**
     * Store a newly created/updated formula in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'trainingCode' => 'required|string',
            'modules' => 'required|array',
            'modules.*.code' => 'required|string',
        ]);

        $trainingCode = $validated['trainingCode'];
        $moduleCodes = collect($validated['modules'])->pluck('code')->toArray();

        DB::transaction(function () use ($trainingCode, $moduleCodes, $validated) {
            // Delete existing mappings
            TrainingModule::where('training_code', $trainingCode)->delete();

            // Find matching module IDs
            $dbModules = Module::whereIn('code', $moduleCodes)->get();

            foreach ($validated['modules'] as $modInput) {
                $matched = $dbModules->firstWhere('code', $modInput['code']);
                if ($matched) {
                    TrainingModule::create([
                        'training_code' => $trainingCode,
                        'module_id' => $matched->id,
                    ]);
                }
            }
        });

        return back()->with('message', 'Formula Modul berhasil disimpan.');
    }
}
