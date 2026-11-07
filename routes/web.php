<?php

use App\Http\Controllers\PresenceController;
use Illuminate\Support\Facades\Route;

// Temporary: shows the shared layout. Replaced by the real home page in the next step.
Route::view('/', 'pages.layout-test');

Route::post('/api/presence', [PresenceController::class, 'store']);
