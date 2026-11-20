<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Store;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

class PublicStoreController extends Controller
{
    public function show(Request $request, Store $store): View
    {
        $store->load('categories');
        $coupons = $store->offers()
            ->with('store')
            ->available()
            ->codes()
            ->latest()
            ->orderByDesc('id')
            ->paginate(16, ['*'], 'coupons_page')
            ->appends(['tab' => 'coupons']);
        $deals = $store->offers()
            ->with('store')
            ->available()
            ->deals()
            ->latest()
            ->orderByDesc('id')
            ->paginate(16, ['*'], 'deals_page')
            ->appends(['tab' => 'deals']);
        $activeTab = $request->query('tab') === 'coupons' ? 'coupons' : 'deals';

        return view('pages.store', compact('activeTab', 'coupons', 'deals', 'store'));
    }

    public function incrementUsage(Coupon $coupon): array
    {
        $coupon->increment('used_count');

        return ['success' => true];
    }
}
