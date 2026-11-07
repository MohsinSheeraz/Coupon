@php
    $navLinks = [
        ['href' => '/', 'label' => 'Home'],
        ['href' => '/coupons', 'label' => 'Coupons'],
        ['href' => '/deals', 'label' => 'Deals'],
        ['href' => '/stores', 'label' => 'Stores'],
    ];
    $currentPath = '/'.ltrim(request()->path(), '/');
    $isActive = fn (string $href) => $href === '/' ? $currentPath === '/' : str_starts_with($currentPath, $href);
    $isListingPage = collect(['/stores', '/deals', '/coupons'])
        ->contains(fn ($route) => $currentPath === $route || str_starts_with($currentPath, $route.'/'));
@endphp

<header
    id="site-header"
    class="sticky top-0 z-50 transition-all duration-300 bg-paper/90 backdrop-blur-sm"
    data-idle="bg-paper/90 backdrop-blur-sm"
    data-scrolled="bg-white/80 shadow-[0_1px_0_rgb(23_19_46/0.06),0_14px_30px_-16px_rgb(23_19_46/0.25)] backdrop-blur-xl"
>
    <div class="container mx-auto px-4">
        <div class="flex h-16 items-center justify-between">
            <a href="/" class="group flex items-center gap-2.5">
                <img src="/LogoMain.png" width="200" height="200" alt="" decoding="async">
            </a>

            @include('partials.site-search', ['class' => 'mx-8 hidden max-w-md flex-1 items-center md:flex'])

            <nav class="hidden items-center gap-1 md:flex">
                @foreach ($navLinks as $link)
                    <a
                        href="{{ $link['href'] }}"
                        class="group relative px-3 py-2 text-sm font-medium transition-colors {{ $isActive($link['href']) ? 'text-grape' : 'text-ink/70 hover:text-ink' }}"
                    >
                        {{ $link['label'] }}
                        <span class="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-grape transition-transform duration-300 {{ $isActive($link['href']) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100' }}"></span>
                    </a>
                @endforeach
            </nav>

            <div class="flex items-center md:hidden">
                <button
                    id="mobile-menu-button"
                    type="button"
                    class="grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-mist"
                    aria-label="Toggle menu"
                    aria-expanded="false"
                >
                    <x-icon name="menu" class="h-6 w-6" data-icon-open />
                    <x-icon name="x" class="hidden h-6 w-6" data-icon-close />
                </button>
            </div>
        </div>

        @unless ($isListingPage)
            @include('partials.site-search', ['class' => 'pb-3 md:hidden'])
        @endunless

        {{-- Mobile menu --}}
        <div id="mobile-menu" class="anim-menu hidden py-4 md:hidden">
            <div class="flex flex-col gap-1">
                @foreach ($navLinks as $link)
                    <a
                        href="{{ $link['href'] }}"
                        class="rounded-xl px-4 py-3 font-medium transition-colors {{ $isActive($link['href']) ? 'bg-grape/10 text-grape' : 'text-ink/80 hover:bg-mist' }}"
                    >
                        {{ $link['label'] }}
                    </a>
                @endforeach
            </div>
        </div>
    </div>
</header>
