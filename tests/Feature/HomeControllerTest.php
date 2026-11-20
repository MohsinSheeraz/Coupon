<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Store;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomeControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_homepage_renders_active_categories_popular_stores_and_trending_coupons(): void
    {
        $this->travelTo('2026-11-20 12:00:00');
        $store = Store::query()->create([
            'name' => 'Example Store',
            'slug' => 'example-store',
            'logo' => '/store-logo.png',
        ]);
        Category::query()->create([
            'name' => 'Fashion',
            'key' => 'fashion',
            'status' => 'active',
        ]);
        Category::query()->create([
            'name' => 'Archived',
            'key' => 'archived',
            'status' => 'archived',
        ]);
        Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'code',
            'title' => 'Save on your next order',
            'code' => 'SAVE20',
            'used_count' => 12,
        ]);
        Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'code',
            'title' => 'Expired homepage coupon',
            'expiry_date' => '2026-11-19',
            'used_count' => 100,
        ]);
        Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'deal',
            'title' => 'Expired homepage deal',
            'expiry_date' => '2026-11-19',
            'used_count' => 99,
        ]);

        $this->get('/')
            ->assertOk()
            ->assertSee('Explore your kind of find.')
            ->assertSee('Fashion')
            ->assertDontSee('Archived')
            ->assertSee('Example Store')
            ->assertSee('Save on your next order')
            ->assertDontSee('Expired homepage coupon')
            ->assertDontSee('Expired homepage deal')
            ->assertSee('SA••••');
    }
}
