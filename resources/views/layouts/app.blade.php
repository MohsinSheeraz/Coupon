<!DOCTYPE html>
<html lang="en" class="light" style="color-scheme: light;">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'DealzyCoup - Find the Best Deals')</title>
    <meta name="description" content="@yield('description', 'Discover the best coupons and deals from your favorite stores')">
    <link rel="icon" href="/favicon.ico">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=DM+Sans:opsz,wght@9..40,100..1000&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css'])
    @stack('head')
</head>
<body data-presence="1">
    <div class="flex min-h-screen flex-col bg-paper">
        @include('partials.navbar')

        <main class="flex-1">
            @yield('content')
        </main>

        @include('partials.footer')
    </div>

    <dialog id="offer-dialog" class="offer-dialog">
        <button type="button" class="offer-dialog-close" data-offer-close aria-label="Close offer details">
            <x-icon name="x" class="h-5 w-5" />
        </button>
        <div class="offer-dialog-header">
            <img data-offer-image alt="" class="offer-dialog-image">
            <span class="offer-dialog-store">
                <img data-offer-store-logo alt="" class="h-5 w-5 object-contain">
                <span data-offer-store></span>
            </span>
            <h2 data-offer-title class="font-display text-xl font-semibold leading-snug text-ink"></h2>
            <p data-offer-meta class="text-sm text-ink/60"></p>
        </div>
        <div class="offer-dialog-body">
            <div data-offer-code-wrap class="offer-code-box">
                <span data-offer-code class="select-all break-all font-mono text-2xl font-bold tracking-wider text-grape"></span>
                <button type="button" data-offer-copy aria-label="Copy code" class="grid size-11 shrink-0 place-items-center rounded-full text-grape hover:bg-grape/10">
                    <x-icon name="copy" class="h-6 w-6" />
                </button>
            </div>
            <button type="button" data-offer-copy-button class="offer-copy-button">Copy Code</button>
            <p data-offer-description class="mt-5 px-2 text-center text-sm leading-relaxed text-ink/60"></p>
            <p data-offer-deal-usage class="mt-4 text-center text-sm text-ink/55"></p>
            <p data-offer-status class="mt-3 text-center text-sm" role="status" aria-live="polite"></p>
            <div data-offer-link-wrap class="offer-dialog-link">
                <p class="truncate text-sm text-ink/65">Visit <span data-offer-link-store></span></p>
                <a data-offer-link class="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-grape px-4 text-sm font-semibold text-white hover:bg-grape-deep" target="_blank" rel="noopener noreferrer">
                    Visit store <x-icon name="external-link" class="h-4 w-4" />
                </a>
            </div>
        </div>
    </dialog>

    <script src="{{ asset('js/site.js') }}?v={{ @filemtime(public_path('js/site.js')) }}" defer></script>
    @stack('scripts')
</body>
</html>
