<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SyncAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_sync_creates_and_updates_the_admin_with_a_hashed_password(): void
    {
        config(['admin.username' => 'admin@example.com', 'admin.password' => 'first-password']);
        $this->artisan('admin:sync')->assertSuccessful();
        $admin = User::query()->where('email', 'admin@example.com')->firstOrFail();
        $this->assertTrue(Hash::check('first-password', $admin->password));

        config(['admin.password' => 'second-password']);
        $this->artisan('admin:sync')->assertSuccessful();
        $admin->refresh();

        $this->assertSame(1, User::query()->count());
        $this->assertTrue(Hash::check('second-password', $admin->password));
    }

    public function test_sync_fails_when_admin_credentials_are_missing(): void
    {
        config(['admin.username' => null, 'admin.password' => null]);

        $this->artisan('admin:sync')->assertExitCode(1);
        $this->assertDatabaseCount('users', 0);
    }
}
