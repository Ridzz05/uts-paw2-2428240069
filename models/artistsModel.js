// Model pelukis (collection artists).
const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema(
  {
    nama: { type: String, required: [true, "Field nama wajib diisi"], trim: true, unique: true, index: true },
    negara: { type: String, default: "Indonesia", trim: true },
    tahunLahir: { type: Number },
    aliran: { type: String, trim: true, lowercase: true },
    bio: { type: String, trim: true },
  },
  { timestamps: true, collection: "artists" }
);

const Artist = mongoose.model("Artist", artistSchema);

module.exports = { Artist };
