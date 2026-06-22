<x-mail::message>
@if($action === 'approved')
# Perubahan Modul Disetujui ✓

Halo,

Pengajuan perubahan modul berikut telah **disetujui** oleh Manager PD dan database modul telah diperbarui.

@else
# Perubahan Modul Ditolak ✗

Halo,

Pengajuan perubahan modul berikut telah **ditolak** oleh Manager PD.

@endif

| Field | Detail |
|-------|--------|
| **Nomor Pengajuan** | {{ $moduleRequest->request_number }} |
| **Jenis Perubahan** | {{ $moduleRequest->type }} |
| **Judul** | {{ $moduleRequest->title }} |
| **Kategori** | {{ $moduleRequest->program ?? '-' }} |
| **Pengaju** | {{ $moduleRequest->applicant->name ?? 'N/A' }} |
| **Diproses Oleh** | {{ $moduleRequest->approved_by ?? 'N/A' }} |
| **Tanggal Proses** | {{ \Illuminate\Support\Carbon::parse($moduleRequest->approved_at ?? $moduleRequest->updated_at)->format('d M Y H:i') }} |

@if($action === 'rejected' && $moduleRequest->reject_reason)
**Alasan Penolakan:** {{ $moduleRequest->reject_reason }}
@endif

<x-mail::button :url="url('/perubahan-modul')">
Lihat Detail
</x-mail::button>

Terima kasih,<br>
{{ config('app.name') }}
</x-mail::message>
