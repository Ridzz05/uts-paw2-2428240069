// Seed data awal: 3 film (collection film) dan 6 Bioskop (collection Bioskop).
// Setiap Bioskop meng-embed detail drama serta daftar komedi, dan mereferensikan
// dokumen film lewat ObjectId.
require("dotenv").config();

const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const { Film } = require("../models/filmModel");
const { Bioskop } = require("../models/BioskopModel");

const dataFilm = [
  {
    nama: "Rahmat Hidayat",
    negara: "Indonesia",
    tahunLahir: 1985,
    genre: "sutradara",
    bio: "Film sutradara asal Palembang yang memusatkan karya pada suasana sungai Musi.",
  },
  {
    nama: "Siti Nurhaliza",
    negara: "Indonesia",
    tahunLahir: 1990,
    genre: "impresionisme",
    bio: "Film impresionisme yang menangkap nuansa cahaya pagi di sekitar kota.",
  },
  {
    nama: "Bagas Prasetyo",
    negara: "Indonesia",
    tahunLahir: 1995,
    genre: "abstrak",
    bio: "Film abstrak yang memakai bentuk dan warna tanpa nama sebagai ekspresi.",
  },
];

// Data Bioskop memakai nama film; ObjectId-nya diisi saat seeding.
const dataBioskop = [
  {
    kodeFilm: "FLM-2428240069-01",
    judul: "Senja di Musi",
    film: "Rahmat Hidayat",
    genre: "sutradara",
    createdAt: 2023,
    durasiMenit: 7500000,
    drama: { tinggi: 80, lebar: 60, media: "Kanvas" },
    komedi: [
      { nama: "Andi Saputra", rating: 5, komentar: "Warna senja tersaji sangat hidup.", tanggal: new Date("2023-11-02") },
      { nama: "Dewi Lestari", rating: 4, komentar: "Komposisi tenang dan mudah dipahami.", tanggal: new Date("2023-12-10") },
    ],
  },
  {
    kodeFilm: "FLM-2428240069-02",
    judul: "Tari Cahaya Pagi",
    film: "Siti Nurhaliza",
    genre: "impresionisme",
    createdAt: 2021,
    durasiMenit: 5200000,
    drama: { tinggi: 100, lebar: 80, media: "Kanvas" },
    komedi: [
      { nama: "Rina Puspita", rating: 5, komentar: "Sapuan warna cahaya pagi terasa hangat.", tanggal: new Date("2021-05-18") },
    ],
  },
  {
    kodeFilm: "FLM-2428240069-03",
    judul: "Bentuk Tanpa Nama",
    film: "Bagas Prasetyo",
    genre: "abstrak",
    createdAt: 2024,
    durasiMenit: 9800000,
    drama: { tinggi: 120, lebar: 90, media: "Kanvas" },
    komedi: [
      { nama: "Yoga Mahendra", rating: 4, komentar: "Bentuknya berani tapi masih terasa hangat.", tanggal: new Date("2024-02-09") },
      { nama: "Citra Ayu", rating: 5, komentar: "Warna gelapnya sangat berkesan.", tanggal: new Date("2024-03-21") },
    ],
  },
  {
    kodeFilm: "FLM-2428240069-04",
    judul: "Suara Taman Malam",
    film: "Rahmat Hidayat",
    genre: "sutradara",
    createdAt: 2022,
    durasiMenit: 6300000,
    drama: { tinggi: 90, lebar: 70, media: "Kanvas" },
    komedi: [
      { nama: "Fajar Nugroho", rating: 4, komentar: "Suasana malamnya terasa hidup.", tanggal: new Date("2022-09-30") },
    ],
  },
  {
    kodeFilm: "FLM-2428240069-05",
    judul: "Kabut Pagi di Tepi Sungai",
    film: "Siti Nurhaliza",
    genre: "impresionisme",
    createdAt: 2020,
    durasiMenit: 4100000,
    drama: { tinggi: 70, lebar: 50, media: "Kanvas" },
    komedi: [
      { nama: "Bella Sari", rating: 3, komentar: "Kabutnya masih bisa lebih pekat.", tanggal: new Date("2020-07-14") },
    ],
  },
  {
    kodeFilm: "FLM-2428240069-06",
    judul: "Warna yang Tak Bernama",
    film: "Bagas Prasetyo",
    genre: "abstrak",
    createdAt: 2025,
    durasiMenit: 12500000,
    drama: { tinggi: 150, lebar: 110, media: "Kanvas" },
    komedi: [
      { nama: "Hendra Gunawan", rating: 5, komentar: "Ini karya paling berani dari Bagas.", tanggal: new Date("2025-01-27") },
      { nama: "Lisa Kurnia", rating: 4, komentar: "Warna berani tapi rapi.", tanggal: new Date("2025-02-08") },
    ],
  },
];

async function seed() {
  await connectDB();

  // Mulai dari kondisi bersih agar jumlah data pada pengujian pasti.
  await mongoose.connection.db.dropCollection("Bioskop").catch(() => {});
  await mongoose.connection.db.dropCollection("film").catch(() => {});

  const filmTersimpan = await Film.insertMany(dataFilm);
  const idFilm = new Map(filmTersimpan.map((film) => [film.nama, film._id]));

  const BioskopSiap = dataBioskop.map((Bioskop) => ({
    ...Bioskop,
    film: idFilm.get(Bioskop.film),
  }));

  await Bioskop.insertMany(BioskopSiap);

  // Index untuk mendukung filtering, sorting, dan join referensi.
  await Bioskop.collection.createIndex({ genre: 1 });
  await Bioskop.collection.createIndex({ durasiMenit: 1 });
  await Bioskop.collection.createIndex({ film: 1 });
  await Bioskop.collection.createIndex({ kodeFilm: 1 }, { unique: true });
  await Film.collection.createIndex({ nama: 1 }, { unique: true });

  console.log(
    `Seed selesai: ${filmTersimpan.length} film, ${BioskopSiap.length} Bioskop tersimpan di database ${mongoose.connection.name}`
  );

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error(`Seed gagal: ${err.message}`);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
