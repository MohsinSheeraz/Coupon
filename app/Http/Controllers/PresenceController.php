<?php

namespace App\Http\Controllers;

use App\Models\VisitorPresence;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;
use Throwable;

class PresenceController extends Controller
{
    /** POST /api/presence: "this visitor is still on the site" (sent every minute by public/js/site.js). */
    public function store(Request $request): Response|JsonResponse
    {
        $cookieId = $request->cookie('dealzycoup_visitor');
        $visitorId = is_string($cookieId) && preg_match('/^[\da-f-]{36}$/i', $cookieId)
            ? $cookieId
            : (string) Str::uuid();

        try {
            VisitorPresence::record($visitorId);
        } catch (Throwable $e) {
            report($e);

            return response()->json(['error' => 'Could not record visitor presence'], 500);
        }

        $response = response()->noContent()->header('Cache-Control', 'no-store');

        if ($visitorId !== $cookieId) {
            // Session cookie, HTTP only, same-site lax (same settings as the Next.js app).
            $response->withCookie(cookie('dealzycoup_visitor', $visitorId, 0, '/', null, app()->isProduction(), true, false, 'lax'));
        }

        return $response;
    }
}
