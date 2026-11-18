<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminLoginControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_explains_when_admin_credentials_are_not_configured(): void
    {
        config(['admin.username' => null, 'admin.password' => null]);

        $this->get(route('login'))
            ->assertOk()
            ->assertSee('Admin access is not configured')
            ->assertSee('php artisan admin:sync');
    }

    public function test_configured_admin_can_sign_in(): void
    {
        config(['admin.username' => 'admin@example.com', 'admin.password' => 'private-password']);
        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('private-password'),
        ]);

        $this->post(route('login.attempt'), [
            'username' => 'admin@example.com',
            'password' => 'private-password',
        ])->assertRedirectToRoute('admin.dashboard');

        $this->assertAuthenticatedAs($admin);
    }

    public function test_non_admin_account_cannot_sign_in(): void
    {
        config(['admin.username' => 'admin@example.com', 'admin.password' => 'private-password']);
        User::factory()->create([
            'email' => 'someone-else@example.com',
            'password' => Hash::make('private-password'),
        ]);

        $this->from(route('login'))
            ->post(route('login.attempt'), [
                'username' => 'someone-else@example.com',
                'password' => 'private-password',
            ])
            ->assertRedirectBackWithErrors('username');

        $this->assertGuest();
    }

    public function test_sign_in_returns_service_unavailable_until_admin_is_configured(): void
    {
        config(['admin.username' => null, 'admin.password' => null]);

        $this->post(route('login.attempt'), [
            'username' => 'admin@example.com',
            'password' => 'private-password',
        ])
            ->assertServiceUnavailable()
            ->assertSee('Admin sign-in is unavailable');
    }

    public function test_guest_is_redirected_to_login_from_admin_dashboard(): void
    {
        $this->get(route('admin.dashboard'))
            ->assertRedirectToRoute('login');
    }

    public function test_authenticated_admin_can_sign_out(): void
    {
        config(['admin.username' => 'admin@example.com', 'admin.password' => 'private-password']);
        $admin = User::factory()->create(['email' => 'admin@example.com']);

        $this->actingAs($admin)
            ->post(route('logout'))
            ->assertRedirectToRoute('login');

        $this->assertGuest();
    }

    public function test_login_is_rate_limited_after_five_attempts(): void
    {
        config(['admin.username' => 'admin@example.com', 'admin.password' => 'private-password']);

        foreach (range(1, 5) as $attempt) {
            $this->post(route('login.attempt'), [
                'username' => 'admin@example.com',
                'password' => 'incorrect',
            ])->assertRedirectBack();
        }

        $this->post(route('login.attempt'), [
            'username' => 'admin@example.com',
            'password' => 'incorrect',
        ])->assertTooManyRequests();
    }
}
