<?php

namespace Tests\Feature;

use App\Mail\ContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_form_shows_helpful_field_placeholders(): void
    {
        $this->get(route('contact'))
            ->assertOk()
            ->assertSee('placeholder="e.g. Alex Morgan"', false)
            ->assertSee('placeholder="you@example.com"', false)
            ->assertSee('placeholder="What can we help with?"', false)
            ->assertSee('placeholder="Tell us a little more about your question..."', false);
    }

    public function test_contact_form_sends_a_message_and_returns_confirmation(): void
    {
        Mail::fake();

        $this->post(route('contact.store'), [
            'name' => 'Taylor Tester',
            'email' => 'taylor@example.com',
            'subject' => 'Question about a coupon',
            'message' => 'Could you help me understand this coupon?',
            'company' => '',
        ])
            ->assertRedirect(route('contact'))
            ->assertSessionHas('status', 'Thanks! Your message has been sent.');

        Mail::assertSent(ContactMessage::class, function (ContactMessage $mail): bool {
            return $mail->name === 'Taylor Tester'
                && $mail->email === 'taylor@example.com'
                && $mail->messageSubject === 'Question about a coupon'
                && $mail->body === 'Could you help me understand this coupon?';
        });
    }

    public function test_contact_form_rejects_invalid_input_without_sending(): void
    {
        Mail::fake();

        $this->from(route('contact'))
            ->post(route('contact.store'), [
                'name' => 'T',
                'email' => 'not-an-email',
                'subject' => 'Question',
                'message' => 'Short',
            ])
            ->assertRedirect(route('contact'))
            ->assertSessionHasErrors(['name', 'email', 'message']);

        Mail::assertNothingSent();
    }

    public function test_contact_form_rejects_honeypot_submission(): void
    {
        Mail::fake();

        $this->from(route('contact'))
            ->post(route('contact.store'), [
                'name' => 'Taylor Tester',
                'email' => 'taylor@example.com',
                'subject' => 'Question about a coupon',
                'message' => 'Could you help me understand this coupon?',
                'company' => 'Bot submission',
            ])
            ->assertRedirect(route('contact'))
            ->assertSessionHasErrors('company');

        Mail::assertNothingSent();
    }
}
