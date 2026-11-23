<?php

use App\Console\Commands\SyncAdmin;
use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\TrackMetaPageView;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withCommands([SyncAdmin::class])
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias(['admin' => EnsureAdmin::class]);
        $middleware->appendToGroup('web', TrackMetaPageView::class);
        $middleware->redirectGuestsTo(fn (Request $request) => route('login'));

        // Public tracking calls sent by site.js (no forms, nothing to protect).
        $middleware->preventRequestForgery(except: [
            'api/presence',
            'api/coupons/increment',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
