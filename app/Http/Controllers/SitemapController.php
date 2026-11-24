<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Store;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * List every indexable public page: the main listings, active categories
     * that contain stores, and stores that currently have offers.
     */
    public function __invoke(): Response
    {
        $stores = Store::query()
            ->withAvailableOfferCounts()
            ->withMax('offers', 'updated_at')
            ->orderBy('name')
            ->get()
            ->filter(fn (Store $store): bool => $store->coupon_count + $store->deal_count > 0);

        $categories = Category::query()
            ->where('status', 'active')
            ->whereHas('stores')
            ->orderBy('name')
            ->get();

        return response()
            ->view('sitemap', compact('categories', 'stores'))
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}
