@extends('layouts.app')

@php
    $gridColumns = match ($view) {
        'one' => 'grid-cols-1',
        'two' => 'grid-cols-2',
        default => 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    };
@endphp

@section('title', ($category ? $category.' Stores' : 'All Stores').' | DealzyCoup')

@section('content')
    <div class="listing-page container mx-auto px-4 py-12">
        <section class="listing-intro listing-intro-stores mb-6">
            <div class="listing-intro-copy">
                <p class="listing-intro-eyebrow"><x-icon name="sparkles" class="h-4 w-4" /> Find stores you love</p>
                <h1 class="font-display">
                    @if ($category)
                        {{ $category }} <span>Stores</span>
                    @else
                        All <span>Stores</span>
                    @endif
                </h1>
                <p class="listing-intro-description">
                    {{ $category ? 'Browse stores in '.$category.'.' : 'Browse our collection of stores and find the best coupons and deals.' }}
                </p>
            </div>
            <div class="listing-hero-art" aria-hidden="true">
                <div class="listing-hero-glow"></div>
                <div class="listing-hero-icon listing-hero-icon-main"><x-icon name="store" class="h-11 w-11" /></div>
                <div class="listing-hero-icon listing-hero-icon-tag"><x-icon name="tag" class="h-6 w-6" /></div>
                <div class="listing-hero-sparkle"><x-icon name="sparkles" class="h-6 w-6" /></div>
            </div>
        </section>

        <div class="listing-controls">
            <div class="listing-pagination-row">
                @include('partials.listing-pagination', ['paginator' => $stores])
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

        @if ($stores->isNotEmpty())
            <div class="stagger grid {{ $gridColumns }} gap-6">
                @foreach ($stores as $store)
                    <a href="{{ route('stores.show', $store) }}" class="group block h-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-4">
                        <div class="flex h-full min-h-[250px] flex-col overflow-hidden rounded-3xl border border-[#e5e9df] bg-white shadow-[0_8px_24px_-18px_rgba(34,39,32,0.35)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#b9c9ac]">
                            <div class="relative h-32 shrink-0 overflow-hidden bg-[#f3f6ee]">
                                <img src="{{ $store->logo ?: '/placeholder.svg' }}" alt="" loading="lazy" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105">
                                <div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10"></div>
                            </div>
                            <div class="flex h-full flex-col items-center p-5 text-center sm:p-6">
                                <h2 class="mb-4 line-clamp-2 min-h-10 w-full text-base font-semibold leading-5 text-ink transition-colors group-hover:text-grape">{{ $store->name }}</h2>
                                <div class="mt-auto flex w-full flex-col gap-2 border-t border-[#edf0e8] pt-4 text-sm">
                                    <div class="flex items-center justify-between gap-2 text-ink/70">
                                        <span class="flex items-center gap-2"><x-icon name="tag" class="h-4 w-4 text-grape" /> Coupons</span>
                                        <span class="min-w-7 rounded-full bg-[#f3f6ee] px-2 py-0.5 text-center text-xs font-semibold text-ink">{{ $store->coupon_count }}</span>
                                    </div>
                                    <div class="flex items-center justify-between gap-2 text-ink/70">
                                        <span class="flex items-center gap-2"><x-icon name="badge-percent" class="h-4 w-4 text-ink/70" /> Deals</span>
                                        <span class="min-w-7 rounded-full bg-[#f3f6ee] px-2 py-0.5 text-center text-xs font-semibold text-ink">{{ $store->deal_count }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </a>
                @endforeach
            </div>
        @else
            <p class="py-12 text-center text-gray-500">
                {{ $category ? 'No stores found in '.$category.'.' : 'No stores available right now.' }}
            </p>
        @endif
    </div>
@endsection
