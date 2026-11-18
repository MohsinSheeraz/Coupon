<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use App\Models\Store;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;
use RuntimeException;

class CategoryController extends Controller
{
    public function index(): View
    {
        $categories = Category::query()
            ->withCount('stores')
            ->with('stores:id,name')
            ->orderBy('name')
            ->orderBy('id')
            ->paginate(14);

        return view('admin.categories.index', compact('categories'));
    }

    public function create(): View
    {
        $stores = Store::query()->orderBy('name')->get(['id', 'name']);

        return view('admin.categories.create', compact('stores'));
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        $attributes = $request->validated();
        $storeIds = $attributes['store_ids'] ?? [];
        $image = $this->imageFor($request, $attributes, null);
        unset($attributes['store_ids'], $attributes['image_url'], $attributes['image_upload'], $attributes['remove_image']);

        $category = DB::transaction(function () use ($attributes, $image, $storeIds): Category {
            $category = Category::query()->create([
                'name' => trim($attributes['name']),
                'image' => $image,
                'status' => 'active',
            ]);
            $category->stores()->sync($storeIds);

            return $category;
        });

        return redirect()
            ->route('admin.categories.index')
            ->with('status', "Category {$category->name} created successfully.");
    }

    public function edit(Category $category): View
    {
        $stores = Store::query()->orderBy('name')->get(['id', 'name']);
        $category->load('stores:id');

        return view('admin.categories.edit', compact('category', 'stores'));
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $attributes = $request->validated();
        $storeIds = $attributes['store_ids'] ?? [];
        $image = $this->imageFor($request, $attributes, $category);
        unset($attributes['store_ids'], $attributes['image_url'], $attributes['image_upload'], $attributes['remove_image']);

        DB::transaction(function () use ($attributes, $category, $image, $storeIds): void {
            $category->update([
                'name' => trim($attributes['name']),
                'image' => $image,
                'status' => $attributes['status'] ?? $category->status,
            ]);
            $category->stores()->sync($storeIds);
        });

        return redirect()
            ->route('admin.categories.index')
            ->with('status', "Category {$category->name} updated successfully.");
    }

    public function toggleStatus(Category $category): RedirectResponse
    {
        $category->update([
            'status' => $category->status === 'active' ? 'archived' : 'active',
        ]);

        return redirect()
            ->route('admin.categories.index')
            ->with('status', "Category {$category->name} is now {$category->status}.");
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->stores()->exists()) {
            return back()->withErrors([
                'category' => 'This category is used by stores. Archive it instead of deleting it.',
            ]);
        }

        $category->delete();

        return redirect()
            ->route('admin.categories.index')
            ->with('status', "Category {$category->name} deleted.");
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function imageFor(CategoryRequest $request, array $attributes, ?Category $category): ?string
    {
        if ($request->hasFile('image_upload')) {
            $path = $request->file('image_upload')->storePublicly('category-images', 'public');

            if (! is_string($path)) {
                throw new RuntimeException('The category image could not be saved.');
            }

            return Storage::disk('public')->url($path);
        }

        if ($request->boolean('remove_image')) {
            return null;
        }

        if (filled($attributes['image_url'] ?? null)) {
            return $attributes['image_url'];
        }

        return $category?->image;
    }
}
