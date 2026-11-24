@extends('layouts.app')

@php
    $couponTotal = $coupons->total();
    $dealTotal = $deals->total();
    $offerTotal = $couponTotal + $dealTotal;
    $monthLabel = now()->format('F Y');
    $categoryNames = $store->categories->pluck('name');
    $websiteHost = $store->website ? preg_replace('/^www\./', '', (string) parse_url($store->website, PHP_URL_HOST)) : null;
    $metaDescription = $offerTotal > 0
        ? $store->name.' coupon codes and deals for '.$monthLabel.': '.$couponTotal.' '.\Illuminate\Support\Str::plural('code', $couponTotal).' and '.$dealTotal.' '.\Illuminate\Support\Str::plural('deal', $dealTotal).'. Top offer: '.$topOffer->title.'.'
        : 'Looking for '.$store->name.' coupon codes? Check DealzyCoup for the latest '.$store->name.' promo codes and deals.';
@endphp

@section('title', $store->name.' Coupons & Promo Codes ('.$monthLabel.') | DealzyCoup')
@section('description', \Illuminate\Support\Str::limit($metaDescription, 157))
@section('canonical', route('stores.show', $store))
@if ($store->logo && \Illuminate\Support\Str::startsWith($store->logo, ['http://', 'https://']))
    @section('og_image', $store->logo)
@elseif ($store->logo && \Illuminate\Support\Str::startsWith($store->logo, '/'))
    @section('og_image', url($store->logo))
@endif
@if ($offerTotal === 0)
    @section('robots', 'noindex, follow')
@endif

@section('content')
    <div class="container mx-auto px-4 py-12">
        
        <section class="relative mb-10 overflow-hidden rounded-3xl bg-ink p-6 text-white md:p-8">
            <div aria-hidden="true" class="absolute inset-0 scale-150 bg-cover bg-center opacity-40 blur-3xl"
                style="background-image: url('{{ $store->logo }}')"></div>
            <div class="relative flex items-center gap-6">
                <div class="grid size-24 shrink-0 place-items-center rounded-3xl bg-white shadow-lg">
                    <img src="{{ $store->logo ?: '/placeholder.svg' }}" alt="{{ $store->name }}"
                        class="h-16 w-16 object-contain">

                </div>
                <div>
                    <h1 class="font-display text-4xl font-semibold tracking-tight md:text-5xl">{{ $store->name }}</h1>
                    <p class="mt-1 text-white/70">{{ $offerTotal }} Coupons &amp; Deals</p>
                </div>
            </div>
        </section>

        <div class="space-y-6">
            <div class="inline-flex w-fit items-center rounded-full bg-mist p-1" role="tablist" aria-label="Store offers">

                <button type="button" role="tab" id="store-coupons-tab" aria-controls="store-coupons-panel"
                    aria-selected="{{ $activeTab === 'coupons' ? 'true' : 'false' }}"
                    tabindex="{{ $activeTab === 'coupons' ? '0' : '-1' }}" data-store-tab="coupons"
                    class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-colors hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grape sm:text-base {{ $activeTab === 'coupons' ? 'bg-white text-grape shadow-sm' : 'text-ink' }}">
                    <x-icon name="ticket" class="h-4 w-4" /> Coupons
                </button>

                <button type="button" role="tab" id="store-deals-tab" aria-controls="store-deals-panel"
                    aria-selected="{{ $activeTab === 'deals' ? 'true' : 'false' }}"
                    tabindex="{{ $activeTab === 'deals' ? '0' : '-1' }}" data-store-tab="deals"
                    class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grape sm:text-base {{ $activeTab === 'deals' ? 'bg-white text-grape shadow-sm' : 'text-ink' }}">
                    <x-icon name="badge-percent" class="h-4 w-4" /> Deals
                </button>

            </div>
            <section id="store-coupons-panel" role="tabpanel" aria-labelledby="store-coupons-tab" data-store-panel="coupons"
                tabindex="0" @if ($activeTab !== 'coupons') hidden @endif>
                @if ($coupons->isNotEmpty())
                    @include('partials.listing-pagination', [
                        'paginator' => $coupons,
                        'pageSelectId' => 'store-coupons-page-select',
                    ])
                    <div class="stagger grid grid-cols-1 gap-4 pb-6 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                        @foreach ($coupons as $coupon)
                            <x-coupon-card :coupon="$coupon" />
                        @endforeach
                    </div>
                @else
                    <p class="text-gray-500">
                        {{ $dealTotal > 0 ? 'No '.$store->name.' coupon codes right now. Open the Deals tab for '.$dealTotal.' '.\Illuminate\Support\Str::plural('deal', $dealTotal).'.' : 'No coupons available.' }}
                    </p>
                @endif
            </section>

            <section id="store-deals-panel" role="tabpanel" aria-labelledby="store-deals-tab" data-store-panel="deals"
                tabindex="0" @if ($activeTab !== 'deals') hidden @endif>
                @if ($deals->isNotEmpty())
                    @include('partials.listing-pagination', [
                        'paginator' => $deals,
                        'pageSelectId' => 'store-deals-page-select',
                    ])
                    <div class="stagger grid grid-cols-1 gap-4 pb-6 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                        @foreach ($deals as $deal)
                            <x-coupon-card :coupon="$deal" />
                        @endforeach
                    </div>
                @else
                    <p class="text-gray-500">
                        {{ $couponTotal > 0 ? 'No '.$store->name.' deals right now. Open the Coupons tab for '.$couponTotal.' '.\Illuminate\Support\Str::plural('code', $couponTotal).'.' : 'No deals available.' }}
                    </p>
                @endif
            </section>
        </div>

        <section class="mt-12 max-w-3xl space-y-3 text-ink/70" aria-labelledby="store-about-heading">
            <h2 id="store-about-heading" class="font-display text-2xl font-semibold text-ink">About {{ $store->name }} coupons</h2>
            <p>
                DealzyCoup currently lists {{ $couponTotal }} {{ $store->name }} {{ \Illuminate\Support\Str::plural('coupon code', $couponTotal) }}
                and {{ $dealTotal }} {{ \Illuminate\Support\Str::plural('deal', $dealTotal) }}@if ($categoryNames->isNotEmpty()) in {{ $categoryNames->join(', ', ' and ') }}@endif.
                Each offer shows when it was last verified, and expired offers are removed from this page automatically.
            </p>
            @if ($topOffer)
                <p>Today's top {{ $store->name }} offer: <strong class="text-ink">{{ $topOffer->title }}</strong>.</p>
            @endif
            <h3 class="pt-2 font-display text-lg font-semibold text-ink">How to use a {{ $store->name }} promo code</h3>
            <p>
                Click <em>Get code</em> on any coupon above to reveal and copy the code. Then shop
                {{ $websiteHost ? 'at '.$websiteHost : 'on the '.$store->name.' website' }}
                and paste the code in the promo code box at checkout. Deals need no code: open the deal and the discount applies on the store's site.
            </p>
        </section>
    </div>
@endsection