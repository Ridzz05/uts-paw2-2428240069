# RUNBOOK — Menjawab UTS PAW2 (template SI5C) dengan repo ini

Panduan langkah demi langkah mengisi `TEMPLAT LAPORAN PRAKTIKUM UTS`, memakai repo
`si2b_kuis1_mrizkialgipari` sebagai **acuan arsitektur**.

Repo ini ditulis untuk Topik 14 — Galeri Seni: Lukisan. Kalau topik UTS-mu **berbeda**,
jangan tulis ulang dari nol: jalankan `scripts/retarget.sh` (bagian 0.0) yang menerjemahkan
seluruh domain dalam satu perintah, lalu ikuti bagian 1–8 seperti biasa.

Semua perintah, URL, nama request, dan nilai di bawah sudah diverifikasi jalan di mesin ini.
Setiap tangkapan layar **harus kamu ambil sendiri saat ujian** — template mewajibkan bukti
dari komputer sendiri dan pernyataan kejujuran ditandatangani.

Singkatan alamat folder kerja: `<repo>` = `C:\Users\muhri\orca\si2b_kuis1_mrizkialgipari`.

---

## 0.0 Kalau topik UTS berbeda dari Lukisan

Lewati bagian ini kalau topikmu tetap Topik 14 Lukisan.

### Aturan yang membuat cara ini aman

Skrip **hanya menerjemahkan label**, bukan mengubah bentuk data:

| Yang DIUBAH | Yang TIDAK diubah |
|---|---|
| Nama resource (`/paintings` → `/menu`) | Jumlah data seed (3 pendukung, 6 utama) |
| Nama model & berkas (`Painting` → `Menu`) | Angka di data seed (harga 7500000, 12500000, dst.) |
| Nama field (`kodeLukisan` → `kodeMenu`) | Struktur subdokumen (2 embed, bentuknya sama) |
| Nilai [filter] seed (`realisme` → `makanan`) | Bentuk respons & kode status |
| Label Indonesia (`pelukis` → `kedai`) | 27 request, 59 assertion |

Karena angka seed tidak disentuh, **seluruh assertion Postman tetap sahih tanpa diedit**.
Itu sebabnya hasil akhir selalu 27 request / 59 assertion / 0 failure, topik apa pun.

### Langkah

**Tidak semua field wajib diisi.** Aturannya: **kosong = tidak disentuh.** Isi hanya yang
memang berbeda dari topik Lukisan. Blok ISIAN di `scripts/retarget.sh` semuanya `""` di awal —
kalau dijalankan tanpa diisi, skrip menolak dan tidak mengubah apa pun.

#### Tingkat 1 — praktis selalu dipakai (tapi tetap opsional)

| Variabel | Arti | Contoh |
|---|---|---|
| `MAIN_NEW` | resource utama + sebutan Indonesianya | `menu` |
| `SUP_NEW` | resource pendukung + sebutan Indonesianya | `kedai` |

Tidak ada yang ditegakkan skrip. `MAIN_NEW` dan `SUP_NEW` hanya **hampir selalu** dipakai
karena tiap topik UTS punya resource sendiri. Kalau dikosongkan, resource tetap
`/paintings` + `/artists` sementara field lain ikut berubah — sah, tapi biasanya bukan
yang kamu mau.

Dari dua ini skrip menurunkan sendiri: `Menu`/`Kedai` (kapital, untuk nama model),
`jumlahMenu`, `menuModel.js`, `menuRoutes.js`, `menuController.js`, `{{menuId}}`,
`Tugas3_Menu.postman_*`. Tidak perlu diisi.

#### Tingkat 2 — isi hanya kalau topikmu mengubahnya

