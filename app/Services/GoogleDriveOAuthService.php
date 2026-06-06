<?php

namespace App\Services;

use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Illuminate\Support\Facades\Log;

class GoogleDriveOAuthService
{
    /**
     * Get configured Google Client.
     */
    public function getClient(): Client
    {
        $client = new Client;
        $client->setClientId(config('services.google.client_id', env('GOOGLE_CLIENT_ID')));
        $client->setClientSecret(config('services.google.client_secret', env('GOOGLE_CLIENT_SECRET')));
        $client->setRedirectUri(config('services.google.redirect_uri', env('GOOGLE_REDIRECT_URI')));

        // Scope for managing files created by this app
        $client->addScope('https://www.googleapis.com/auth/drive.file');

        // Necessary settings to retrieve a refresh_token
        $client->setAccessType('offline');
        $client->setApprovalPrompt('force'); // Ensures refresh token is returned on re-auth
        $client->setPrompt('consent');

        return $client;
    }

    /**
     * Get OAuth 2.0 Authentication URL.
     */
    public function getAuthUrl(): string
    {
        return $this->getClient()->createAuthUrl();
    }

    /**
     * Exchange Authorization Code for Refresh Token.
     */
    public function fetchRefreshTokenWithCode(string $code): ?string
    {
        $client = $this->getClient();
        $token = $client->fetchAccessTokenWithAuthCode($code);

        if (isset($token['error'])) {
            Log::error('Google Drive token exchange error', ['token' => $token]);
            throw new \Exception('Failed to exchange code: '.($token['error_description'] ?? $token['error']));
        }

        return $token['refresh_token'] ?? null;
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
        $client = $this->getClient();
        $refreshToken = config('services.google.refresh_token', env('GOOGLE_REFRESH_TOKEN'));

        if (empty($refreshToken)) {
            throw new \Exception('Google Drive OAuth refresh token is not set. Please authenticate at /google-drive/connect.');
        }

        $client->refreshToken($refreshToken);
        $service = new Drive($client);

        $fileMetadata = new DriveFile([
            'name' => $filename,
        ]);

        $folderId = config('services.google.folder_id', env('GOOGLE_DRIVE_FOLDER_ID'));
        if (! empty($folderId)) {
            $fileMetadata->setParents([$folderId]);
        }

        $content = file_get_contents($filePath);
        if ($content === false) {
            throw new \Exception("Failed to read local file: {$filePath}");
        }

        $file = $service->files->create($fileMetadata, [
            'data' => $content,
            'mimeType' => $mimeType,
            'uploadType' => 'multipart',
            'supportsAllDrives' => true,
        ]);

        return $file->id;
    }

    /**
     * Download file media from Google Drive.
     *
     * @param  string  $fileId  Google Drive file ID
     * @return string File content binary string
     */
    public function downloadFile(string $fileId): string
    {
        $client = $this->getClient();
        $refreshToken = config('services.google.refresh_token', env('GOOGLE_REFRESH_TOKEN'));

        if (empty($refreshToken)) {
            throw new \Exception('Google Drive OAuth refresh token is not set. Please authenticate at /google-drive/connect.');
        }

        $client->refreshToken($refreshToken);
        $service = new Drive($client);

        $response = $service->files->get($fileId, [
            'alt' => 'media',
            'supportsAllDrives' => true,
        ]);

        return $response->getBody()->getContents();
    }
}
