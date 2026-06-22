<x-mail::message>
# Perubahan Modul Menunggu Persetujuan

Halo,

Pengajuan perubahan modul berikut telah dikirim dan **menunggu persetujuan Manager PD**.

| Field | Detail |
|-------|--------|
| **Nomor Pengajuan** | {{ $moduleRequest->request_number }} |
| **Jenis Perubahan** | {{ $moduleRequest->type }} |
| **Judul** | {{ $moduleRequest->title }} |
| **Kategori** | {{ $moduleRequest->program ?? '-' }} |
| **Bahasa** | {{ $moduleRequest->language ?? 'Indonesia' }} |
| **Pengaju** | {{ $moduleRequest->applicant->name ?? 'N/A' }} |
| **Tanggal Pengajuan** | {{ \Illuminate\Support\Carbon::parse($moduleRequest->created_at)->format('d M Y H:i') }} |

@if($moduleRequest->revision_reason)
**Referensi Khusus:** {{ $moduleRequest->revision_reason }}
@endif

@if($moduleRequest->description)
**Detail Permintaan:** {{ $moduleRequest->description }}
@endif

Silakan tinjau dan berikan persetujuan sesegera mungkin.

<x-mail::button :url="url('/perubahan-modul')">
Lihat Pengajuan
</x-mail::button>

Terima kasih,<br>
{{ config('app.name') }}
</x-mail::message>
