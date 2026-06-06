<?php

namespace App\Http\Controllers;

use App\Services\GoogleDriveOAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
            return response('Authorization code not found. Please try connecting again.', 400);
        }

        try {
            $refreshToken = $service->fetchRefreshTokenWithCode($request->input('code'));

            if (empty($refreshToken)) {
                return response('Failed to obtain a Refresh Token. Google might not have returned one. Try removing access permissions from your Google account settings first, then reconnect.', 400);
            }

            // Write the refresh token dynamically to the .env file
            $this->updateEnv('GOOGLE_REFRESH_TOKEN', $refreshToken);

            // Display a success screen that matches the application's premium aesthetic
            return response("
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Google Drive Terkoneksi</title>
                        <style>
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                background: #0a0a0a;
                                color: #ededed;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                height: 100vh;
                                margin: 0;
                            }
                            .card {
                                background: #121212;
                                border: 1px solid #222;
                                padding: 3rem;
                                border-radius: 1.5rem;
                                max-width: 500px;
                                text-align: center;
                                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                            }
                            .icon {
                                font-size: 3rem;
                                color: #10b981;
                                margin-bottom: 1rem;
                            }
                            h1 { color: #ffffff; font-size: 1.75rem; margin-top: 0; font-weight: 700; }
                            p { color: #a0a0a0; font-size: 0.95rem; line-height: 1.6; }
                            code {
                                background: #1e1e1e;
                                padding: 0.2rem 0.5rem;
                                border-radius: 0.35rem;
                                font-family: 'Fira Code', Consolas, Monaco, monospace;
                                font-size: 0.85rem;
                                color: #60a5fa;
                            }
                            .btn {
                                display: inline-flex;
                                margin-top: 2rem;
                                bg-color: #3b82f6;
                                background: #2563eb;
                                color: white;
                                text-decoration: none;
                                padding: 0.75rem 1.75rem;
                                border-radius: 0.75rem;
                                font-weight: 600;
                                transition: background 0.2s;
                            }
                            .btn:hover { background: #1d4ed8; }
                        </style>
                    </head>
                    <body>
                        <div class='card'>
                            <div class='icon'>✓</div>
                            <h1>Google Drive Terkoneksi!</h1>
                            <p>Refresh Token berhasil didapatkan dan ditulis ke file <code>.env</code> Anda.</p>
                            <p>Sistem sekarang dapat mengunggah dokumen langsung ke Google Drive menggunakan kuota penyimpanan akun Google Anda.</p>
                            <a class='btn' href='/database'>Kembali ke Database</a>
                        </div>
                    </body>
                </html>
            ");
        } catch (\Exception $e) {
            Log::error('Google OAuth callback failed', ['error' => $e->getMessage()]);

            return response('Error connecting to Google Drive: '.$e->getMessage(), 500);
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
