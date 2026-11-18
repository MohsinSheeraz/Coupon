@if ($paginator instanceof \Illuminate\Contracts\Pagination\LengthAwarePaginator && $paginator->hasPages())
    @php
        $visiblePageCount = 5;
        $firstPage = max(1, min(
            $paginator->currentPage() - intdiv($visiblePageCount, 2),
            $paginator->lastPage() - $visiblePageCount + 1,
        ));
        $lastPage = min($paginator->lastPage(), $firstPage + $visiblePageCount - 1);
    @endphp
    <nav class="flex flex-wrap items-center gap-2" aria-label="Pagination">
        <a href="{{ $paginator->previousPageUrl() ?: '#' }}" aria-label="Previous page"
            aria-disabled="{{ $paginator->onFirstPage() ? 'true' : 'false' }}"
          class="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-full border text-gray-700 transition-colors bg-white {{ $paginator->hasMorePages() ? '' : ' text-gray-400' }}">
            <x-icon name="chevron-left" class="h-5 w-5" />
        </a>
        @for ($page = $firstPage; $page <= $lastPage; $page++)
            <a href="{{ $paginator->url($page) }}" aria-current="{{ $page === $paginator->currentPage() ? 'page' : 'false' }}"
                class="inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors {{ $page === $paginator->currentPage() ? ' bg-teal-600 text-white' : 'text-gray-700 bg-white' }}">
                {{ $page }}
            </a>
        @endfor
        <a href="{{ $paginator->nextPageUrl() ?: '#' }}" aria-label="Next page"
            aria-disabled="{{ $paginator->hasMorePages() ? 'false' : 'true' }}"
            class="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-full border text-gray-700 transition-colors bg-white {{ $paginator->hasMorePages() ? '' : ' text-gray-400' }}">
            <x-icon name="chevron-right" class="h-5 w-5" />
        </a>
        <div id="{{ $pageSelectId ?? 'listing-page-select' }}" class="relative" data-pagination-select>
            <button type="button" data-pagination-trigger
                aria-label="Current page {{ $paginator->currentPage() }}. Choose page" aria-haspopup="listbox"
                aria-expanded="false" aria-controls="{{ $pageSelectId ?? 'listing-page-select' }}-options"
                class="cursor-pointer inline-flex h-10 min-w-16 items-center justify-between gap-2 rounded-full border border-[#dce3d4] bg-white px-3 text-sm font-semibold text-ink shadow-[0_2px_8px_rgba(27,39,26,0.08)] transition hover:shadow-md">
                <span>{{ $paginator->currentPage() }}</span>
                <x-icon name="chevron-down" class="h-3.5 w-3.5 transition-transform" data-pagination-chevron />
            </button>
            <div id="{{ $pageSelectId ?? 'listing-page-select' }}-options" role="listbox" aria-label="Choose page"
                class="absolute left-0 top-full z-[70] mt-2 hidden w-16 overflow-y-auto rounded-2xl border border-[#dce3d4] bg-white p-1.5 shadow-xl ring-1 ring-black/5"
                style="max-height: min(180px, 60vh)">
                @for ($page = 1; $page <= $paginator->lastPage(); $page++)
                    <a href="{{ $paginator->url($page) }}" role="option"
                        aria-selected="{{ $page === $paginator->currentPage() ? 'true' : 'false' }}"
                        class="flex items-center justify-start h-8 w-full rounded-xl px-3 text-left text-sm transition-colors {{ $page === $paginator->currentPage() ? 'bg-teal-600 font-semibold text-white' : 'text-gray-700
                         hover:bg-[#edf0e5] hover:text-ink' }}">
                        {{ $page }}
                    </a>
                @endfor
            </div>
        </div>
    </nav>
@endif