<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingMatrix extends Model
{
    protected $table = 'training_matrix';

    protected $fillable = [
        'kode',
        'nama_pelatihan',
        'link_modul',
        'master_sa',
        'master_sertifikat_name',
        'master_sertifikat_path',
        'tipe_pelatihan',
        'jenis_sertifikat',
        'keterangan',
        'pic_periksa_lk',
        'tipe_sertifikat_sihalal',
        'harga_dasar_tte',
        'status',
    ];
}
