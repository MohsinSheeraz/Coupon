@extends('layouts.app')

@section('title', 'Search Results | DealzyCoup')
@section('robots', 'noindex, follow')

@section('content')
    <div class="listing-page container mx-auto px-4 py-12">
        <section class="listing-intro mb-12">
            <h1 class="mb-4 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">Search Results for “{{ $query }}”</h1>
            <p class="text-gray-600">Found {{ $coupons->count() }} coupons and {{ $stores->count() }} stores</p>
        </section>

        @if ($stores->isNotEmpty())
            <section class="mb-12">
                <h2 class="mb-6 font-display text-2xl font-semibold tracking-tight text-ink">Stores</h2>
                <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    @foreach ($stores as $store)
                        <a href="{{ route('stores.show', $store) }}" class="group block h-full rounded-3xl">
                            <div class="flex h-full min-h-[250px] flex-col overflow-hidden rounded-3xl border border-[#e5e9df] bg-white transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#b9c9ac]">
                                <div class="relative h-32 overflow-hidden bg-[#f3f6ee]">
                                    <img src="{{ $store->logo ?: '/placeholder.svg' }}" alt="" loading="lazy" class="h-full w-full object-cover">
                                </div>
                                <div class="flex h-full flex-col items-center p-5 text-center">
                                    <h3 class="mb-4 line-clamp-2 min-h-10 font-semibold text-ink">{{ $store->name }}</h3>
                                    <p class="mt-auto border-t border-[#edf0e8] pt-3 text-sm text-ink/70">
                                        {{ $store->coupon_count }} Coupons · {{ $store->deal_count }} Deals
                                    </p>
                                </div>
                            </div>
                        </a>
                    @endforeach
                </div>
            </section>
        @endif

        @if ($coupons->isNotEmpty())
            <section>
                <h2 class="mb-6 font-display text-2xl font-semibold tracking-tight text-ink">Coupons</h2>
                <div class="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
                    @foreach ($coupons as $coupon)
                        <x-coupon-card :coupon="$coupon" />
                    @endforeach
                </div>
            </section>
        @endif

        @if ($coupons->isEmpty() && $stores->isEmpty())
            <div class="py-12 text-center">
                <x-icon name="store" class="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h2 class="mb-2 text-2xl font-bold">No results found</h2>
                <p class="mb-6 text-gray-600">We couldn’t find any coupons or stores matching “{{ $query }}”</p>
                <a href="{{ route('home') }}" class="rounded-full bg-grape px-5 py-3 text-white hover:bg-grape-deep">Back to Home</a>
            </div>
        @endif
    </div>
@endsection
