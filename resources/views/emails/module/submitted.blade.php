<x-mail::message>
# Pengajuan Modul Berhasil Dibuat

Halo, pengajuan modul baru dengan rincian sebagai berikut telah disubmit ke dalam sistem dan menunggu persetujuan.

**Nomor Pengajuan:** {{ $moduleRequest->request_number }}  
**Judul:** {{ $moduleRequest->title }}  
**Tipe Pengajuan:** {{ $moduleRequest->type }}  
**Pemohon:** {{ $moduleRequest->applicant->name ?? 'N/A' }}  
**Prioritas:** {{ $moduleRequest->priority }}  
**Tanggal Pengajuan:** {{ \Illuminate\Support\Carbon::parse($moduleRequest->created_at)->format('d M Y') }}

<x-mail::button :url="url('/pengajuan')">
Lihat Pengajuan
</x-mail::button>

Terima kasih,<br>
{{ config('app.name') }}
</x-mail::message>
