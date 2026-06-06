<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleDriveService
{
    protected string $clientEmail;

    protected string $privateKey;

    protected string $tokenUri;

    public function __construct()
    {
        $credentialsPath = storage_path('app/google/trainingpd-6315593ebcd4.json');

        if (! file_exists($credentialsPath)) {
            throw new \Exception('Google service account key file not found at: '.$credentialsPath);
        }

        $credentials = json_decode(file_get_contents($credentialsPath), true);
        $this->clientEmail = $credentials['client_email'];
        $this->privateKey = $credentials['private_key'];
        $this->tokenUri = $credentials['token_uri'] ?? 'https://oauth2.googleapis.com/token';
    }

    /**
     * Generate JWT assertion for OAuth2.
     */
    protected function generateJwt(): string
    {
        $header = json_encode([
            'alg' => 'RS256',
            'typ' => 'JWT',
        ]);

        $now = time();
        $payload = json_encode([
            'iss' => $this->clientEmail,
            'scope' => 'https://www.googleapis.com/auth/drive',
            'aud' => $this->tokenUri,
            'exp' => $now + 3600,
            'iat' => $now,
        ]);

        $base64UrlHeader = $this->base64UrlEncode($header);
        $base64UrlPayload = $this->base64UrlEncode($payload);

        $signatureInput = $base64UrlHeader.'.'.$base64UrlPayload;

        $signature = '';
        $success = openssl_sign($signatureInput, $signature, $this->privateKey, OPENSSL_ALGO_SHA256);

        if (! $success) {
            throw new \Exception('Failed to sign JWT with private key using openssl_sign.');
        }

        $base64UrlSignature = $this->base64UrlEncode($signature);

        return $signatureInput.'.'.$base64UrlSignature;
    }

    protected function base64UrlEncode(string $data): string
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    /**
     * Get OAuth2 Access Token.
     */
    public function getAccessToken(): string
    {
        $jwt = $this->generateJwt();

        $response = Http::asForm()->post($this->tokenUri, [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt,
        ]);

        if ($response->failed()) {
            Log::error('Google OAuth token request failed', ['response' => $response->body()]);
            throw new \Exception('Failed to retrieve access token from Google: '.$response->body());
        }

        return $response->json()['access_token'];
    }

    /**
     * Upload a file to Google Drive.
     *
     * @param  string  $filePath  Local path of the file
     * @param  string  $filename  Name of the file in Google Drive
     * @param  string  $mimeType  Mime type of the file
     * @return string Google Drive file ID
     */
    public function uploadFile(string $filePath, string $filename, string $mimeType = 'application/pdf'): string
    {
        $accessToken = $this->getAccessToken();

        $fileData = file_get_contents($filePath);
        $boundary = 'foo_bar_boundary_'.uniqid();

        // Prepare metadata
        $metadata = [
            'name' => $filename,
        ];

        $folderId = env('GOOGLE_DRIVE_FOLDER_ID');
        if (! empty($folderId)) {
            $metadata['parents'] = [$folderId];
        }

        $body = "--{$boundary}\r\n".
                "Content-Type: application/json; charset=UTF-8\r\n\r\n".
                json_encode($metadata)."\r\n".
                "--{$boundary}\r\n".
                "Content-Type: {$mimeType}\r\n\r\n".
                $fileData."\r\n".
                "--{$boundary}--";

        $response = Http::withToken($accessToken)
            ->withBody($body, 'multipart/related; boundary='.$boundary)
            ->post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true');

        if ($response->failed()) {
            Log::error('Google Drive upload failed', ['response' => $response->body()]);
            throw new \Exception('Failed to upload file to Google Drive: '.$response->body());
        }

        return $response->json()['id'];
    }

    /**
     * Download file media from Google Drive.
     *
     * @param  string  $fileId  Google Drive file ID
     * @return string File content binary string
     */
    public function downloadFile(string $fileId): string
    {
        $accessToken = $this->getAccessToken();

        $response = Http::withToken($accessToken)
            ->get("https://www.googleapis.com/drive/v3/files/{$fileId}?alt=media&supportsAllDrives=true");

        if ($response->failed()) {
            throw new \Exception('Failed to download file from Google Drive: '.$response->body());
        }

        return $response->body();
    }
}
