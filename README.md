# si2b_kuis1_mrizkialgipari

RESTful API Express.js + **MongoDB** untuk data Bioskop (galeri seni).

- **Nama:** M. Rizki Algipari
- **NIM:** 2428240069
- **Kelas:** SI5B
- **Absen:** 14
- **Topik:** tahun — Galeri Seni: Bioskop
- **Resource:** `/Bioskop` (relasi ke `/film`)

## Tautan

**Repository GitHub:** https://github.com/Ridzz05/si2b_kuis1_mrizkialgipari
**Deployment Vercel:** https://tugas1-restful-2428240069.vercel.app

## Cara Menjalankan dengan MongoDB

Prasyarat: server MongoDB berjalan di `127.0.0.1:27017` (misalnya `mongod --dbpath C:\mongodb\data --port 27017 --bind_ip 127.0.0.1`).

```bash
cp .env.example .env      # lalu isi API_KEY dan MONGODB_URI
npm install
npm run seed              # mengisi 3 film dan 6 Bioskop
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
MONGODB_URI=mongodb://127.0.0.1:27017/si2b_Bioskop
```

## Relasi Antar Schema

**Embedding** — detail `drama` (objek) dan daftar `komedi` (array subdokumen) tersimpan di dalam dokumen Bioskop.

**Referencing** — field `film` pada `Bioskop` berisi ObjectId yang menunjuk dokumen pada collection `film`. Saat dibaca, referensi tersebut di-`populate` menjadi objek film.

### Field `Bioskop`

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `_id` | ObjectId | otomatis | Dibuat otomatis oleh MongoDB |
| `kodeFilm` | string | ya | Kode unik Bioskop (indeks unik, mis. `FLM-2428240069-01`) |
| `judul` | string | ya | Judul Bioskop |
| `film` | ObjectId → `film` | ya | Referensi ke dokumen film |
| `genre` | string | ya | Aliran seni (disimpan huruf kecil) |
| `createdAt` | number | tidak | Tahun pembuatan |
| `durasiMenit` | number | ya | DurasiMenit Bioskop |
| `drama` | object | tidak | `{ tinggi, lebar, media }` — tertanam |
| `komedi` | array | tidak | `[{ nama, rating (1–5), komentar, tanggal }]` — tertanam |

### Field `film`

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `_id` | ObjectId | otomatis | Dibuat otomatis oleh MongoDB |
| `nama` | string | ya | Unik |
| `negara` | string | tidak | Default `Indonesia` |
| `tahunLahir` | number | tidak | Tahun lahir film |
| `genre` | string | tidak | Aliran utama film |
| `bio` | string | tidak | Keterangan singkat |

Saat POST/PUT, field `film` boleh berisi ObjectId film yang sudah ada **atau** nama film. Nama yang belum terdaftar akan dibuatkan dokumen `film` baru secara otomatis.

## Daftar Endpoint

| Method | Endpoint | API key | Keterangan |
|---|---|---|---|
| GET | `/` | Tidak | Informasi API |
| GET | `/Bioskop` | Tidak | Daftar Bioskop dengan filter, sorting, pagination, projection |
| GET | `/Bioskop/:id` | Tidak | Satu Bioskop (film ter-populate, komedi & drama tertanam) |
| POST | `/Bioskop` | Ya (`x-api-key`) | Menambah Bioskop |
| PUT | `/Bioskop/:id` | Ya (`x-api-key`) | Mengubah seluruh field Bioskop |
| DELETE | `/Bioskop/:id` | Ya (`x-api-key`) | Menghapus Bioskop (204 No Content) |
| GET | `/film` | Tidak | Daftar film beserta `jumlahBioskop` |
| GET | `/film/:id` | Tidak | Detail film beserta daftar Bioskopnya |
| POST | `/film` | Ya (`x-api-key`) | Menambah film |

Endpoint lain menghasilkan `404` dengan pesan `Endpoint tidak ditemukan`.

## Parameter Query `GET /Bioskop`

| Parameter | Contoh | Keterangan |
|---|---|---|
| `genre` | `?genre=sutradara` | Filter genre (tidak membedakan huruf besar/kecil) |
| `film` | `?film=Rahmat Hidayat` | Filter berdasarkan nama atau ObjectId film |
| `durasiMenitMin` | `?durasiMenitMin=5000000` | Batas bawah durasiMenit |
| `durasiMenitMax` | `?durasiMenitMax=9000000` | Batas atas durasiMenit |
| `createdAt` | `?createdAt=2023` | Filter tahun pembuatan |
| `q` | `?q=musi` | Cari judul (substring, tidak membedakan huruf besar/kecil) |
| `sort` | `?sort=-durasiMenit,judul` | Daftar field dipisah koma; awalan `-` berarti menurun |
| `page` | `?page=2` | Halaman, minimal 1 (default 1) |
| `limit` | `?limit=5` | Jumlah per halaman, 1–50 (default 10) |
| `fields` | `?fields=judul,film,durasiMenit` | Projection: hanya field yang disebut yang dikembalikan |

