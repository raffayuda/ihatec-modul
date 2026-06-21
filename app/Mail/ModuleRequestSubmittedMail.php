<?php

namespace App\Mail;

use App\Models\ModuleRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ModuleRequestSubmittedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $moduleRequest;

    /**
     * Create a new message instance.
     */
    public function __construct(ModuleRequest $moduleRequest)
    {
        $this->moduleRequest = $moduleRequest;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pengajuan Modul Baru: ' . $this->moduleRequest->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.module.submitted',
        );
    }
}
