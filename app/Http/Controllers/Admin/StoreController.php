<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRequest;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Store;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;
use RuntimeException;

class StoreController extends Controller
{
    public function index(): View
    {
        $stores = Store::query()
            ->withOfferCounts()
            ->with('categories')
            ->orderBy('name')
            ->orderBy('id')
            ->paginate(14);

        return view('admin.stores.index', compact('stores'));
    }

    public function create(): View
    {
        $categories = Category::query()->orderBy('name')->get();

        return view('admin.stores.create', compact('categories'));
    }

    public function store(StoreRequest $request): RedirectResponse
    {
        $attributes = $request->validated();
        $categoryIds = $attributes['category_ids'] ?? [];
        $logo = $this->logoFor($request, $attributes, null);
        unset($attributes['category_ids'], $attributes['logo'], $attributes['logo_url'], $attributes['remove_logo']);
        $attributes['logo'] = $logo;

        $store = DB::transaction(function () use ($attributes, $categoryIds): Store {
            $store = Store::query()->create($attributes);
            $store->categories()->sync($categoryIds);

            return $store;
        });

        return redirect()
            ->route('admin.stores.index')
            ->with('status', "Store {$store->name} created successfully.");
    }

    public function edit(Store $store): View
    {
        $categories = Category::query()->orderBy('name')->get();
        $store->load('categories');

        return view('admin.stores.edit', compact('categories', 'store'));
    }

    public function update(StoreRequest $request, Store $store): RedirectResponse
    {
        $attributes = $request->validated();
        $categoryIds = $attributes['category_ids'] ?? [];
        $logo = $this->logoFor($request, $attributes, $store);
        unset($attributes['category_ids'], $attributes['logo'], $attributes['logo_url'], $attributes['remove_logo']);
        $attributes['logo'] = $logo;

        DB::transaction(function () use ($attributes, $categoryIds, $store): void {
            $store->update($attributes);
            $store->categories()->sync($categoryIds);
        });

        return redirect()
            ->route('admin.stores.index')
            ->with('status', "Store {$store->name} updated successfully.");
    }

    public function destroy(Store $store): RedirectResponse
    {
        $storeName = $store->name;

        DB::transaction(function () use ($store): void {
            $store->categories()->detach();
            Coupon::query()->whereBelongsTo($store)->delete();
            $store->delete();
        });

        return redirect()
            ->route('admin.stores.index')
            ->with('status', "Store {$storeName} and its offers were deleted.");
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function logoFor(StoreRequest $request, array $attributes, ?Store $store): ?string
    {
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->storePublicly('store-logos', 'public');

            if (!is_string($path)) {
                throw new RuntimeException('The store logo could not be saved.');
            }

            return Storage::disk('public')->url($path);
        }

        if ($request->boolean('remove_logo')) {
            return null;
        }

        if (filled($attributes['logo_url'] ?? null)) {
            return $attributes['logo_url'];
        }

        return $store?->logo;
    }
}
