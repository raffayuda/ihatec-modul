<?php

namespace App\Mail;

use App\Models\ModuleRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ModuleRequestProcessedMail extends Mailable
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
        $status = $this->moduleRequest->status;
        if ($status === 'Selesai') {
            $statusStr = 'Disetujui/Selesai';
        } elseif ($status === 'Batal') {
            $statusStr = 'Dibatalkan';
        } elseif ($status === 'Hold') {
            $statusStr = 'Dihold';
        } else {
            $statusStr = 'Ditolak';
        }
        
        return new Envelope(
            subject: "Pengajuan Modul [{$this->moduleRequest->type}] {$statusStr}: " . $this->moduleRequest->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.module.processed',
        );
    }
}
