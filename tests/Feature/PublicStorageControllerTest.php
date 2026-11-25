<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicStorageControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_uploaded_public_file_is_served_without_storage_symlink(): void
    {
        Storage::fake('public');
        $path = UploadedFile::fake()->image('logo.png')->storePublicly('store-logos', 'public');

        $this->get('/storage/'.$path)
            ->assertOk()
            ->assertHeader('Content-Type', 'image/png');
    }

    public function test_missing_public_file_returns_not_found(): void
    {
        Storage::fake('public');

        $this->get('/storage/store-logos/missing.png')->assertNotFound();
    }

    public function test_path_traversal_outside_public_disk_returns_not_found(): void
    {
        Storage::fake('public');

        $this->get('/storage/..%2F..%2F.env')->assertNotFound();
    }
}
