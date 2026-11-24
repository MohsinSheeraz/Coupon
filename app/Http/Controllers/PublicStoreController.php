<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Store;
use App\Services\MetaConversionsApi;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

class PublicStoreController extends Controller
{
    public function show(Request $request, Store $store, MetaConversionsApi $meta): View
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
        $topOffer = $store->offers()
            ->available()
            ->orderByDesc('used_count')
            ->latest()
            ->first();
        $activeTab = $this->activeTab($request->query('tab'), $coupons->total(), $deals->total());

        $meta->track('ViewContent', $request, [
            'content_type' => 'store',
            'content_name' => $store->name,
            'content_ids' => [(string) $store->slug],
        ]);

        return view('pages.store', compact('activeTab', 'coupons', 'deals', 'store', 'topOffer'));
    }

    /**
     * Honour an explicit tab; otherwise open deals, unless only coupons exist.
     */
    private function activeTab(mixed $requestedTab, int $couponCount, int $dealCount): string
    {
        if (in_array($requestedTab, ['coupons', 'deals'], true)) {
            return $requestedTab;
        }

        return $dealCount === 0 && $couponCount > 0 ? 'coupons' : 'deals';
    }

    public function incrementUsage(Request $request, Coupon $coupon, MetaConversionsApi $meta): array
    {
        $coupon->increment('used_count');

        $eventId = $request->string('event_id')->limit(64)->toString();
        $meta->track('InitiateCheckout', $request, [
            'content_type' => 'offer',
            'content_name' => $coupon->title,
            'content_ids' => [(string) $coupon->id],
        ], $eventId !== '' ? $eventId : null);

        return ['success' => true];
    }
}
