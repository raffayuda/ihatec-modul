<?php

namespace App\Mail;

use App\Models\ModuleRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PerubahanModulReviewedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public ModuleRequest $moduleRequest, public string $action) {}

    public function envelope(): Envelope
    {
        $label = $this->action === 'approved' ? 'Disetujui' : 'Ditolak';

        return new Envelope(
            subject: "Perubahan Modul {$label}: ".$this->moduleRequest->request_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.module.perubahan-reviewed',
            with: ['action' => $this->action],
        );
    }
}
