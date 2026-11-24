@extends('layouts.admin')

@section('title', 'Categories | Admin Panel | DealzyCoup')

@section('content')
    <div class="animate-fadeIn space-y-8">
        <header class="border-b border-[#e5e9df] pb-5">
            <p class="text-sm font-semibold uppercase text-teal-700">Catalog</p>
            <div class="mt-1 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 class="text-3xl font-bold">Categories</h2>
                    <p class="mt-2 text-sm text-gray-600">Manage names and images used by store search and the homepage slider.</p>
                </div>
                <div class="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
                    @include('partials.admin-table-search', [
                        'action' => route('admin.categories.index'),
                        'id' => 'admin-categories-search',
                        'label' => 'Search categories',
                        'placeholder' => 'Search categories',
                        'search' => $search,
                    ])
                    <a href="{{ route('admin.categories.create') }}" class="inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800">
                        <x-icon name="plus" class="h-4 w-4" />
                        New Category
                    </a>
                </div>
            </div>
        </header>

        @if (session('status'))
            <p class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">{{ session('status') }}</p>
        @endif
        @if ($errors->has('category'))
            <p class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{{ $errors->first('category') }}</p>
        @endif

        @if ($categories->hasPages())
            <div class="mb-3 flex justify-end">
                @include('partials.listing-pagination', [
                    'paginator' => $categories,
                    'pageSelectId' => 'admin-categories-top-page-select',
                ])
            </div>
        @endif

        <section class="admin-table-panel rounded-2xl border border-[#dde5d6] bg-white shadow-sm" aria-label="Category list">
            <div class="flex items-center justify-between gap-3 border-b border-[#edf0e8] px-5 py-4">
                <h3 class="font-semibold">All categories</h3>
                <span class="text-sm text-gray-500">{{ $categories->total() }} total</span>
            </div>
            <div class="admin-table-viewport">
                <table class="w-full min-w-[1000px] table-fixed border-collapse text-sm">
                    <thead data-slot="table-header">
                        <tr class="border-b border-[#e5e9df] text-left text-xs uppercase tracking-wide text-gray-500">
                            <th scope="col" data-slot="table-head" class="admin-table-title w-[26%] px-4 py-4">Category</th>
                            <th scope="col" data-slot="table-head" class="w-[13%] px-4 py-4">Status</th>
                            <th scope="col" data-slot="table-head" class="w-[11%] px-4 py-4">Stores</th>
                            <th scope="col" data-slot="table-head" class="w-[34%] px-4 py-4">Assigned stores</th>
                            <th scope="col" data-slot="table-head" class="admin-table-actions w-[16%] px-4 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                @forelse ($categories as $category)
                    <tr class="border-b border-[#edf0e8] transition hover:bg-paper/70">
                        <td data-slot="table-cell" class="admin-table-title px-4 py-4">
                            <div class="flex min-w-0 items-center gap-3">
                                @if ($category->image)
                                    <img src="{{ $category->image }}" alt="{{ $category->name }} category"
                                        class="size-10 shrink-0 rounded-lg border border-ink/10 object-cover">
                                @else
                                    <span class="grid size-10 shrink-0 place-items-center rounded-lg border border-ink/10 bg-gradient-to-br from-amber-100 to-emerald-100 text-teal-800">
                                        <x-icon name="layers" class="h-5 w-5" />
                                    </span>
                                @endif
                                <span class="truncate font-medium text-ink">{{ $category->name }}</span>
                            </div>
                        </td>
                        <td data-slot="table-cell" class="px-4 py-4">
                            <span class="rounded-full px-2.5 py-1 text-xs {{ $category->status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700' }}">
                                {{ $category->status }}
                            </span>
                        </td>
                        <td data-slot="table-cell" class="px-4 py-4 text-ink">
                            {{ $category->stores_count }} {{ \Illuminate\Support\Str::plural('store', $category->stores_count) }}
                        </td>
                        <td data-slot="table-cell" class="px-4 py-4 text-gray-600">
                            <span class="block truncate">{{ $category->stores->isNotEmpty() ? $category->stores->pluck('name')->implode(', ') : 'No stores assigned' }}</span>
                        </td>
                        <td data-slot="table-cell" class="admin-table-actions px-4 py-4">
                            <div class="flex justify-end gap-2">
                                <a href="{{ route('admin.categories.edit', $category) }}" aria-label="Edit {{ $category->name }}" title="Edit category"
                                    class="grid size-9 place-items-center rounded-lg border border-[#dde5d6] text-teal-800 transition hover:bg-paper">
                                    <x-icon name="pencil" class="h-4 w-4" />
                                </a>
                                <form method="POST" action="{{ route('admin.categories.toggle-status', $category) }}">
                                    @csrf
                                    @method('PATCH')
                                    <button type="submit" aria-label="{{ $category->status === 'active' ? 'Archive' : 'Restore' }} {{ $category->name }}"
                                        title="{{ $category->status === 'active' ? 'Archive' : 'Restore' }} category"
                                        class="grid size-9 place-items-center rounded-lg border border-[#dde5d6] text-teal-800 transition hover:bg-paper">
                                        <x-icon :name="$category->status === 'active' ? 'archive' : 'rotate-ccw'" class="h-4 w-4" />
                                    </button>
                                </form>
                                @if ($category->stores_count === 0)
                                    <form method="POST" action="{{ route('admin.categories.destroy', $category) }}" onsubmit="return confirm('Delete this category? This cannot be undone.')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" aria-label="Delete {{ $category->name }}" title="Delete category"
                                            class="grid size-9 place-items-center rounded-lg border border-[#dde5d6] text-red-600 transition hover:bg-red-50">
                                            <x-icon name="trash" class="h-4 w-4" />
                                        </button>
                                    </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-4 py-12 text-center text-gray-500">
                            {{ $search !== '' ? 'No categories match your search.' : 'No categories yet.' }}
                        </td>
                    </tr>
                @endforelse
                    </tbody>
                </table>
            </div>
        </section>
    </div>
@endsection
