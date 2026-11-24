<form method="GET" action="{{ $action }}" role="search" class="flex w-48 max-w-full items-center gap-1.5">
    <label for="{{ $id }}" class="sr-only">{{ $label }}</label>
    <input
        id="{{ $id }}"
        name="search"
        type="search"
        value="{{ $search }}"
        maxlength="100"
        placeholder="{{ $placeholder }}"
        class="h-10 min-w-0 flex-1 rounded-full border border-ink/15 bg-white px-3 text-sm focus:border-grape focus:outline-none focus:ring-2 focus:ring-grape/20"
    >
    <button type="submit" aria-label="{{ $label }}" title="{{ $label }}"
        class="grid size-10 shrink-0 place-items-center rounded-full bg-teal-700 text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
        <x-icon name="search" class="h-4 w-4" />
    </button>
</form>
