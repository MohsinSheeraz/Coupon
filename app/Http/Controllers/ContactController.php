<?php

namespace App\Http\Controllers;

use App\Mail\ContactMessage;
use App\Services\MetaConversionsApi;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class ContactController extends Controller
{
    public function create(): View
    {
        return view('pages.contact');
    }

    public function store(Request $request, MetaConversionsApi $meta): RedirectResponse
    {
        if ($request->filled('company')) {
            throw ValidationException::withMessages([
                'company' => 'Unable to send this message.',
            ]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:100', 'not_regex:/[\r\n]/'],
            'email' => ['required', 'email:rfc', 'max:254'],
            'subject' => ['required', 'string', 'min:2', 'max:120', 'not_regex:/[\r\n]/'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ]);
        $rateLimitKey = 'contact:'.$request->ip();

        if (RateLimiter::tooManyAttempts($rateLimitKey, 5)) {
            throw ValidationException::withMessages([
                'contact' => 'Too many messages were sent. Please wait a little and try again.',
            ]);
        }

        RateLimiter::hit($rateLimitKey, 15 * 60);

        try {
            Mail::to(config('mail.contact_to'))->send(new ContactMessage(
                name: $validated['name'],
                email: $validated['email'],
                messageSubject: $validated['subject'],
                body: $validated['message'],
            ));
        } catch (Throwable $exception) {
            report($exception);

            return back()
                ->withInput($request->except('company'))
                ->withErrors(['contact' => 'We could not send your message right now. Please try again later.']);
        }

        $leadEventId = (string) Str::uuid();
        $meta->send('Lead', $request, $leadEventId, ['content_name' => 'Contact form'], $validated['email']);

        return to_route('contact')
            ->with('status', 'Thanks! Your message has been sent.')
            ->with('meta_lead_event_id', $leadEventId);
    }
}
