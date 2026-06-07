<?php

use App\Models\MasterData;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin', 'status' => 'Aktif']);
    $this->user = User::factory()->create(['role' => 'User', 'status' => 'Aktif']);
});

test('administrator can access manajemen modul page', function () {
    $response = $this->actingAs($this->admin)->get('/master-data');
    $response->assertStatus(200);
});

test('regular user cannot access manajemen modul page', function () {
    $response = $this->actingAs($this->user)->get('/master-data');
    $response->assertStatus(403);
});

test('administrator can create new master data', function () {
    $response = $this->actingAs($this->admin)->post('/master-data', [
        'name' => 'Pelatihan Khusus A',
        'category' => 'Jenis Kebutuhan Modul',
        'status' => 'Aktif',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('master_data', [
        'name' => 'Pelatihan Khusus A',
        'category' => 'Jenis Kebutuhan Modul',
    ]);
});

test('administrator can update master data', function () {
    $item = MasterData::create([
        'name' => 'Pelatihan Awal',
        'category' => 'Jenis Kebutuhan Modul',
        'status' => 'Aktif',
    ]);

    $response = $this->actingAs($this->admin)->put("/master-data/{$item->id}", [
        'name' => 'Pelatihan Baru',
        'category' => 'Jenis Kebutuhan Modul',
        'status' => 'Nonaktif',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('master_data', [
        'id' => $item->id,
        'name' => 'Pelatihan Baru',
        'status' => 'Nonaktif',
    ]);
});

test('administrator can delete master data', function () {
    $item = MasterData::create([
        'name' => 'Data Sampah',
        'category' => 'Jenis Kebutuhan Modul',
        'status' => 'Aktif',
    ]);

    $response = $this->actingAs($this->admin)->delete("/master-data/{$item->id}");

    $response->assertRedirect();
    $this->assertDatabaseMissing('master_data', [
        'id' => $item->id,
    ]);
});

test('administrator can download CSV template', function () {
    $response = $this->actingAs($this->admin)->get('/master-data/template');
    $response->assertStatus(200);
    $response->assertHeader('Content-Disposition', 'attachment; filename="template_kode_pelatihan.csv"');
});

test('administrator can import master data from CSV', function () {
    // Generate fake CSV file
    $csvContent = "Nama Pelatihan,Kode Pelatihan\nPelatihan Baru Impor,IMPOR-001\n";
    $file = UploadedFile::fake()->createWithContent('import.csv', $csvContent);

    $response = $this->actingAs($this->admin)->post('/master-data/import', [
        'file' => $file,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('master_data', [
        'category' => 'Kode Pelatihan',
        'code' => 'IMPOR-001',
        'name' => 'Pelatihan Baru Impor',
    ]);
});
