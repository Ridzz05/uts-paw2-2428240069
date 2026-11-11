// Model Studio (collection studio): entitas pendukung yang dirujuk oleh Film.
const mongoose = require("mongoose");

const studioSchema = new mongoose.Schema(
  {
    kode: { type: String, required: [true, "Field kode wajib diisi"], unique: true, trim: true },
    nama: { type: String, required: [true, "Field nama wajib diisi"], trim: true },
  },
  { versionKey: false }
);

const Studio = mongoose.model("Studio", studioSchema, "studio");

module.exports = { Studio };
