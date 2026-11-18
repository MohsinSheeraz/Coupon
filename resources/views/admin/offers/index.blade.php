@extends('layouts.admin')

@section('title', ucfirst($resource).' | Admin Panel | DealzyCoup')

@section('content')
    <div class="animate-fadeIn space-y-8">
        <header class="border-b border-[#e5e9df] pb-5">
            <p class="text-sm font-semibold uppercase text-teal-700">Catalog</p>
            <div class="mt-1 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 class="text-3xl font-bold">{{ ucfirst($resource) }}</h2>
                    <p class="mt-2 text-sm text-gray-600">Manage {{ $resource }} and their store assignments.</p>
                </div>
                <a href="{{ route('admin.'.$resource.'.create') }}" class="inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800">
                    <x-icon name="plus" class="h-4 w-4" />
                    New {{ $type === 'code' ? 'Coupon' : 'Deal' }}
                </a>
            </div>
        </header>

        @if (session('status'))
            <p class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">{{ session('status') }}</p>
        @endif

        @if ($offers->hasPages())
            <div class="mb-3 flex justify-end">
                @include('partials.listing-pagination', [
                    'paginator' => $offers,
                    'pageSelectId' => 'admin-'.$resource.'-top-page-select',
                ])
            </div>
        @endif

        <section class="admin-table-panel rounded-2xl border border-[#dde5d6] bg-white shadow-sm" aria-label="{{ ucfirst($resource) }} list">
            <div class="flex items-center justify-between gap-3 border-b border-[#edf0e8] px-5 py-4">
                <h3 class="font-semibold">All {{ $resource }}</h3>
                <span class="text-sm text-gray-500">{{ $offers->total() }} total</span>
            </div>
            <div class="admin-table-viewport">
                <table class="w-full min-w-[900px] table-fixed border-collapse text-sm">
                    <thead data-slot="table-header">
                        <tr class="border-b border-[#e5e9df] text-left text-xs uppercase tracking-wide text-gray-500">
                            <th scope="col" data-slot="table-head" class="admin-table-title {{ $type === 'code' ? 'w-[26%]' : 'w-[30%]' }} px-4 py-4">Title</th>
                            <th scope="col" data-slot="table-head" class="{{ $type === 'code' ? 'w-[19%]' : 'w-[27%]' }} px-4 py-4">Store</th>
                            @if ($type === 'code')
                                <th scope="col" data-slot="table-head" class="w-[14%] px-4 py-4">Coupon code</th>
                                <th scope="col" data-slot="table-head" class="w-[15%] px-4 py-4">Expiry date</th>
                                <th scope="col" data-slot="table-head" class="w-[12%] px-4 py-4">Used</th>
                            @else
                                <th scope="col" data-slot="table-head" class="w-[16%] px-4 py-4">Expiry date</th>
                                <th scope="col" data-slot="table-head" class="w-[13%] px-4 py-4">Used</th>
                            @endif
                            <th scope="col" data-slot="table-head" class="admin-table-actions w-[14%] px-4 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                @forelse ($offers as $offer)
                    <tr class="border-b border-[#edf0e8] transition hover:bg-paper/70">
                        <td data-slot="table-cell" class="admin-table-title px-4 py-4">
                            <span class="block truncate font-medium text-ink">{{ $offer->title }}</span>
                        </td>
                        <td data-slot="table-cell" class="px-4 py-4 text-ink">{{ $offer->store->name }}</td>
                        @if ($type === 'code')
                            <td data-slot="table-cell" class="px-4 py-4 font-mono text-ink">{{ $offer->code ?: '—' }}</td>
                        @endif
                        <td data-slot="table-cell" class="px-4 py-4 text-gray-600">{{ $offer->expiry_date ?: 'Not set' }}</td>
                        <td data-slot="table-cell" class="px-4 py-4 text-ink">{{ number_format($offer->used_count) }}</td>
                        <td data-slot="table-cell" class="admin-table-actions px-4 py-4">
                            <div class="flex justify-end gap-2">
                                <a href="{{ route('admin.'.$resource.'.edit', $offer) }}" aria-label="Edit {{ $offer->title }}"
                                    class="grid size-9 place-items-center rounded-lg border border-[#dde5d6] text-teal-800 transition hover:bg-paper">
                                    <x-icon name="pencil" class="h-4 w-4" />
                                </a>
                                <form method="POST" action="{{ route('admin.'.$resource.'.destroy', $offer) }}" onsubmit="return confirm('Delete this offer? This cannot be undone.')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" aria-label="Delete {{ $offer->title }}"
                                        class="grid size-9 place-items-center rounded-lg border border-[#dde5d6] text-red-600 transition hover:bg-red-50">
                                        <x-icon name="trash" class="h-4 w-4" />
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="{{ $type === 'code' ? 6 : 5 }}" class="px-4 py-12 text-center text-gray-500">No {{ $resource }} yet.</td>
                    </tr>
                @endforelse
                    </tbody>
                </table>
            </div>
        </section>
    </div>
@endsection
