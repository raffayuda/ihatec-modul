<?php

namespace App\Mail;

use App\Models\Module;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ModuleApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $module;

    /**
     * Create a new message instance.
     */
    public function __construct(Module $module)
    {
        $this->module = $module;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Modul Tersedia di Database: ' . $this->module->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.module.approved',
        );
    }
}
