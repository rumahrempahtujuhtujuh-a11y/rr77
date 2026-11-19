# Titipan RR77

Aplikasi web sederhana untuk laporan titipan harian, analisa produk, dan stok bahan baku.
Satu file utama (`index.html`), tanpa build dan tanpa dependensi.

## Isi folder
- `index.html` : seluruh aplikasi (tampilan, logika, dan data awal)
- `manifest.webmanifest`, `icon.svg`, `icon-192.png`, `icon-512.png` : agar bisa dipasang di layar utama HP
- `vercel.json` : pengaturan Vercel (header keamanan, tidak diindeks mesin pencari)
- `robots.txt` : meminta mesin pencari tidak mengindeks

## Deploy ke GitHub dan Vercel
1. Buat repository baru di GitHub. **Pilih Private**, karena `index.html` berisi data penjualan.
2. Unggah semua file di folder ini ke repository (tombol *Add file > Upload files*).
3. Buka vercel.com, pilih *Add New > Project*, lalu impor repository tadi.
4. Framework Preset: **Other**. Biarkan Build Command dan Output Directory kosong, lalu tekan *Deploy*.
5. Setelah selesai, buka alamat `.vercel.app` di HP dan pilih *Tambahkan ke layar utama*.

Setiap perubahan yang di-commit ke GitHub akan otomatis ter-deploy ulang.

## Data
- Data tersimpan di browser (localStorage, kunci `rr77v2`) pada perangkat yang dipakai, bukan di server.
- Data awal (laporan Mei sampai November 2026) tertanam di `index.html` pada fungsi `sample()`. Ia hanya tampil saat browser belum punya data.
- Cadangkan rutin lewat menu **Lainnya > Salin cadangan**, dan pulihkan lewat **Pulihkan data**.
- Ganti perangkat atau hapus data browser: tempel teks cadangan di menu Lainnya.

## Catatan
- Siapa pun yang tahu alamat web dapat membuka halaman dan melihat data awal yang tertanam. Untuk data sensitif, kosongkan isi `sample()` (sisakan `{"outlets":[{"name":"SJ TSM","items":[]}]}`) sebelum dipublikasikan, lalu pulihkan data lewat cadangan.
- Font memakai Google Fonts. Tanpa internet, tampilan memakai font cadangan.
