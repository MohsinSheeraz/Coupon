<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminStoreControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login_from_store_management(): void
    {
        $this->get(route('admin.stores.index'))
            ->assertRedirectToRoute('login');
    }

    public function test_non_admin_cannot_manage_stores(): void
    {
        config(['admin.username' => 'admin@example.com']);
        $user = User::factory()->create(['email' => 'user@example.com']);

        $this->actingAs($user)
            ->get(route('admin.stores.index'))
            ->assertForbidden();

        $this->assertGuest();
    }

    public function test_store_listing_shows_relationship_counts_and_categories(): void
    {
        $this->signInAsAdmin();
        $category = Category::query()->create(['name' => 'Electronics', 'key' => 'electronics']);
        $store = Store::query()->create(['name' => 'Example Store', 'slug' => 'example-store']);
        $store->categories()->attach($category);
        Coupon::query()->create(['store_id' => $store->id, 'type' => 'code', 'title' => 'Coupon']);
        Coupon::query()->create(['store_id' => $store->id, 'type' => 'deal', 'title' => 'Deal']);

        $this->get(route('admin.stores.index'))
            ->assertOk()
            ->assertSee('Example Store')
            ->assertSee('Electronics')
            ->assertSee('Add Store')
            ->assertSee('Coupons')
            ->assertSee('Deals');
    }

    public function test_store_listing_paginates_ten_records_per_page(): void
    {
        $this->signInAsAdmin();

        foreach (range(1, 26) as $number) {
            Store::query()->create([
                'name' => 'Paged Store '.str_pad((string) $number, 2, '0', STR_PAD_LEFT),
                'slug' => 'paged-store-'.$number,
            ]);
        }

        $this->get(route('admin.stores.index', ['page' => 2]))
            ->assertOk()
            ->assertSee('Paged Store 11')
            ->assertDontSee('Paged Store 10')
            ->assertDontSee('Paged Store 01')
            ->assertSee('admin-stores-top-page-select')
            ->assertDontSee('admin-stores-bottom-page-select')
            ->assertSee('role="option"', false);
    }

    public function test_store_creation_persists_attributes_and_category_relationships(): void
    {
        $this->signInAsAdmin();
        $category = Category::query()->create(['name' => 'Fashion', 'key' => 'fashion']);

        $this->post(route('admin.stores.store'), [
            'name' => 'New Store',
            'slug' => 'new-store',
            'website' => 'https://store.example',
            'affiliate_link' => 'https://store.example/?ref=partner',
            'logo_url' => 'https://store.example/logo.png',
            'category_ids' => [$category->id],
        ])
            ->assertRedirectToRoute('admin.stores.index')
            ->assertSessionHas('status', 'Store New Store created successfully.');

        $store = Store::query()->where('slug', 'new-store')->firstOrFail();
        $this->assertDatabaseHas('stores', [
            'id' => $store->id,
            'name' => 'New Store',
            'logo' => 'https://store.example/logo.png',
        ]);
        $this->assertDatabaseHas('category_store', [
            'store_id' => $store->id,
            'category_id' => $category->id,
        ]);
    }

    public function test_store_logo_upload_is_saved_to_public_storage(): void
    {
        $this->signInAsAdmin();
        Storage::fake('public');

        $this->post(route('admin.stores.store'), [
            'name' => 'Logo Store',
            'slug' => 'logo-store',
            'logo' => UploadedFile::fake()->image('logo.png'),
        ])->assertRedirectToRoute('admin.stores.index');

        $store = Store::query()->where('slug', 'logo-store')->firstOrFail();
        $logoPath = str_replace('/storage/', '', (string) parse_url($store->logo, PHP_URL_PATH));

        Storage::disk('public')->assertExists($logoPath);
    }

    public function test_store_logo_upload_rejects_non_image_files(): void
    {
        $this->signInAsAdmin();

        $this->from(route('admin.stores.create'))
            ->post(route('admin.stores.store'), [
                'name' => 'Invalid Logo Store',
                'slug' => 'invalid-logo-store',
                'logo' => UploadedFile::fake()->createWithContent('payload.txt', '<script>alert(1)</script>'),
            ])
            ->assertRedirectToRoute('admin.stores.create')
            ->assertSessionHasErrors('logo');

        $this->assertDatabaseMissing('stores', ['slug' => 'invalid-logo-store']);
    }

    public function test_store_update_replaces_categories_and_preserves_existing_logo_when_unchanged(): void
    {
        $this->signInAsAdmin();
        $oldCategory = Category::query()->create(['name' => 'Old Category', 'key' => 'old-category']);
        $newCategory = Category::query()->create(['name' => 'New Category', 'key' => 'new-category']);
        $store = Store::query()->create([
            'name' => 'Old Name',
            'slug' => 'old-name',
            'logo' => 'https://store.example/logo.png',
        ]);
        $store->categories()->attach($oldCategory);

        $this->put(route('admin.stores.update', $store), [
            'name' => 'Updated Name',
            'slug' => 'updated-name',
            'category_ids' => [$newCategory->id],
            'logo_url' => '',
        ])
            ->assertRedirectToRoute('admin.stores.index')
            ->assertSessionHas('status', 'Store Updated Name updated successfully.');

        $store->refresh();
        $this->assertSame('Updated Name', $store->name);
        $this->assertSame('https://store.example/logo.png', $store->logo);
        $this->assertDatabaseMissing('category_store', [
            'store_id' => $store->id,
            'category_id' => $oldCategory->id,
        ]);
        $this->assertDatabaseHas('category_store', [
            'store_id' => $store->id,
            'category_id' => $newCategory->id,
        ]);
    }

    public function test_store_update_can_remove_an_existing_logo(): void
    {
        $this->signInAsAdmin();
        $store = Store::query()->create([
            'name' => 'Logo Store',
            'slug' => 'logo-store',
            'logo' => 'https://store.example/logo.png',
        ]);

        $this->put(route('admin.stores.update', $store), [
            'name' => 'Logo Store',
            'slug' => 'logo-store',
            'logo_url' => 'https://store.example/logo.png',
            'remove_logo' => '1',
        ])->assertRedirectToRoute('admin.stores.index');

        $this->assertDatabaseHas('stores', ['id' => $store->id, 'logo' => null]);
    }

    public function test_store_deletion_also_deletes_its_offers_and_category_links(): void
    {
        $this->signInAsAdmin();
        $category = Category::query()->create(['name' => 'Travel', 'key' => 'travel']);
        $store = Store::query()->create(['name' => 'Delete Store', 'slug' => 'delete-store']);
        $store->categories()->attach($category);
        $coupon = Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'code',
            'title' => 'Related Coupon',
        ]);

        $this->delete(route('admin.stores.destroy', $store))
            ->assertRedirectToRoute('admin.stores.index')
            ->assertSessionHas('status', 'Store Delete Store and its offers were deleted.');

        $this->assertDatabaseMissing('stores', ['id' => $store->id]);
        $this->assertDatabaseMissing('coupons', ['id' => $coupon->id]);
        $this->assertDatabaseMissing('category_store', [
            'store_id' => $store->id,
            'category_id' => $category->id,
        ]);
    }

    public function test_store_creation_rejects_a_duplicate_slug_and_invalid_category(): void
    {
        $this->signInAsAdmin();
        Store::query()->create(['name' => 'Existing Store', 'slug' => 'taken-slug']);

        $this->from(route('admin.stores.create'))
            ->post(route('admin.stores.store'), [
                'name' => 'Another Store',
                'slug' => 'taken-slug',
                'category_ids' => [999],
            ])
            ->assertRedirectToRoute('admin.stores.create')
            ->assertSessionHasErrors(['slug', 'category_ids.0']);

        $this->assertDatabaseCount('stores', 1);
    }

    private function signInAsAdmin(): User
    {
        config(['admin.username' => 'admin@example.com']);
        $admin = User::factory()->create(['email' => 'admin@example.com']);
        $this->actingAs($admin);

        return $admin;
    }
}
