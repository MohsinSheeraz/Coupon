<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Store;
use App\Models\VisitorPresence;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;

class AdminDashboardController extends Controller
{
    public function __invoke(): View
    {
        $stats = [
            'allItems' => Coupon::query()->count(),
            'stores' => Store::query()->count(),
            'coupons' => Coupon::query()->codes()->count(),
            'deals' => Coupon::query()->deals()->count(),
            'usage' => (int) Coupon::query()->sum('used_count'),
            'activeUsers' => VisitorPresence::activeCount(3),
        ];

        $recentCoupons = Coupon::query()
            ->codes()
            ->with('store')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(5)
            ->get();

        $expiredOfferCount = Coupon::query()->expired()->count();
        $expiredOffers = Coupon::query()
            ->expired()
            ->with('store:id,name')
            ->orderByDesc('expiry_date')
            ->orderByDesc('id')
            ->limit(5)
            ->get();

        $topStores = Store::query()
            ->withOfferCounts()
            ->with('categories')
            ->orderByDesc('coupon_count')
            ->orderBy('name')
            ->limit(5)
            ->get();

        return view('admin.dashboard', compact('expiredOfferCount', 'expiredOffers', 'recentCoupons', 'stats', 'topStores'));
    }

    public function presence(): JsonResponse
    {
        return response()
            ->json(['count' => VisitorPresence::activeCount(3)])
            ->header('Cache-Control', 'no-store');
    }
}
