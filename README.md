# uts-paw2-2428240069

RESTful API Express.js + **MongoDB** untuk UTS Praktikum PAW II — **Topik 14: Bioskop (Film)**.

- **Nama:** M. Rizki Algipari
- **NIM:** 2428240069
- **Kelas:** SI5B
- **Model utama / endpoint:** `Film` — `/film`
- **Model pendukung / endpoint:** `Studio` — `/studio`
- **Database:** `uts_paw2` (2 collection: `film`, `studio`)
- **Repository:** https://github.com/Ridzz05/uts-paw2-2428240069

## Cara Menjalankan

Prasyarat: MongoDB berjalan di `127.0.0.1:27017` (mis. `mongod --dbpath C:\mongodb\data --port 27017 --bind_ip 127.0.0.1`).

```bash
cp .env.example .env      # isi MONGODB_URI
npm install
npm run seed              # 3 studio dan 6 film
npm start
```

Server berjalan di `http://localhost:3000`. `MONGODB_URI` bisa diarahkan ke MongoDB Atlas tanpa mengubah kode. `.env` tidak ikut commit (ada di `.gitignore`).

```env
MONGODB_URI=mongodb://127.0.0.1:27017/uts_paw2
```

## Endpoint

| Method | Path | Keterangan | Status |
|---|---|---|---|
| GET | `/` | Informasi API | 200 |
| POST | `/studio` | Tambah studio | 201, 400, 409 (`kode` duplikat) |
| GET | `/studio` | Daftar studio | 200 |
| POST | `/film` | Tambah film | 201, 400, 409 (`kodeFilm` duplikat) |
| GET | `/film` | Daftar film; `?genre=`, `?sort=`, `page`, `limit`, `fields` | 200, 400 |
| GET | `/film/:id` | Satu film, `studioId` ter-populate (`kode`, `nama`) | 200, 400 (id salah format), 404 |
| * | rute lain | Tidak terdaftar | 404 |

Contoh:

```
GET /film?genre=komedi
GET /film?genre=komedi&sort=durasiMenit     # menaik; -durasiMenit = menurun
```

`POST /studio`

```json
{ "kode": "ST1", "nama": "Studio 1" }
```

`POST /film`

```json
{
  "kodeFilm": "FLM-001",
  "judul": "Contoh judul",
  "durasiMenit": 11,
  "genre": "drama",
  "produksi": { "sutradara": "Contoh sutradara", "tahun": "Contoh tahun" },
  "studioId": "<_id Studio>"
}
```

Bentuk respons: `{ "status": "success|error", "message": "...", "data": ..., "pagination": {...} }` (`pagination` hanya pada daftar).

## Model

### `Film` (collection `film`)

| Field | Tipe | Aturan |
|---|---|---|
| `kodeFilm` | String | wajib, unik, trim |
| `judul` | String | wajib, trim |
| `durasiMenit` | Number | wajib, min 1 |
| `genre` | String | wajib, trim; dipakai filter (tidak peka huruf besar-kecil) |
| `produksi` | Subdokumen | `{ sutradara: String, tahun: String }`, tanpa `_id` |
| `studioId` | ObjectId | wajib, `ref: 'Studio'`, harus menunjuk Studio yang ada |
| `createdAt` | Date | default saat dibuat |

### `Studio` (collection `studio`)

| Field | Tipe | Aturan |
|---|---|---|
| `kode` | String | wajib, unik, trim |
| `nama` | String | wajib, trim |

## Alasan Desain Data

| Data | Pola | Alasan |
|---|---|---|
| `produksi` | Embedding | Sutradara dan tahun produksi selalu dibaca bersama film dan tidak dipakai berdiri sendiri, sehingga satu pembacaan `GET /film/:id` sudah lengkap tanpa join. |
| `studioId` | Referencing | Satu studio dipakai banyak film; menyimpan ObjectId mencegah duplikasi data studio dan cukup di-`populate` saat detail dibaca. |

## Pengujian

Koleksi Postman: `postman/UTS_Film.postman_collection.json` + `postman/UTS_Film.postman_environment.json` (16 request, 15 skenario laporan + 1 gabungan filter/sort untuk Gambar 4). Jalankan `npm run seed` sebelum setiap rangkaian, lalu:

```bash
bash postman/run_newman.sh
```

| No | Skenario | Status |
|---|---|---|
| 1 | `POST /studio` | 201 |
| 2 | `POST /studio` kode duplikat | 409 |
| 3 | `GET /studio` | 200 |
| 4 | `POST /film` | 201 |
| 5 | `POST /film` `kodeFilm` duplikat | 409 |
| 6 | `POST /film` tanpa `judul` | 400 |
| 7 | `POST /film` `durasiMenit` di bawah minimum | 400 |
| 8 | `GET /film` | 200 (array) |
| 9 | `GET /film?genre=komedi` | 200 (hanya komedi) |
| 10 | `GET /film?genre=tidak_ada` | 200 (`[]`) |
| 11 | `GET /film?sort=durasiMenit` | 200 (menaik) |
| 12 | `GET /film/:id` | 200 (`studioId` ter-populate) |
| 13 | `GET /film/:id` tidak ditemukan | 404 |
| 14 | `GET /film/abc` | 400 |
| 15 | `GET /rute-tidak-ada` | 404 |

## Struktur Folder

```
app.js          entry point: sambung MongoDB, pasang middleware, mount route
config/         koneksi database mongoose
routes/         rute per resource (film, studio)
controllers/    validasi, query, bentuk respons
models/         schema mongoose Film dan Studio
middlewares/    logger, validasi query, error handler
utils/          pelindung karakter regex
scripts/        seed data awal
postman/        koleksi dan environment pengujian
bukti/          tangkapan layar bukti pengujian
```
