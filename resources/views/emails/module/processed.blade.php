<x-mail::message>
@if($moduleRequest->type === 'Kebutuhan Khusus' && $moduleRequest->status === 'Selesai')
Dear user,

Pengajuan modul dengan {{ $moduleRequest->request_number }} telah selesai, silahkan klik link [{{ url('/pengajuan') }}]({{ url('/pengajuan') }}) untuk info detailnya.
@else
# Pengajuan Modul Telah Diproses

Halo, pengajuan modul Anda telah diproses oleh Manager/Staf PD.

**Nomor Pengajuan:** {{ $moduleRequest->request_number }}  
**Judul:** {{ $moduleRequest->title }}  
**Tipe Pengajuan:** {{ $moduleRequest->type }}  
**Status:** **{{ $moduleRequest->status }}**  

@if($moduleRequest->status === 'Ditolak' && $moduleRequest->reject_reason)
**Alasan Penolakan:** {{ $moduleRequest->reject_reason }}  
@endif

@if($moduleRequest->type === 'Kebutuhan Khusus')
@if($moduleRequest->status === 'Selesai')
- **Link Modul:** [Akses Modul]({{ $moduleRequest->link_modul }})
- **Tanggal Realisasi:** {{ \Illuminate\Support\Carbon::parse($moduleRequest->tanggal_realisasi)->format('d M Y') }}
@elseif(in_array($moduleRequest->status, ['Hold', 'Batal']))
- **Keterangan:** {{ $moduleRequest->reject_reason }}
@endif

@if($moduleRequest->tanggal_kebutuhan_baru)
- **Tanggal Kebutuhan Baru:** {{ \Illuminate\Support\Carbon::parse($moduleRequest->tanggal_kebutuhan_baru)->format('d M Y') }}
@endif
@endif

**Diproses Oleh:** {{ $moduleRequest->processor->name ?? 'N/A' }}  
**Tanggal Proses:** {{ \Illuminate\Support\Carbon::parse($moduleRequest->processed_at)->format('d M Y H:i') }}

<x-mail::button :url="url('/pengajuan')">
Lihat Detail Pengajuan
</x-mail::button>
@endif

Terima kasih,<br>
{{ config('app.name') }}
</x-mail::message>
