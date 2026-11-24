<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminOfferControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login_from_offer_management(): void
    {
        $this->get(route('admin.coupons.index'))
            ->assertRedirectToRoute('login');
    }

    public function test_non_admin_cannot_manage_deals(): void
    {
        config(['admin.username' => 'admin@example.com']);
        $user = User::factory()->create(['email' => 'user@example.com']);

        $this->actingAs($user)
            ->get(route('admin.deals.index'))
            ->assertForbidden();

        $this->assertGuest();
    }

    public function test_coupon_listing_shows_coupon_records_only(): void
    {
        $this->signInAsAdmin();
        $store = Store::query()->create(['name' => 'Example Store', 'slug' => 'example-store']);
        Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'code',
            'title' => 'Coupon offer',
            'code' => 'SAVE20',
        ]);
        Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'deal',
            'title' => 'Deal offer',
        ]);

        $this->get(route('admin.coupons.index'))
            ->assertOk()
            ->assertSee('Coupon offer')
            ->assertSee('SAVE20')
            ->assertDontSee('Deal offer')
            ->assertSee('admin-table-viewport', false)
            ->assertSee('Coupon code')
            ->assertSee('data-admin-back', false)
            ->assertSee('data-dashboard-url="'.route('admin.dashboard').'"', false)
            ->assertSee('data-sidebar-collapse-icon', false)
            ->assertSee('data-sidebar-expand-icon', false)
            ->assertSee('js/site.js', false);
    }

    public function test_coupon_listing_searches_title_code_and_store_without_including_deals(): void
    {
        $this->signInAsAdmin();
        $store = Store::query()->create(['name' => 'Example Store', 'slug' => 'example-store']);
        Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'code',
            'title' => 'Spring Savings',
            'code' => 'SPRING25',
        ]);
        Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'code',
            'title' => 'Winter Savings',
            'code' => 'WINTER25',
        ]);
        Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'deal',
            'title' => 'Spring Deal',
        ]);

        $this->get(route('admin.coupons.index', ['search' => 'SPRING25']))
            ->assertOk()
            ->assertSee('Spring Savings')
            ->assertDontSee('Winter Savings')
            ->assertDontSee('Spring Deal');
    }

    public function test_deal_listing_searches_the_assigned_store_name(): void
    {
        $this->signInAsAdmin();
        $matchingStore = Store::query()->create(['name' => 'Mountain Outfitters', 'slug' => 'mountain-outfitters']);
        $otherStore = Store::query()->create(['name' => 'City Books', 'slug' => 'city-books']);
        Coupon::query()->create([
            'store_id' => $matchingStore->id,
            'type' => 'deal',
            'title' => 'Weekend Sale',
        ]);
        Coupon::query()->create([
            'store_id' => $otherStore->id,
            'type' => 'deal',
            'title' => 'Clearance',
        ]);

        $this->get(route('admin.deals.index', ['search' => 'Mountain']))
            ->assertOk()
            ->assertSee('Weekend Sale')
            ->assertDontSee('Clearance');
    }

    public function test_coupon_listing_paginates_ten_records_per_page(): void
    {
        $this->signInAsAdmin();
        $store = Store::query()->create(['name' => 'Paged Store', 'slug' => 'paged-store']);

        foreach (range(1, 26) as $number) {
            Coupon::query()->create([
                'store_id' => $store->id,
                'type' => 'code',
                'title' => 'Paged Coupon '.str_pad((string) $number, 2, '0', STR_PAD_LEFT),
                'code' => 'PAGE'.$number,
            ]);
        }

        $response = $this->get(route('admin.coupons.index', ['page' => 2]));

        $response->assertOk()
            ->assertSee('Paged Coupon 16')
            ->assertDontSee('Paged Coupon 17')
            ->assertDontSee('Paged Coupon 06')
            ->assertSee('admin-coupons-top-page-select')
            ->assertDontSee('admin-coupons-bottom-page-select')
            ->assertSee('role="option"', false);
    }

    public function test_coupon_pagination_shows_at_most_five_numbered_page_links(): void
    {
        $this->signInAsAdmin();
        $store = Store::query()->create(['name' => 'Paged Store', 'slug' => 'paged-store']);

        foreach (range(1, 76) as $number) {
            Coupon::query()->create([
                'store_id' => $store->id,
                'type' => 'code',
                'title' => 'Paged Coupon '.$number,
                'code' => 'PAGE'.$number,
            ]);
        }

        $response = $this->get(route('admin.coupons.index', ['page' => 4]));

        $response->assertOk();

        $this->assertSame(5, substr_count($response->getContent(), 'aria-current="'));
    }

    public function test_deal_listing_paginates_ten_records_per_page(): void
    {
        $this->signInAsAdmin();
        $store = Store::query()->create(['name' => 'Paged Store', 'slug' => 'paged-store']);

        foreach (range(1, 26) as $number) {
            Coupon::query()->create([
                'store_id' => $store->id,
                'type' => 'deal',
                'title' => 'Paged Deal '.str_pad((string) $number, 2, '0', STR_PAD_LEFT),
            ]);
        }

        $this->get(route('admin.deals.index', ['page' => 2]))
            ->assertOk()
            ->assertSee('Paged Deal 16')
            ->assertDontSee('Paged Deal 17')
            ->assertDontSee('Paged Deal 06')
            ->assertSee('admin-table-viewport', false)
            ->assertSee('Expiry date')
            ->assertDontSee('Coupon code')
            ->assertSee('admin-deals-top-page-select')
            ->assertDontSee('admin-deals-bottom-page-select')
            ->assertSee('role="option"', false);
    }

    public function test_coupon_creation_persists_coupon_fields_and_initial_usage_count(): void
    {
        $this->signInAsAdmin();
        $store = Store::query()->create(['name' => 'New Store', 'slug' => 'new-store']);

        $this->post(route('admin.coupons.store'), [
            'title' => '20% off',
            'store_id' => $store->id,
            'code' => 'WELCOME20',
            'affiliate_link' => 'https://store.example/coupon?ref=partner',
            'expiry_date' => '2027-12-31',
            'description' => 'Save on your first order.',
            'logo_url' => 'https://store.example/coupon.png',
        ])
            ->assertRedirectToRoute('admin.coupons.index')
            ->assertSessionHas('status', 'Coupon 20% off created successfully.');

        $this->assertDatabaseHas('coupons', [
            'store_id' => $store->id,
            'type' => 'code',
            'title' => '20% off',
            'code' => 'WELCOME20',
            'expiry_date' => '2027-12-31',
            'used_count' => 0,
            'logo' => 'https://store.example/coupon.png',
        ]);
    }

    public function test_deal_creation_persists_a_deal_without_a_coupon_code(): void
    {
        $this->signInAsAdmin();
        $store = Store::query()->create(['name' => 'Deal Store', 'slug' => 'deal-store']);

        $this->post(route('admin.deals.store'), [
            'title' => 'Clearance deal',
            'store_id' => $store->id,
            'affiliate_link' => 'https://store.example/deal',
            'expiry_date' => '2027-11-30',
            'logo_url' => 'https://store.example/deal.png',
        ])
            ->assertRedirectToRoute('admin.deals.index')
            ->assertSessionHas('status', 'Deal Clearance deal created successfully.');

        $this->assertDatabaseHas('coupons', [
            'store_id' => $store->id,
            'type' => 'deal',
            'title' => 'Clearance deal',
            'code' => null,
            'used_count' => 0,
            'logo' => 'https://store.example/deal.png',
        ]);
    }

    public function test_offer_update_preserves_usage_count_and_unchanged_logo(): void
    {
        $this->signInAsAdmin();
        $store = Store::query()->create(['name' => 'Original Store', 'slug' => 'original-store']);
        $newStore = Store::query()->create(['name' => 'Replacement Store', 'slug' => 'replacement-store']);
        $coupon = Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'code',
            'title' => 'Original title',
            'code' => 'OLD',
            'affiliate_link' => 'https://store.example/old',
            'expiry_date' => '2027-01-31',
            'used_count' => 12,
            'logo' => 'https://store.example/original.png',
        ]);

        $this->put(route('admin.coupons.update', $coupon), [
            'title' => 'Updated title',
            'store_id' => $newStore->id,
            'code' => 'NEW',
            'affiliate_link' => 'https://store.example/new',
            'expiry_date' => '2027-12-31',
            'description' => 'Updated description',
        ])
            ->assertRedirectToRoute('admin.coupons.index')
            ->assertSessionHas('status', 'Coupon Updated title updated successfully.');

        $this->assertDatabaseHas('coupons', [
            'id' => $coupon->id,
            'store_id' => $newStore->id,
            'title' => 'Updated title',
            'code' => 'NEW',
            'used_count' => 12,
            'logo' => 'https://store.example/original.png',
        ]);
    }

    public function test_offer_logo_upload_is_saved_to_public_storage(): void
    {
        $this->signInAsAdmin();
        Storage::fake('public');
        $store = Store::query()->create(['name' => 'Image Store', 'slug' => 'image-store']);

        $this->post(route('admin.deals.store'), [
            'title' => 'Image deal',
            'store_id' => $store->id,
            'affiliate_link' => 'https://store.example/deal',
            'expiry_date' => '2027-05-01',
            'logo_upload' => UploadedFile::fake()->image('deal.png'),
        ])->assertRedirectToRoute('admin.deals.index');

        $offer = Coupon::query()->where('title', 'Image deal')->firstOrFail();
        $logoPath = str_replace('/storage/', '', (string) parse_url($offer->logo, PHP_URL_PATH));
        Storage::disk('public')->assertExists($logoPath);
    }

    public function test_coupon_creation_rejects_missing_fields_and_invalid_store(): void
    {
        $this->signInAsAdmin();

        $this->from(route('admin.coupons.create'))
            ->post(route('admin.coupons.store'), [
                'title' => '',
                'store_id' => 999,
                'code' => '',
                'affiliate_link' => 'javascript:alert(1)',
                'expiry_date' => 'not-a-date',
            ])
            ->assertRedirectToRoute('admin.coupons.create')
            ->assertSessionHasErrors(['title', 'store_id', 'code', 'affiliate_link', 'expiry_date']);

        $this->assertDatabaseCount('coupons', 0);
    }

    public function test_deal_creation_rejects_a_coupon_code(): void
    {
        $this->signInAsAdmin();
        $store = Store::query()->create(['name' => 'No Code Store', 'slug' => 'no-code-store']);

        $this->from(route('admin.deals.create'))
            ->post(route('admin.deals.store'), [
                'title' => 'Invalid deal',
                'store_id' => $store->id,
                'code' => 'NOT-ALLOWED',
                'affiliate_link' => 'https://store.example/deal',
                'expiry_date' => '2027-05-01',
            ])
            ->assertRedirectToRoute('admin.deals.create')
            ->assertSessionHasErrors('code');

        $this->assertDatabaseCount('coupons', 0);
    }

    public function test_coupon_routes_do_not_edit_deal_records(): void
    {
        $this->signInAsAdmin();
        $store = Store::query()->create(['name' => 'Deal Store', 'slug' => 'deal-store']);
        $deal = Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'deal',
            'title' => 'A deal',
        ]);

        $this->get(route('admin.coupons.edit', $deal))
            ->assertNotFound();

        $this->assertModelExists($deal);
    }

    public function test_offer_deletion_removes_the_record(): void
    {
        $this->signInAsAdmin();
        $store = Store::query()->create(['name' => 'Delete Store', 'slug' => 'delete-store']);
        $deal = Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'deal',
            'title' => 'Delete deal',
        ]);

        $this->delete(route('admin.deals.destroy', $deal))
            ->assertRedirectToRoute('admin.deals.index')
            ->assertSessionHas('status', 'Deal Delete deal deleted.');

        $this->assertDatabaseMissing('coupons', ['id' => $deal->id]);
    }

    private function signInAsAdmin(): User
    {
        config(['admin.username' => 'admin@example.com']);
        $admin = User::factory()->create(['email' => 'admin@example.com']);
        $this->actingAs($admin);

        return $admin;
    }
}
