<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactMessage extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $name,
        public string $email,
        public string $messageSubject,
        public string $body,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: [new Address(config('mail.from.address'), 'DealzyCoup')],
            replyTo: [new Address($this->email, $this->name)],
            subject: '[DealzyCoup Contact] '.$this->messageSubject,
        );
    }

    public function content(): Content
    {
        return new Content(
            text: 'mail.contact-message',
            with: [
                'name' => $this->name,
                'email' => $this->email,
                'message' => $this->body,
            ],
        );
    }
}