| Variabel | Arti | Contoh | Kalau dikosongkan |
|---|---|---|---|
| `UNIK_NEW` | `[unik]` | `kodeMenu` | tetap `kodeLukisan` |
| `FILTER_NEW` | `[filter]` | `kategori` | tetap `aliran` |
| `EMBED1_NEW` | `[embed]` ke-1 | `varian` | tetap `ukuran` |
| `EMBED2_NEW` | `[embed]` ke-2 | `ulasan` | tetap `kritik` |
| `TEKS_NEW` | `[teks]` | `nama` | tetap `judul` |
| `ANGKA_NEW` | `[angka]` | `ukuranMb` | tetap `harga` |
| `EXTRA_NEW` | field angka opsional | `tahunBuka` | tetap `tahunDibuat` |
| `PREFIX_NEW` | awalan `[unik]` di seed | `MNU-` | tetap `LKS-` |
| `VAL1_NEW`..`VAL3_NEW` | tiga nilai `[filter]` di seed | `makanan`,`minuman`,`dessert` | tetap `realisme`,`impresionisme`,`abstrak` |
| `MEDIA_NEW` | teks di subdokumen embed | `Porsi` | tetap `Kanvas` |
| `TOPIKNO_NEW` | nomor topik | `Topik 07` | tetap `Topik 14` |
| `TOPIK_NEW` | nama topik | `Menu Kedai` | tetap `Galeri Seni` |

Nama lama (sisi kiri `s|...|...|`) tidak perlu diubah — skrip sudah tahu.

#### Contoh kasus "cuma sedikit berbeda"

Topik **Buku** dengan pemasok **Penulis**, tapi field `judul`, `harga`, dan embed
`ukuran`/`kritik` tetap sama. Cukup empat baris:

```bash
MAIN_NEW="buku"
SUP_NEW="penulis"
UNIK_NEW="kodeBuku"
FILTER_NEW="genre"
```

Hasil terverifikasi: `bukuModel.js`, `penulisModel.js`, `/buku`, `/penulis`, `kodeBuku`,
`genre`, sementara `judul`, `harga`, `ukuran`, `kritik` tidak tersentuh. Newman:
**27 request / 59 assertion / 0 failure**.

#### Versi lengkap (semua diganti)

Topik **Menu Kedai**:

```bash
MAIN_NEW="menu";      SUP_NEW="kedai"
UNIK_NEW="kodeMenu";  FILTER_NEW="kategori"
EMBED1_NEW="varian";  EMBED2_NEW="ulasan"
TEKS_NEW="nama";      EXTRA_NEW="tahunBuka"
PREFIX_NEW="MNU-";    MEDIA_NEW="Porsi"
VAL1_NEW="makanan";   VAL2_NEW="minuman";  VAL3_NEW="dessert"
TOPIKNO_NEW="Topik 07";  TOPIK_NEW="Menu Kedai"
```

#### Menjalankan

```bash
bash scripts/retarget.sh
```

**Sekali jalan saja.** Setelah sukses, skrip menulis penanda `.retarget-applied`
(sudah di `.gitignore`). Menjalankan ulang akan **ditolak** — dan itu memang yang
diinginkan: run kedua merusak nama field. Contoh nyata yang pernah terjadi: aturan
`harga`→`ukuranMb` pada run pertama, lalu aturan `ukuran`→`spesifikasi` mencocokkan
`ukuran` di dalam `ukuranMb`, hasilnya jadi `spesifikasiMb`.

Kalau perlu mengulang dari awal:

```bash
git restore .                        # kembali ke kondisi Lukisan
rm -f .retarget-applied
bash scripts/retarget.sh
```

Skrip mencetak dua blok pemeriksaan:

- `== Sisa token domain lama ==` — hanya token yang **kamu minta diganti** yang diperiksa,
  dicocokkan dengan batas identifier supaya `ukuran` tidak menangkap `ukuranMb`.
  Kalau ada baris tersisa, perbaiki manual berkas yang disebut.
- `== Nama berkas vs require ==` — memastikan `require("./menuModel")` benar-benar ada
  berkasnya. Ini menggigit di Linux/macOS yang case-sensitive.

Keduanya harus berakhir `bersih`, lalu lanjut ke bagian 0.1.

### Kalau topik baru memaksa angka seed berbeda

Assertion berikut menyebut angka yang berasal dari data seed. Ubah **hanya kalau** kamu
mengubah angka di `scripts/seed.js`:

| Request | Angka yang disebut |
|---|---|
| Ambil semua lukisan | `lengthOf(6)`, `total` 6, `totalPages` 1 |
| Filter berdasarkan aliran | `eql(2)` |
| Filter rentang harga | `eql(3)`, batas `5000000`–`9000000` |
| Sorting harga menurun | `12500000`, `9800000` |
| Pagination halaman 2 | `lengthOf(2)` |

Cara aman: **biarkan angka seed apa adanya**. Hanya nama dan label yang diganti.

### Postman kalau topik berbeda

Tidak ada langkah manual tambahan — skrip sudah menangani semuanya:

