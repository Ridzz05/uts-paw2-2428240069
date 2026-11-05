# si2b_kuis1_mrizkialgipari

RESTful API Express.js + **MongoDB** untuk data lukisan (galeri seni).

- **Nama:** M. Rizki Algipari
- **NIM:** 2428240069
- **Kelas:** SI5B
- **Absen:** 14
- **Topik:** Topik 14 — Galeri Seni: Lukisan
- **Resource:** `/paintings` (relasi ke `/artists`)

## Tautan

**Repository GitHub:** https://github.com/Ridzz05/si2b_kuis1_mrizkialgipari
**Deployment Vercel:** https://tugas1-restful-2428240069.vercel.app

## Cara Menjalankan dengan MongoDB

Prasyarat: server MongoDB berjalan di `127.0.0.1:27017` (misalnya `mongod --dbpath C:\mongodb\data --port 27017 --bind_ip 127.0.0.1`).

```bash
cp .env.example .env      # lalu isi API_KEY dan MONGODB_URI
npm install
npm run seed              # mengisi 3 pelukis dan 6 lukisan
npm start
```

Mode development (auto-restart dengan nodemon):

```bash
npm run dev
```

Server berjalan di `http://localhost:3000`. Koneksi database memakai `MONGODB_URI`, sehingga bisa diarahkan ke MongoDB Atlas hanya dengan mengubah `.env` tanpa menyentuh kode.

## Struktur Folder

```
app.js                  entry point: sambung MongoDB, pasang middleware, mount route
config/                 koneksi database mongoose
routes/                 definisi rute per resource
controllers/            validasi, penyusunan query, dan bentuk respons
models/                 schema mongoose beserta statis query
middlewares/            logger, pemeriksa API key, validasi query, error handler
utils/                  helper kecil (pelindung karakter regex)
scripts/                seed data awal
postman/                koleksi dan environment pengujian
bukti/                  tangkapan layar bukti pengujian
```

## Variabel Lingkungan

`.env` berisi `API_KEY` dan `MONGODB_URI` serta tidak boleh di-commit (sudah ada di `.gitignore`). Endpoint POST, PUT, dan DELETE mewajibkan header `x-api-key` sesuai nilai `API_KEY`.

```env
API_KEY=isi_api_key_anda
MONGODB_URI=mongodb://127.0.0.1:27017/si2b_lukisan
```

## Relasi Antar Schema

**Embedding** — detail `ukuran` (objek) dan daftar `kritik` (array subdokumen) tersimpan di dalam dokumen lukisan.

**Referencing** — field `pelukis` pada `paintings` berisi ObjectId yang menunjuk dokumen pada collection `artists`. Saat dibaca, referensi tersebut di-`populate` menjadi objek pelukis.

### Field `paintings`

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `_id` | ObjectId | otomatis | Dibuat otomatis oleh MongoDB |
| `kodeLukisan` | string | ya | Kode unik lukisan (indeks unik, mis. `LKS-2428240069-01`) |
| `judul` | string | ya | Judul lukisan |
| `pelukis` | ObjectId → `artists` | ya | Referensi ke dokumen pelukis |
| `aliran` | string | ya | Aliran seni (disimpan huruf kecil) |
| `tahunDibuat` | number | tidak | Tahun pembuatan |
| `harga` | number | ya | Harga lukisan |
| `ukuran` | object | tidak | `{ tinggi, lebar, media }` — tertanam |
| `kritik` | array | tidak | `[{ nama, rating (1–5), komentar, tanggal }]` — tertanam |

### Field `artists`

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `_id` | ObjectId | otomatis | Dibuat otomatis oleh MongoDB |
| `nama` | string | ya | Unik |
| `negara` | string | tidak | Default `Indonesia` |
| `tahunLahir` | number | tidak | Tahun lahir pelukis |
| `aliran` | string | tidak | Aliran utama pelukis |
| `bio` | string | tidak | Keterangan singkat |

Saat POST/PUT, field `pelukis` boleh berisi ObjectId pelukis yang sudah ada **atau** nama pelukis. Nama yang belum terdaftar akan dibuatkan dokumen `artists` baru secara otomatis.

## Daftar Endpoint

| Method | Endpoint | API key | Keterangan |
|---|---|---|---|
| GET | `/` | Tidak | Informasi API |
| GET | `/paintings` | Tidak | Daftar lukisan dengan filter, sorting, pagination, projection |
| GET | `/paintings/:id` | Tidak | Satu lukisan (pelukis ter-populate, kritik & ukuran tertanam) |
| POST | `/paintings` | Ya (`x-api-key`) | Menambah lukisan |
| PUT | `/paintings/:id` | Ya (`x-api-key`) | Mengubah seluruh field lukisan |
| DELETE | `/paintings/:id` | Ya (`x-api-key`) | Menghapus lukisan (204 No Content) |
| GET | `/artists` | Tidak | Daftar pelukis beserta `jumlahLukisan` |
| GET | `/artists/:id` | Tidak | Detail pelukis beserta daftar lukisannya |
| POST | `/artists` | Ya (`x-api-key`) | Menambah pelukis |

Endpoint lain menghasilkan `404` dengan pesan `Endpoint tidak ditemukan`.

