@extends('layouts.app')

@section('canonical', route('home'))

@php
    $slides = [
        [
            'eyebrow' => 'THE GOOD STUFF, FOR LESS',
            'title' => 'A better way to find your next great deal.',
            'description' => 'Fresh finds, verified codes, and the stores you love. Your next little win starts here.',
            'cta' => 'Explore coupons',
            'href' => '/coupons',
            'image' => 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1920&q=70',
        ],
        [
            'eyebrow' => 'MORE STYLE. LESS SPEND.',
            'title' => 'The things you love. At prices you’ll love more.',
            'description' => 'Make room for the good stuff with offers worth opening.',
            'cta' => 'Shop the deals',
            'href' => '/deals',
            'image' => 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=70',
        ],
        [
            'eyebrow' => 'YOUR FAVORITES, ALL HERE',
            'title' => 'Good stores. Great finds. Better prices.',
            'description' => 'Browse the brands on your list and discover a few new favorites along the way.',
            'cta' => 'Discover stores',
            'href' => '/stores',
            'image' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=70',
        ],
    ];
    $fallbackCategories = [
        ['name' => 'Electronics', 'image' => 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=70'],
        ['name' => 'Fashion', 'image' => 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=70'],
        ['name' => 'Home & Garden', 'image' => 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=70'],
        ['name' => 'Travel', 'image' => 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=70'],
        ['name' => 'Beauty', 'image' => 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=70'],
        ['name' => 'Sports & Outdoors', 'image' => 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=70'],
        ['name' => 'Grocery', 'image' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=70'],
        ['name' => 'Toys & Games', 'image' => 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=800&q=70'],
        ['name' => 'Automotive', 'image' => 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=70'],
        ['name' => 'Pets', 'image' => 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=70'],
    ];
    $categoryTiles = $categories->isEmpty() ? collect($fallbackCategories) : $categories;
@endphp

@section('content')
    <div class="homepage">
        <section class="hero-stage" aria-label="Featured offers" aria-roledescription="carousel" data-home-carousel>
            <div class="hero-stage-inner">
                @foreach ($slides as $index => $slide)
                    <div class="hero-slide {{ $index === 0 ? 'is-active' : '' }}" data-home-slide="{{ $index }}"
                         aria-hidden="{{ $index === 0 ? 'false' : 'true' }}" role="group"
                         aria-roledescription="slide" aria-label="{{ $index + 1 }} of {{ count($slides) }}">
                        <div class="hero-photo" style="background-image: url('{{ $slide['image'] }}'), linear-gradient(135deg,#7b776d,#282b25)"></div>
                        <div class="hero-photo-shade"></div>
                        <div class="hero-copy">
                            <span class="eyebrow"><x-icon name="sparkles" class="h-4 w-4" /> {{ $slide['eyebrow'] }}</span>
                            @if ($index === 0)
                                <h1>{{ $slide['title'] }}</h1>
                            @else
                                <h2>{{ $slide['title'] }}</h2>
                            @endif
                            <p>{{ $slide['description'] }}</p>
                            <a href="{{ $slide['href'] }}" class="button-lime">
                                {{ $slide['cta'] }} <x-icon name="arrow-up-right" class="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                @endforeach

                <div class="hero-bottom">
                    <div class="hero-count"><span data-home-count>01</span><i></i>0{{ count($slides) }}</div>
                    <div class="hero-dots" aria-label="Choose a featured offer">
                        @foreach ($slides as $index => $slide)
                            <button type="button" data-home-dot="{{ $index }}" aria-label="Show slide {{ $index + 1 }}"
                                    aria-current="{{ $index === 0 ? 'true' : 'false' }}"
                                    class="{{ $index === 0 ? 'active' : '' }}"></button>
                        @endforeach
                    </div>
                    <div class="hero-arrows">
                        <button type="button" data-home-prev aria-label="Previous slide"><x-icon name="chevron-left" class="h-5 w-5" /></button>
                        <button type="button" data-home-next aria-label="Next slide"><x-icon name="chevron-right" class="h-5 w-5" /></button>
                    </div>
                </div>
            </div>
        </section>

        <div class="container mx-auto px-4">
            <div class="trust-strip">
                <span><x-icon name="badge-check" class="h-5 w-5" /> Offers worth checking out</span>
                <span><x-icon name="tag" class="h-5 w-5" /> Deals from your favorite stores</span>
                <span><x-icon name="trending-up" class="h-5 w-5" /> Fresh ways to save</span>
            </div>
        </div>

        <section class="home-section category-section">
            <div class="container mx-auto px-4">
                <div class="section-heading">
                    <div>
                        <span class="eyebrow text-olive">A LITTLE SOMETHING FOR EVERYONE</span>
                        <h2>Explore your kind of find.</h2>
                    </div>
                    <a class="text-link" href="/stores">All stores <x-icon name="arrow-up-right" class="h-5 w-5" /></a>
                </div>
                <h3 class="mobile-category-heading">Categories</h3>
                <div class="category-slider">
                    <div class="category-track">
                        @for ($group = 0; $group < 2; $group++)
                            <div class="category-group" @if ($group === 1) aria-hidden="true" @endif>
                                @foreach ($categoryTiles as $index => $category)
                                    <a class="category-tile" href="/stores?category={{ urlencode($category['name'] ?? $category->name) }}"
                                       @if ($group === 1) tabindex="-1" @endif>
                                        <div class="category-image" aria-hidden="true"
                                             style="background-image: url('{{ $category['image'] ?? $category->image }}'), linear-gradient(135deg,#4326d4 0%,#17132e 100%)"></div>
                                        <div class="category-shade"></div>
                                        <span class="category-number">{{ str_pad($index + 1, 2, '0', STR_PAD_LEFT) }} / {{ str_pad($categoryTiles->count(), 2, '0', STR_PAD_LEFT) }}</span>
                                        <span class="category-label"><span>{{ $category['name'] ?? $category->name }}</span></span>
                                    </a>
                                @endforeach
                            </div>
                        @endfor
                    </div>
                </div>
            </div>
        </section>

        <section class="home-section stores-section">
            <div class="container mx-auto px-4">
                <div class="section-heading">
                    <div>
                        <span class="eyebrow text-olive">GOOD COMPANY</span>
                        <h2>Stores you’ll come back to.</h2>
                    </div>
                    <a class="text-link" href="/stores">Browse stores <x-icon name="arrow-up-right" class="h-5 w-5" /></a>
                </div>
                @if ($stores->isNotEmpty())
                    <div class="store-carousel" data-store-carousel>
                        <button type="button" class="store-carousel-nav store-carousel-nav--previous" data-store-prev
                                aria-label="Previous stores" aria-controls="popular-stores-track">
                            <x-icon name="chevron-left" class="h-5 w-5" />
                        </button>
                        <div id="popular-stores-track" class="store-carousel-track" data-store-track tabindex="0"
                             role="region" aria-label="Popular stores carousel">
                        @foreach ($stores as $store)
                            <a href="{{ route('stores.show', $store) }}" class="store-carousel-slide group">
                                <div class="relative flex h-[248px] flex-col items-center overflow-hidden rounded-3xl bg-white px-5 pb-5 pt-6 text-center shadow-lg ring-1 ring-ink/5 transition duration-500 group-hover:-translate-y-1.5">
                                    <div class="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-mist to-white"></div>
                                    <div class="relative grid size-20 place-items-center rounded-2xl bg-white shadow-lg ring-1 ring-ink/5">
                                        <img src="{{ $store->logo ?: '/placeholder.svg' }}" alt="{{ $store->name }}" class="h-12 w-12 object-contain" loading="lazy">
                                    </div>
                                    <h3 class="relative mt-3 max-w-full truncate font-display text-lg font-semibold text-ink">{{ $store->name }}</h3>
                                    <div class="relative mt-auto flex flex-wrap justify-center gap-1.5 text-xs">
                                        <span class="rounded-full bg-grape/10 px-2.5 py-1 font-medium text-grape">{{ $store->coupon_count }} {{ $store->coupon_count === 1 ? 'Coupon' : 'Coupons' }}</span>
                                        <span class="rounded-full bg-citrus/40 px-2.5 py-1 font-medium text-ink">{{ $store->deal_count }} {{ $store->deal_count === 1 ? 'Deal' : 'Deals' }}</span>
                                    </div>
                                </div>
                            </a>
                        @endforeach
                        </div>
                        <button type="button" class="store-carousel-nav store-carousel-nav--next" data-store-next
                                aria-label="Next stores" aria-controls="popular-stores-track">
                            <x-icon name="chevron-right" class="h-5 w-5" />
                        </button>
                    </div>
                    <p class="mt-1 flex items-center justify-center gap-2 text-xs font-medium text-ink/55 md:hidden">
                        <x-icon name="move-horizontal" class="h-4 w-4 text-grape" />
                        Swipe or use arrows to explore
                    </p>
                @endif
            </div>
        </section>

        <section class="home-section trending-section">
            <div class="container mx-auto px-4">
                <div class="section-heading">
                    <div>
                        <span class="eyebrow text-olive">RIGHT NOW</span>
                        <h2>The offers worth a look.</h2>
                    </div>
                    <a class="text-link" href="/coupons">All coupons <x-icon name="arrow-up-right" class="h-5 w-5" /></a>
                </div>
                <div class="stagger grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
                    @foreach ($coupons as $coupon)
                        <x-coupon-card :coupon="$coupon" />
                    @endforeach
                </div>
            </div>
        </section>

        <div class="container mx-auto px-4 pb-20">
            <section class="discover-banner">
                <div>
                    <span class="eyebrow">THE SEARCH STARTS HERE</span>
                    <h2>Something in mind?<br><em>There’s a deal for that.</em></h2>
                </div>
                <x-icon name="arrow-right" class="discover-decoration h-44 w-44" aria-hidden="true" />
            </section>
        </div>
    </div>
@endsection

@push('scripts')
    <script>
        (() => {
            const carousel = document.querySelector('[data-home-carousel]');
            if (!carousel) return;

            const slides = Array.from(carousel.querySelectorAll('[data-home-slide]'));
            const dots = Array.from(carousel.querySelectorAll('[data-home-dot]'));
            const count = carousel.querySelector('[data-home-count]');
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
            let current = 0;
            let timer;

            const show = (index) => {
                current = (index + slides.length) % slides.length;
                slides.forEach((slide, i) => {
                    const active = i === current;
                    slide.classList.toggle('is-active', active);
                    slide.setAttribute('aria-hidden', active ? 'false' : 'true');
                });
                dots.forEach((dot, i) => {
                    const active = i === current;
                    dot.classList.toggle('active', active);
                    dot.setAttribute('aria-current', active ? 'true' : 'false');
                });
                if (count) count.textContent = `0${current + 1}`;
            };

            const stop = () => window.clearInterval(timer);
            const start = () => {
                stop();
                if (!reducedMotion.matches) timer = window.setInterval(() => show(current + 1), 6500);
            };

            carousel.querySelector('[data-home-prev]')?.addEventListener('click', () => show(current - 1));
            carousel.querySelector('[data-home-next]')?.addEventListener('click', () => show(current + 1));
            dots.forEach((dot) => dot.addEventListener('click', () => show(Number(dot.dataset.homeDot))));
            carousel.addEventListener('mouseenter', stop);
            carousel.addEventListener('mouseleave', start);
            carousel.addEventListener('focusin', stop);
            carousel.addEventListener('focusout', (event) => {
                if (!carousel.contains(event.relatedTarget)) start();
            });
            reducedMotion.addEventListener('change', start);
            start();
        })();

        (() => {
            const track = document.querySelector('[data-store-track]');
            if (!track) return;

            track.setAttribute('tabindex', '0');
            track.addEventListener('keydown', (event) => {
                if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                event.preventDefault();
                track.scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * track.clientWidth * 0.8, behavior: 'smooth' });
            });
        })();
    </script>
@endpush
