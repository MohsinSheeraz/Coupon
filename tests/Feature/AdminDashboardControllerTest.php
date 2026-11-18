<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Store;
use App\Models\User;
use App\Models\VisitorPresence;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_shows_offer_statistics_and_recent_records(): void
    {
        config(['admin.username' => 'admin@example.com']);
        $admin = User::factory()->create(['email' => 'admin@example.com']);
        $category = Category::query()->create(['name' => 'Electronics', 'key' => 'electronics']);
        $store = Store::query()->create(['name' => 'Popular Store', 'slug' => 'popular-store']);
        $store->categories()->attach($category);
        Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'code',
            'title' => 'A recent coupon',
            'used_count' => 4,
        ]);
        Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'deal',
            'title' => 'A recent deal',
            'used_count' => 2,
        ]);
        Store::query()->create(['name' => 'Another Store', 'slug' => 'another-store']);

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertViewHas('stats', [
                'allItems' => 2,
                'stores' => 2,
                'coupons' => 1,
                'deals' => 1,
                'usage' => 6,
                'activeUsers' => 0,
            ])
            ->assertSee('A recent coupon')
            ->assertSee('Popular Store')
            ->assertSee('Electronics')
            ->assertDontSee('A recent deal')
            ->assertDontSee('<button type="button" data-admin-back', false);
    }

    public function test_admin_presence_endpoint_returns_the_active_visitor_count(): void
    {
        config(['admin.username' => 'admin@example.com']);
        $admin = User::factory()->create(['email' => 'admin@example.com']);
        VisitorPresence::query()->create([
            'visitor_id' => '123e4567-e89b-12d3-a456-426614174000',
            'last_seen_at' => now(),
        ]);

        $this->actingAs($admin)
            ->getJson(route('admin.presence'))
            ->assertOk()
            ->assertJson(['count' => 1])
            ->assertHeaderContains('Cache-Control', 'no-store');
    }

    public function test_authenticated_non_admin_is_forbidden_from_dashboard(): void
    {
        config(['admin.username' => 'admin@example.com']);
        $user = User::factory()->create(['email' => 'someone-else@example.com']);

        $this->actingAs($user)
            ->get(route('admin.dashboard'))
            ->assertForbidden();

        $this->assertGuest();
    }
}
