@php
    $isCoupon = $resource === 'coupons';
    $logoUrl = old('logo_url', $offer && filter_var($offer->logo, FILTER_VALIDATE_URL) ? $offer->logo : '');
    $expiryDate = old('expiry_date', $offer?->expiry_date ? substr($offer->expiry_date, 0, 10) : '');
@endphp

<section data-slot="card" class="mx-auto max-w-4xl rounded-2xl p-6 sm:p-8">
    <header class="mb-6 border-b border-[#e5e9df] pb-4">
        <h3 class="text-lg font-semibold text-teal-900">{{ $isCoupon ? 'Coupon' : 'Deal' }} Details</h3>
    </header>

    <form method="POST" action="{{ $offer ? route('admin.'.$resource.'.update', $offer) : route('admin.'.$resource.'.store') }}" enctype="multipart/form-data" class="space-y-7">
        @csrf
        @if ($offer)
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

        <div class="grid gap-8 md:grid-cols-2">
            <div class="space-y-5">
                <div>
                    <label for="title" class="mb-1.5 block text-sm font-medium">{{ $isCoupon ? 'Title' : 'Deal Title' }}</label>
                    <input id="title" name="title" value="{{ old('title', $offer?->title) }}" maxlength="500" required class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20" placeholder="e.g. 20% Off Your First Order">
                    @error('title')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label for="store_id" class="mb-1.5 block text-sm font-medium">Store</label>
                    <select id="store_id" name="store_id" required class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20">
                        <option value="">Select a store</option>
                        @foreach ($stores as $store)
                            <option value="{{ $store->id }}" @selected((string) old('store_id', $offer?->store_id) === (string) $store->id)>{{ $store->name }}</option>
                        @endforeach
                    </select>
                    @error('store_id')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                    @if ($stores->isEmpty())
                        <p class="mt-1 text-xs text-gray-500">Create a store before adding an offer.</p>
                    @endif
                </div>

                @if ($isCoupon)
                    <div>
                        <label for="code" class="mb-1.5 block text-sm font-medium">Coupon Code</label>
                        <input id="code" name="code" value="{{ old('code', $offer?->code) }}" maxlength="255" required class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 font-mono focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20" placeholder="e.g. WELCOME20">
                        @error('code')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                    </div>
                    <div>
                        <label for="description" class="mb-1.5 block text-sm font-medium">Description <span class="text-gray-500">(optional)</span></label>
                        <textarea id="description" name="description" rows="3" maxlength="5000" class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20">{{ old('description', $offer?->description) }}</textarea>
                        @error('description')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                    </div>
                @endif
            </div>

            <div class="space-y-5">
                <div>
                    <label for="affiliate_link" class="mb-1.5 block text-sm font-medium">Affiliate Link</label>
                    <input id="affiliate_link" name="affiliate_link" type="url" value="{{ old('affiliate_link', $offer?->affiliate_link) }}" maxlength="2048" required class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20" placeholder="https://example.com/offer?ref=affiliate">
                    @error('affiliate_link')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label for="expiry_date" class="mb-1.5 block text-sm font-medium">Expiry Date</label>
                    <input id="expiry_date" name="expiry_date" type="date" value="{{ $expiryDate }}" required class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20">
                    @error('expiry_date')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label for="logo_upload" class="mb-1.5 block text-sm font-medium">{{ $isCoupon ? 'Coupon' : 'Deal' }} Logo Upload</label>
                    <input id="logo_upload" name="logo_upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="block w-full rounded-lg border border-ink/15 bg-white text-sm file:mr-3 file:border-0 file:bg-paper file:px-4 file:py-2.5">
                    <p class="mt-1 text-xs text-gray-500">JPG, PNG, WebP or GIF; maximum 2 MB.</p>
                    @error('logo_upload')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label for="logo_url" class="mb-1.5 block text-sm font-medium">Logo URL <span class="text-gray-500">(optional)</span></label>
                    <input id="logo_url" name="logo_url" type="url" value="{{ $logoUrl }}" maxlength="2048" class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20" placeholder="https://example.com/logo.png">
                    @error('logo_url')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                @if ($offer?->logo)
                    <div class="flex items-center gap-3 rounded-xl border border-ink/10 bg-paper p-3">
                        <img src="{{ $offer->logo }}" alt="{{ $offer->title }} logo" class="size-14 rounded-lg bg-white object-contain p-1">
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-medium">Current logo</p>
                            <p class="truncate text-xs text-gray-500">{{ \Illuminate\Support\Str::limit($offer->logo, 100) }}</p>
                        </div>
                        <label class="flex items-center gap-2 text-xs text-red-700">
                            <input type="checkbox" name="remove_logo" value="1" class="rounded border-ink/20">
                            Remove
                        </label>
                    </div>
                @endif
            </div>
        </div>

        <footer class="flex flex-col-reverse justify-end gap-3 border-t border-[#e5e9df] pt-5 sm:flex-row">
            <a href="{{ route('admin.'.$resource.'.index') }}" class="inline-flex items-center justify-center rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-paper">Cancel</a>
            <button type="submit" @disabled($stores->isEmpty()) class="inline-flex items-center justify-center rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50">
                {{ $offer ? 'Update' : 'Create' }} {{ $isCoupon ? 'Coupon' : 'Deal' }}
            </button>
        </footer>
    </form>
</section>
