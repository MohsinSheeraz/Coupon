@php
    $selectedStoreIds = collect(old('store_ids', $selectedStoreIds))
        ->map(fn ($id) => (int) $id)
        ->all();
    $imageUrl = old('image_url', $category && filter_var($category->image, FILTER_VALIDATE_URL) ? $category->image : '');
@endphp

<section data-slot="card" class="mx-auto max-w-4xl rounded-2xl p-6 sm:p-8">
    <header class="mb-6 border-b border-[#e5e9df] pb-4">
        <h3 class="text-lg font-semibold text-teal-900">Category Details</h3>
        <p class="mt-1 text-sm text-gray-600">Every category needs an image before it can appear on the site.</p>
    </header>

    <form method="POST" action="{{ $category ? route('admin.categories.update', $category) : route('admin.categories.store') }}" enctype="multipart/form-data" class="space-y-7">
        @csrf
        @if ($category)
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

        <div class="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]">
            <div class="space-y-5">
                <div>
                    <label for="name" class="mb-1.5 block text-sm font-medium">Name</label>
                    <input id="name" name="name" value="{{ old('name', $category?->name) }}" maxlength="60" required class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20" placeholder="e.g. Footwear">
                    @error('name')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                @if ($category)
                    <div>
                        <label for="status" class="mb-1.5 block text-sm font-medium">Status</label>
                        <select id="status" name="status" class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20">
                            <option value="active" @selected(old('status', $category->status) === 'active')>Active</option>
                            <option value="archived" @selected(old('status', $category->status) === 'archived')>Archived</option>
                        </select>
                    </div>
                @endif

                <section class="space-y-3 border-t border-[#e5e9df] pt-5" aria-labelledby="category-stores-title">
                    <div>
                        <h4 id="category-stores-title" class="font-semibold">Assign stores</h4>
                        <p class="mt-1 text-xs text-gray-500">Choose every store that belongs to this category.</p>
                    </div>
                    <div class="max-h-72 space-y-2 overflow-auto rounded-xl border border-ink/10 p-3">
                        @forelse ($stores as $store)
                            <label class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-paper">
                                <input type="checkbox" name="store_ids[]" value="{{ $store->id }}" @checked(in_array($store->id, $selectedStoreIds, true)) class="rounded border-ink/20 text-grape focus:ring-grape">
                                <span class="truncate">{{ $store->name }}</span>
                            </label>
                        @empty
                            <p class="text-sm text-gray-500">No stores have been added yet.</p>
                        @endforelse
                    </div>
                    @error('store_ids.*')<p class="text-sm text-red-600">{{ $message }}</p>@enderror
                </section>
            </div>

            <div class="space-y-5">
                <div>
                    <label for="image_upload" class="mb-1.5 block text-sm font-medium">Image upload</label>
                    <input id="image_upload" name="image_upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="block w-full rounded-lg border border-ink/15 bg-white text-sm file:mr-3 file:border-0 file:bg-paper file:px-4 file:py-2.5">
                    <p class="mt-1 text-xs text-gray-500">JPG, PNG, WebP or GIF; maximum 5 MB.</p>
                    @error('image_upload')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                <div class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <span class="h-px flex-1 bg-ink/10"></span>
                    or use an image URL
                    <span class="h-px flex-1 bg-ink/10"></span>
                </div>

                <div>
                    <label for="image_url" class="mb-1.5 block text-sm font-medium">Image URL</label>
                    <input id="image_url" name="image_url" type="url" value="{{ $imageUrl }}" maxlength="2048" class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20" placeholder="https://example.com/category.jpg">
                    @error('image_url')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                @if ($category?->image)
                    <div class="flex items-center gap-3 rounded-xl border border-ink/10 bg-paper p-3">
                        <img src="{{ $category->image }}" alt="{{ $category->name }} category" class="size-16 rounded-lg bg-white object-cover">
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-medium">Current image</p>
                            <p class="truncate text-xs text-gray-500">{{ \Illuminate\Support\Str::limit($category->image, 100) }}</p>
                        </div>
                        <label class="flex items-center gap-2 text-xs text-red-700">
                            <input type="checkbox" name="remove_image" value="1" class="rounded border-ink/20">
                            Remove
                        </label>
                    </div>
                @endif
            </div>
        </div>

        <footer class="flex flex-col-reverse justify-end gap-3 border-t border-[#e5e9df] pt-5 sm:flex-row">
            <a href="{{ route('admin.categories.index') }}" class="inline-flex items-center justify-center rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-paper">Cancel</a>
            <button type="submit" class="inline-flex items-center justify-center rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800">
                {{ $category ? 'Update Category' : 'Create Category' }}
            </button>
        </footer>
    </form>
</section>
