<?php

namespace App\Providers;

use App\Models\Category;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

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
    }
}
