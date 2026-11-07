{{-- Header search box. Pass class="..." to control layout. --}}
<form action="/search" method="get" data-site-search class="flex items-center {{ $class ?? '' }}">
    <div class="relative w-full">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <x-icon name="search" class="h-4 w-4 text-ink/40" />
        </div>
        <input
            type="search"
            name="q"
            placeholder="Search for stores or coupons..."
            aria-label="Search for stores or coupons"
            class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 min-w-0 flex border px-3 py-1 text-base outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-10 w-full rounded-full border-ink/10 bg-white pl-10 text-black shadow-none transition-all focus-visible:border-grape focus-visible:ring-grape/25"
        >
    </div>
    <button type="submit" class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive py-2 has-[>svg]:px-3 shadow-xs ml-2 h-10 rounded-full bg-ink px-5 text-white hover:bg-grape">
        Search
    </button>
</form>
