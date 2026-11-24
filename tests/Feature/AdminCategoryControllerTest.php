<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminCategoryControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login_from_category_management(): void
    {
        $this->get(route('admin.categories.index'))
            ->assertRedirectToRoute('login');
    }

    public function test_non_admin_cannot_manage_categories(): void
    {
        config(['admin.username' => 'admin@example.com']);
        $user = User::factory()->create(['email' => 'user@example.com']);

        $this->actingAs($user)
            ->get(route('admin.categories.index'))
            ->assertForbidden();

        $this->assertGuest();
    }

    public function test_category_listing_shows_status_and_store_assignments(): void
    {
        $this->signInAsAdmin();
        $category = Category::query()->create([
            'name' => 'Electronics',
            'key' => 'electronics',
            'image' => 'https://example.test/electronics.jpg',
        ]);
        $store = Store::query()->create(['name' => 'Example Store', 'slug' => 'example-store']);
        $category->stores()->attach($store);

        $this->get(route('admin.categories.index'))
            ->assertOk()
            ->assertSee('Electronics')
            ->assertSee('Example Store')
            ->assertSee('active')
            ->assertSee('1 store')
            ->assertSee('admin-table-viewport', false)
            ->assertSee('Assigned stores');
    }

    public function test_category_listing_searches_category_and_assigned_store_names(): void
    {
        $this->signInAsAdmin();
        $category = Category::query()->create(['name' => 'Travel', 'key' => 'travel']);
        $category->stores()->attach(
            Store::query()->create(['name' => 'Northstar Travel', 'slug' => 'northstar-travel'])
        );
        Category::query()->create(['name' => 'Electronics', 'key' => 'electronics']);

        $this->get(route('admin.categories.index', ['search' => 'Northstar']))
            ->assertOk()
            ->assertSee('Travel')
            ->assertDontSee('Electronics')
            ->assertSee('name="search"', false);
    }

    public function test_category_listing_paginates_ten_records_per_page(): void
    {
        $this->signInAsAdmin();

        foreach (range(1, 11) as $number) {
            $name = 'Paged Category '.str_pad((string) $number, 2, '0', STR_PAD_LEFT);
            Category::query()->create([
                'name' => $name,
                'key' => 'paged-category-'.$number,
            ]);
        }

        $this->get(route('admin.categories.index', ['page' => 2]))
            ->assertOk()
            ->assertSee('11 total')
            ->assertSee('Paged Category 11')
            ->assertDontSee('Paged Category 10')
            ->assertDontSee('Paged Category 01')
            ->assertSee('admin-categories-top-page-select')
            ->assertDontSee('admin-categories-bottom-page-select')
            ->assertSee('role="option"', false);
    }

    public function test_category_creation_persists_image_and_store_assignments(): void
    {
        $this->signInAsAdmin();
        $store = Store::query()->create(['name' => 'Outdoor Store', 'slug' => 'outdoor-store']);

        $this->post(route('admin.categories.store'), [
            'name' => 'Outdoor',
            'image_url' => 'https://example.test/outdoor.jpg',
            'store_ids' => [$store->id],
        ])
            ->assertRedirectToRoute('admin.categories.index')
            ->assertSessionHas('status', 'Category Outdoor created successfully.');

        $category = Category::query()->where('key', 'outdoor')->firstOrFail();
        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Outdoor',
            'image' => 'https://example.test/outdoor.jpg',
            'status' => 'active',
        ]);
        $this->assertDatabaseHas('category_store', [
            'category_id' => $category->id,
            'store_id' => $store->id,
        ]);
    }

    public function test_category_image_upload_is_saved_to_public_storage(): void
    {
        $this->signInAsAdmin();
        Storage::fake('public');

        $this->post(route('admin.categories.store'), [
            'name' => 'Home Decor',
            'image_upload' => UploadedFile::fake()->image('home.png'),
        ])->assertRedirectToRoute('admin.categories.index');

        $category = Category::query()->where('key', 'homedecor')->firstOrFail();
        $imagePath = str_replace('/storage/', '', (string) parse_url($category->image, PHP_URL_PATH));

        Storage::disk('public')->assertExists($imagePath);
    }

    public function test_category_update_renames_it_and_syncs_store_assignments(): void
    {
        $this->signInAsAdmin();
        $oldStore = Store::query()->create(['name' => 'Old Store', 'slug' => 'old-store']);
        $newStore = Store::query()->create(['name' => 'New Store', 'slug' => 'new-store']);
        $category = Category::query()->create([
            'name' => 'Old Category',
            'key' => 'old-category',
            'image' => 'https://example.test/category.jpg',
        ]);
        $category->stores()->attach($oldStore);

        $this->put(route('admin.categories.update', $category), [
            'name' => 'New Category',
            'image_url' => '',
            'status' => 'archived',
            'store_ids' => [$newStore->id],
        ])
            ->assertRedirectToRoute('admin.categories.index')
            ->assertSessionHas('status', 'Category New Category updated successfully.');

        $category->refresh();
        $this->assertSame('newcategory', $category->key);
        $this->assertSame('archived', $category->status);
        $this->assertSame('https://example.test/category.jpg', $category->image);
        $this->assertDatabaseMissing('category_store', [
            'category_id' => $category->id,
            'store_id' => $oldStore->id,
        ]);
        $this->assertDatabaseHas('category_store', [
            'category_id' => $category->id,
            'store_id' => $newStore->id,
        ]);
    }

    public function test_category_status_can_be_toggled(): void
    {
        $this->signInAsAdmin();
        $category = Category::query()->create([
            'name' => 'Travel',
            'key' => 'travel',
            'image' => 'https://example.test/travel.jpg',
        ]);

        $this->patch(route('admin.categories.toggle-status', $category))
            ->assertRedirectToRoute('admin.categories.index')
            ->assertSessionHas('status', 'Category Travel is now archived.');

        $this->assertDatabaseHas('categories', ['id' => $category->id, 'status' => 'archived']);
    }

    public function test_category_delete_is_blocked_while_stores_are_assigned(): void
    {
        $this->signInAsAdmin();
        $store = Store::query()->create(['name' => 'Assigned Store', 'slug' => 'assigned-store']);
        $category = Category::query()->create([
            'name' => 'Assigned Category',
            'key' => 'assigned-category',
            'image' => 'https://example.test/category.jpg',
        ]);
        $category->stores()->attach($store);

        $this->from(route('admin.categories.index'))
            ->delete(route('admin.categories.destroy', $category))
            ->assertRedirectToRoute('admin.categories.index')
            ->assertSessionHasErrors([
                'category' => 'This category is used by stores. Archive it instead of deleting it.',
            ]);

        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_unassigned_category_can_be_deleted(): void
    {
        $this->signInAsAdmin();
        $category = Category::query()->create([
            'name' => 'Unused Category',
            'key' => 'unused-category',
            'image' => 'https://example.test/category.jpg',
        ]);

        $this->delete(route('admin.categories.destroy', $category))
            ->assertRedirectToRoute('admin.categories.index')
            ->assertSessionHas('status', 'Category Unused Category deleted.');

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_category_creation_rejects_duplicate_normalized_names_and_missing_images(): void
    {
        $this->signInAsAdmin();
        Category::query()->create([
            'name' => 'Gadget',
            'key' => 'gadget',
            'image' => 'https://example.test/gadget.jpg',
        ]);

        $this->from(route('admin.categories.create'))
            ->post(route('admin.categories.store'), ['name' => 'Gadgets'])
            ->assertRedirectToRoute('admin.categories.create')
            ->assertSessionHasErrors(['name', 'image_url']);

        $this->assertDatabaseCount('categories', 1);
    }

    private function signInAsAdmin(): User
    {
        config(['admin.username' => 'admin@example.com']);
        $admin = User::factory()->create(['email' => 'admin@example.com']);
        $this->actingAs($admin);

        return $admin;
    }
}
