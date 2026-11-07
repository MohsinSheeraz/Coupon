<footer class="bg-ink py-14 text-white/65">
    <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 gap-10 md:grid-cols-4">
            <div>
                <a href="/" class="group inline-flex items-center gap-2.5">
                    <span class="grid size-9 place-items-center rounded-xl bg-grape text-white transition-transform duration-300 group-hover:-rotate-12">
                        <x-icon name="ticket" class="size-5" />
                    </span>
                    <span class="font-display text-xl font-semibold text-white">DealzyCoup</span>
                </a>
                <p class="mt-4 max-w-xs leading-relaxed">
                    Your destination for the best deals and discounts online.
                </p>
            </div>
            <div>
                <h3 class="mb-4 font-display text-base font-semibold text-white">Quick Links</h3>
                <ul class="space-y-2.5">
                    <li>
                        <a href="/coupons" class="transition-colors hover:text-citrus">Coupons</a>
                    </li>
                    <li>
                        <a href="/stores" class="transition-colors hover:text-citrus">Stores</a>
                    </li>
                </ul>
            </div>
            <div>
                <h3 class="mb-4 font-display text-base font-semibold text-white">Categories</h3>
                <ul class="space-y-2.5">
                    @foreach ($footerCategories as $category)
                        <li>
                            <a href="/stores?category={{ rawurlencode($category['query']) }}" class="transition-colors hover:text-citrus">
                                {{ $category['label'] }}
                            </a>
                        </li>
                    @endforeach
                </ul>
            </div>
            <div>
                <h3 class="mb-4 font-display text-base font-semibold text-white">Contact</h3>
                <ul class="space-y-2.5">
                    <li><a href="mailto:support@dealzycoup.com">support@dealzycoup.com</a></li>
                    <li><a href="tel:+923121069685">+92 312 1069685</a></li>
                </ul>
            </div>
        </div>
        <div class="mt-12 border-t border-white/10 pt-6 text-sm">
            <p>© {{ date('Y') }} DealzyCoup. All rights reserved.</p>
        </div>
    </div>
</footer>