- berkas koleksi & environment ikut ter-rename (`Tugas3_Menu.postman_collection.json`),
- nama koleksi di dalam JSON menjadi `Tugas 3 - API Menu MongoDB`,
- nama environment menjadi `Tugas 3 - Menu MongoDB (Lokal)`,
- setiap URL, body, dan pesan assertion ikut memakai nama field baru,
- variabel environment ikut berganti: `{{paintingId}}` → `{{menuId}}`,
  `{{artistId}}` → `{{kedaiId}}` (terverifikasi pada run Obat/Apotek: `obatId`, `apotekId`).

Yang **tidak** ikut di-retarget dan memang seharusnya dibiarkan: `postman/Tugas2_Lukisan.*`
dan `postman_collection.json` (artefak Tugas 1 & 2) — keduanya bukti riwayat, bukan koleksi
yang dipakai saat UTS. Koleksi Tugas 3 lama tidak perlu disimpan; riwayatnya tetap ada di git.

Cara cepat memastikan koleksi baru sehat, sebelum ambil screenshot:

```bash
npm run seed
npx --yes newman run postman/Tugas3_<Topik>.postman_collection.json \
  -e postman/Tugas3_<Topik>.postman_environment.json --reporters cli
```

Harus `27 requests / 59 assertions / 0 failed`. Prosedur ini sudah diuji end-to-end dengan
enam domain berbeda — Produk/Pemasok, Resep/Koki, Menu/Kedai, Buku/Penulis, Jurnal/Penerbit,
dan Obat/Apotek — semuanya lulus penuh tanpa menyunting satu assertion pun.

---

## 0.1 Ubah nama database ke `uts_paw2`

Buka `<repo>\.env` (Notepad / VS Code), ubah **satu baris**:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/uts_paw2
```

`API_KEY` biarkan apa adanya (`rahasia2428240069`); nilai ini dipakai header `x-api-key`.

### 0.2 Nyalakan MongoDB

Buka PowerShell baru di `<repo>`, jalankan (path terverifikasi di mesin ini):

```powershell
& 'C:\mongodb\mongodb-win32-x86_64-windows-4.4.29\bin\mongod.exe' --dbpath C:\mongodb\data --port 27017 --bind_ip 127.0.0.1
```

Biarkan jendela ini terbuka. Berhasil bila muncul `Waiting for connections` dengan
`"port":27017`. Jendela ini **bukan** isi Gambar 1 — Gambar 1 adalah jendela `npm start`
pada langkah 0.4; biarkan keduanya terbuka supaya bisa dipotret berdampingan bila perlu.

### 0.3 Isi data seed

PowerShell **kedua**:

```powershell
cd <repo>
npm run seed
```

Harus keluar: `MongoDB terhubung: uts_paw2` lalu
`Seed selesai: 3 pelukis, 6 lukisan tersimpan di database uts_paw2`.

Kalau kamu sudah menjalankan bagian 0.0, kata `pelukis` dan `lukisan` pada baris itu ikut
berganti mengikuti domain baru (contoh Menu Kedai: `Seed selesai: 3 kedai, 6 menu tersimpan
di database uts_paw2`). Yang wajib tetap sama adalah angkanya: **3** dan **6**.

### 0.4 Pastikan port 3000 kosong, lalu nyalakan server

```powershell
netstat -ano | findstr :3000
```

Kalau ada baris `LISTENING`, matikan dulu prosesnya — kalau tidak, server baru gagal mengikat
port dan kamu akan **melihat data dari database lama** (pernah kejadian di sesi ini):

```powershell
powershell -NoProfile -Command "Stop-Process -Id <PID> -Force"
```

Baru jalankan:

```powershell
npm start
```

Harus keluar `MongoDB terhubung: uts_paw2` + `Server berjalan di http://localhost:3000`.
**Jangan tutup jendela ini** sampai semua screenshot selesai.

### 0.5 Buka Postman dan impor koleksi

1. Buka Postman (`Win`, ketik `Postman`).
2. Kiri atas: **Import** → **Files** → pilih
   `<repo>\postman\Tugas3_Lukisan_MongoDB.postman_collection.json` → **Import**.
