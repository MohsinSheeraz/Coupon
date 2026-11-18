@php
    $selectedCategoryIds = collect(old('category_ids', $store?->categories->pluck('id')->all() ?? []))
        ->map(fn ($id) => (int) $id)
        ->all();
    $logoUrl = old('logo_url', $store && filter_var($store->logo, FILTER_VALIDATE_URL) ? $store->logo : '');
@endphp

<section data-slot="card" class="mx-auto max-w-3xl rounded-2xl p-6 sm:p-8">
    <header class="mb-6 border-b border-[#e5e9df] pb-4">
        <h3 class="text-lg font-semibold text-teal-900">Store Details</h3>
    </header>

    <form method="POST" action="{{ $store ? route('admin.stores.update', $store) : route('admin.stores.store') }}" enctype="multipart/form-data" class="space-y-7">
        @csrf
        @if ($store)
            @method('PUT')
        @endif

        @if ($errors->any())
            <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                <p class="mb-2 font-semibold">Please correct the following:</p>
                <ul class="list-inside list-disc space-y-1">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-5">
                <div>
                    <label for="name" class="mb-1.5 block text-sm font-medium">Store Name</label>
                    <input id="name" name="name" value="{{ old('name', $store?->name) }}" maxlength="255" required class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20" placeholder="e.g. Amazon">
                    @error('name')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label for="slug" class="mb-1.5 block text-sm font-medium">URL Slug</label>
                    <input id="slug" name="slug" value="{{ old('slug', $store?->slug) }}" maxlength="255" required pattern="[A-Za-z0-9_-]+" class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20" placeholder="e.g. amazon">
                    <p class="mt-1 text-xs text-gray-500">Public store page: /stores/{{ old('slug', $store?->slug ?: 'store-name') }}</p>
                    @error('slug')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label for="website" class="mb-1.5 block text-sm font-medium">Website URL <span class="text-gray-500">(optional)</span></label>
                    <input id="website" name="website" type="url" value="{{ old('website', $store?->website) }}" maxlength="2048" class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20" placeholder="https://example.com">
                    @error('website')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label for="affiliate_link" class="mb-1.5 block text-sm font-medium">Affiliate Link <span class="text-gray-500">(optional)</span></label>
                    <input id="affiliate_link" name="affiliate_link" type="url" value="{{ old('affiliate_link', $store?->affiliate_link) }}" maxlength="2048" class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20" placeholder="https://example.com/?ref=partner">
                    @error('affiliate_link')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>
            </div>

            <div class="space-y-5">
                <div>
                    <label for="logo" class="mb-1.5 block text-sm font-medium">Store Logo Upload</label>
                    <input id="logo" name="logo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="block w-full rounded-lg border border-ink/15 bg-white text-sm file:mr-3 file:border-0 file:bg-paper file:px-4 file:py-2.5">
                    <p class="mt-1 text-xs text-gray-500">JPG, PNG, WebP or GIF; maximum 2 MB.</p>
                    @error('logo')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                <div class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <span class="h-px flex-1 bg-ink/10"></span>
                    or use a logo URL
                    <span class="h-px flex-1 bg-ink/10"></span>
                </div>

                <div>
                    <label for="logo_url" class="mb-1.5 block text-sm font-medium">Logo URL</label>
                    <input id="logo_url" name="logo_url" type="url" value="{{ $logoUrl }}" maxlength="2048" class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20" placeholder="https://example.com/logo.png">
                    @error('logo_url')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                @if ($store?->logo)
                    <div class="flex items-center gap-3 rounded-xl border border-ink/10 bg-paper p-3">
                        <img src="{{ $store->logo }}" alt="{{ $store->name }} logo" class="size-14 rounded-lg bg-white object-contain p-1">
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-medium">Current logo</p>
                            <p class="truncate text-xs text-gray-500">{{ $store->logo }}</p>
                        </div>
                        <label class="flex items-center gap-2 text-xs text-red-700">
                            <input type="checkbox" name="remove_logo" value="1" class="rounded border-ink/20">
                            Remove
                        </label>
                    </div>
                @endif
            </div>
        </div>

        <section class="space-y-3 border-t border-[#e5e9df] pt-6" aria-labelledby="store-categories-title">
            <div class="flex items-center justify-between gap-3">
                <h3 id="store-categories-title" class="font-semibold">Categories</h3>
                <a href="{{ route('admin.categories.index') }}" class="text-sm text-teal-700 underline underline-offset-4">Manage categories</a>
            </div>
            <div class="grid gap-2 sm:grid-cols-2">
                @forelse ($categories as $category)
                    <label class="flex cursor-pointer items-center gap-2 rounded-lg border border-ink/10 px-3 py-2.5 text-sm">
                        <input type="checkbox" name="category_ids[]" value="{{ $category->id }}" @checked(in_array($category->id, $selectedCategoryIds, true)) class="rounded border-ink/20 text-grape focus:ring-grape">
                        <span class="min-w-0 flex-1 truncate">{{ $category->name }}</span>
                        @if ($category->status !== 'active')
                            <span class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] uppercase text-gray-500">{{ $category->status }}</span>
                        @endif
                    </label>
                @empty
                    <p class="text-sm text-gray-500">No categories have been created yet.</p>
                @endforelse
            </div>
            @error('category_ids.*')<p class="text-sm text-red-600">{{ $message }}</p>@enderror
        </section>

        <footer class="flex flex-col-reverse justify-end gap-3 border-t border-[#e5e9df] pt-5 sm:flex-row">
            <a href="{{ route('admin.stores.index') }}" class="inline-flex items-center justify-center rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-paper">Cancel</a>
            <button type="submit" class="inline-flex items-center justify-center rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800">
                {{ $store ? 'Update Store' : 'Save Store' }}
            </button>
        </footer>
    </form>
</section>
