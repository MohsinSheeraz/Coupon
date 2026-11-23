<?php

namespace App\Http\Middleware;

use App\Services\MetaConversionsApi;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class TrackMetaPageView
{
    public function __construct(private MetaConversionsApi $meta) {}

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->shouldTrack($request)) {
            $request->attributes->set('meta_event_id', (string) Str::uuid());
        }

        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        $eventId = $request->attributes->get('meta_event_id');

        if ($eventId && $response->isSuccessful()) {
            $this->meta->send('PageView', $request, $eventId);
        }
    }

    private function shouldTrack(Request $request): bool
    {
        return $this->meta->isPixelEnabled()
            && $request->isMethod('GET')
            && ! $request->expectsJson()
            && ! $request->is('admin', 'admin/*', 'login', 'api/*', 'up');
    }
}
