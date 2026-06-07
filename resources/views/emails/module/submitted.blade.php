<x-mail::message>
# Pengajuan Modul Berhasil Dibuat

Halo, pengajuan modul baru dengan rincian sebagai berikut telah disubmit ke dalam sistem dan menunggu persetujuan.

**Nomor Pengajuan:** {{ $moduleRequest->request_number }}  
**Judul:** {{ $moduleRequest->title }}  
**Tipe Pengajuan:** {{ $moduleRequest->type }}  
**Pemohon:** {{ $moduleRequest->applicant->name ?? 'N/A' }}  
**Prioritas:** {{ $moduleRequest->priority }}  
**Tanggal Pengajuan:** {{ \Illuminate\Support\Carbon::parse($moduleRequest->created_at)->format('d M Y') }}

@if($moduleRequest->type === 'Kebutuhan Khusus')
### Rincian Kebutuhan Khusus
- **Jenis Kebutuhan:** {{ $moduleRequest->jenis_kebutuhan }}
@if($moduleRequest->nama_instansi)
- **Nama Instansi:** {{ $moduleRequest->nama_instansi }}
@endif
- **Judul Program / Modul:** {{ $moduleRequest->judul_program }}
- **Bahasa Pengantar:** {{ $moduleRequest->language }}
- **Jam Khusus:** {{ $moduleRequest->jam_khusus }}
- **Pre & Post Test:** {{ $moduleRequest->pre_post_test }}
- **Tanggal Kebutuhan:** {{ \Illuminate\Support\Carbon::parse($moduleRequest->deadline)->format('d M Y') }}
@if($moduleRequest->keterangan_kebutuhan)
- **Keterangan:** {{ $moduleRequest->keterangan_kebutuhan }}
@endif
@endif

<x-mail::button :url="url('/pengajuan')">
Lihat Pengajuan
</x-mail::button>

Terima kasih,<br>
{{ config('app.name') }}
</x-mail::message>
