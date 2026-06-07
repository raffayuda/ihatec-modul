<x-mail::message>
# Modul Baru Tersedia di Database

Halo, sebuah modul telah disetujui dan kini tersedia di dalam database Modul.

**Kode Modul:** {{ $module->code }}  
**Judul Modul:** {{ $module->title }}  
**Program:** {{ $module->program }}  
**Revisi Saat Ini:** {{ $module->current_revision }}  
**Status:** {{ $module->status }}

Silakan cek modul tersebut pada sistem untuk keperluan training lebih lanjut.

<x-mail::button :url="url('/modules')">
Lihat Database Modul
</x-mail::button>

Terima kasih,<br>
{{ config('app.name') }}
</x-mail::message>
