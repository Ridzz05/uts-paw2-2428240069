// Model lukisan (collection paintings).
// Relasi: field pelukis MEREFERENSIKAN dokumen pada collection artists,
// sedangkan detail ukuran dan daftar kritik DI-EMBED di dalam dokumen lukisan.
const mongoose = require("mongoose");
const { Artist } = require("./artistsModel");
const { escapeRegex } = require("../utils/escapeRegex");

// Subdokumen kritik (embedding) — ikut tersimpan di dalam dokumen lukisan.
const kritikSchema = new mongoose.Schema(
  {
    nama: { type: String, required: [true, "Field nama kritik wajib diisi"], trim: true },
    rating: { type: Number, min: 1, max: 5 },
    komentar: { type: String, trim: true },
    tanggal: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Subdokumen ukuran (embedding) — satu objek tanpa collection sendiri.
const ukuranSchema = new mongoose.Schema(
  {
    tinggi: { type: Number },
    lebar: { type: Number },
    media: { type: String, trim: true },
  },
  { _id: false }
);

const paintingSchema = new mongoose.Schema(
  {
    kodeLukisan: {
      type: String,
      required: [true, "Field kodeLukisan wajib diisi"],
      trim: true,
      unique: true,
      index: true,
    },
    judul: { type: String, required: [true, "Field judul wajib diisi"], trim: true },
    pelukis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: [true, "Field pelukis wajib diisi"],
      index: true,
    },
    aliran: { type: String, required: [true, "Field aliran wajib diisi"], trim: true, lowercase: true, index: true },
    tahunDibuat: { type: Number },
    harga: { type: Number, required: [true, "Field harga wajib diisi dan harus berupa angka"], min: [0, "Field harga tidak boleh negatif"], index: true },
    ukuran: { type: ukuranSchema },
    kritik: { type: [kritikSchema], default: [] },
  },
  { timestamps: true, collection: "paintings" }
);

// Ambil daftar lukisan dengan filter, sorting, pagination, dan projection.
paintingSchema.statics.list = async function list({ filter, sort, skip, limit, fields, populate }) {
  let query = this.find(filter).sort(sort).skip(skip).limit(limit);

  if (fields) {
    query = query.select(fields);
  }

  if (populate) {
    query = query.populate("pelukis");
  }

  const [data, total] = await Promise.all([query.lean(), this.countDocuments(filter)]);

  return { data, total };
};

// Tentukan dokumen pelukis dari ObjectId atau nama; nama baru dibuatkan otomatis.
paintingSchema.statics.resolveArtist = async function resolveArtist(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return { error: "Field pelukis wajib diisi" };
  }

  const teks = value.trim();

  if (/^[0-9a-fA-F]{24}$/.test(teks)) {
    const artist = await Artist.findById(teks);
    if (!artist) {
      return { error: `Pelukis dengan id ${teks} tidak ditemukan` };
    }
    return { artist };
  }

  const pencarian = new RegExp(`^${escapeRegex(teks)}$`, "i");
  let artist = await Artist.findOne({ nama: pencarian });

  if (!artist) {
    artist = await Artist.create({ nama: teks, negara: "Indonesia" });
  }

  return { artist };
};

const Painting = mongoose.model("Painting", paintingSchema);

module.exports = { Painting };
