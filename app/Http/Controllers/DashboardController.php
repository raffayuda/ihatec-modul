<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\ModuleRequest;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard for the authenticated user.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $role = $user->role;

        $roleLower = strtolower($role);

        $props = match (true) {
            $roleLower === 'admin' => $this->adminDashboard(),
            $roleLower === 'manager pd' => $this->managerDashboard(),
            $roleLower === 'staf pd' => $this->stafDashboard(),
            $roleLower === 'tim training' => $this->timTrainingDashboard(),
            default => $this->userDashboard(),
        };

        return Inertia::render('dashboard', $props);
    }

    /**
     * Admin dashboard data.
     *
     * @return array<string, mixed>
     */
    private function adminDashboard(): array
    {
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'Aktif')->count();
        $pendingUsers = User::where('status', 'Pending')->count();
        $inactiveUsers = User::where('status', 'Nonaktif')->count();
        $totalModules = Module::count();
        $approvedModules = Module::where('status', 'Approved')->count();
        $pendingRequests = ModuleRequest::where('status', 'Menunggu Approval')->count();

        // Role distribution
        $roleDistribution = User::selectRaw('role, count(*) as count')
            ->groupBy('role')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->role => (int) $row->count]);

        // Recent requests (last 15)
        $recentRequests = ModuleRequest::with('applicant')
            ->orderByDesc('created_at')
            ->limit(15)
            ->get()
            ->map(fn ($req) => [
                'id' => $req->request_number,
                'title' => $req->title,
                'type' => $req->type === 'Modul Baru' ? 'Baru' : 'Revisi',
                'applicant' => $req->applicant?->name ?? '-',
                'status' => $req->status,
                'deadline' => $req->deadline?->format('d M Y') ?? '-',
            ]);

        // Approval summary (this month)
        $thisMonth = Carbon::now()->startOfMonth();
        $approvalSummary = [
            'approved' => ModuleRequest::where('status', 'Selesai')->where('processed_at', '>=', $thisMonth)->count(),
            'rejected' => ModuleRequest::where('status', 'Ditolak')->where('processed_at', '>=', $thisMonth)->count(),
            'pending' => $pendingRequests,
        ];

        return [
            'stats' => [
                'totalUsers' => $totalUsers,
                'activeUsers' => $activeUsers,
                'pendingUsers' => $pendingUsers,
                'inactiveUsers' => $inactiveUsers,
                'totalModules' => $totalModules,
                'approvedModules' => $approvedModules,
                'pendingRequests' => $pendingRequests,
            ],
            'roleDistribution' => $roleDistribution,
            'recentRequests' => $recentRequests,
            'approvalSummary' => $approvalSummary,
        ];
    }

    /**
     * Manager PD dashboard data.
     *
     * @return array<string, mixed>
     */
    private function managerDashboard(): array
    {
        $totalModules = Module::count();
        $pendingApprovals = ModuleRequest::where('status', 'Menunggu Approval')->count();
        $approvedModules = Module::where('status', 'Approved')->count();
        $revisionCount = Module::where('status', 'Revisi')->count();

        // Pending queue (latest 15)
        $recentRequests = ModuleRequest::with('applicant')
            ->where('status', 'Menunggu Approval')
            ->orderByDesc('created_at')
            ->limit(15)
            ->get()
            ->map(fn ($req) => [
                'id' => $req->request_number,
                'title' => $req->title,
                'type' => $req->type === 'Modul Baru' ? 'Baru' : 'Revisi',
                'applicant' => $req->applicant?->name ?? '-',
                'status' => $req->status,
                'deadline' => $req->deadline?->format('d M Y') ?? '-',
            ]);

        // Approval summary this month
        $thisMonth = Carbon::now()->startOfMonth();
        $approvalSummary = [
            'approved' => ModuleRequest::where('status', 'Selesai')->where('processed_at', '>=', $thisMonth)->count(),
            'rejected' => ModuleRequest::where('status', 'Ditolak')->where('processed_at', '>=', $thisMonth)->count(),
            'pending' => $pendingApprovals,
        ];

        return [
            'stats' => [
                'totalModules' => $totalModules,
                'pendingApprovals' => $pendingApprovals,
                'approvedModules' => $approvedModules,
                'revisionCount' => $revisionCount,
            ],
            'recentRequests' => $recentRequests,
            'approvalSummary' => $approvalSummary,
        ];
    }

    /**
     * Staf PD dashboard data.
     *
     * @return array<string, mixed>
     */
    private function stafDashboard(): array
    {
        $draft = ModuleRequest::where('status', 'Baru')->count();
        $drafting = ModuleRequest::where('status', 'Drafting')->count();
        $waitingApproval = ModuleRequest::where('status', 'Menunggu Approval')->count();
        $approved = ModuleRequest::where('status', 'Selesai')->count();
        $rejected = ModuleRequest::where('status', 'Ditolak')->count();

        // Recent requests submitted by staf (show all as staf processes all)
        $recentRequests = ModuleRequest::with('applicant')
            ->orderByDesc('created_at')
            ->limit(15)
            ->get()
            ->map(fn ($req) => [
                'id' => $req->request_number,
                'title' => $req->title,
                'type' => $req->type === 'Modul Baru' ? 'Baru' : 'Revisi',
                'applicant' => $req->applicant?->name ?? '-',
                'status' => $req->status,
                'deadline' => $req->deadline?->format('d M Y') ?? '-',
            ]);

        return [
            'stats' => [
                'draft' => $draft,
                'drafting' => $drafting,
                'waitingApproval' => $waitingApproval,
                'approved' => $approved,
                'rejected' => $rejected,
            ],
            'recentRequests' => $recentRequests,
        ];
    }

    /**
     * Tim Training dashboard data.
     *
     * @return array<string, mixed>
     */
    private function timTrainingDashboard(): array
    {
        $approvedModules = Module::where('status', 'Approved')->count();
        $thisMonth = Carbon::now()->startOfMonth();
        $newApproved = Module::where('status', 'Approved')->where('updated_at', '>=', $thisMonth)->count();
        $totalModules = Module::count();

        // Latest approved modules
        $recentRequests = Module::where('status', 'Approved')
            ->orderByDesc('updated_at')
            ->limit(15)
            ->get()
            ->map(fn ($mod) => [
                'id' => $mod->code,
                'title' => $mod->title,
                'type' => 'Baru',
                'applicant' => '-',
                'status' => 'Approved',
                'deadline' => Carbon::parse($mod->updated_at)->format('d M Y'),
            ]);

        return [
            'stats' => [
                'approvedModules' => $approvedModules,
                'newApproved' => $newApproved,
                'totalModules' => $totalModules,
                'revisionsApproved' => 0,
            ],
            'recentRequests' => $recentRequests,
        ];
    }

    /**
     * Regular user dashboard data.
     *
     * @return array<string, mixed>
     */
    private function userDashboard(): array
    {
        $userId = Auth::id();

        $myRequests = ModuleRequest::where('applicant_id', $userId);
        $total = (clone $myRequests)->count();
        $inProgress = (clone $myRequests)->whereIn('status', ['Baru', 'Drafting', 'Menunggu Approval'])->count();
        $approved = (clone $myRequests)->where('status', 'Selesai')->count();
        $rejected = (clone $myRequests)->where('status', 'Ditolak')->count();

        $recentRequests = (clone $myRequests)
            ->orderByDesc('created_at')
            ->limit(15)
            ->get()
            ->map(fn ($req) => [
                'id' => $req->request_number,
                'title' => $req->title,
                'type' => $req->type === 'Modul Baru' ? 'Baru' : 'Revisi',
                'applicant' => Auth::user()->name,
                'status' => $req->status,
                'deadline' => $req->deadline?->format('d M Y') ?? '-',
            ]);

        return [
            'stats' => [
                'total' => $total,
                'inProgress' => $inProgress,
                'approved' => $approved,
                'rejected' => $rejected,
            ],
            'recentRequests' => $recentRequests,
        ];
    }
}
