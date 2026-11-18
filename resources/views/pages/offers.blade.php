@extends('layouts.app')

@php
    $isCouponPage = $type === 'code';
    $kind = $isCouponPage ? 'coupons' : 'deals';
    $title = $isCouponPage ? 'All Coupons' : 'All Deals';
    $description = $isCouponPage
        ? 'Browse our collection of verified coupons.'
        : 'Browse our collection of verified deals from top stores.';
    $gridColumns = match ($view) {
        'one' => 'grid-cols-1',
        'two' => 'grid-cols-2',
        default => 'grid-cols-2 md:grid-cols-2 lg:grid-cols-4',
    };
@endphp

@section('title', $title . ' | DealzyCoup')

@section('content')
    <div class="listing-page container mx-auto px-4 py-12">
        <section class="listing-intro listing-intro-{{ $kind }} mb-6">
            <div class="listing-intro-copy">
                <p class="listing-intro-eyebrow"><x-icon name="sparkles" class="h-4 w-4" />
                    {{ $isCouponPage ? 'Your next savings start here' : 'Deals worth discovering' }}
                </p>
                <h1 class="font-display">All <span>{{ $isCouponPage ? 'Coupons' : 'Deals' }}</span></h1>
                <p class="listing-intro-description">{{ $description }}</p>
            </div>
            <div class="listing-hero-art" aria-hidden="true">
                <div class="listing-hero-glow"></div>
                <div class="listing-hero-icon listing-hero-icon-main"><x-icon
                        name="{{ $isCouponPage ? 'ticket' : 'badge-percent' }}" class="h-11 w-11" /></div>
                <div class="listing-hero-icon listing-hero-icon-tag"><x-icon name="tag" class="h-6 w-6" /></div>
                <div class="listing-hero-sparkle"><x-icon name="sparkles" class="h-6 w-6" /></div>
            </div>
        </section>

        <div class="listing-controls">
            <div class="listing-pagination-row">
                @include('partials.listing-pagination', ['paginator' => $offers])
                <a href="{{ request()->fullUrlWithQuery(['view' => 'all', 'page' => 1]) }}"
                    class="hidden whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors md:inline-flex {{ $view === 'all' ? 'border-ink bg-ink text-white' : 'bg-white text-gray-700' }}">
                    Show all
                </a>
            </div>
            <div class="listing-view-controls flex gap-2 overflow-x-auto md:hidden">
                @foreach (['one' => 'One per row', 'two' => 'Two per row', 'all' => 'Show all'] as $mode => $label)
                    <a href="{{ request()->fullUrlWithQuery(['view' => $mode, 'page' => 1]) }}"
                        class="whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors {{ $view === $mode ? 'border-ink bg-ink text-white' : 'bg-white text-gray-700' }}">
                        {{ $label }}
                    </a>
                @endforeach
            </div>
            @include('partials.mobile-page-search')
        </div>

        


        @if ($offers->isNotEmpty())
            <div class="stagger grid {{ $gridColumns }} gap-3 md:gap-6">
                @foreach ($offers as $offer)
                    <x-coupon-card :coupon="$offer" />
                @endforeach
            </div>
        @else
            <p class="py-12 text-center text-gray-500">
                {{ $isCouponPage ? 'No coupons available right now.' : 'No deals available right now.' }}
            </p>
        @endif
    </div>
@endsection