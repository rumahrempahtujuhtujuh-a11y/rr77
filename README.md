# Titipan RR77

Aplikasi web sederhana untuk laporan titipan harian, analisa produk, dan stok bahan baku.
Satu file tampilan (`index.html`) dan satu fungsi server (`api/data.js`), tanpa build dan tanpa dependensi npm.

## Isi folder
- `index.html` : seluruh tampilan dan logika aplikasi
- `api/data.js` : penyimpanan data di server (Upstash Redis) dengan PIN
- `api/_seed.js` : data awal, hanya dibaca server
- `manifest.webmanifest`, `icon.svg`, `icon-192.png`, `icon-512.png` : agar bisa dipasang di layar utama HP
- `vercel.json` : pengaturan Vercel (header keamanan, tidak diindeks mesin pencari)
- `robots.txt` : meminta mesin pencari tidak mengindeks

## Deploy ke GitHub dan Vercel
1. Buat repository baru di GitHub (Private) dan unggah semua file, termasuk folder `api/`.
2. Di vercel.com pilih *Add New > Project*, impor repository. Framework Preset: **Other**. Build Command dan Output Directory kosongkan, lalu *Deploy*.
3. **Hubungkan database.** Di project Vercel buka tab *Storage > Create Database*, pilih **Upstash Redis** (paket gratis cukup), lalu *Connect* ke project ini. Vercel otomatis mengisi variabel `KV_REST_API_URL` dan `KV_REST_API_TOKEN` (atau `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN`; keduanya didukung).
4. **Buat PIN.** Di *Settings > Environment Variables* tambahkan `APP_PIN` dengan nilai PIN/kata sandi pilihan Anda (disarankan minimal 8 karakter). Hanya yang tahu PIN yang bisa membaca atau mengubah data.
5. **Redeploy** (tab *Deployments* > titik tiga > *Redeploy*) agar variabel terbaca.
6. Buka alamat `.vercel.app`, masukkan PIN. Data lama yang ada di browser HP otomatis dipindahkan ke server pada saat pertama masuk. Lalu pilih *Tambahkan ke layar utama*.

## Penyimpanan data
- Data utama ada di server (Upstash Redis lewat `api/data.js`), jadi sama di semua perangkat. Browser hanya menyimpan salinan agar cepat dan tetap terbuka saat sinyal buruk.
- Perubahan saat offline tersimpan di perangkat dan dikirim otomatis begitu online.
- Setiap data punya nomor revisi. Bila dua perangkat mengubah data bersamaan, yang kalah dimuat ulang dari server dan salinannya disimpan di menu **Lainnya > Data yang tertimpa**.
- Titik pulih harian: server menyimpan keadaan data sebelum perubahan pertama tiap hari, selama 30 hari (kunci `rr77:bak:TANGGAL`, bisa dibaca di konsol Upstash).
- Data awal (laporan Mei sampai November 2026) ada di `api/_seed.js`, bukan lagi di `index.html`, sehingga tidak terbaca publik. Ia hanya dipakai bila server masih kosong dan belum ada data di browser.
- Cadangan manual lewat **Lainnya > Salin cadangan** tetap tersedia.

## Menu Bayar
- Catat pembayaran dari tiap outlet (tanggal, jumlah, cara bayar, catatan). Tombol *Lunasi* mengisi jumlah sisa tagihan.
- **Sisa tagihan = total titipan outlet dikurangi total pembayaran**, dihitung otomatis. Menghapus pembayaran mengembalikan sisa tagihan.
- Pembayaran dialokasikan ke titipan paling lama lebih dulu, sehingga tiap titipan di tab Outlet berlabel *Lunas*, *Sebagian*, atau *Belum*.
- Beranda menampilkan *Belum dibayar* dan *Sudah diterima*. Laporan WhatsApp menambahkan baris *Sudah dibayar* dan *Sisa* bila sudah ada pembayaran.

## Alur tagihan per periode
- Titipan dicatat tiap hari. Setelah sekitar 7 sampai 8 hari, tagih ke outlet lalu tekan **Tutup tagihan** (menu Bayar, per outlet).
- Titipan dan pembayaran periode itu ditandai tertutup, sehingga **tagihan kembali 0** dan dihitung lagi dari awal. Data lama tidak dihapus: tetap dipakai untuk analisa dan tersimpan di *Tagihan yang sudah ditutup* (ada tombol Salin untuk laporannya).
- Sisa yang belum dibayar saat tutup tidak dibawa ke periode baru, hanya tercatat di riwayat.

## Menu Beranda dan Analisa
Menu Analisa digabung ke Beranda: ringkasan di atas, analisa produk (pilih Bulan ini / 7 hari / Semua) di bawahnya.

## Beranda, Laporan, dan Ubah data
- Kartu utama Beranda adalah **Tagihan berjalan**: sisa dari titipan yang belum lunas (periode yang belum ditutup).
- **Laporan** berisi rekap per pembayaran (klaster). Tiap pembayaran yang masuk menjadi satu rekap berisi titipan yang dilunasinya (paling lama lebih dulu), dengan tombol *Salin rekap* untuk WhatsApp dan *Salin semua rekap*. Titipan yang belum dibayar tidak masuk rekap. Tombol *Salin tagihan* di Beranda menyalin daftar tagihan lengkap seperti laporan lama.
- Tombol pensil (ubah) tersedia di: titipan (Beranda dan Outlet), nama outlet, pembayaran (Bayar dan Laporan), bahan baku, serta riwayat belanja/pemakaian bahan. Titipan di periode yang sudah ditutup tidak bisa diubah; tekan *Buka lagi* di menu Bayar (Tagihan yang sudah ditutup) bila perlu memperbaikinya.

## Tampilan
- Desain berwarna penuh dengan tema daun (hijau) dan warna api (oranye) khas nasi bakar. Tiap menu punya warna sendiri: Beranda hijau, Outlet kuning, Bayar biru, Bahan ungu, Laporan merah muda, Lainnya abu-abu.
- Beranda punya empat tombol cepat (Titipan, Bayar, Belanja, Salin tagihan). Tiap outlet punya avatar berwarna. Mengikuti mode gelap/terang HP.
- Font Plus Jakarta Sans dari Google Fonts (font cadangan dipakai bila tidak ada internet). Ikon aplikasi di `icon.svg`, `icon-192.png`, `icon-512.png`.

## Catatan
- Keamanan: semua data lewat `/api/data` dengan PIN. Setelah 10 kali salah PIN, alamat IP itu dikunci 10 menit.
- Font memakai Google Fonts. Tanpa internet, tampilan memakai font cadangan.

## Versi
- **1.3.0** (20 Nov 2026): ikon menu 3D berwarna tanpa kotak latar (rumah, toko, dompet, kotak, dokumen, roda gigi, keranjang); latar warna menu aktif dihapus, diganti garis penanda kecil di atas ikon.
- **1.2.0** (20 Nov 2026): ikon menu 3D berwarna (menu bawah, judul halaman, aksi cepat); tombol + Titipan di header dihapus; logo dan nama usaha di layar PIN sama dengan dashboard (disalin di perangkat); ikon aplikasi (layar utama) disamakan dengan logo daun.
- **1.1.0** (20 Nov 2026): ikon tambah pada tombol Titipan dan Bahan, ikon hapus (tempat sampah) untuk titipan, pembayaran, riwayat bahan, bahan, dan outlet; hapus outlet; nomor versi di Lainnya dan layar PIN; latar logo transparan (putih tepi dibuang saat unggah); ikon masuk dan keluar.
- Nomor versi ada di `APP_V` dalam `index.html`; naikkan setiap kali ada perubahan.
