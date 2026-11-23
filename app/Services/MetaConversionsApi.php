<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

/**
 * Sends server-side events to the Meta Conversions API.
 *
 * Browser pixel events use the same event_id so Meta de-duplicates them.
 */
class MetaConversionsApi
{
    public function isPixelEnabled(): bool
    {
        return filled(config('services.meta.pixel_id'));
    }

    public function isServerSideEnabled(): bool
    {
        return $this->isPixelEnabled() && filled(config('services.meta.access_token'));
    }

    /**
     * Tracks an event in the browser pixel (rendered by the layout) and sends it
     * server-side after the response, both with the same event_id for de-duplication.
     *
     * @param  array<string, mixed>  $customData
     */
    public function track(string $eventName, Request $request, array $customData = [], ?string $eventId = null): string
    {
        $eventId ??= (string) Str::uuid();

        $browserEvents = $request->attributes->get('meta_browser_events', []);
        $browserEvents[] = ['name' => $eventName, 'id' => $eventId, 'data' => (object) $customData];
        $request->attributes->set('meta_browser_events', $browserEvents);

        app()->terminating(fn () => $this->send($eventName, $request, $eventId, $customData));

        return $eventId;
    }

    /**
     * @param  array<string, mixed>  $customData
     */
    public function send(string $eventName, Request $request, string $eventId, array $customData = [], ?string $email = null): void
    {
        if (! $this->isServerSideEnabled()) {
            return;
        }

        $payload = [
            'data' => [[
                'event_name' => $eventName,
                'event_time' => time(),
                'event_id' => $eventId,
                'action_source' => 'website',
                'event_source_url' => $request->isMethod('GET')
                    ? $request->fullUrl()
                    : ($request->headers->get('referer') ?: $request->fullUrl()),
                'user_data' => $this->userData($request, $email),
                'custom_data' => $customData === [] ? (object) [] : $customData,
            ]],
        ];

        if (filled(config('services.meta.test_event_code'))) {
            $payload['test_event_code'] = config('services.meta.test_event_code');
        }

        try {
            Http::timeout(5)
                ->withToken((string) config('services.meta.access_token'))
                ->post($this->endpoint(), $payload)
                ->throw();
        } catch (Throwable $exception) {
            report($exception);
        }
    }

    private function endpoint(): string
    {
        return sprintf(
            'https://graph.facebook.com/%s/%s/events',
            config('services.meta.graph_version'),
            config('services.meta.pixel_id'),
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function userData(Request $request, ?string $email): array
    {
        return array_filter([
            'client_ip_address' => $request->ip(),
            'client_user_agent' => $request->userAgent(),
            'fbp' => $request->cookie('_fbp'),
            'fbc' => $request->cookie('_fbc'),
            'em' => $email ? [hash('sha256', strtolower(trim($email)))] : null,
        ]);
    }
}
