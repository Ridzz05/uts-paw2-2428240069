// Model film (collection film).
const mongoose = require("mongoose");

const filmSchema = new mongoose.Schema(
  {
    nama: { type: String, required: [true, "Field nama wajib diisi"], trim: true, unique: true, index: true },
    negara: { type: String, default: "Indonesia", trim: true },
    tahunLahir: { type: Number },
    genre: { type: String, trim: true, lowercase: true },
    bio: { type: String, trim: true },
  },
  { timestamps: true, collection: "film" }
);

const Film = mongoose.model("Film", filmSchema);

module.exports = { Film };
