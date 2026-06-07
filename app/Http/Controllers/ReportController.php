<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\ModuleRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display report analytics page.
     */
    public function index(Request $request): Response
    {
        $selectedUnit = $request->input('unit', 'Semua Unit');
        $selectedType = $request->input('type', 'Semua Jenis Report');

        // 1. Base queries
        $modulesQuery = Module::query();
        $requestsQuery = ModuleRequest::query();

        if ($selectedUnit !== 'Semua Unit') {
            $modulesQuery->where('program', $selectedUnit);
            $requestsQuery->where('unit', $selectedUnit);
        }

        // 2. Metrics
        $totalModulesThisMonth = (clone $modulesQuery)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $approvedCount = (clone $requestsQuery)->where('status', 'Selesai')->count();
        $rejectedCount = (clone $requestsQuery)->where('status', 'Ditolak')->count();
        $totalProcessed = $approvedCount + $rejectedCount;
        $approvalRate = $totalProcessed > 0 ? round(($approvedCount / $totalProcessed) * 100) : 100;

        $completedRequests = $approvedCount;

        $userQuery = User::query();
        if ($selectedUnit !== 'Semua Unit') {
            $userQuery->where('unit', $selectedUnit);
        }
        $activeUsers = $userQuery->where('status', 'Aktif')->count();

        // 3. Line Chart: Tren Pengajuan & Approval (Last 30 Days)
        $startDate = now()->subDays(30)->startOfDay();
        $endDate = now()->endOfDay();

        $pengajuans = (clone $requestsQuery)
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->get()
            ->pluck('count', 'date');

        $approvals = (clone $requestsQuery)
            ->selectRaw('DATE(processed_at) as date, count(*) as count')
            ->where('status', 'Selesai')
            ->where('processed_at', '>=', $startDate)
            ->groupBy('date')
            ->get()
            ->pluck('count', 'date');

        $trendData = [];
        for ($date = clone $startDate; $date <= $endDate; $date->addDay()) {
            $formattedDate = $date->format('Y-m-d');
            $displayDate = $date->translatedFormat('d M');
            $trendData[] = [
                'name' => $displayDate,
                'pengajuan' => $pengajuans->get($formattedDate, 0),
                'approval' => $approvals->get($formattedDate, 0),
            ];
        }

        // 4. Bar Chart: Distribusi Modul per Jenis Pelatihan
        $distributionDataRaw = (clone $modulesQuery)
            ->selectRaw('program, count(*) as count')
            ->groupBy('program')
            ->get();

        $colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#9ca3af'];
        $distributionData = [];
        foreach ($distributionDataRaw as $index => $item) {
            $distributionData[] = [
                'category' => $item->program ?? 'Umum',
                'count' => $item->count,
                'fill' => $colors[$index % count($colors)],
            ];
        }

        if (empty($distributionData)) {
            $distributionData = [
                ['category' => 'Teknis', 'count' => 0, 'fill' => '#3b82f6'],
                ['category' => 'Soft Skill', 'count' => 0, 'fill' => '#10b981'],
            ];
        }

        // 5. Pie Chart: Status Modul
        $statusData = [
            ['name' => 'Aktif', 'value' => (clone $modulesQuery)->where('status', 'Approved')->count(), 'fill' => '#10b981'],
            ['name' => 'Menunggu Approval', 'value' => (clone $requestsQuery)->where('status', 'Menunggu Approval')->count(), 'fill' => '#3b82f6'],
            ['name' => 'Draft', 'value' => (clone $requestsQuery)->where('status', 'Drafting')->count(), 'fill' => '#f59e0b'],
            ['name' => 'Nonaktif', 'value' => (clone $modulesQuery)->where('status', 'Arsip')->count(), 'fill' => '#9ca3af'],
        ];

        $totalStatusVal = array_sum(array_column($statusData, 'value'));
        foreach ($statusData as &$sd) {
            $sd['percentage'] = $totalStatusVal > 0 ? round(($sd['value'] / $totalStatusVal) * 100) : 0;
        }

        // 6. Horizontal Bar Chart: Aktivitas User per Unit
        $activityDataRaw = ModuleRequest::selectRaw('unit, count(*) as count')
            ->groupBy('unit')
            ->get();

        $activityData = [];
        foreach ($activityDataRaw as $index => $item) {
            $activityData[] = [
                'name' => $item->unit ?? 'Umum',
                'value' => $item->count,
                'fill' => $colors[$index % count($colors)],
            ];
        }

        if (empty($activityData)) {
            $activityData = [
                ['name' => 'IT & Digital', 'value' => 0, 'fill' => '#2563eb'],
            ];
        }

        // Mock saved reports list (dynamic timestamps)
        $savedReports = [
            ['id' => '1', 'name' => 'Laporan Pengajuan & Approval Bulanan', 'period' => now()->translatedFormat('F Y'), 'author' => 'Sistem', 'format' => 'Excel', 'lastGenerated' => now()->format('d M Y H:i')],
            ['id' => '2', 'name' => 'Laporan Aktivitas User per Unit', 'period' => now()->translatedFormat('F Y'), 'author' => 'Sistem', 'format' => 'Excel', 'lastGenerated' => now()->subDay()->format('d M Y H:i')],
            ['id' => '3', 'name' => 'Laporan Status Modul', 'period' => now()->translatedFormat('F Y'), 'author' => 'Sistem', 'format' => 'CSV', 'lastGenerated' => now()->subDays(2)->format('d M Y H:i')],
        ];

        return Inertia::render('report', [
            'metrics' => [
                'modulBulanIni' => $totalModulesThisMonth,
                'approvalRate' => $approvalRate,
                'pengajuanSelesai' => $completedRequests,
                'userAktif' => $activeUsers,
            ],
            'trendData' => $trendData,
            'distributionData' => $distributionData,
            'statusData' => $statusData,
            'activityTitle' => $selectedUnit !== 'Semua Unit' ? "Aktivitas per Tim {$selectedUnit}" : 'Aktivitas User per Unit',
            'activityData' => $activityData,
            'savedReports' => $savedReports,
            'filters' => [
                'unit' => $selectedUnit,
                'type' => $selectedType,
            ],
        ]);
    }

    /**
     * Export dynamic report to CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        $type = $request->input('type', 'modules'); // modules or requests
        $unit = $request->input('unit', 'Semua Unit');

        $headers = [
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=' . $type . '_report_' . now()->format('YmdHis') . '.csv',
            'Expires' => '0',
            'Pragma' => 'public',
        ];

        if ($type === 'modules') {
            $query = Module::query();
            if ($unit !== 'Semua Unit') {
                $query->where('program', $unit);
            }
            $data = $query->orderBy('code')->get();

            $columns = ['Kode Modul', 'Judul Modul', 'Jenis Pelatihan', 'Bahasa', 'Status', 'Revisi Saat Ini', 'Total Halaman', 'Approved At'];

            $callback = function () use ($data, $columns) {
                $file = fopen('php://output', 'w');
                fputcsv($file, $columns);

                foreach ($data as $row) {
                    fputcsv($file, [
                        $row->code,
                        $row->title,
                        $row->program,
                        $row->language,
                        $row->status,
                        $row->current_revision,
                        $row->file_pages,
                        $row->approved_at ? $row->approved_at->format('Y-m-d H:i') : '-',
                    ]);
                }
                fclose($file);
            };
        } else {
            $query = ModuleRequest::with('applicant');
            if ($unit !== 'Semua Unit') {
                $query->where('unit', $unit);
            }
            $data = $query->orderByDesc('created_at')->get();

            $columns = ['No. Pengajuan', 'Tipe', 'Judul Modul', 'Pengaju', 'Unit Kerja', 'Prioritas', 'Status', 'Tanggal Pengajuan', 'Deadline'];

            $callback = function () use ($data, $columns) {
                $file = fopen('php://output', 'w');
                fputcsv($file, $columns);

                foreach ($data as $row) {
                    fputcsv($file, [
                        $row->request_number,
                        $row->type,
                        $row->title,
                        $row->applicant?->name ?? '-',
                        $row->unit ?? '-',
                        $row->priority,
                        $row->status,
                        $row->created_at->format('Y-m-d H:i'),
                        $row->deadline ? $row->deadline->format('Y-m-d') : '-',
                    ]);
                }
                fclose($file);
            };
        }

        return response()->stream($callback, 200, $headers);
    }
}
