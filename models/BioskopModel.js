// Model Bioskop (collection Bioskop).
// Relasi: field film MEREFERENSIKAN dokumen pada collection film,
// sedangkan detail drama dan daftar komedi DI-EMBED di dalam dokumen Bioskop.
const mongoose = require("mongoose");
const { Film } = require("./filmModel");
const { escapeRegex } = require("../utils/escapeRegex");

// Subdokumen komedi (embedding) — ikut tersimpan di dalam dokumen Bioskop.
const komediSchema = new mongoose.Schema(
  {
    nama: { type: String, required: [true, "Field nama komedi wajib diisi"], trim: true },
    rating: { type: Number, min: 1, max: 5 },
    komentar: { type: String, trim: true },
    tanggal: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Subdokumen drama (embedding) — satu objek tanpa collection sendiri.
const dramaSchema = new mongoose.Schema(
  {
    tinggi: { type: Number },
    lebar: { type: Number },
    media: { type: String, trim: true },
  },
  { _id: false }
);

const BioskopSchema = new mongoose.Schema(
  {
    kodeFilm: {
      type: String,
      required: [true, "Field kodeFilm wajib diisi"],
      trim: true,
      unique: true,
      index: true,
    },
    judul: { type: String, required: [true, "Field judul wajib diisi"], trim: true },
    film: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Film",
      required: [true, "Field film wajib diisi"],
      index: true,
    },
    genre: { type: String, required: [true, "Field genre wajib diisi"], trim: true, lowercase: true, index: true },
    createdAt: { type: Number },
    durasiMenit: { type: Number, required: [true, "Field durasiMenit wajib diisi dan harus berupa angka"], min: [0, "Field durasiMenit tidak boleh negatif"], index: true },
    drama: { type: dramaSchema },
    komedi: { type: [komediSchema], default: [] },
  },
  { timestamps: true, collection: "Bioskop" }
);

// Ambil daftar Bioskop dengan filter, sorting, pagination, dan projection.
BioskopSchema.statics.list = async function list({ filter, sort, skip, limit, fields, populate }) {
  let query = this.find(filter).sort(sort).skip(skip).limit(limit);

  if (fields) {
    query = query.select(fields);
  }

  if (populate) {
    query = query.populate("film");
  }

  const [data, total] = await Promise.all([query.lean(), this.countDocuments(filter)]);

  return { data, total };
};

// Tentukan dokumen film dari ObjectId atau nama; nama baru dibuatkan otomatis.
BioskopSchema.statics.resolveFilm = async function resolveFilm(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return { error: "Field film wajib diisi" };
  }

  const teks = value.trim();

  if (/^[0-9a-fA-F]{24}$/.test(teks)) {
    const film = await Film.findById(teks);
    if (!film) {
      return { error: `Film dengan id ${teks} tidak ditemukan` };
    }
    return { film };
  }

  const pencarian = new RegExp(`^${escapeRegex(teks)}$`, "i");
  let film = await Film.findOne({ nama: pencarian });

  if (!film) {
    film = await Film.create({ nama: teks, negara: "Indonesia" });
  }

  return { film };
};

const Bioskop = mongoose.model("Bioskop", BioskopSchema);

module.exports = { Bioskop };
