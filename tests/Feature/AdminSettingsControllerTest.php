<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSettingsControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login_from_settings(): void
    {
        $this->get(route('admin.settings.edit'))
            ->assertRedirectToRoute('login');
    }

    public function test_non_admin_cannot_update_settings(): void
    {
        config(['admin.username' => 'admin@example.com']);
        $user = User::factory()->create(['email' => 'user@example.com']);

        $this->actingAs($user)
            ->get(route('admin.settings.edit'))
            ->assertForbidden();

        $this->assertGuest();
    }

    public function test_settings_page_shows_sections_and_creates_default_settings(): void
    {
        $this->signInAsAdmin();

        $this->get(route('admin.settings.edit'))
            ->assertOk()
            ->assertSee('General Settings')
            ->assertSee('Social Media Links')
            ->assertSee('SEO Settings')
            ->assertSee('Save Settings')
            ->assertSee(route('admin.settings.update'));

        $this->assertDatabaseCount('settings', 1);
    }

    public function test_admin_can_update_general_social_and_seo_settings(): void
    {
        $this->signInAsAdmin();
        $settings = Setting::query()->create([
            'site_name' => 'Old Site',
            'site_description' => 'Old description',
            'contact_email' => 'old@example.com',
            'social_links' => ['facebook' => 'https://facebook.com/old'],
            'meta_tags' => ['title' => 'Old title', 'description' => 'Old SEO', 'keywords' => 'old'],
        ]);

        $this->put(route('admin.settings.update'), [
            'site_name' => 'Updated Site',
            'site_description' => 'A new site description.',
            'contact_email' => 'hello@example.com',
            'social_links' => [
                'facebook' => 'https://facebook.com/updated',
                'twitter' => '',
                'instagram' => 'https://instagram.com/updated',
                'pinterest' => '',
            ],
            'meta_tags' => [
                'title' => 'Updated title',
                'description' => 'Updated SEO description.',
                'keywords' => 'coupons, savings, offers',
            ],
        ])
            ->assertRedirectToRoute('admin.settings.edit')
            ->assertSessionHas('status', 'Settings updated successfully.');

        $settings->refresh();
        $this->assertSame('Updated Site', $settings->site_name);
        $this->assertSame('hello@example.com', $settings->contact_email);
        $this->assertSame([
            'facebook' => 'https://facebook.com/updated',
            'twitter' => null,
            'instagram' => 'https://instagram.com/updated',
            'pinterest' => null,
        ], $settings->social_links);
        $this->assertSame([
            'title' => 'Updated title',
            'description' => 'Updated SEO description.',
            'keywords' => 'coupons, savings, offers',
        ], $settings->meta_tags);
    }

    public function test_settings_update_rejects_invalid_email_and_social_urls(): void
    {
        $this->signInAsAdmin();
        $settings = Setting::current();
        $originalName = $settings->site_name;

        $this->from(route('admin.settings.edit'))
            ->put(route('admin.settings.update'), [
                'site_name' => 'Changed Site',
                'site_description' => 'A valid description.',
                'contact_email' => 'not-an-email',
                'social_links' => [
                    'facebook' => 'javascript:alert(1)',
                    'twitter' => '',
                    'instagram' => '',
                    'pinterest' => '',
                ],
                'meta_tags' => [
                    'title' => 'Valid title',
                    'description' => 'Valid SEO description.',
                    'keywords' => 'coupons, deals',
                ],
                'active_tab' => 'social',
            ])
            ->assertRedirectToRoute('admin.settings.edit')
            ->assertSessionHasErrors(['contact_email', 'social_links.facebook']);

        $this->assertDatabaseHas('settings', [
            'id' => $settings->id,
            'site_name' => $originalName,
        ]);
    }

    private function signInAsAdmin(): User
    {
        config(['admin.username' => 'admin@example.com']);
        $admin = User::factory()->create(['email' => 'admin@example.com']);
        $this->actingAs($admin);

        return $admin;
    }
}
