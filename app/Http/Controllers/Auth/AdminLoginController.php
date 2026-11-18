<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class AdminLoginController extends Controller
{
    public function create(): View|RedirectResponse
    {
        if (Auth::user()?->email === config('admin.username') && filled(config('admin.username'))) {
            return redirect()->route('admin.dashboard');
        }

        return view('admin.login', ['configured' => $this->isConfigured()]);
    }

    public function store(Request $request): RedirectResponse|Response
    {
        if (! $this->isConfigured()) {
            return response()->view('admin.login', [
                'configured' => false,
                'setupError' => 'Admin sign-in is unavailable. Configure ADMIN_USERNAME and ADMIN_PASSWORD, then run php artisan admin:sync.',
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        $credentials = $request->validate([
            'username' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ]);
        $adminUsername = (string) config('admin.username');

        if (! hash_equals($adminUsername, $credentials['username'])
            || ! Auth::attempt(['email' => $adminUsername, 'password' => $credentials['password']])) {
            return back()
                ->withErrors(['username' => 'Invalid username or password.'])
                ->onlyInput('username');
        }

        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    private function isConfigured(): bool
    {
        return filled(config('admin.username')) && filled(config('admin.password'));
    }
}
