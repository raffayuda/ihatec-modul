<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users (admin only).
     */
    public function index(): Response
    {
        $this->authorizeAdmin();

        $users = User::orderByDesc('created_at')->get()->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'role' => $u->role,
            'unit' => $u->unit ?? '-',
            'status' => $u->status ?? 'Aktif',
            'lastLogin' => $u->last_login_at
                ? $this->humanDiff($u->last_login_at)
                : '-',
            'createdAt' => Carbon::parse($u->created_at)->format('d M Y'),
        ]);

        // Metrics
        $metrics = [
            'total' => User::count(),
            'active' => User::where('status', 'Aktif')->count(),
            'pending' => User::where('status', 'Pending')->count(),
            'inactive' => User::where('status', 'Nonaktif')->count(),
        ];

        // Role distribution for chart
        $roleDistribution = User::selectRaw('role, count(*) as count')
            ->groupBy('role')
            ->get()
            ->map(fn ($row) => [
                'name' => $row->role,
                'value' => (int) $row->count,
            ]);

        return Inertia::render('manajemen-user', [
            'users' => $users,
            'metrics' => $metrics,
            'roleDistribution' => $roleDistribution,
        ]);
    }

    /**
     * Store a new user.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,manager PD,Staf PD,tim training,User',
            'unit' => 'nullable|string|max:255',
            'status' => 'required|in:Aktif,Pending,Nonaktif',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'unit' => $validated['unit'] ?? null,
            'status' => $validated['status'],
        ]);

        return redirect()->route('manajemen-user')
            ->with('message', "Akun pengguna {$validated['name']} berhasil ditambahkan.");
    }

    /**
     * Update an existing user.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $this->authorizeAdmin();

        $user = User::findOrFail($id);

        $rules = [
            'name' => 'required|string|max:255',
            'email' => "required|email|unique:users,email,{$id}",
            'role' => 'required|in:admin,manager PD,Staf PD,tim training,User',
            'unit' => 'nullable|string|max:255',
            'status' => 'required|in:Aktif,Pending,Nonaktif',
        ];

        if ($request->filled('password')) {
            $rules['password'] = 'string|min:8';
        }

        $validated = $request->validate($rules);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'unit' => $validated['unit'] ?? null,
            'status' => $validated['status'],
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->input('password'));
        }

        $user->update($updateData);

        return redirect()->route('manajemen-user')
            ->with('message', "Akun pengguna {$user->name} berhasil diperbarui.");
    }

    /**
     * Toggle user status (Aktif / Nonaktif).
     */
    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $this->authorizeAdmin();

        $user = User::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:Aktif,Pending,Nonaktif',
        ]);

        $user->update(['status' => $validated['status']]);

        return redirect()->route('manajemen-user')
            ->with('message', "Status akun {$user->name} diubah menjadi {$validated['status']}.");
    }

    /**
     * Delete a user permanently.
     */
    public function destroy(int $id): RedirectResponse
    {
        $this->authorizeAdmin();

        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            return redirect()->route('manajemen-user')
                ->with('error', 'Tidak dapat menghapus akun Anda sendiri.');
        }

        $name = $user->name;
        $user->delete();

        return redirect()->route('manajemen-user')
            ->with('message', "Akun pengguna {$name} berhasil dihapus.");
    }

    /**
     * Only admin may perform these actions.
     */
    private function authorizeAdmin(): void
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Akses ditolak. Hanya Administrator yang dapat mengelola pengguna.');
        }
    }

    /**
     * Human-readable time difference for last_login_at.
     */
    private function humanDiff(Carbon $date): string
    {
        $diffSeconds = (int) $date->diffInSeconds(now());

        if ($diffSeconds < 60) {
            return 'Baru saja';
        }
        if ($diffSeconds < 3600) {
            return ((int) $date->diffInMinutes(now())) . ' menit lalu';
        }
        if ($diffSeconds < 86400) {
            return ((int) $date->diffInHours(now())) . ' jam lalu';
        }
        if ($diffSeconds < 604800) {
            return ((int) $date->diffInDays(now())) . ' hari lalu';
        }

        return $date->format('d M Y');
    }
}
