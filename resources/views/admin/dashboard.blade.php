@extends('layouts.admin')

@section('title', 'Dashboard | DealzyCoup')

@section('content')
    <div class="animate-fadeIn">
        <div class="mb-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <h2 class="gradient-text text-3xl font-bold">Dashboard</h2>
            <p class="text-sm text-gray-600">Last updated: {{ now()->format('M j, Y g:i A') }}</p>
        </div>

        <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
            @foreach ([
                    ['title' => 'All Items', 'value' => $stats['allItems'], 'icon' => 'layers', 'color' => 'violet', 'caption' => 'Coupons and deals'],
                    ['title' => 'Stores', 'value' => $stats['stores'], 'icon' => 'store', 'color' => 'teal', 'caption' => 'Numbers are in total'],
                    ['title' => 'Coupons', 'value' => $stats['coupons'], 'icon' => 'ticket-percent', 'color' => 'amber', 'caption' => 'Numbers are in total'],
                    ['title' => 'Deals', 'value' => $stats['deals'], 'icon' => 'percent', 'color' => 'blue', 'caption' => 'Numbers are in total'],
                    ['title' => 'Usage', 'value' => $stats['usage'], 'icon' => 'trending-up', 'color' => 'green', 'caption' => 'Coupon and deal redemptions'],
                    ['title' => 'Active Users', 'value' => $stats['activeUsers'], 'icon' => 'users', 'color' => 'rose', 'caption' => 'Active in the last 3 minutes'],
                ] as $metric)
                <section data-slot="card" class="admin-metric-card admin-metric-card--{{ $metric['color'] }} rounded-2xl p-4">
                    <div class="mb-2 flex items-center justify-between gap-3">
                        <h3 data-slot="card-title">{{ $metric['title'] }}</h3>
                        <span class="admin-metric-icon">
                            <x-icon :name="$metric['icon']" class="h-5 w-5" />
                        </span>
                    </div>
                    <p @if ($metric['title'] === 'Active Users') data-active-users-count @endif class="admin-metric-value">
                        {{ number_format($metric['value']) }}</p>
                    <p class="admin-metric-caption">{{ $metric['caption'] }}</p>
                </section>
            @endforeach
        </div>

        @if ($expiredOfferCount > 0)
            <section class="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-950" role="status"
                aria-labelledby="expired-offers-title">
                <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 id="expired-offers-title" class="text-lg font-semibold">Expired offers need attention</h3>
                        <p class="text-sm">{{ $expiredOfferCount }} expired {{ \Illuminate\Support\Str::plural('offer', $expiredOfferCount) }} found.</p>
                    </div>
                    <div class="flex gap-2 text-sm font-semibold">
                        <a href="{{ route('admin.coupons.index') }}" class="underline underline-offset-2">Coupons</a>
                        <a href="{{ route('admin.deals.index') }}" class="underline underline-offset-2">Deals</a>
                    </div>
                </div>
                <ul class="space-y-2">
                    @foreach ($expiredOffers as $offer)
                        <li class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200/80 bg-white/70 px-3 py-2">
                            <div>
                                <p class="font-medium">{{ $offer->title }}</p>
                                <p class="text-sm text-red-900/70">
                                    {{ $offer->type === 'deal' ? 'Deal' : 'Coupon' }}
                                    · {{ $offer->store?->name }}
                                    · Expired {{ $offer->expiry_date }}
                                </p>
                            </div>
                            <a href="{{ route($offer->type === 'deal' ? 'admin.deals.edit' : 'admin.coupons.edit', $offer) }}"
                                class="text-sm font-semibold underline underline-offset-2">Edit</a>
                        </li>
                    @endforeach
                </ul>
                @if ($expiredOfferCount > $expiredOffers->count())
                    <p class="mt-2 text-sm">Showing the 5 most recently expired offers.</p>
                @endif
            </section>
        @endif

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section data-slot="card" class="rounded-2xl p-4">
                <h3 class="mb-3 text-lg font-semibold">Recent Coupons</h3>
                <div class="space-y-1.5">
                    @forelse ($recentCoupons as $coupon)
                        <div class="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-paper">
                            <div
                                class="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full border border-ink/10 bg-white">
                                <img src="{{ $coupon->store?->logo ?: asset('placeholder.svg') }}"
                                    alt="{{ $coupon->store?->name }}" class="h-5 w-5 object-contain">
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="truncate font-medium">{{ $coupon->title }}</p>
                                <p class="text-sm text-gray-600">{{ $coupon->store?->name }}</p>
                            </div>
                            <p class="shrink-0 text-sm text-gray-600">{{ number_format($coupon->used_count) }} uses</p>
                        </div>
                    @empty
                        <p class="py-6 text-sm text-gray-600">No coupons have been added yet.</p>
                    @endforelse
                </div>
            </section>

            <section data-slot="card" class="rounded-2xl p-4">
                <h3 class="mb-3 text-lg font-semibold">Top Stores</h3>
                <div class="space-y-1.5">
                    @forelse ($topStores as $store)
                        <div class="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-paper">
                            <div
                                class="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full border border-ink/10 bg-white">
                                <img src="{{ $store->logo ?: asset('placeholder.svg') }}" alt="{{ $store->name }}"
                                    class="h-5 w-5 object-contain">
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="truncate font-medium">{{ $store->name }}</p>
                                <p class="truncate text-sm text-gray-600">
                                    {{ $store->categories->first()?->name ?? 'Uncategorized' }}</p>
                            </div>
                            <p class="shrink-0 text-sm text-gray-600">{{ number_format($store->coupon_count) }} coupons</p>
                        </div>
                    @empty
                        <p class="py-6 text-sm text-gray-600">No stores have been added yet.</p>
                    @endforelse
                </div>
            </section>
        </div>
    </div>
@endsection

@push('scripts')
    <script>
        const activeUsersCount = document.querySelector('[data-active-users-count]');
        const activeUsersUrl = {{ \Illuminate\Support\Js::from(route('admin.presence')) }};

        async function refreshActiveUsers() {
            try {
                const response = await fetch(activeUsersUrl, {
                    headers: { Accept: 'application/json' },
                    cache: 'no-store',
                });

                if (!response.ok) {
                    throw new Error(`Active users request failed (${response.status})`);
                }

                const result = await response.json();
                if (!Number.isInteger(result.count)) {
                    throw new Error('Active users response did not contain a valid count');
                }

                activeUsersCount.textContent = result.count.toLocaleString();
            } catch (error) {
                console.error('Could not refresh active user count:', error);
            }
        }

        refreshActiveUsers();
        window.setInterval(refreshActiveUsers, 30000);
    </script>
@endpush