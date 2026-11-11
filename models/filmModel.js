// Model Film (collection film): produksi di-embed, studioId mereferensikan Studio.
const mongoose = require("mongoose");

// Subdokumen produksi (embedding), tanpa _id.
const produksiSchema = new mongoose.Schema(
  {
    sutradara: { type: String },
    tahun: { type: String },
  },
  { _id: false }
);

const filmSchema = new mongoose.Schema(
  {
    kodeFilm: { type: String, required: [true, "Field kodeFilm wajib diisi"], unique: true, trim: true },
    judul: { type: String, required: [true, "Field judul wajib diisi"], trim: true },
    durasiMenit: {
      type: Number,
      required: [true, "Field durasiMenit wajib diisi"],
      min: [1, "Field durasiMenit minimal 1"],
    },
    genre: { type: String, required: [true, "Field genre wajib diisi"], trim: true },
    produksi: { type: produksiSchema },
    studioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Studio",
      required: [true, "Field studioId wajib diisi"],
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const Film = mongoose.model("Film", filmSchema, "film");

module.exports = { Film };
