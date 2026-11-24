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
        $this->travelTo('2026-11-20 12:00:00');
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
        Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'code',
            'title' => 'Expired coupon for this store',
            'expiry_date' => '2026-11-19',
        ]);
        Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'deal',
            'title' => 'Expired deal for this store',
            'expiry_date' => '2026-11-19',
        ]);

        $this->get(route('stores.show', $store))
            ->assertOk()
            ->assertSee('Example Store')
            ->assertSee('Coupon for this store')
            ->assertSee('Deal for this store')
            ->assertDontSee('Expired coupon for this store')
            ->assertDontSee('Expired deal for this store')
            ->assertSee('store-coupons-panel')
            ->assertSee('store-deals-panel');
    }

    public function test_store_page_uses_host_relative_urls_for_uploaded_logos(): void
    {
        $store = Store::query()->create([
            'name' => 'Example Store',
            'slug' => 'example-store',
            'logo' => 'http://localhost/storage/store-logos/example.png',
        ]);

        $this->get(route('stores.show', $store))
            ->assertOk()
            ->assertSee('src="/storage/store-logos/example.png"', false);
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

    public function test_store_page_opens_coupons_tab_when_store_has_only_coupons(): void
    {
        $store = Store::query()->create(['name' => 'Coupon Only Store', 'slug' => 'coupon-only-store']);
        Coupon::query()->create(['store_id' => $store->id, 'type' => 'code', 'title' => 'Save 10%', 'code' => 'SAVE10']);

        $response = $this->get(route('stores.show', $store))
            ->assertOk()
            ->assertSee('No Coupon Only Store deals right now. Open the Coupons tab for 1 code.');

        $this->assertMatchesRegularExpression(
            '/id="store-coupons-tab" aria-controls="store-coupons-panel"\s+aria-selected="true"/',
            $response->getContent(),
        );
    }

    public function test_store_page_has_unique_seo_tags(): void
    {
        $this->travelTo('2026-11-20 12:00:00');
        $store = Store::query()->create([
            'name' => 'Example & Co',
            'slug' => 'example-co',
            'website' => 'https://www.example.com',
            'logo' => '/storage/store-logos/example.png',
        ]);
        Coupon::query()->create(['store_id' => $store->id, 'type' => 'code', 'title' => 'Save 20% Sitewide', 'code' => 'SAVE20']);

        $this->get(route('stores.show', $store).'?tab=deals&coupons_page=2')
            ->assertOk()
            ->assertSee('<title>Example &amp; Co Coupons &amp; Promo Codes (November 2026) | DealzyCoup</title>', false)
            ->assertSee('<meta name="description" content="Example &amp; Co coupon codes and deals for November 2026: 1 code and 0 deals. Top offer: Save 20% Sitewide.">', false)
            ->assertSee('<link rel="canonical" href="'.route('stores.show', $store).'">', false)
            ->assertSee('<meta property="og:image" content="'.url('/storage/store-logos/example.png').'">', false)
            ->assertSee('<meta name="robots" content="index, follow">', false)
            ->assertSee('About Example &amp; Co coupons', false)
            ->assertSee('at example.com');
    }

    public function test_store_page_falls_back_to_site_logo_for_inline_store_logos(): void
    {
        $store = Store::query()->create([
            'name' => 'Inline Logo Store',
            'slug' => 'inline-logo-store',
            'logo' => 'data:image/png;base64,iVBORw0KGgo=',
        ]);

        $this->get(route('stores.show', $store))
            ->assertOk()
            ->assertSee('<meta property="og:image" content="'.asset('LogoMain.png').'">', false);
    }

    public function test_store_page_without_offers_is_not_indexed(): void
    {
        $store = Store::query()->create(['name' => 'Empty Store', 'slug' => 'empty-store']);

        $this->get(route('stores.show', $store))
            ->assertOk()
            ->assertSee('<meta name="robots" content="noindex, follow">', false);
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
