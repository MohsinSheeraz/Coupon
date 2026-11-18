<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Store;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

class PublicListingController extends Controller
{
    public function coupons(Request $request): View
    {
        return $this->offers($request, 'code');
    }

    public function deals(Request $request): View
    {
        return $this->offers($request, 'deal');
    }

    public function stores(Request $request): View
    {
        $categoryValue = $request->query('category', '');
        $category = is_string($categoryValue) ? trim($categoryValue) : '';
        $view = $this->viewMode($request);
        $query = Store::query()
            ->with(['categories'])
            ->withOfferCounts()
            ->orderBy('name');

        if ($category !== '') {
            $categoryKey = Category::keyFor($category);

            if ($categoryKey !== '') {
                $query->whereHas('categories', fn ($categories) => $categories->where('key', $categoryKey));
            }
        }

        $stores = $view === 'all'
            ? $query->get()
            : $query->paginate(20)->withQueryString();

        return view('pages.stores', compact('stores', 'category', 'view'));
    }

    public function search(Request $request): View
    {
        $queryValue = $request->query('q', '');
        $query = is_string($queryValue) ? trim($queryValue) : '';

        $stores = Store::query()
            ->with('categories')
            ->withOfferCounts()
            ->where(function ($stores) use ($query) {
                $stores->where('name', 'like', "%{$query}%")
                    ->orWhereHas('categories', fn ($categories) => $categories->where('name', 'like', "%{$query}%"));
            })
            ->orderBy('name')
            ->get();

        $coupons = Coupon::query()
            ->with('store')
            ->where(function ($coupons) use ($query) {
                $coupons->where('title', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%")
                    ->orWhere('code', 'like', "%{$query}%");
            })
            ->latest()
            ->get();

        return view('pages.search', compact('coupons', 'query', 'stores'));
    }

    private function offers(Request $request, string $type): View
    {
        $view = $this->viewMode($request);
        $query = Coupon::query()
            ->with('store')
            ->where('type', $type)
            ->latest();

        $offers = $view === 'all'
            ? $query->get()
            : $query->paginate(16)->withQueryString();

        return view('pages.offers', [
            'offers' => $offers,
            'type' => $type,
            'view' => $view,
        ]);
    }

    private function viewMode(Request $request): string
    {
        $view = $request->query('view', 'default');

        return in_array($view, ['one', 'two', 'all'], true) ? $view : 'default';
    }
}
