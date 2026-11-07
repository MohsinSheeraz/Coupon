@extends('layouts.app')

@section('title', 'Page not found')

@section('content')
    <div class="not-found-shell">
        <div class="not-found-card">
            <div class="not-found-code">404</div>

            <h1>Page not found</h1>
            <p>
                The page you were looking for may have moved, been removed, or never existed.
            </p>

            <div class="not-found-actions">
                <a
                    href="/"
                    class="inline-flex items-center gap-2 bg-[#222720] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#35492b]"
                >
                    <x-icon name="house" class="h-4 w-4" />
                    Back home
                </a>

                <a
                    href="/stores"
                    class="inline-flex items-center gap-2 border border-[#526a3c]/30 bg-white px-5 py-3 text-sm font-semibold text-[#222720] hover:border-[#526a3c] hover:text-[#35492b]"
                >
                    <x-icon name="arrow-left" class="h-4 w-4" />
                    Explore stores
                </a>
            </div>
        </div>
    </div>
@endsection
