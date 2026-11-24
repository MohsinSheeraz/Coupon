<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Store;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SitemapControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_sitemap_lists_main_pages_active_categories_and_stores_with_offers(): void
    {
        $this->travelTo('2026-11-20 12:00:00');
        $category = Category::query()->create(['name' => 'Home & Living', 'status' => 'active']);
        $inactiveCategory = Category::query()->create(['name' => 'Retired Category', 'status' => 'inactive']);
        $storeWithOffers = Store::query()->create(['name' => 'Live Store', 'slug' => 'live-store']);
        $storeWithOffers->categories()->attach([$category->id, $inactiveCategory->id]);
        Coupon::query()->create(['store_id' => $storeWithOffers->id, 'type' => 'code', 'title' => 'Save 10%', 'code' => 'SAVE10']);
        $expiredOnlyStore = Store::query()->create(['name' => 'Expired Store', 'slug' => 'expired-store']);
        Coupon::query()->create([
            'store_id' => $expiredOnlyStore->id,
            'type' => 'deal',
            'title' => 'Old deal',
            'expiry_date' => '2026-11-01',
        ]);
        Store::query()->create(['name' => 'Empty Store', 'slug' => 'empty-store']);

        $response = $this->get('/sitemap.xml')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8');

        $xml = simplexml_load_string($response->getContent());
        $locations = [];

        foreach ($xml->url as $url) {
            $locations[] = (string) $url->loc;
        }

        $this->assertContains(route('home'), $locations);
        $this->assertContains(route('coupons.index'), $locations);
        $this->assertContains(route('stores.index', ['category' => 'Home & Living']), $locations);
        $this->assertContains(route('stores.show', $storeWithOffers), $locations);
        $this->assertNotContains(route('stores.index', ['category' => 'Retired Category']), $locations);
        $this->assertNotContains(route('stores.show', $expiredOnlyStore), $locations);
        $this->assertNotContains(url('/stores/empty-store'), $locations);
    }
}