3. Import lagi untuk environment: `<repo>\postman\Tugas3_Lukisan_MongoDB.postman_environment.json`.
4. Kanan atas: dropdown environment → pilih **Tugas 3 - Lukisan MongoDB (Lokal)**.
   Kalau lupa, `{{base_url}}` dan `{{api_key}}` tidak terisi dan semua request gagal.

Koleksi berisi 27 request dalam 4 folder:

| Folder | Isi |
|---|---|
| Info dan Daftar | Info API, Ambil semua lukisan |
| Filter, Sort, Pagination, Projection | 7 request: aliran, rentang harga, nama pelukis, sorting, pagination, projection, dan 1 error sort |
| CRUD dan Relasi | Tambah lukisan, Ambil by ID, Perbarui, 3 request artists, Hapus |
| Skenario Gagal | 11 request penolakan (401, 400, 404, 409) |

Setelah bagian 0.0, nama berkas dan nama environment berubah. Cara menemukannya tanpa
menebak: `ls postman/` di terminal, lalu di dalam Postman pilih environment yang namanya
diawali `Tugas 3 - `. Jumlah request tetap 27 dalam 4 folder yang sama.

---

## 1. Bagian 1 — Identitas Topik

### 1.1 Sampul laporan (halaman 1 template)

Isi tabel identitas di halaman pertama:

| Kolom template | Isi |
|---|---|
| Nama | M. Rizki Algipari |
| NIM | 2428240069 |
| Kelas | SI5C |
| Nomor dan judul topik | Topik 14 — Galeri Seni: Lukisan |
| Basis data yang dipakai | MongoDB Compass |
| Tautan repositori GitHub | `https://github.com/Ridzz05/uts-paw2-2428240069` (setelah rename) |
| Hash commit | hasil `git log --oneline -1` (isi 7 karakter pertama) |

Catatan kelas: berkas template temanmu berkelas **SI5C**, sedangkan repo ini tercatat **SI5B**
(`README.md`, `app.js`). Pakai kelas yang benar sesuai KRS-mu, dan sesuaikan nama berkas akhir.

### 1.2 Tabel Identitas Topik (halaman 2 template)

Isi tabel dengan nilai berikut. Nama harus **persis**.

> Nilai di bawah adalah kondisi repo **sebelum** retarget (Topik 14 Lukisan).
> Kalau kamu menjalankan bagian 0.0, ganti tiap nilai dengan isian `_NEW` di
> `scripts/retarget.sh` — nilainya harus sama persis dengan yang tertulis di Lampiran
> Daftar Topik, termasuk huruf besar-kecil.

| Kolom template | Isi |
|---|---|
| Model utama dan endpoint | `/paintings` |
| Model pendukung dan endpoint | `/artists` |
| `[unik]`, `[teks]`, `[angka]` | `kodeLukisan`, `judul`, `harga` |
| `[filter]` | `aliran` |
| `[embed]` | `ukuran` dan `kritik` |
| `[ref]` | `pelukis` |
| Ketentuan C3 (projection) | `_id, kodeLukisan, judul, harga, aliran` |

Sumber acuan kalau dosen tanya: `<repo>\models\paintingsModel.js` (schema + subdokumen
`ukuranSchema`, `kritikSchema`, field referensi `pelukis`), `README.md` bagian
"Relasi Antar Schema".

---

## 2. Bagian 2 — Tujuh tangkapan layar

Ambil dengan **Win + Shift + S** (Snipping Tool), pilih area, lalu Ctrl+V ke kotak putus-putus
di template. Pastikan status code dan isi respons ikut terpotong.

> Semua nama request, nama collection, dan nama field di bagian ini adalah kondisi
> **sebelum** retarget (Topik 14 Lukisan). Kalau kamu sudah menjalankan bagian 0.0, padanan
> namanya mengikuti `_NEW`, contoh Menu Kedai:
> `Tambah lukisan baru` → `Tambah menu baru`,
> `paintings` → `menu`, `kodeLukisan` → `kodeMenu`, `pelukis` → `kedai`,
> `aliran` → `kategori`, `ukuran` → `varian`, `kritik` → `ulasan`,
> `{{paintingId}}` → `{{menuId}}`. Cek nama persisnya di Postman, jangan menebak.

### Gambar 1 — Terminal server (B1)

Buka: jendela PowerShell **0.2** (mongod) dan **0.4** (`npm start`).
Potret keduanya, atau minimal jendela `npm start` yang memuat:
- perintah `npm start`
- `MongoDB terhubung: uts_paw2`
- `Server berjalan di http://localhost:3000`