Field `sort` yang diizinkan: `judul`, `genre`, `createdAt`, `durasiMenit`, `createdAt`.
Field `fields` yang diizinkan: `judul`, `film`, `genre`, `createdAt`, `durasiMenit`, `drama`, `komedi`, `createdAt`, `updatedAt`.
Nilai di luar daftar, `page`/`limit` bukan angka, atau `page` < 1 menghasilkan `400` beserta pesan yang menyebut field bermasalah.

Contoh respons `GET /Bioskop?page=2&limit=2`:

```json
{
  "status": "success",
  "message": "Data Bioskop berhasil diambil",
  "data": ["..."],
  "pagination": { "page": 2, "limit": 2, "total": 6, "totalPages": 3, "hasNext": true, "hasPrev": true }
}
```

## Contoh Body POST `/Bioskop`

```json
{
  "kodeFilm": "FLM-2428240069-07",
  "judul": "Senja di Musi",
  "film": "Rahmat Hidayat",
  "genre": "sutradara",
  "createdAt": 2023,
  "durasiMenit": 7500000,
  "drama": { "tinggi": 80, "lebar": 60, "media": "Kanvas" },
  "komedi": [
    { "nama": "Andi Saputra", "rating": 5, "komentar": "Warna senja tersaji sangat hidup." }
  ]
}
```

## Contoh Body PUT `/Bioskop/:id`

```json
{
  "kodeFilm": "FLM-2428240069-01",
  "judul": "Senja di Musi (Revisi)",
  "film": "Rahmat Hidayat",
  "genre": "impresionisme",
  "createdAt": 2024,
  "durasiMenit": 8000000
}
```

`createdAt` bersifat opsional. Jika tidak dikirim saat `PUT`, nilainya menjadi `null`.

## Pengujian Otomatis

Jalankan server lebih dulu, lalu:

```bash
npx --yes newman run postman/Tugas3_Bioskop_MongoDB.postman_collection.json \
  -e postman/Tugas3_Bioskop_MongoDB.postman_environment.json --reporters cli
```

Hasil yang diharapkan: 27 request, 59 assertions, 0 failure.

## Bukti Pengujian

Tangkapan layar tiap pengujian tersimpan di folder `bukti/`:

| Berkas | Skenario |
|---|---|
| `01-mongodb-server.png` | Server MongoDB berjalan (`waiting for connections` pada port 27017) |
| `02-seed-data.png` | `npm run seed` mengisi 3 film dan 6 Bioskop |
| `03-server-start.png` | `npm start` terkoneksi ke MongoDB dan siap di port 3000 |
| `04-get-semua-Bioskop.png` | `GET /Bioskop` mengembalikan seluruh data beserta metadata pagination |
| `05-get-detail-Bioskop.png` | `GET /Bioskop/:id` menampilkan komedi dan drama tertanam |
| `06-filter-genre.png` | Filter `genre=sutradara` |
| `07-filter-durasiMenit.png` | Filter `durasiMenitMin` dan `durasiMenitMax` |
| `08-filter-film.png` | Filter `film=Rahmat Hidayat` |
| `09-sorting-durasiMenit.png` | Sorting `sort=-durasiMenit` |
| `10-pagination.png` | Pagination `page=2&limit=2` |
| `11-projection.png` | Projection `fields=judul,film,durasiMenit` |
| `12-embedding-referencing.png` | Dokumen mentah (film berupa ObjectId) dibandingkan respons API (film ter-populate) |
| `13-post-Bioskop.png` | `POST /Bioskop` berhasil membuat Bioskop dan film baru |
| `14-film.png` | `GET /film` beserta `jumlahBioskop` dan `GET /film/:id` |
| `15-error-404.png` | ID tidak ditemukan menghasilkan 404 |
| `16-error-401.png` | POST tanpa API key menghasilkan 401 |
| `17-error-400.png` | POST tanpa `judul` menghasilkan 400 |
| `18-newman.png` | Seluruh assertion koleksi Tugas 3 lulus |
| `19-error-409.png` | POST dengan `kodeFilm` duplikat menghasilkan 409 |
