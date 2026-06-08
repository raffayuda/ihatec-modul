<?php

namespace App\Http\Controllers;

use App\Services\GoogleDriveOAuthService;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DriveIntegrationController extends Controller
{
    protected GoogleDriveOAuthService $driveService;

    public function __construct(GoogleDriveOAuthService $driveService)
    {
        $this->driveService = $driveService;
    }

    /**
     * Show the drive integration dashboard.
     */
    public function index(): Response
    {
        $this->authorizeAdmin();

        $refreshToken = Setting::get('google_refresh_token') 
            ?? config('services.google.refresh_token') 
            ?? env('GOOGLE_REFRESH_TOKEN');

        $isConnected = !empty($refreshToken);
        $profile = null;
        $folders = [];
        $isActiveFolderMissing = false;

        $activeFolderId = Setting::get('google_drive_folder_id')
            ?? config('services.google.folder_id')
            ?? env('GOOGLE_DRIVE_FOLDER_ID');

        $activeFolderName = Setting::get('google_drive_folder_name');

        if ($isConnected) {
            $email = Setting::get('google_connected_email');
            $name = Setting::get('google_connected_name');

            if (empty($email) || $email === '-') {
                $profileInfo = $this->driveService->getProfileInfo($refreshToken);
                if (!empty($profileInfo)) {
                    $email = $profileInfo['email'];
                    $name = $profileInfo['name'];
                    Setting::set('google_connected_email', $email);
                    Setting::set('google_connected_name', $name);
                }
            }

            $profile = [
                'name' => !empty($name) ? $name : 'Google User',
                'email' => !empty($email) ? $email : '-',
            ];

            $folders = $this->driveService->listFolders();

            if (!empty($activeFolderId)) {
                $found = false;
                foreach ($folders as $folder) {
                    if ($folder['id'] === $activeFolderId) {
                        $found = true;
                        // Synchronize name with the latest hierarchical name path
                        if ($folder['name'] !== $activeFolderName) {
                            $activeFolderName = $folder['name'];
                            Setting::set('google_drive_folder_name', $activeFolderName);
                        }
                        break;
                    }
                }
                if (!$found) {
                    $isActiveFolderMissing = true;
                }
            }
        }

        // Try to match the active folder id with the folders list to get name (if name is missing)
        if (empty($activeFolderName) && !empty($activeFolderId) && !empty($folders)) {
            foreach ($folders as $folder) {
                if ($folder['id'] === $activeFolderId) {
                    $activeFolderName = $folder['name'];
                    Setting::set('google_drive_folder_name', $activeFolderName);
                    break;
                }
            }
            if (empty($activeFolderName)) {
                $activeFolderName = 'Folder ID: ' . substr($activeFolderId, 0, 8) . '...';
            }
        }

        return Inertia::render('admin/drive-integration', [
            'isConnected' => $isConnected,
            'profile' => $profile,
            'folders' => $folders,
            'activeFolderId' => $activeFolderId ?? '',
            'activeFolderName' => $activeFolderName ?? 'Default Folder',
            'isActiveFolderMissing' => $isActiveFolderMissing,
        ]);
    }

    /**
     * Save active folder ID and name.
     */
    public function saveFolder(Request $request): RedirectResponse
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'folder_id' => 'required|string',
            'folder_name' => 'required|string',
        ]);

        Setting::set('google_drive_folder_id', $validated['folder_id']);
        Setting::set('google_drive_folder_name', $validated['folder_name']);

        return redirect()->route('admin.drive-integration')
            ->with('message', "Folder aktif berhasil diubah menjadi: {$validated['folder_name']}");
    }

    /**
     * Create a new folder and set it as active.
     */
    public function createFolder(Request $request): RedirectResponse
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'folder_name' => 'required|string|max:100',
            'parent_folder_id' => 'nullable|string',
        ]);

        try {
            $parentFolderId = $validated['parent_folder_id'] ?? null;
            $folderId = $this->driveService->createFolder($validated['folder_name'], $parentFolderId ?: null);

            Setting::set('google_drive_folder_id', $folderId);
            Setting::set('google_drive_folder_name', $validated['folder_name']);

            return redirect()->route('admin.drive-integration')
                ->with('message', "Folder baru '{$validated['folder_name']}' berhasil dibuat dan dijadikan folder aktif.");
        } catch (\Exception $e) {
            return redirect()->route('admin.drive-integration')
                ->with('error', "Gagal membuat folder baru: " . $e->getMessage());
        }
    }

    /**
     * Disconnect the Google Drive account.
     */
    public function disconnect(): RedirectResponse
    {
        $this->authorizeAdmin();

        // Clear settings
        Setting::set('google_refresh_token', null);
        Setting::set('google_drive_folder_id', null);
        Setting::set('google_drive_folder_name', null);
        Setting::set('google_connected_email', null);
        Setting::set('google_connected_name', null);

        // Clear .env file value
        $this->updateEnv('GOOGLE_REFRESH_TOKEN', '');

        return redirect()->route('admin.drive-integration')
            ->with('message', 'Koneksi akun Google Drive berhasil diputuskan.');
    }

    /**
     * Ensure only admin can access.
     */
    private function authorizeAdmin(): void
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Akses ditolak. Hanya Administrator yang dapat mengakses halaman ini.');
        }
    }

    /**
     * Update .env file value.
     */
    protected function updateEnv(string $key, string $value): void
    {
        $path = base_path('.env');
        if (file_exists($path)) {
            $content = file_get_contents($path);

            if (strpos($content, "{$key}=") !== false) {
                $content = preg_replace("/^{$key}=.*/m", "{$key}={$value}", $content);
            } else {
                $content .= "\n{$key}={$value}";
            }

            file_put_contents($path, $content);
        }
    }
}