### Gambar 2 — Isi basis data (B1, B2)

Harus terlihat database `uts_paw2`, **dua** collection, dan minimal satu dokumen lukisan.

**Opsi A — MongoDB Compass** (belum terpasang di mesin ini; pasang sekali dari PowerShell):

```powershell
& 'C:\mongodb\mongodb-win32-x86_64-windows-4.4.29\bin\Install-Compass.ps1'
```

Buka Compass → **New connection** → URI `mongodb://127.0.0.1:27017` → **Connect** →
pilih database `uts_paw2` di sidebar kiri → klik collection `paintings` → tampil 6 dokumen.
Potret seluruh jendela: sidebar (`uts_paw2` + `artists` + `paintings`) dan satu dokumen terbuka.

**Opsi B — shell mongod** (terverifikasi jalan, kalau Compass gagal dipasang):

```powershell
& 'C:\mongodb\mongodb-win32-x86_64-windows-4.4.29\bin\mongo.exe' uts_paw2 --eval "printjson(db.getCollectionNames()); print('paintings=' + db.paintings.count()); printjson(db.paintings.findOne())"
```

Output yang muncul: `[ "artists", "paintings" ]`, `paintings=6`, lalu satu dokumen lengkap
dengan `kodeLukisan: "LKS-2428240069-01"` dan `pelukis: ObjectId(...)`. Potret terminal itu.

### Gambar 3 — POST model utama (C1, B3)

Postman → folder **CRUD dan Relasi** → klik request **Tambah lukisan baru**.

1. Tab **Body** → pilih **raw** → **JSON**. Body sudah berisi:
   ```json
   {
     "kodeLukisan": "LKS-UJI-2428240069",
     "judul": "Lukisan Bukti Uji 2428240069",
     "pelukis": "M. Rizki Algipari",
     "aliran": "realisme",
     "tahunDibuat": 2026,
     "harga": 4500000,
     "ukuran": { "tinggi": 60, "lebar": 40, "media": "Kanvas" },
     "kritik": [
       { "nama": "Panitia Uji", "rating": 5, "komentar": "Lukisan bukti uji 2428240069." }
     ]
   }
   ```
2. Tab **Headers** → pastikan dua baris ini **tercentang**: `Content-Type: application/json`
   dan `x-api-key: {{api_key}}`.
3. Klik **Send**.
4. Respons harus `201 Created` dengan `"message": "Data berhasil ditambahkan"` dan `data`
   memuat `pelukis` sebagai objek (`nama: "M. Rizki Algipari"`), `ukuran` objek, dan
   `kritik` array — itu bukti `[ref]` dan `[embed]` sekaligus.

Potret area yang memuat: dropdown method **POST**, URL `{{base_url}}/paintings`, tab Body,
status **201 Created**, dan panel respons. Kalau tab Body menutupi respons, potret dua kali
lalu tempel berdampingan di kotak yang sama.

### Gambar 4 — GET `?[filter]=...` + projection (C3)

Satu gambar harus membuktikan filter **dan** projection.

Postman → folder **Skenario Gagal** → request **Projection UTS (kodeLukisan,judul,harga,aliran)**.
Kalau URL-nya belum memuat filter, klik tab **Params** dan tambahkan baris `aliran` = `realisme`,
sehingga URL menjadi:

```
{{base_url}}/paintings?aliran=realisme&fields=kodeLukisan,judul,harga,aliran
```

Klik **Send**. Hasil terverifikasi: `200 OK`, `"pagination": {"total": 2, ...}`, dan setiap
objek di `data` hanya punya lima key: `_id`, `kodeLukisan`, `judul`, `aliran`, `harga`.

Potret URL lengkap (kolom alamat) + status 200 + isi respons yang memperlihatkan tidak ada
field `pelukis`, `ukuran`, atau `kritik`.

### Gambar 5 — GET `/:id` dengan `[ref]` ter-populate (C4)

Postman → folder **CRUD dan Relasi** → request **Ambil lukisan baru berdasarkan ID**.
URL memakai `{{paintingId}}` yang otomatis diisi request POST tadi. Klik **Send**.

Hasil: `200 OK`, dan `data.pelukis` berupa **objek** berisi `_id`, `nama`, `negara`,
`tahunLahir`, `aliran`, `bio` — bukan deretan angka ObjectId.

