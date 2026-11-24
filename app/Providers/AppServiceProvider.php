<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Setting;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('admin-login', function (Request $request): Limit {
            $username = Str::lower($request->string('username')->toString());
            $key = Str::transliterate($username.'|'.($request->ip() ?? 'unknown'));

            return Limit::perMinute(5)->by($key);
        });

        // The footer lists the first three active categories (alphabetical),
        // or three default names when no categories exist yet.
        View::composer('partials.footer', function ($view) {
            $names = Category::where('status', 'active')->orderBy('name')->limit(3)->pluck('name');

            $links = $names->isNotEmpty()
                ? $names->map(fn ($name) => ['label' => $name, 'query' => $name])->all()
                : [
                    ['label' => 'Electronics', 'query' => 'Electronics'],
                    ['label' => 'Fashion', 'query' => 'Fashion'],
                    ['label' => 'Home & Garden', 'query' => 'Home & Garden'],
                ];

            $view->with('footerCategories', $links);
        });

        // Default <title> and meta description come from the admin SEO settings.
        View::composer('layouts.app', function ($view) {
            $metaTags = Setting::query()->first()?->meta_tags ?? [];

            $view->with('seoDefaults', [
                'title' => filled($metaTags['title'] ?? null) ? $metaTags['title'] : 'DealzyCoup - Find the Best Deals',
                'description' => filled($metaTags['description'] ?? null)
                    ? $metaTags['description']
                    : 'Find verified coupon codes, promo codes and deals from top online stores. Save more on every order with DealzyCoup.',
            ]);
        });
    }
}
