// Seed data awal: 3 Studio (collection studio) dan 6 Film (collection film).
// Setiap Film meng-embed produksi dan mereferensikan Studio lewat studioId.
require("dotenv").config();

const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const { Film } = require("../models/filmModel");
const { Studio } = require("../models/studioModel");

const dataStudio = [
  { kode: "ST1", nama: "Studio 1" },
  { kode: "ST2", nama: "Studio 2" },
  { kode: "ST3", nama: "Studio 3" },
];

// Data Film memakai kode Studio; ObjectId-nya diisi saat seeding.
const dataFilm = [
  { kodeFilm: "FLM-2428240069-01", judul: "Tawa di Ujung Senja", durasiMenit: 120, genre: "komedi", produksi: { sutradara: "Rahmat Hidayat", tahun: "2021" }, studio: "ST1" },
  { kodeFilm: "FLM-2428240069-02", judul: "Kantin Kampus", durasiMenit: 95, genre: "komedi", produksi: { sutradara: "Sinta Maharani", tahun: "2023" }, studio: "ST2" },
  { kodeFilm: "FLM-2428240069-03", judul: "Hujan di Bulan Juni", durasiMenit: 110, genre: "drama", produksi: { sutradara: "Dewi Lestari", tahun: "2019" }, studio: "ST1" },
  { kodeFilm: "FLM-2428240069-04", judul: "Surat untuk Ibu", durasiMenit: 135, genre: "drama", produksi: { sutradara: "Bayu Prakoso", tahun: "2022" }, studio: "ST3" },
  { kodeFilm: "FLM-2428240069-05", judul: "Garis Depan", durasiMenit: 140, genre: "aksi", produksi: { sutradara: "Andi Wirawan", tahun: "2020" }, studio: "ST2" },
  { kodeFilm: "FLM-2428240069-06", judul: "Kejar Bayangan", durasiMenit: 105, genre: "aksi", produksi: { sutradara: "Maya Kusuma", tahun: "2024" }, studio: "ST3" },
];

async function seed() {
  await connectDB();

  // Mulai dari kondisi bersih agar jumlah data pada pengujian pasti.
  await mongoose.connection.db.dropCollection("Bioskop").catch(() => {});
  await mongoose.connection.db.dropCollection("film").catch(() => {});
  await mongoose.connection.db.dropCollection("studio").catch(() => {});

  const studioTersimpan = await Studio.insertMany(dataStudio);
  const idStudio = new Map(studioTersimpan.map((studio) => [studio.kode, studio._id]));

  const filmSiap = dataFilm.map(({ studio, ...film }) => ({ ...film, studioId: idStudio.get(studio) }));
  await Film.insertMany(filmSiap);

  // Pastikan index unik (kodeFilm, kode) ada.
  await Studio.syncIndexes();
  await Film.syncIndexes();

  console.log(
    `Seed selesai: ${studioTersimpan.length} studio, ${filmSiap.length} film tersimpan di database ${mongoose.connection.name}`
  );

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error(`Seed gagal: ${err.message}`);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