## Parameter Query `GET /paintings`

| Parameter | Contoh | Keterangan |
|---|---|---|
| `aliran` | `?aliran=realisme` | Filter aliran (tidak membedakan huruf besar/kecil) |
| `pelukis` | `?pelukis=Rahmat Hidayat` | Filter berdasarkan nama atau ObjectId pelukis |
| `hargaMin` | `?hargaMin=5000000` | Batas bawah harga |
| `hargaMax` | `?hargaMax=9000000` | Batas atas harga |
| `tahunDibuat` | `?tahunDibuat=2023` | Filter tahun pembuatan |
| `q` | `?q=musi` | Cari judul (substring, tidak membedakan huruf besar/kecil) |
| `sort` | `?sort=-harga,judul` | Daftar field dipisah koma; awalan `-` berarti menurun |
| `page` | `?page=2` | Halaman, minimal 1 (default 1) |
| `limit` | `?limit=5` | Jumlah per halaman, 1–50 (default 10) |
| `fields` | `?fields=judul,pelukis,harga` | Projection: hanya field yang disebut yang dikembalikan |

Field `sort` yang diizinkan: `judul`, `aliran`, `tahunDibuat`, `harga`, `createdAt`.
Field `fields` yang diizinkan: `judul`, `pelukis`, `aliran`, `tahunDibuat`, `harga`, `ukuran`, `kritik`, `createdAt`, `updatedAt`.
Nilai di luar daftar, `page`/`limit` bukan angka, atau `page` < 1 menghasilkan `400` beserta pesan yang menyebut field bermasalah.

Contoh respons `GET /paintings?page=2&limit=2`:

```json
{
  "status": "success",
  "message": "Data lukisan berhasil diambil",
  "data": ["..."],
  "pagination": { "page": 2, "limit": 2, "total": 6, "totalPages": 3, "hasNext": true, "hasPrev": true }
}
```

## Contoh Body POST `/paintings`

```json
{
  "kodeLukisan": "LKS-2428240069-07",
  "judul": "Senja di Musi",
  "pelukis": "Rahmat Hidayat",
  "aliran": "realisme",
  "tahunDibuat": 2023,
  "harga": 7500000,
  "ukuran": { "tinggi": 80, "lebar": 60, "media": "Kanvas" },
  "kritik": [
    { "nama": "Andi Saputra", "rating": 5, "komentar": "Warna senja tersaji sangat hidup." }
  ]
}
```

## Contoh Body PUT `/paintings/:id`

```json
{
  "kodeLukisan": "LKS-2428240069-01",
  "judul": "Senja di Musi (Revisi)",
  "pelukis": "Rahmat Hidayat",
  "aliran": "impresionisme",
  "tahunDibuat": 2024,
  "harga": 8000000
}
```

`tahunDibuat` bersifat opsional. Jika tidak dikirim saat `PUT`, nilainya menjadi `null`.

## Pengujian Otomatis

Jalankan server lebih dulu, lalu:

```bash
npx --yes newman run postman/Tugas3_Lukisan_MongoDB.postman_collection.json \
  -e postman/Tugas3_Lukisan_MongoDB.postman_environment.json --reporters cli
```

Hasil yang diharapkan: 27 request, 59 assertions, 0 failure.

## Bukti Pengujian

Tangkapan layar tiap pengujian tersimpan di folder `bukti/`:

| Berkas | Skenario |
|---|---|
| `01-mongodb-server.png` | Server MongoDB berjalan (`waiting for connections` pada port 27017) |
| `02-seed-data.png` | `npm run seed` mengisi 3 pelukis dan 6 lukisan |
| `03-server-start.png` | `npm start` terkoneksi ke MongoDB dan siap di port 3000 |
| `04-get-semua-lukisan.png` | `GET /paintings` mengembalikan seluruh data beserta metadata pagination |
| `05-get-detail-lukisan.png` | `GET /paintings/:id` menampilkan kritik dan ukuran tertanam |
| `06-filter-aliran.png` | Filter `aliran=realisme` |
| `07-filter-harga.png` | Filter `hargaMin` dan `hargaMax` |
| `08-filter-pelukis.png` | Filter `pelukis=Rahmat Hidayat` |
| `09-sorting-harga.png` | Sorting `sort=-harga` |
| `10-pagination.png` | Pagination `page=2&limit=2` |
| `11-projection.png` | Projection `fields=judul,pelukis,harga` |
| `12-embedding-referencing.png` | Dokumen mentah (pelukis berupa ObjectId) dibandingkan respons API (pelukis ter-populate) |
| `13-post-lukisan.png` | `POST /paintings` berhasil membuat lukisan dan pelukis baru |
| `14-artists.png` | `GET /artists` beserta `jumlahLukisan` dan `GET /artists/:id` |
| `15-error-404.png` | ID tidak ditemukan menghasilkan 404 |
| `16-error-401.png` | POST tanpa API key menghasilkan 401 |
| `17-error-400.png` | POST tanpa `judul` menghasilkan 400 |
| `18-newman.png` | Seluruh assertion koleksi Tugas 3 lulus |
| `19-error-409.png` | POST dengan `kodeLukisan` duplikat menghasilkan 409 |
