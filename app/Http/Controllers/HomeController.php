<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Store;
use Illuminate\Contracts\View\View;

class HomeController extends Controller
{
    public function __invoke(): View
    {
        return view('pages.home', [
            'categories' => Category::query()
                ->where('status', 'active')
                ->orderBy('name')
                ->get(),
            'stores' => Store::query()
                ->withAvailableOfferCounts()
                ->orderByDesc('coupon_count')
                ->limit(6)
                ->get(),
            'coupons' => Coupon::query()
                ->with('store')
                ->available()
                ->orderByDesc('used_count')
                ->limit(6)
                ->get(),
        ]);
    }
}
