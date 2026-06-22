<?php

namespace App\Mail;

use App\Models\ModuleRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PerubahanModulSubmittedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public ModuleRequest $moduleRequest) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pengajuan Perubahan Modul Menunggu Approval: '.$this->moduleRequest->request_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.module.perubahan-submitted',
        );
    }
}
