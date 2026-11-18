@extends('layouts.admin')

@section('title', 'Stores | Admin Panel | DealzyCoup')

@section('content')
    <div class="animate-fadeIn">
        <div class="mb-4 flex items-center justify-between gap-4">
            <h2 class="gradient-text text-3xl font-bold">Stores</h2>
            <a href="{{ route('admin.stores.create') }}"
                class="inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700">
                <x-icon name="plus" class="h-4 w-4" />
                Add Store
            </a>
        </div>

        @if (session('status'))
            <p class="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
                {{ session('status') }}</p>
        @endif
 @if ($stores->hasPages())
            <div class="mb-3 flex justify-end">
                @include('partials.listing-pagination', [
                    'paginator' => $stores,
                    'pageSelectId' => 'admin-stores-top-page-select',
                ])
            </div>
        @endif
       

        <section class="admin-table-panel rounded-2xl border border-[#dde5d6] bg-white shadow-sm">
            <div class="admin-table-viewport">
                <table class="w-full min-w-[850px] table-fixed border-collapse text-sm">
                    <thead>
                        <tr class="border-b border-[#e5e9df] text-left text-xs uppercase tracking-wide text-gray-500">
                            <th class="admin-table-title w-[22%] px-4 py-4">Store</th>
                            <th class="w-[23%] px-4 py-4">Store URL</th>
                            <th class="w-[25%] px-4 py-4">Categories</th>
                            <th class="w-[8%] px-4 py-4">Coupons</th>
                            <th class="w-[8%] px-4 py-4">Deals</th>
                            <th class="admin-table-actions w-[14%] px-4 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($stores as $store)
                            <tr class="border-b border-[#edf0e8] transition hover:bg-paper/70">
                                <td class="admin-table-title px-4 py-4">
                                    <div class="flex min-w-0 items-center gap-3">
                                        <span
                                            class="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-ink/10 bg-white">
                                            <img src="{{ $store->logo ?: asset('placeholder.svg') }}" alt=""
                                                class="h-6 w-6 object-contain">
                                        </span>
                                        <span class="truncate font-medium text-ink">{{ $store->name }}</span>
                                    </div>
                                </td>
                                <td class="px-4 py-4">
                                    <a href="{{ route('stores.show', $store) }}" target="_blank" rel="noopener noreferrer"
                                        class="flex items-center gap-1 text-teal-700 hover:text-teal-900">
                                        <span class="truncate">{{ $store->slug }}</span>
                                        <x-icon name="external-link" class="h-3 w-3 shrink-0" />
                                    </a>
                                    @if ($store->website)
                                        <a href="{{ $store->website }}" target="_blank" rel="noopener noreferrer"
                                            class="mt-1 block truncate text-xs text-gray-500">{{ $store->website }}</a>
                                    @endif
                                </td>
                                <td class="px-4 py-4">
                                    <div class="flex flex-wrap gap-1.5">
                                        @forelse ($store->categories as $category)
                                            <span
                                                class="rounded-full border border-[#dde5d6] bg-paper px-2.5 py-1 text-xs text-ink">{{ $category->name }}</span>
                                        @empty
                                            <span class="text-xs text-gray-500">Uncategorized</span>
                                        @endforelse
                                    </div>
                                </td>
                                <td class="px-4 py-4 text-ink">{{ number_format($store->coupon_count) }}</td>
                                <td class="px-4 py-4 text-ink">{{ number_format($store->deal_count) }}</td>
                                <td class="admin-table-actions px-4 py-4">
                                    <div class="flex justify-end gap-2">
                                        <a href="{{ route('admin.stores.edit', $store) }}" aria-label="Edit {{ $store->name }}"
                                            class="grid size-9 place-items-center rounded-lg border border-[#dde5d6] text-teal-800 transition hover:bg-paper">
                                            <x-icon name="pencil" class="h-4 w-4" />
                                        </a>
                                        <form method="POST" action="{{ route('admin.stores.destroy', $store) }}"
                                            onsubmit="return confirm('Delete this store and its coupons and deals?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" aria-label="Delete {{ $store->name }}"
                                                class="grid size-9 place-items-center rounded-lg border border-[#dde5d6] text-red-600 transition hover:bg-red-50">
                                                <x-icon name="trash" class="h-4 w-4" />
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="px-4 py-12 text-center text-gray-500">No stores have been added yet.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </section>
    </div>
@endsection