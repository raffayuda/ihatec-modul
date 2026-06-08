<?php

namespace App\Services;

use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use App\Models\Setting;
use Illuminate\Support\Facades\Log;

class GoogleDriveOAuthService
{
    /**
     * Get configured Google Client.
     */
    public function getClient(): Client
    {
        $client = new Client;
        $client->setClientId(config('services.google.client_id') ?? env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(config('services.google.client_secret') ?? env('GOOGLE_CLIENT_SECRET'));
        $client->setRedirectUri(config('services.google.redirect_uri') ?? env('GOOGLE_REDIRECT_URI'));

        // Scopes for managing files, email, and user profile
        $client->addScope('https://www.googleapis.com/auth/drive.file');
        $client->addScope('email');
        $client->addScope('profile');

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
     * Fetch profile details of the connected Google account using Drive API About resource.
     * This avoids scope errors for accounts that only have the drive.file scope authorized.
     */
    public function getProfileInfo(string $refreshToken): array
    {
        try {
            $client = $this->getClient();
            $client->refreshToken($refreshToken);
            
            // Try fetching via OAuth2 UserInfo first if the scope allows it
            try {
                $oauth2 = new \Google\Service\Oauth2($client);
                $userInfo = $oauth2->userinfo->get();
                $name = $userInfo->getName();
                $email = $userInfo->getEmail();
                
                if (!empty($name) || !empty($email)) {
                    return [
                        'name' => !empty($name) ? $name : 'Google User',
                        'email' => !empty($email) ? $email : '-',
                    ];
                }
            } catch (\Exception $e) {
                Log::warning('Failed to fetch Google profile info via OAuth2 UserInfo: ' . $e->getMessage());
            }
            
            // Fallback to Drive About resource
            $service = new Drive($client);
            $about = $service->about->get([
                'fields' => 'user(displayName, emailAddress)',
            ]);
            
            $user = $about->getUser();
            if ($user) {
                $displayName = $user->getDisplayName();
                $emailAddress = $user->getEmailAddress();
                return [
                    'name' => !empty($displayName) ? $displayName : 'Google User',
                    'email' => !empty($emailAddress) ? $emailAddress : '-',
                ];
            }
            
            return [
                'name' => 'Google User',
                'email' => '-',
            ];
        } catch (\Exception $e) {
            Log::error('Failed to fetch Google profile info: ' . $e->getMessage());
            return [
                'name' => 'Google User',
                'email' => '-',
            ];
        }
    }

    /**
     * List folders in the connected Google Drive with full hierarchical path representation.
     */
    public function listFolders(): array
    {
        $refreshToken = Setting::get('google_refresh_token') 
            ?? config('services.google.refresh_token') 
            ?? env('GOOGLE_REFRESH_TOKEN');

        if (empty($refreshToken)) {
            return [];
        }

        try {
            $client = $this->getClient();
            $client->refreshToken($refreshToken);
            $service = new Drive($client);

            $response = $service->files->listFiles([
                'q' => "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
                'fields' => 'files(id, name, parents)',
                'pageSize' => 100,
                'supportsAllDrives' => true,
                'includeItemsFromAllDrives' => true,
            ]);

            // Build folder map
            $foldersMap = [];
            foreach ($response->getFiles() as $file) {
                $parents = $file->getParents();
                $foldersMap[$file->getId()] = [
                    'id' => $file->getId(),
                    'name' => $file->getName(),
                    'parentId' => (!empty($parents) && is_array($parents)) ? $parents[0] : null,
                ];
            }

            // Recursive path builder helper
            $buildPath = function ($folderId, $map) use (&$buildPath) {
                if (!isset($map[$folderId])) {
                    return '';
                }
                $folder = $map[$folderId];
                if (empty($folder['parentId']) || !isset($map[$folder['parentId']])) {
                    return $folder['name'];
                }
                $parentPath = $buildPath($folder['parentId'], $map);
                return $parentPath ? $parentPath . ' / ' . $folder['name'] : $folder['name'];
            };

            $folders = [];
            foreach ($foldersMap as $id => $folder) {
                $folders[] = [
                    'id' => $id,
                    'name' => $buildPath($id, $foldersMap),
                ];
            }

            // Sort folders alphabetically by path name
            usort($folders, fn($a, $b) => strcasecmp($a['name'], $b['name']));

            return $folders;
        } catch (\Exception $e) {
            Log::error('Failed to list Google Drive folders: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Create a new folder in Google Drive, optionally inside a parent folder.
     */
    public function createFolder(string $folderName, ?string $parentFolderId = null): string
    {
        $refreshToken = Setting::get('google_refresh_token') 
            ?? config('services.google.refresh_token') 
            ?? env('GOOGLE_REFRESH_TOKEN');

        if (empty($refreshToken)) {
            throw new \Exception('Google Drive not connected.');
        }

        $client = $this->getClient();
        $client->refreshToken($refreshToken);
        $service = new Drive($client);

        $fileMetadata = new DriveFile([
            'name' => $folderName,
            'mimeType' => 'application/vnd.google-apps.folder',
        ]);

        if (!empty($parentFolderId)) {
            $fileMetadata->setParents([$parentFolderId]);
        }

        $file = $service->files->create($fileMetadata, [
            'fields' => 'id',
            'supportsAllDrives' => true,
        ]);

        return $file->id;
    }

    /**
     * Upload a file to Google Drive.
     * Falls back to root if the active folder is deleted or in the trash.
     */
    public function uploadFile(string $filePath, string $filename, string $mimeType = 'application/pdf'): string
    {
        $client = $this->getClient();
        $refreshToken = Setting::get('google_refresh_token') 
            ?? config('services.google.refresh_token') 
            ?? env('GOOGLE_REFRESH_TOKEN');

        if (empty($refreshToken)) {
            throw new \Exception('Google Drive OAuth refresh token is not set. Please authenticate at /google-drive/connect.');
        }

        $client->refreshToken($refreshToken);
        $service = new Drive($client);

        $fileMetadata = new DriveFile([
            'name' => $filename,
        ]);

        $folderId = Setting::get('google_drive_folder_id')
            ?? config('services.google.folder_id')
            ?? env('GOOGLE_DRIVE_FOLDER_ID');

        $isValidFolder = false;
        if (! empty($folderId)) {
            try {
                // Check if folder exists and is not trashed
                $folder = $service->files->get($folderId, [
                    'fields' => 'id, trashed',
                    'supportsAllDrives' => true,
                ]);
                if ($folder && !$folder->getTrashed()) {
                    $isValidFolder = true;
                } else {
                    Log::warning("Active Google Drive folder {$folderId} is in the trash. Uploading to root instead.");
                }
            } catch (\Exception $e) {
                Log::warning("Active Google Drive folder {$folderId} is invalid or deleted: " . $e->getMessage() . ". Uploading to root instead.");
            }
        }

        if ($isValidFolder) {
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
     */
    public function downloadFile(string $fileId): string
    {
        $client = $this->getClient();
        $refreshToken = Setting::get('google_refresh_token') 
            ?? config('services.google.refresh_token') 
            ?? env('GOOGLE_REFRESH_TOKEN');

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

    /**
     * Delete a file from Google Drive.
     */
    public function deleteFile(string $fileId): void
    {
        $refreshToken = Setting::get('google_refresh_token') 
            ?? config('services.google.refresh_token') 
            ?? env('GOOGLE_REFRESH_TOKEN');

        if (empty($refreshToken)) {
            throw new \Exception('Google Drive not connected.');
        }

        $client = $this->getClient();
        $client->refreshToken($refreshToken);
        $service = new Drive($client);

        try {
            $service->files->delete($fileId, [
                'supportsAllDrives' => true,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to delete file from Google Drive: " . $e->getMessage(), ['fileId' => $fileId]);
            throw $e;
        }
    }
}

