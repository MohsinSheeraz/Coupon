<!DOCTYPE html>
<html lang="en" class="light" style="color-scheme: light;">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Admin Login | DealzyCoup</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=DM+Sans:opsz,wght@9..40,100..1000&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css'])
</head>
<body>
    <main class="admin-login flex min-h-screen items-center justify-center p-4">
        <div class="admin-login-reveal" aria-hidden="true">
            <span class="admin-login-reveal-text">WOAHH</span>
            <img src="{{ asset('reality.png') }}" alt="" class="admin-login-reveal-image">
        </div>

        <form method="POST" action="{{ route('login.attempt') }}" class="w-full max-w-sm space-y-6 rounded-2xl bg-gray-900/80 p-8 shadow-xl backdrop-blur-sm">
            @csrf
            <div class="space-y-2 text-center">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-citrus">DealzyCoup</p>
                <h1 class="text-3xl font-extrabold text-white">Admin Login</h1>
            </div>

            @if (! $configured)
                <p class="rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100" role="status">
                    Admin access is not configured. Set Email and Password in your private environment, then run <code>php artisan admin:sync</code>.
                </p>
            @endif
            @if (isset($setupError))
                <p class="text-center text-sm text-red-300" role="alert">{{ $setupError }}</p>
            @endif

            <div class="space-y-2">
                <label for="username" class="block text-sm font-medium text-gray-300">Username</label>
                <input id="username" name="username" type="text" value="{{ old('username') }}" autocomplete="username" required autofocus class="w-full rounded-lg bg-gray-800 px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Enter username">
                @error('username')
                    <p class="text-sm text-red-300">{{ $message }}</p>
                @enderror
            </div>

            <div class="space-y-2">
                <label for="password" class="block text-sm font-medium text-gray-300">Password</label>
                <input id="password" name="password" type="password" autocomplete="current-password" required class="w-full rounded-lg bg-gray-800 px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Enter password">
                @error('password')
                    <p class="text-sm text-red-300">{{ $message }}</p>
                @enderror
            </div>

            <button type="submit" class="w-full cursor-pointer rounded-lg bg-teal-500 py-2 font-semibold text-white transition hover:bg-teal-600">
                Sign In
            </button>
        </form>
    </main>
</body>
</html>
