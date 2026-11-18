<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Store;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicListingControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_coupon_listing_paginates_codes_and_can_show_all_codes(): void
    {
        $store = Store::query()->create(['name' => 'Example Store', 'slug' => 'example-store']);

        foreach (range(1, 17) as $number) {
            $coupon = Coupon::query()->create([
                'store_id' => $store->id,
                'type' => 'code',
                'title' => 'Coupon '.str_pad((string) $number, 2, '0', STR_PAD_LEFT),
                'code' => 'CODE'.$number,
            ]);
            $coupon->forceFill([
                'created_at' => now()->addSeconds($number),
                'updated_at' => now()->addSeconds($number),
            ])->save();
        }

        Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'deal',
            'title' => 'A special deal',
        ]);

        $this->get(route('coupons.index'))
            ->assertOk()
            ->assertSee('Coupon 17')
            ->assertSee('<span>Coupons</span>', false)
            ->assertSee('listing-hero-art', false)
            ->assertSee('aria-label="Current page 1. Choose page"', false)
            ->assertSee('role="listbox"', false)
            ->assertSee('role="option"', false)
            ->assertDontSee('Page 1')
            ->assertDontSee('Coupon 01')
            ->assertDontSee('A special deal');

        $this->get(route('coupons.index', ['view' => 'all']))
            ->assertOk()
            ->assertSee('Coupon 01')
            ->assertSee('Coupon 17')
            ->assertDontSee('A special deal');
    }

    public function test_store_listing_filters_using_normalized_category_name(): void
    {
        $category = Category::query()->create(['name' => 'Fashion', 'key' => 'fashion']);
        $fashionStore = Store::query()->create(['name' => 'Fashion Shop', 'slug' => 'fashion-shop']);
        $otherStore = Store::query()->create(['name' => 'Home Store', 'slug' => 'home-store']);
        $fashionStore->categories()->attach($category);

        $this->get(route('stores.index', ['category' => 'Fashions']))
            ->assertOk()
            ->assertSee('<span>Stores</span>', false)
            ->assertSee('Fashion Shop')
            ->assertDontSee('Home Store');

        $this->get(route('stores.index', ['category' => '---']))
            ->assertOk()
            ->assertSee('Fashion Shop')
            ->assertSee('Home Store');
    }

    public function test_search_finds_stores_by_category_and_offers_by_title(): void
    {
        $category = Category::query()->create(['name' => 'Outdoor', 'key' => 'outdoor']);
        $store = Store::query()->create(['name' => 'Trail Shop', 'slug' => 'trail-shop']);
        $store->categories()->attach($category);
        Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'code',
            'title' => 'Outdoor gear discount',
        ]);

        $this->get(route('search', ['q' => 'Outdoor']))
            ->assertOk()
            ->assertSee('Trail Shop')
            ->assertSee('Outdoor gear discount');
    }
}
