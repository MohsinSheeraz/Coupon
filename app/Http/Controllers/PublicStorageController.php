<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use League\Flysystem\PathTraversalDetected;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Serves files from the public disk when the `public/storage` symlink is missing,
 * e.g. on shared hosting deployed from git where `storage:link` never runs.
 */
class PublicStorageController extends Controller
{
    public function __invoke(string $path): StreamedResponse
    {
        $disk = Storage::disk('public');

        try {
            $fileExists = $disk->fileExists($path);
        } catch (PathTraversalDetected) {
            abort(404);
        }

        abort_unless($fileExists, 404);

        return $disk->response($path, null, [
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