Potret URL yang memuat id lukisan + status 200 + objek `pelukis` yang terbuka.

### Gambar 6 — Satu skenario galat (A3)

Pilih **409 duplikat** (paling kuat, sekaligus membuktikan field `[unik]`).

Postman → folder **Skenario Gagal** → request **POST kodeLukisan duplikat** → **Send**.

Hasil: `409 Conflict` + `{"status":"error","message":"Data duplikat: kodeLukisan sudah digunakan","data":null}`.

Alternatif bila ingin 400: request **POST tanpa field judul** → `400` +
`"Field judul wajib diisi"`.

Potret method + URL + body + status + pesan.

### Gambar 7 — Riwayat commit (Proses)

Buka `https://github.com/Ridzz05/si2b_kuis1_mrizkialgipari/commits/main` di browser.
Repo ini sudah punya 14 commit (memenuhi syarat minimal tiga).

Potret daftar commit: nama repo di atas, lalu minimal tiga baris commit beserta tanggal.

**Catatan penting:** checklist template butir 1 mewajibkan repo bernama `uts-paw2-<NIM>` dan
publik. Sebelum ujian, siapkan salah satu:
- GitHub → repo → **Settings** → kolom **Repository name** → ganti jadi `uts-paw2-2428240069`
  → **Rename**; atau
- **New repository** `uts-paw2-2428240069`, lalu `git remote set-url origin <url baru> &&
  git push -u origin main`.

Setelah rename, tautan di sampul laporan harus memakai URL baru.

---

## 3. Bagian 3 — Tabel hasil pengujian endpoint (15 baris)

Semua request di bawah ada di koleksi Postman. **Jalankan satu per satu dan catat status yang
kamu lihat sendiri**; kolom "Perkiraan" adalah hasil yang sudah diverifikasi di sesi ini.

> Nama request di tabel ini adalah kondisi **sebelum** retarget. Setelah bagian 0.0, ambil
> nama barunya langsung dari Postman (urutan dan jumlahnya tetap 15). Nomor baris tidak
> berubah, jadi cukup cocokkan posisinya.

| No | Request (klik di Postman) | Folder | Perkiraan | Isi kolom "Status didapat" | Sesuai |
|---|---|---|---|---|---|
| 1 | Tambah pelukis baru | CRUD dan Relasi | 201 | tulis angka yang tampil | Ya |
| 2 | POST nama pelukis duplikat | Skenario Gagal | 409 | | Ya |
| 3 | Daftar pelukis dengan jumlah lukisan | CRUD dan Relasi | 200 | | Ya |
| 4 | Tambah lukisan baru | CRUD dan Relasi | 201 | | Ya |
| 5 | POST kodeLukisan duplikat | Skenario Gagal | 409 | | Ya |
| 6 | POST tanpa field judul | Skenario Gagal | 400 | | Ya |
| 7 | POST harga di bawah minimum | Skenario Gagal | 400 | | Ya |
| 8 | Ambil semua lukisan | Info dan Daftar | 200 | | Ya |
| 9 | Filter berdasarkan aliran | Filter, Sort, Pagination, Projection | 200 | | Ya |
| 10 | Filter aliran tanpa hasil | Skenario Gagal | 200, `data: []` | | Ya |
| 11 | Projection UTS (kodeLukisan,judul,harga,aliran) | Skenario Gagal | 200, field terbatas | | Ya |
| 12 | Ambil lukisan baru berdasarkan ID | CRUD dan Relasi | 200, `pelukis` populate | | Ya |
| 13 | GET ID tidak ditemukan | Skenario Gagal | 404 | | Ya |
| 14 | GET ID format salah | Skenario Gagal | 400 | | Ya |
| 15 | Endpoint tidak terdaftar | Skenario Gagal | 404 | | Ya |

Pesan galat yang tertulis di laporan (salin apa adanya dari respons):

| Request | Pesan |
|---|---|
| POST tanpa field judul | `Field judul wajib diisi` |
| POST harga di bawah minimum | `Field harga tidak boleh negatif` |
| POST kodeLukisan duplikat | `Data duplikat: kodeLukisan sudah digunakan` |
| POST nama pelukis duplikat | `Data duplikat: nama sudah digunakan` |
| GET ID tidak ditemukan | `Data dengan id 000000000000000000000000 tidak ditemukan` |
| GET ID format salah | `Format id tidak valid` |
| Endpoint tidak terdaftar | `Endpoint tidak ditemukan` |

