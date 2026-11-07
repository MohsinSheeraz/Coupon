{{-- Same page shell without navbar, footer or visitor tracking (admin pages and the login page). --}}
<!DOCTYPE html>
<html lang="en" class="light" style="color-scheme: light;">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'DealzyCoup - Find the Best Deals')</title>
    <meta name="description" content="@yield('description', 'Discover the best coupons and deals from your favorite stores')">
    <meta name="robots" content="noindex">
    <link rel="icon" href="/favicon.ico">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=DM+Sans:opsz,wght@9..40,100..1000&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/app.css') }}?v={{ @filemtime(public_path('css/app.css')) }}">
    @stack('head')
</head>
<body>
    <div class="flex min-h-screen flex-col bg-paper">
        <main class="flex-1">
            @yield('content')
        </main>
    </div>

    <script src="{{ asset('js/site.js') }}?v={{ @filemtime(public_path('js/site.js')) }}" defer></script>
    @stack('scripts')
</body>
</html>
