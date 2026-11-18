@extends('layouts.app')

@section('title', 'Contact Us | DealzyCoup')
@section('description', 'Send a message to the DealzyCoup team.')

@section('content')
    <div class="container mx-auto px-4 py-12">
        <section class="mx-auto max-w-6xl">
            <header class="mb-8 max-w-2xl">
                <p class="mb-3 inline-flex items-center gap-2 rounded-full border border-[#dce3d4] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#5b7048]">
                    <x-icon name="users" class="h-4 w-4" aria-hidden="true" /> Contact DealzyCoup
                </p>
                <h1 class="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">How can we help?</h1>
                <p class="mt-3 text-base leading-relaxed text-gray-600">Send us a message and our team will get back to you.</p>
            </header>

            <div class="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <aside class="rounded-3xl bg-ink p-6 text-white sm:p-8">
                    <div class="grid size-12 place-items-center rounded-2xl bg-white/10 text-citrus"><x-icon name="link" class="h-6 w-6" /></div>
                    <h2 class="mt-6 font-display text-2xl font-semibold">Email us directly</h2>
                    <p class="mt-2 max-w-sm leading-relaxed text-white/70">Have a question about a deal or need help? We are happy to hear from you.</p>
                    <a href="mailto:info@dealzycoup.com" class="mt-5 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-citrus transition hover:bg-white/10">
                        info@dealzycoup.com
                    </a>
                </aside>

                <form method="POST" action="{{ route('contact.store') }}" class="rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-sm sm:p-8">
                    @csrf
                    @if (session('status'))
                        <p role="status" class="mb-5 text-sm text-emerald-700">{{ session('status') }}</p>
                    @endif
                    @error('contact')
                        <p role="alert" class="mb-5 text-sm text-red-700">{{ $message }}</p>
                    @enderror
                    <div class="grid gap-5 sm:grid-cols-2">
                        <label class="text-sm font-medium text-ink">
                            Your name
                            <input name="name" required minlength="2" maxlength="100" autocomplete="name" value="{{ old('name') }}" placeholder="e.g. Alex Morgan"
                                   class="mt-2 h-12 w-full rounded-xl border border-[#dce3d4] bg-white px-4">
                            @error('name') <span class="mt-1 block text-xs text-red-700">{{ $message }}</span> @enderror
                        </label>
                        <label class="text-sm font-medium text-ink">
                            Email address
                            <input name="email" type="email" required maxlength="254" autocomplete="email" value="{{ old('email') }}" placeholder="you@example.com"
                                   class="mt-2 h-12 w-full rounded-xl border border-[#dce3d4] bg-white px-4">
                            @error('email') <span class="mt-1 block text-xs text-red-700">{{ $message }}</span> @enderror
                        </label>
                        <label class="text-sm font-medium text-ink sm:col-span-2">
                            Subject
                            <input name="subject" required minlength="2" maxlength="120" value="{{ old('subject') }}" placeholder="What can we help with?"
                                   class="mt-2 h-12 w-full rounded-xl border border-[#dce3d4] bg-white px-4">
                            @error('subject') <span class="mt-1 block text-xs text-red-700">{{ $message }}</span> @enderror
                        </label>
                        <label class="text-sm font-medium text-ink sm:col-span-2">
                            Message
                            <textarea name="message" required minlength="10" maxlength="5000" rows="6" placeholder="Tell us a little more about your question..."
                                      class="mt-2 min-h-40 w-full rounded-xl border border-[#dce3d4] bg-white px-4 py-3">{{ old('message') }}</textarea>
                            @error('message') <span class="mt-1 block text-xs text-red-700">{{ $message }}</span> @enderror
                        </label>
                    </div>
                    <label aria-hidden="true" class="absolute -left-[10000px] h-px w-px overflow-hidden">
                        Leave this field empty
                        <input name="company" tabindex="-1" autocomplete="off">
                    </label>
                    <button type="submit" class="mt-6 inline-flex h-12 items-center gap-3 rounded-full bg-ink px-6 text-white hover:bg-grape">
                        Send message <x-icon name="arrow-right" class="h-5 w-5" />
                    </button>
                </form>
            </div>
        </section>
    </div>
@endsection
