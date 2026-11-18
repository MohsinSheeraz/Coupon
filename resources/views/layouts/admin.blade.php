<!DOCTYPE html>
<html lang="en" class="light" style="color-scheme: light;">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Admin Panel | DealzyCoup')</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=DM+Sans:opsz,wght@9..40,100..1000&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css'])
</head>
<body>
    <div class="admin-shell flex min-h-screen">
        <aside class="admin-sidebar w-64" data-admin-sidebar>
            <div class="flex items-center justify-between gap-3 p-6">
                <a href="{{ route('admin.dashboard') }}" class="text-xl font-bold text-brand-400" data-sidebar-label>DealzyCoup</a>
                <button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-teal-600 hover:bg-dark-700" data-admin-sidebar-toggle aria-label="Collapse sidebar" title="Collapse sidebar" aria-expanded="true">
                    <span data-sidebar-collapse-icon aria-hidden="true">
                        <x-icon name="chevron-left" class="h-5 w-5" />
                    </span>
                    <span class="hidden" data-sidebar-expand-icon aria-hidden="true">
                        <x-icon name="chevron-right" class="h-5 w-5" />
                    </span>
                </button>
            </div>
            <p class="px-6 text-xs text-gray-500" data-sidebar-label>Admin Panel</p>
            <nav id="admin-navigation" class="mt-6">
                <a href="{{ route('admin.dashboard') }}" class="{{ request()->routeIs('admin.dashboard') ? 'bg-dark-700 font-medium text-brand-400' : '' }} flex items-center gap-3 px-6 py-3">
                    <x-icon name="layout-dashboard" class="h-5 w-5 shrink-0" />
                    <span data-sidebar-label>Dashboard</span>
                </a>
                <a href="{{ route('admin.stores.index') }}" class="{{ request()->routeIs('admin.stores.*') ? 'bg-dark-700 font-medium text-brand-400' : '' }} flex items-center gap-3 px-6 py-3">
                    <x-icon name="store" class="h-5 w-5 shrink-0" />
                    <span data-sidebar-label>Stores</span>
                </a>
                <a href="{{ route('admin.categories.index') }}" class="{{ request()->routeIs('admin.categories.*') ? 'bg-dark-700 font-medium text-brand-400' : '' }} flex items-center gap-3 px-6 py-3">
                    <x-icon name="layers" class="h-5 w-5 shrink-0" />
                    <span data-sidebar-label>Categories</span>
                </a>
                <a href="{{ route('admin.coupons.index') }}" class="{{ request()->routeIs('admin.coupons.*') ? 'bg-dark-700 font-medium text-brand-400' : '' }} flex items-center gap-3 px-6 py-3">
                    <x-icon name="ticket" class="h-5 w-5 shrink-0" />
                    <span data-sidebar-label>Coupons</span>
                </a>
                <a href="{{ route('admin.deals.index') }}" class="{{ request()->routeIs('admin.deals.*') ? 'bg-dark-700 font-medium text-brand-400' : '' }} flex items-center gap-3 px-6 py-3">
                    <x-icon name="badge-percent" class="h-5 w-5 shrink-0" />
                    <span data-sidebar-label>Deals</span>
                </a>
                <a href="{{ route('admin.settings.edit') }}" class="{{ request()->routeIs('admin.settings.*') ? 'bg-dark-700 font-medium text-brand-400' : '' }} flex items-center gap-3 px-6 py-3">
                    <x-icon name="settings" class="h-5 w-5 shrink-0" />
                    <span data-sidebar-label>Settings</span>
                </a>
            </nav>
            <div class="absolute bottom-0 flex w-64 flex-col gap-3 p-6">
                <a href="{{ route('home') }}" class="flex items-center gap-3 text-teal-600 hover:text-brand-400">
                    <x-icon name="house" class="h-5 w-5 shrink-0" />
                    <span data-sidebar-label>Back to Site</span>
                </a>
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" class="flex items-center gap-3 text-teal-600 hover:text-brand-400">
                        <x-icon name="log-out" class="h-5 w-5 shrink-0" />
                        <span data-sidebar-label>Sign Out</span>
                    </button>
                </form>
            </div>
        </aside>

        <div class="admin-content min-w-0 flex-1 overflow-auto px-5 pb-8 md:px-8">
            <header class="sticky top-0 z-30 mb-6 flex max-w-6xl flex-col gap-3 border-b border-[#e0e5d8] bg-[#f3f5ed]/95 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-3">
                    @unless (request()->routeIs('admin.dashboard'))
                        <button type="button" data-admin-back data-dashboard-url="{{ route('admin.dashboard') }}"
                            aria-label="Go back one page" title="Go back one page"
                            class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/10 bg-white text-ink transition hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grape">
                            <x-icon name="arrow-left" class="h-4 w-4" />
                        </button>
                    @endunless
                    <div>
                        <p class="text-xs font-semibold uppercase text-teal-700">DealzyCoup</p>
                        <h1 class="text-xl font-semibold">Admin Panel</h1>
                    </div>
                </div>
                <form method="GET" action="{{ route('search') }}" class="flex w-full gap-2 sm:max-w-xl">
                    <label class="sr-only" for="admin-search">Search stores and coupons</label>
                    <input id="admin-search" name="q" type="search" placeholder="Search for stores or coupons" class="min-w-0 flex-1 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm">
                    <button type="submit" class="rounded-full bg-grape px-5 py-2 text-sm font-semibold text-white hover:bg-grape-deep">Search</button>
                </form>
            </header>
            @yield('content')
        </div>
    </div>

    <script>
        const sidebar = document.querySelector('[data-admin-sidebar]');
        const sidebarToggle = document.querySelector('[data-admin-sidebar-toggle]');
        const collapseIcon = sidebarToggle.querySelector('[data-sidebar-collapse-icon]');
        const expandIcon = sidebarToggle.querySelector('[data-sidebar-expand-icon]');

        sidebarToggle.addEventListener('click', () => {
            const collapsed = sidebar.classList.toggle('admin-sidebar--collapsed');
            sidebarToggle.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
            sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
            sidebarToggle.setAttribute('title', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
            collapseIcon.classList.toggle('hidden', collapsed);
            expandIcon.classList.toggle('hidden', !collapsed);
        });

        const backButton = document.querySelector('[data-admin-back]');
        if (backButton) {
            backButton.addEventListener('click', () => {
                const referrer = document.referrer ? new URL(document.referrer) : null;
                const referrerIsAdmin = referrer
                    && referrer.origin === window.location.origin
                    && (referrer.pathname === '/admin' || referrer.pathname.startsWith('/admin/'));

                if (window.history.length > 1 && referrerIsAdmin) {
                    window.history.back();
                    return;
                }

                window.location.assign(backButton.dataset.dashboardUrl);
            });
        }
    </script>
    <script src="{{ asset('js/site.js') }}?v={{ @filemtime(public_path('js/site.js')) }}" defer></script>
    @stack('scripts')
</body>
</html>
