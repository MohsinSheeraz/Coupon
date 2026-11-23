<?php

namespace Tests\Feature;

use App\Mail\ContactMessage;
use App\Models\Coupon;
use App\Models\Store;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class MetaTrackingTest extends TestCase
{
    use RefreshDatabase;

    private function enableMeta(bool $withToken = true): void
    {
        config([
            'services.meta.pixel_id' => '1580985547376513',
            'services.meta.access_token' => $withToken ? 'test-token' : null,
            'services.meta.test_event_code' => null,
        ]);
    }

    public function test_pixel_is_not_rendered_when_not_configured(): void
    {
        config(['services.meta.pixel_id' => null]);
        Http::fake();

        $this->get(route('home'))->assertOk()->assertDontSee('fbq(', false);

        Http::assertNothingSent();
    }

    public function test_public_pages_render_pixel_and_send_matching_server_page_view(): void
    {
        $this->enableMeta();
        Http::fake();

        $response = $this->get(route('home'))
            ->assertOk()
            ->assertSee("fbq('init', \"1580985547376513\")", false);

        Http::assertSent(function ($request) use ($response): bool {
            $event = $request->data()['data'][0] ?? [];

            return str_contains($request->url(), '/1580985547376513/events')
                && $event['event_name'] === 'PageView'
                && str_contains($response->getContent(), $event['event_id'])
                && $request->hasHeader('Authorization', 'Bearer test-token');
        });
    }

    public function test_pixel_still_renders_without_access_token_but_sends_nothing_server_side(): void
    {
        $this->enableMeta(withToken: false);
        Http::fake();

        $this->get(route('home'))->assertOk()->assertSee('fbq(', false);

        Http::assertNothingSent();
    }

    public function test_admin_login_page_is_not_tracked(): void
    {
        $this->enableMeta();
        Http::fake();

        $this->get(route('login'))->assertOk()->assertDontSee('fbq(', false);

        Http::assertNothingSent();
    }

    public function test_meta_failures_never_break_the_page(): void
    {
        $this->enableMeta();
        Http::fake(['graph.facebook.com/*' => Http::response(['error' => 'bad'], 400)]);

        $this->get(route('home'))->assertOk();
    }

    public function test_store_page_sends_view_content_in_browser_and_server(): void
    {
        $this->enableMeta();
        Http::fake();
        $store = Store::query()->create(['name' => 'Example Store', 'slug' => 'example-store']);

        $response = $this->get(route('stores.show', $store))->assertOk();

        Http::assertSent(function ($request) use ($response): bool {
            $event = $request->data()['data'][0] ?? [];

            return $event['event_name'] === 'ViewContent'
                && $event['custom_data']['content_name'] === 'Example Store'
                && str_contains($response->getContent(), "fbq('track', \"ViewContent\"")
                && str_contains($response->getContent(), $event['event_id']);
        });
    }

    public function test_blank_search_does_not_send_a_search_event(): void
    {
        $this->enableMeta();
        Http::fake();

        $this->get(route('search', ['q' => '  ']))->assertOk();

        Http::assertNotSent(fn ($request): bool => $request->data()['data'][0]['event_name'] === 'Search');
    }

    public function test_search_sends_search_event_with_the_query(): void
    {
        $this->enableMeta();
        Http::fake();

        $this->get(route('search', ['q' => 'shoes']))->assertOk();

        Http::assertSent(fn ($request): bool => $request->data()['data'][0]['event_name'] === 'Search'
            && $request->data()['data'][0]['custom_data']['search_string'] === 'shoes');
    }

    public function test_opening_an_offer_sends_initiate_checkout_with_the_browser_event_id(): void
    {
        $this->enableMeta();
        Http::fake();
        $store = Store::query()->create(['name' => 'Example Store', 'slug' => 'example-store']);
        $coupon = Coupon::query()->create([
            'store_id' => $store->id,
            'type' => 'code',
            'title' => 'Coupon for this store',
            'code' => 'STORE20',
        ]);

        $this->post(route('coupons.increment', $coupon), ['event_id' => 'browser-event-123'])->assertOk();

        Http::assertSent(fn ($request): bool => $request->data()['data'][0]['event_name'] === 'InitiateCheckout'
            && $request->data()['data'][0]['event_id'] === 'browser-event-123'
            && $request->data()['data'][0]['custom_data']['content_ids'] === [(string) $coupon->id]);
    }

    public function test_contact_form_sends_hashed_lead_event_with_matching_browser_event(): void
    {
        $this->enableMeta();
        Mail::fake();
        Http::fake();

        $this->post(route('contact.store'), [
            'name' => 'Taylor Tester',
            'email' => 'Taylor@Example.com',
            'subject' => 'Question about a coupon',
            'message' => 'Could you help me understand this coupon?',
            'company' => '',
        ])->assertRedirect(route('contact'));

        Mail::assertSent(ContactMessage::class);

        $leadEventId = session('meta_lead_event_id');

        Http::assertSent(function ($request) use ($leadEventId): bool {
            $event = $request->data()['data'][0] ?? [];

            return $event['event_name'] === 'Lead'
                && $event['event_id'] === $leadEventId
                && $event['user_data']['em'] === [hash('sha256', 'taylor@example.com')];
        });

        $this->get(route('contact'))
            ->assertSee("fbq('track', 'Lead', {}, {eventID: \"{$leadEventId}\"})", false);
    }
}
