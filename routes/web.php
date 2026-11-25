<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\OfferController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\StoreController;
use App\Http\Controllers\Auth\AdminLoginController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PresenceController;
use App\Http\Controllers\PublicListingController;
use App\Http\Controllers\PublicStorageController;
use App\Http\Controllers\PublicStoreController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/login', [AdminLoginController::class, 'create'])->name('login');
Route::post('/login', [AdminLoginController::class, 'store'])
    ->middleware('throttle:admin-login')
    ->name('login.attempt');
Route::post('/logout', [AdminLoginController::class, 'destroy'])
    ->middleware(['auth', 'admin'])
    ->name('logout');

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'admin'])
    ->group(function (): void {
        Route::get('/', AdminDashboardController::class)->name('dashboard');
        Route::get('settings', [SettingsController::class, 'edit'])->name('settings.edit');
        Route::put('settings', [SettingsController::class, 'update'])->name('settings.update');
        Route::patch('categories/{category}/toggle-status', [CategoryController::class, 'toggleStatus'])
            ->name('categories.toggle-status');
        Route::resource('categories', CategoryController::class)->except(['show']);
        Route::resource('stores', StoreController::class)->except(['show']);
        Route::resource('coupons', OfferController::class)->except(['show'])->parameters(['coupons' => 'offer']);
        Route::resource('deals', OfferController::class)->except(['show'])->parameters(['deals' => 'offer']);
    });
Route::get('/api/admin/presence', [AdminDashboardController::class, 'presence'])
    ->middleware(['auth', 'admin'])
    ->name('admin.presence');

Route::get('/', HomeController::class)->name('home');
Route::get('/sitemap.xml', SitemapController::class)->name('sitemap');
Route::get('/storage/{path}', PublicStorageController::class)
    ->where('path', '.*')
    ->name('storage.public');
Route::get('/coupons', [PublicListingController::class, 'coupons'])->name('coupons.index');
Route::get('/deals', [PublicListingController::class, 'deals'])->name('deals.index');
Route::get('/stores', [PublicListingController::class, 'stores'])->name('stores.index');
Route::get('/stores/{store:slug}', [PublicStoreController::class, 'show'])->name('stores.show');
Route::get('/search', [PublicListingController::class, 'search'])->name('search');
Route::get('/contact', [ContactController::class, 'create'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:10,15')
    ->name('contact.store');
Route::post('/coupons/{coupon}/increment', [PublicStoreController::class, 'incrementUsage'])
    ->middleware('throttle:60,1')
    ->name('coupons.increment');

Route::post('/api/presence', [PresenceController::class, 'store']);
