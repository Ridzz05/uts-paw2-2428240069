// Seed data awal: 3 pelukis (collection artists) dan 6 lukisan (collection paintings).
// Setiap lukisan meng-embed detail ukuran serta daftar kritik, dan mereferensikan
// dokumen pelukis lewat ObjectId.
require("dotenv").config();

const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const { Artist } = require("../models/artistsModel");
const { Painting } = require("../models/paintingsModel");

const dataPelukis = [
  {
    nama: "Rahmat Hidayat",
    negara: "Indonesia",
    tahunLahir: 1985,
    aliran: "realisme",
    bio: "Pelukis realisme asal Palembang yang memusatkan karya pada suasana sungai Musi.",
  },
  {
    nama: "Siti Nurhaliza",
    negara: "Indonesia",
    tahunLahir: 1990,
    aliran: "impresionisme",
    bio: "Pelukis impresionisme yang menangkap nuansa cahaya pagi di sekitar kota.",
  },
  {
    nama: "Bagas Prasetyo",
    negara: "Indonesia",
    tahunLahir: 1995,
    aliran: "abstrak",
    bio: "Pelukis abstrak yang memakai bentuk dan warna tanpa nama sebagai ekspresi.",
  },
];

// Data lukisan memakai nama pelukis; ObjectId-nya diisi saat seeding.
const dataLukisan = [
  {
    kodeLukisan: "LKS-2428240069-01",
    judul: "Senja di Musi",
    pelukis: "Rahmat Hidayat",
    aliran: "realisme",
    tahunDibuat: 2023,
    harga: 7500000,
    ukuran: { tinggi: 80, lebar: 60, media: "Kanvas" },
    kritik: [
      { nama: "Andi Saputra", rating: 5, komentar: "Warna senja tersaji sangat hidup.", tanggal: new Date("2023-11-02") },
      { nama: "Dewi Lestari", rating: 4, komentar: "Komposisi tenang dan mudah dipahami.", tanggal: new Date("2023-12-10") },
    ],
  },
  {
    kodeLukisan: "LKS-2428240069-02",
    judul: "Tari Cahaya Pagi",
    pelukis: "Siti Nurhaliza",
    aliran: "impresionisme",
    tahunDibuat: 2021,
    harga: 5200000,
    ukuran: { tinggi: 100, lebar: 80, media: "Kanvas" },
    kritik: [
      { nama: "Rina Puspita", rating: 5, komentar: "Sapuan warna cahaya pagi terasa hangat.", tanggal: new Date("2021-05-18") },
    ],
  },
  {
    kodeLukisan: "LKS-2428240069-03",
    judul: "Bentuk Tanpa Nama",
    pelukis: "Bagas Prasetyo",
    aliran: "abstrak",
    tahunDibuat: 2024,
    harga: 9800000,
    ukuran: { tinggi: 120, lebar: 90, media: "Kanvas" },
    kritik: [
      { nama: "Yoga Mahendra", rating: 4, komentar: "Bentuknya berani tapi masih terasa hangat.", tanggal: new Date("2024-02-09") },
      { nama: "Citra Ayu", rating: 5, komentar: "Warna gelapnya sangat berkesan.", tanggal: new Date("2024-03-21") },
    ],
  },
  {
    kodeLukisan: "LKS-2428240069-04",
    judul: "Suara Taman Malam",
    pelukis: "Rahmat Hidayat",
    aliran: "realisme",
    tahunDibuat: 2022,
    harga: 6300000,
    ukuran: { tinggi: 90, lebar: 70, media: "Kanvas" },
    kritik: [
      { nama: "Fajar Nugroho", rating: 4, komentar: "Suasana malamnya terasa hidup.", tanggal: new Date("2022-09-30") },
    ],
  },
  {
    kodeLukisan: "LKS-2428240069-05",
    judul: "Kabut Pagi di Tepi Sungai",
    pelukis: "Siti Nurhaliza",
    aliran: "impresionisme",
    tahunDibuat: 2020,
    harga: 4100000,
    ukuran: { tinggi: 70, lebar: 50, media: "Kanvas" },
    kritik: [
      { nama: "Bella Sari", rating: 3, komentar: "Kabutnya masih bisa lebih pekat.", tanggal: new Date("2020-07-14") },
    ],
  },
  {
    kodeLukisan: "LKS-2428240069-06",
    judul: "Warna yang Tak Bernama",
    pelukis: "Bagas Prasetyo",
    aliran: "abstrak",
    tahunDibuat: 2025,
    harga: 12500000,
    ukuran: { tinggi: 150, lebar: 110, media: "Kanvas" },
    kritik: [
      { nama: "Hendra Gunawan", rating: 5, komentar: "Ini karya paling berani dari Bagas.", tanggal: new Date("2025-01-27") },
      { nama: "Lisa Kurnia", rating: 4, komentar: "Warna berani tapi rapi.", tanggal: new Date("2025-02-08") },
    ],
  },
];

async function seed() {
  await connectDB();

  // Mulai dari kondisi bersih agar jumlah data pada pengujian pasti.
  await mongoose.connection.db.dropCollection("paintings").catch(() => {});
  await mongoose.connection.db.dropCollection("artists").catch(() => {});

  const pelukisTersimpan = await Artist.insertMany(dataPelukis);
  const idPelukis = new Map(pelukisTersimpan.map((artist) => [artist.nama, artist._id]));

  const lukisanSiap = dataLukisan.map((lukisan) => ({
    ...lukisan,
    pelukis: idPelukis.get(lukisan.pelukis),
  }));

  await Painting.insertMany(lukisanSiap);

  // Index untuk mendukung filtering, sorting, dan join referensi.
  await Painting.collection.createIndex({ aliran: 1 });
  await Painting.collection.createIndex({ harga: 1 });
  await Painting.collection.createIndex({ pelukis: 1 });
  await Painting.collection.createIndex({ kodeLukisan: 1 }, { unique: true });
  await Artist.collection.createIndex({ nama: 1 }, { unique: true });

  console.log(
    `Seed selesai: ${pelukisTersimpan.length} pelukis, ${lukisanSiap.length} lukisan tersimpan di database ${mongoose.connection.name}`
  );

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error(`Seed gagal: ${err.message}`);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
