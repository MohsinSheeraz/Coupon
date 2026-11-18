@props(['coupon'])
@php
    $isCode = $coupon->type === 'code';
    $offerImage = $coupon->logo ?: ($coupon->store->logo ?: '/placeholder.svg');
    $storeName = $coupon->store->name;
    $maskedCode = $coupon->code
        ? substr($coupon->code, 0, 2).str_repeat('•', max(3, min(6, strlen($coupon->code) - 2)))
        : '••••••';
    $expiryTimestamp = $coupon->expiry_date ? strtotime($coupon->expiry_date) : false;
    $expiryLabel = null;
    $expiryTone = 'ok';

    if ($expiryTimestamp !== false) {
        $expiresAt = \Illuminate\Support\Carbon::createFromTimestamp($expiryTimestamp, 'UTC')->endOfDay();
        $secondsLeft = $expiresAt->timestamp - now('UTC')->timestamp;
        $daysLeft = (int) ceil($secondsLeft / 86400);

        if ($secondsLeft < 0) {
            $expiryLabel = 'Expired';
            $expiryTone = 'expired';
        } elseif ($secondsLeft <= 86400) {
            $expiryLabel = 'Ends today';
            $expiryTone = 'soon';
        } else {
            $expiryLabel = $daysLeft.' days left';
            $expiryTone = $daysLeft <= 3 ? 'soon' : 'ok';
        }
    }
    $affiliateLink = $coupon->affiliate_link ?: $coupon->store->website;
    $affiliateScheme = $affiliateLink ? parse_url($affiliateLink, PHP_URL_SCHEME) : null;

    if ($affiliateScheme && ! in_array(strtolower($affiliateScheme), ['http', 'https'], true)) {
        $affiliateLink = null;
    }
@endphp

<article class="ticket-shell h-full">
    <div class="ticket group flex h-full flex-col overflow-hidden bg-white transition-colors">
        <div class="relative aspect-[4/3] max-h-72 w-full overflow-hidden bg-paper">
            <div aria-hidden="true" class="absolute inset-0 scale-150 bg-cover bg-center opacity-30 blur-2xl"
                 style="background-image: url('{{ $offerImage }}')"></div>
            <img src="{{ $offerImage }}" alt="{{ $coupon->title }}" loading="lazy"
                 class="relative size-full object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-105 sm:p-3">
            <span class="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold sm:left-3 sm:top-3 sm:text-xs {{ $isCode ? 'bg-grape text-white' : 'bg-citrus text-ink' }}">
                <x-icon name="{{ $isCode ? 'tag' : 'percent' }}" class="h-3 w-3" />
                {{ $isCode ? 'Code' : 'Deal' }}
            </span>
            @if ($expiryLabel)
                <span class="absolute right-2 top-2 inline-flex max-w-[58%] items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium sm:right-3 sm:top-3 sm:text-xs {{ $expiryTone === 'expired' ? 'bg-red-100 text-red-700' : ($expiryTone === 'soon' ? 'bg-amber-100 text-amber-800' : 'bg-white/90 text-ink/70 ring-1 ring-ink/10') }}">
                    <x-icon name="clock" class="h-3 w-3" />
                    <span class="truncate">{{ $expiryLabel }}</span>
                </span>
            @endif
            <span class="absolute bottom-2 left-2 inline-flex max-w-[85%] items-center gap-1 rounded-full bg-white py-1 pl-1 pr-2 text-[10px] font-medium text-ink ring-1 ring-ink/10 sm:bottom-3 sm:left-3 sm:gap-1.5 sm:pr-3 sm:text-xs">
                <span class="grid size-5 shrink-0 place-items-center overflow-hidden rounded-full bg-paper">
                    <img src="{{ $coupon->store->logo ?: '/placeholder.svg' }}" alt="" class="size-4 object-contain">
                </span>
                <span class="truncate">{{ $storeName }}</span>
            </span>
        </div>

        <div class="flex flex-1 flex-col gap-1.5 px-2.5 pb-3 pt-2.5 sm:gap-2 sm:px-4 sm:pb-4 sm:pt-3.5">
            <h2 class="line-clamp-2 font-display text-sm font-semibold leading-snug text-ink sm:text-base">{{ $coupon->title }}</h2>
            @if ($coupon->description)
                <p class="line-clamp-2 text-xs leading-relaxed text-ink/60 sm:text-sm">{{ $coupon->description }}</p>
            @endif
            <p class="flex items-center gap-1 text-[10px] text-ink/55 sm:text-xs">
                <x-icon name="badge-check" class="h-3 w-3 shrink-0 text-mint sm:h-3.5 sm:w-3.5" />
                <span class="truncate">Verified {{ $coupon->verified_time }} · Used {{ $coupon->used_count }} times</span>
            </p>
            <div class="mt-auto flex items-center gap-2 pt-2">
                @if ($affiliateLink)
                    <a href="{{ $affiliateLink }}" target="_blank" rel="noopener noreferrer"
                       aria-label="Visit {{ $storeName }}"
                       class="hidden size-10 shrink-0 place-items-center rounded-full border border-ink/15 text-ink transition-colors hover:border-grape hover:text-grape sm:grid">
                        <x-icon name="external-link" class="h-4 w-4" />
                    </a>
                @endif
                <button type="button"
                        class="inline-flex h-9 flex-1 cursor-pointer items-center justify-between rounded-full px-2.5 text-[10px] font-semibold sm:h-10 sm:px-4 sm:text-sm {{ $isCode ? 'bg-grape text-white hover:bg-grape-deep' : 'bg-citrus text-ink hover:bg-citrus/80' }}"
                        data-offer-trigger
                        data-offer-id="{{ $coupon->id }}"
                        data-offer-title="{{ $coupon->title }}"
                        data-offer-type="{{ $coupon->type }}"
                        data-offer-code="{{ $coupon->code }}"
                        data-offer-description="{{ $coupon->description }}"
                        data-offer-image="{{ $offerImage }}"
                        data-offer-store="{{ $storeName }}"
                        data-offer-store-logo="{{ $coupon->store->logo }}"
                        data-offer-verified="{{ $coupon->verified_time }}"
                        data-offer-used="{{ $coupon->used_count }}"
                        data-offer-expiry="{{ $expiryLabel }}"
                        data-offer-affiliate="{{ $affiliateLink }}">
                    <span class="font-mono tracking-tight text-white/80 sm:tracking-widest">{{ $isCode ? $maskedCode : '' }}</span>
                    <span>{{ $isCode ? 'Get code' : 'Get deal' }}</span>
                </button>
            </div>
        </div>
    </div>
</article>
