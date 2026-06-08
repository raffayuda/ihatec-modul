<?php

namespace App\Http\Controllers;

use App\Services\GoogleDriveOAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Setting;

class GoogleDriveOAuthController extends Controller
{
    /**
     * Redirect to Google OAuth consent page.
     */
    public function connect(GoogleDriveOAuthService $service)
    {
        return redirect()->away($service->getAuthUrl());
    }

    /**
     * Handle the OAuth redirect callback from Google.
     */
    public function callback(Request $request, GoogleDriveOAuthService $service)
    {
        if ($request->missing('code')) {
            return redirect()->route('admin.drive-integration')
                ->with('error', 'Kode otorisasi Google tidak ditemukan. Silakan hubungkan kembali.');
        }

        try {
            $refreshToken = $service->fetchRefreshTokenWithCode($request->input('code'));

            if (empty($refreshToken)) {
                return redirect()->route('admin.drive-integration')
                    ->with('error', 'Gagal mendapatkan Refresh Token. Coba hapus izin aplikasi pada akun Google Anda, lalu coba lagi.');
            }

            // Save the refresh token dynamic settings to DB
            Setting::set('google_refresh_token', $refreshToken);

            // Fetch profile info to display in UI
            $profile = $service->getProfileInfo($refreshToken);
            Setting::set('google_connected_email', $profile['email'] ?? '-');
            Setting::set('google_connected_name', $profile['name'] ?? '-');

            // Also update the .env file as a backup fallback
            $this->updateEnv('GOOGLE_REFRESH_TOKEN', $refreshToken);

            return redirect()->route('admin.drive-integration')
                ->with('message', 'Akun Google Drive berhasil ditautkan!');
        } catch (\Exception $e) {
            Log::error('Google OAuth callback failed', ['error' => $e->getMessage()]);

            return redirect()->route('admin.drive-integration')
                ->with('error', 'Error connecting to Google Drive: ' . $e->getMessage());
        }
    }

    /**
     * Programmatically update the .env configuration file.
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
