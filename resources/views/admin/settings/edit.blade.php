@extends('layouts.admin')

@section('title', 'Settings | Admin Panel | DealzyCoup')

@section('content')
    @php
        $activeTab = in_array(old('active_tab'), ['general', 'social', 'seo'], true)
            ? old('active_tab')
            : 'general';
    @endphp

    <div class="animate-fadeIn space-y-8">
        <header class="border-b border-[#e5e9df] pb-5">
            <p class="text-sm font-semibold uppercase text-teal-700">Configuration</p>
            <h2 class="mt-1 text-3xl font-bold">Settings</h2>
            <p class="mt-2 text-sm text-gray-600">Manage site details, social links, and search metadata.</p>
        </header>

        @if (session('status'))
            <p class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">{{ session('status') }}</p>
        @endif

        <form method="POST" action="{{ route('admin.settings.update') }}" class="space-y-6" data-settings-form>
            @csrf
            @method('PUT')
            <input type="hidden" name="active_tab" value="{{ $activeTab }}" data-settings-active-tab>

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

            <div class="max-w-2xl rounded-2xl border border-[#dde5d6] bg-white p-1.5 shadow-sm" role="tablist" aria-label="Settings sections">
                <div class="grid grid-cols-3 gap-1">
                    @foreach ([
                        'general' => ['label' => 'General', 'icon' => 'settings'],
                        'social' => ['label' => 'Social Media', 'icon' => 'link'],
                        'seo' => ['label' => 'SEO', 'icon' => 'search'],
                    ] as $tab => $details)
                        <button type="button" role="tab" id="settings-tab-{{ $tab }}"
                                aria-controls="settings-panel-{{ $tab }}"
                                aria-selected="{{ $activeTab === $tab ? 'true' : 'false' }}"
                                tabindex="{{ $activeTab === $tab ? '0' : '-1' }}"
                                data-settings-tab="{{ $tab }}"
                                class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 text-xs font-semibold text-ink/70 transition hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grape sm:text-sm {{ $activeTab === $tab ? 'bg-paper text-ink shadow-sm' : '' }}">
                            <x-icon :name="$details['icon']" class="h-4 w-4 shrink-0" />
                            {{ $details['label'] }}
                        </button>
                    @endforeach
                </div>
            </div>

            <section id="settings-panel-general" role="tabpanel" aria-labelledby="settings-tab-general"
                     data-settings-panel="general" @if ($activeTab !== 'general') hidden @endif
                     class="max-w-4xl rounded-2xl border border-[#dde5d6] bg-white p-6 shadow-sm sm:p-8">
                <div class="mb-6 border-b border-[#e5e9df] pb-4">
                    <h3 class="text-lg font-semibold text-teal-900">General Settings</h3>
                    <p class="mt-1 text-sm text-gray-600">The main identity and contact address for your site.</p>
                </div>
                <div class="grid gap-5 md:grid-cols-2">
                    <div>
                        <label for="site_name" class="mb-1.5 block text-sm font-medium">Site Name</label>
                        <input id="site_name" name="site_name" value="{{ old('site_name', $settings->site_name) }}" maxlength="255" required
                               placeholder="e.g. DealzyCoup"
                               class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20">
                        @error('site_name')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                    </div>
                    <div>
                        <label for="contact_email" class="mb-1.5 block text-sm font-medium">Contact Email</label>
                        <input id="contact_email" name="contact_email" type="email" value="{{ old('contact_email', $settings->contact_email) }}" maxlength="254" required
                               placeholder="e.g. contact@example.com"
                               class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20">
                        @error('contact_email')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                    </div>
                    <div class="md:col-span-2">
                        <label for="site_description" class="mb-1.5 block text-sm font-medium">Site Description</label>
                        <textarea id="site_description" name="site_description" rows="4" maxlength="2000" required
                                  placeholder="Briefly describe your site"
                                  class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20">{{ old('site_description', $settings->site_description) }}</textarea>
                        @error('site_description')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                    </div>
                </div>
            </section>

            <section id="settings-panel-social" role="tabpanel" aria-labelledby="settings-tab-social"
                     data-settings-panel="social" @if ($activeTab !== 'social') hidden @endif
                     class="max-w-4xl rounded-2xl border border-[#dde5d6] bg-white p-6 shadow-sm sm:p-8">
                <div class="mb-6 border-b border-[#e5e9df] pb-4">
                    <h3 class="text-lg font-semibold text-teal-900">Social Media Links</h3>
                    <p class="mt-1 text-sm text-gray-600">Add a valid HTTP or HTTPS link for each social account.</p>
                </div>
                <div class="grid gap-5 md:grid-cols-2">
                    @foreach (['facebook' => 'Facebook', 'twitter' => 'Twitter', 'instagram' => 'Instagram', 'pinterest' => 'Pinterest'] as $network => $label)
                        <div>
                            <label for="social_links_{{ $network }}" class="mb-1.5 block text-sm font-medium">{{ $label }}</label>
                            <input id="social_links_{{ $network }}" name="social_links[{{ $network }}]" type="url"
                                   value="{{ old('social_links.'.$network, $settings->social_links[$network] ?? '') }}" maxlength="2048"
                                   placeholder="https://{{ strtolower($label) }}.com/your-page"
                                   class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20">
                            @error('social_links.'.$network)<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                        </div>
                    @endforeach
                </div>
            </section>

            <section id="settings-panel-seo" role="tabpanel" aria-labelledby="settings-tab-seo"
                     data-settings-panel="seo" @if ($activeTab !== 'seo') hidden @endif
                     class="max-w-4xl rounded-2xl border border-[#dde5d6] bg-white p-6 shadow-sm sm:p-8">
                <div class="mb-6 border-b border-[#e5e9df] pb-4">
                    <h3 class="text-lg font-semibold text-teal-900">SEO Settings</h3>
                    <p class="mt-1 text-sm text-gray-600">Set the default metadata used by search engines.</p>
                </div>
                <div class="space-y-5">
                    <div>
                        <label for="meta_tags_title" class="mb-1.5 block text-sm font-medium">Meta Title</label>
                        <input id="meta_tags_title" name="meta_tags[title]" value="{{ old('meta_tags.title', $settings->meta_tags['title'] ?? '') }}" maxlength="255" required
                               placeholder="e.g. DealzyCoup - Find the Best Deals"
                               class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20">
                        @error('meta_tags.title')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                    </div>
                    <div>
                        <label for="meta_tags_description" class="mb-1.5 block text-sm font-medium">Meta Description</label>
                        <textarea id="meta_tags_description" name="meta_tags[description]" rows="3" maxlength="500" required
                                  placeholder="Brief description for search engines"
                                  class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20">{{ old('meta_tags.description', $settings->meta_tags['description'] ?? '') }}</textarea>
                        @error('meta_tags.description')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                    </div>
                    <div>
                        <label for="meta_tags_keywords" class="mb-1.5 block text-sm font-medium">Meta Keywords</label>
                        <input id="meta_tags_keywords" name="meta_tags[keywords]" value="{{ old('meta_tags.keywords', $settings->meta_tags['keywords'] ?? '') }}" maxlength="500" required
                               placeholder="e.g. coupons, deals, promo codes, discounts"
                               class="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20">
                        <p class="mt-1 text-xs text-gray-500">Separate keywords with commas.</p>
                        @error('meta_tags.keywords')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                    </div>
                </div>
            </section>

            <footer class="flex max-w-4xl justify-end border-t border-[#e5e9df] pt-5">
                <button type="submit" class="inline-flex cursor-pointer items-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800">
                    <x-icon name="check" class="h-4 w-4" />
                    Save Settings
                </button>
            </footer>
        </form>
    </div>
@endsection
