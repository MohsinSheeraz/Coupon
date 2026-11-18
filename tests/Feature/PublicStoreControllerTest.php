<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Store;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicStoreControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_page_displays_coupons_and_deals_in_separate_tabs(): void
    {
        $store = Store::query()->create(['name' => 'Example Store', 'slug' => 'example-store']);
        Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'code',
            'title' => 'Coupon for this store',
            'code' => 'STORE20',
        ]);
        Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'deal',
            'title' => 'Deal for this store',
        ]);

        $this->get(route('stores.show', $store))
            ->assertOk()
            ->assertSee('Example Store')
            ->assertSee('Coupon for this store')
            ->assertSee('Deal for this store')
            ->assertSee('store-coupons-panel')
            ->assertSee('store-deals-panel');
    }

    public function test_store_coupon_tab_paginates_offers_and_keeps_coupons_selected(): void
    {
        $store = Store::query()->create(['name' => 'Paged Store', 'slug' => 'paged-store']);

        foreach (range(1, 17) as $number) {
            Coupon::query()->create([
                'store_id' => $store->id,
                'type' => 'code',
                'title' => 'Store Coupon '.str_pad((string) $number, 2, '0', STR_PAD_LEFT),
                'code' => 'STORE'.$number,
            ]);
            Coupon::query()->create([
                'store_id' => $store->id,
                'type' => 'deal',
                'title' => 'Store Deal '.str_pad((string) $number, 2, '0', STR_PAD_LEFT),
            ]);
        }

        $response = $this->get(route('stores.show', $store).'?coupons_page=2&tab=coupons')
            ->assertOk()
            ->assertSee('Store Coupon 01')
            ->assertDontSee('Store Coupon 17')
            ->assertSee('Store Deal 17')
            ->assertSee('store-coupons-page-select')
            ->assertSee('tab=coupons');

        $this->assertMatchesRegularExpression(
            '/id="store-coupons-tab" aria-controls="store-coupons-panel"\s+aria-selected="true"/',
            $response->getContent(),
        );
    }

    public function test_store_deal_tab_paginates_offers_and_keeps_deals_selected(): void
    {
        $store = Store::query()->create(['name' => 'Paged Store', 'slug' => 'paged-store']);

        foreach (range(1, 17) as $number) {
            Coupon::query()->create([
                'store_id' => $store->id,
                'type' => 'deal',
                'title' => 'Store Deal '.str_pad((string) $number, 2, '0', STR_PAD_LEFT),
            ]);
            Coupon::query()->create([
                'store_id' => $store->id,
                'type' => 'code',
                'title' => 'Store Coupon '.str_pad((string) $number, 2, '0', STR_PAD_LEFT),
                'code' => 'STORE'.$number,
            ]);
        }

        $response = $this->get(route('stores.show', $store).'?deals_page=2&tab=deals')
            ->assertOk()
            ->assertSee('Store Deal 01')
            ->assertDontSee('Store Deal 17')
            ->assertSee('Store Coupon 17')
            ->assertSee('store-deals-page-select')
            ->assertSee('tab=deals');

        $this->assertMatchesRegularExpression(
            '/id="store-deals-tab" aria-controls="store-deals-panel"\s+aria-selected="true"/',
            $response->getContent(),
        );
    }

    public function test_store_page_returns_not_found_for_unknown_slug(): void
    {
        $this->get('/stores/not-a-real-store')->assertNotFound();
    }

    public function test_opening_an_offer_increments_its_usage_count(): void
    {
        $store = Store::query()->create(['name' => 'Example Store', 'slug' => 'example-store']);
        $coupon = Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'code',
            'title' => 'Coupon for this store',
            'code' => 'STORE20',
            'used_count' => 3,
        ]);

        $this->postJson(route('coupons.increment', $coupon))
            ->assertOk()
            ->assertJson(['success' => true]);

        $this->assertSame(4, $coupon->fresh()->used_count);
    }
}
