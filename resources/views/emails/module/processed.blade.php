<x-mail::message>
# Pengajuan Modul Telah Diproses

Halo, pengajuan modul Anda telah diproses oleh Manager PD.

**Nomor Pengajuan:** {{ $moduleRequest->request_number }}  
**Judul:** {{ $moduleRequest->title }}  
**Status:** **{{ $moduleRequest->status === 'Selesai' ? 'Disetujui' : 'Ditolak' }}**  
@if($moduleRequest->status === 'Ditolak')
**Alasan Penolakan:** {{ $moduleRequest->reject_reason }}  
@endif
**Diproses Oleh:** {{ $moduleRequest->processor->name ?? 'N/A' }}  
**Tanggal Proses:** {{ \Illuminate\Support\Carbon::parse($moduleRequest->processed_at)->format('d M Y H:i') }}

<x-mail::button :url="url('/pengajuan')">
Lihat Detail Pengajuan
</x-mail::button>

Terima kasih,<br>
{{ config('app.name') }}
</x-mail::message>