**Urutan penting:** jalankan nomor 4 **sebelum** 12; request 12 memakai `{{paintingId}}` yang
diisi oleh respons nomor 4. Kalau terbalik, URL jadi `/paintings/` dan hasilnya 404.

Cara cepat menjalankan semua sekaligus (opsional, untuk memastikan tidak ada yang gagal):

```powershell
# di <repo>, server harus hidup
npx --yes newman run postman/Tugas3_Lukisan_MongoDB.postman_collection.json `
  -e postman/Tugas3_Lukisan_MongoDB.postman_environment.json --reporters cli
```

Terverifikasi: **27 request, 59 assertions, 0 failure**. Jalankan `npm run seed` dulu supaya
data kembali bersih; kalau database sudah kotor dari percobaan sebelumnya, request
"Tambah pelukis baru" akan dapat 409.

---

## 4. Bagian 4 — Alasan desain data model

Isi tabel alasan (juga ada di `README.md`):

| Data | Pola | Alasan |
|---|---|---|
| `ukuran`, `kritik` | Embedding | Detail ukuran dan ulasan selalu dibaca bersama lukisannya; menaruhnya di dalam dokumen membuat satu kali baca `GET /paintings/:id` sudah lengkap tanpa join tambahan. |
| `pelukis` | Referencing | Satu pelukis memiliki banyak lukisan; menyimpan ObjectId mencegah duplikasi nama/negara dan cukup di-`populate` saat dibaca. |

---

## 5. Bagian 5 — Kendala dan penyelesaian

Isi dengan kendala nyata yang kamu alami. Contoh yang benar-benar terjadi di repo ini:

| No | Kendala | Penyelesaian |
|---|---|---|
| 1 | Server tidak mau menyala karena port 3000 masih dipakai proses lama, sehingga aplikasi membaca database lama | Memeriksa `netstat -ano \| findstr :3000`, menghentikan prosesnya, lalu menjalankan ulang `npm start` |
| 2 | Request uji gagal 409 saat dijalankan ulang karena data percobaan sebelumnya masih ada | Menjalankan `npm run seed` sebelum setiap rangkaian pengujian |

---

## 6. Bagian 6 — Periksa sebelum mengumpulkan

Centang satu per satu:

| No | Butir | Cara memastikan |
|---|---|---|
| 1 | Repo publik bernama `uts-paw2-NIM` | buka URL di mode Incognito; sudah di-rename (lihat Gambar 7) |
| 2 | Minimal tiga commit (Bagian A, B, C) | halaman `/commits/main`, repo ini punya 14 |
| 3 | `.env` tidak ada di repo, `.env.example` + `.gitignore` ada | terverifikasi: `git ls-files` tidak memuat `.env` |
| 4 | Nama model, endpoint, field sama persis dengan Lampiran Daftar Topik | cocokkan dengan tabel Bagian 1 |
| 5 | README memuat alasan embedding/referencing, daftar endpoint, cara menjalankan | `<repo>\README.md` sudah lengkap |
| 6 | Ketujuh tangkapan layar terbaca dan tabel pengujian terisi | cek ulang hasil tempelan |
| 7 | Identitas, tautan repo, hash commit diisi; pernyataan kejujuran ditandatangani | isi hash dari `git log --oneline -1` |

---

## 7. Berkas yang dibuka, ringkasnya

| Keperluan | Berkas / aplikasi |
|---|---|
| Isi & jalankan server | `<repo>\.env`, `app.js`, `package.json` |
| Seed data | `scripts\seed.js` |
| Bukti data mentah | MongoDB Compass atau `mongo.exe` |
| Uji semua endpoint | Postman + `postman\Tugas3_Lukisan_MongoDB.postman_collection.json` + `..._environment.json` |
| Isi laporan | `UTS-PAW2-SI5C-2428240113.pdf` (template), `README.md`, `.omp\UTS_READINESS_PAW2.md` |
| Bukti lama yang bisa dipakai ulang | `bukti\01`…`18` (lihat tabel di `.omp\UTS_READINESS_PAW2.md` bagian 3) |

## 8. Simpan sebagai

Nama berkas: `UTS-PAW2-SI5C-2428240069.pdf` → unggah ke LMS bersama tautan repo.
