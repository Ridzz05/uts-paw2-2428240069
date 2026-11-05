// Controller resource /Bioskop: validasi body, susun query MongoDB, lalu kirim respons.
const mongoose = require("mongoose");
const { Bioskop } = require("../models/BioskopModel");
const { escapeRegex } = require("../utils/escapeRegex");

// Daftar field yang boleh dipakai sorting dan projection pada endpoint ini.
const SORT_FIELDS = ["judul", "genre", "createdAt", "durasiMenit", "createdAt"];
const FIELDS = [
  "kodeFilm",
  "judul",
  "film",
  "genre",
  "createdAt",
  "durasiMenit",
  "drama",
  "komedi",
  "createdAt",
  "updatedAt",
];

// Validasi body Bioskop; mengembalikan pesan error atau null bila valid.
function validasiBioskop(body) {
  const fieldString = ["judul", "kodeFilm", "film", "genre"];

  for (const field of fieldString) {
    if (typeof body[field] !== "string" || body[field].trim() === "") {
      return `Field ${field} wajib diisi`;
    }
  }

  if (typeof body.durasiMenit !== "number" || Number.isNaN(body.durasiMenit)) {
    return "Field durasiMenit wajib diisi dan harus berupa angka";
  }

  if (
    body.createdAt !== undefined &&
    body.createdAt !== null &&
    (typeof body.createdAt !== "number" || Number.isNaN(body.createdAt))
  ) {
    return "Field createdAt harus berupa angka";
  }

  if (body.drama !== undefined && body.drama !== null && typeof body.drama !== "object") {
    return "Field drama harus berupa object";
  }

  if (body.komedi !== undefined && body.komedi !== null) {
    if (!Array.isArray(body.komedi)) {
      return "Field komedi tidak valid";
    }
    for (const item of body.komedi) {
      const namaValid = item && typeof item.nama === "string" && item.nama.trim() !== "";
      const ratingValid = item && typeof item.rating === "number" && item.rating >= 1 && item.rating <= 5;
      if (!namaValid || !ratingValid) {
        return "Field komedi tidak valid";
      }
    }
  }

  return null;
}

// Susun filter MongoDB dari query string yang sudah divalidasi middleware.
async function susunFilter(mentah) {
  const filter = {};

  if (mentah.genre) {
    filter.genre = String(mentah.genre).toLowerCase();
  }

  if (mentah.film) {
    const nilai = String(mentah.film).trim();
    if (/^[0-9a-fA-F]{24}$/.test(nilai)) {
      filter.film = new mongoose.Types.ObjectId(nilai);
    } else {
      const pencarian = new RegExp(`^${escapeRegex(nilai)}$`, "i");
      const film = await Bioskop.db.model("Film").findOne({ nama: pencarian });
      filter.film = film ? film._id : new mongoose.Types.ObjectId();
    }
  }

  if (mentah.durasiMenitMin !== undefined || mentah.durasiMenitMax !== undefined) {
    filter.durasiMenit = {};
    if (mentah.durasiMenitMin !== undefined) filter.durasiMenit.$gte = mentah.durasiMenitMin;
    if (mentah.durasiMenitMax !== undefined) filter.durasiMenit.$lte = mentah.durasiMenitMax;
  }

  if (mentah.createdAt !== undefined) {
    filter.createdAt = mentah.createdAt;
  }

  if (mentah.q) {
    filter.judul = { $regex: escapeRegex(String(mentah.q)), $options: "i" };
  }

  return filter;
}

// GET /Bioskop — daftar Bioskop dengan filter, sorting, pagination, dan projection.
async function getAll(req, res) {
  const { filter: mentah, sort, page, limit, skip, fields } = req.opsi;
  const filter = await susunFilter(mentah);
  const perluPopulate = !fields || fields.split(" ").includes("film");

  const { data, total } = await Bioskop.list({
    filter,
    sort,
    skip,
    limit,
    fields,
    populate: perluPopulate,
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  res.status(200).json({
    status: "success",
    message: "Data Bioskop berhasil diambil",
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
}

// GET /Bioskop/:id — satu data; 404 bila tidak ditemukan.
async function getById(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      status: "error",
      message: "Format id tidak valid",
      data: null,
    });
  }

  const Bioskop = await Bioskop.findById(id).populate("film");

  if (!Bioskop) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Data Bioskop berhasil diambil",
    data: Bioskop,
  });
}

// POST /Bioskop — tambah data; 400 bila body tidak valid, 201 bila sukses.
async function create(req, res) {
  const pesanError = validasiBioskop(req.body);

  if (pesanError) {
    return res.status(400).json({ status: "error", message: pesanError, data: null });
  }

  const { film, error } = await Bioskop.resolveFilm(req.body.film);

  if (error) {
    return res.status(400).json({ status: "error", message: error, data: null });
  }

  const BioskopBaru = await Bioskop.create({
    kodeFilm: req.body.kodeFilm,
    judul: req.body.judul,
    film: film._id,
    genre: req.body.genre,
    createdAt: req.body.createdAt ?? null,
    durasiMenit: req.body.durasiMenit,
    drama: req.body.drama,
    komedi: req.body.komedi,
  });

  await BioskopBaru.populate("film");

  res.status(201).json({
    status: "success",
    message: "Data berhasil ditambahkan",
    data: BioskopBaru,
  });
}

// PUT /Bioskop/:id — perbarui data; 404 lalu 400, 200 bila sukses.
async function update(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ status: "error", message: "Format id tidak valid", data: null });
  }

  if (!(await Bioskop.findById(id))) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null,
    });
  }

  const pesanError = validasiBioskop(req.body);

  if (pesanError) {
    return res.status(400).json({ status: "error", message: pesanError, data: null });
  }

  const { film, error } = await Bioskop.resolveFilm(req.body.film);

  if (error) {
    return res.status(400).json({ status: "error", message: error, data: null });
  }

  const BioskopDiperbarui = await Bioskop.findByIdAndUpdate(
    id,
    {
      kodeFilm: req.body.kodeFilm,
      judul: req.body.judul,
      film: film._id,
      genre: req.body.genre,
      createdAt: req.body.createdAt ?? null,
      durasiMenit: req.body.durasiMenit,
      drama: req.body.drama,
      komedi: req.body.komedi,
    },
    { new: true, runValidators: true }
  ).populate("film");

  res.status(200).json({
    status: "success",
    message: `Data Bioskop dengan id ${id} berhasil diperbarui`,
    data: BioskopDiperbarui,
  });
}

// DELETE /Bioskop/:id — hapus data; 404 bila tidak ada, 204 tanpa isi.
async function remove(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ status: "error", message: "Format id tidak valid", data: null });
  }

  const terhapus = await Bioskop.findByIdAndDelete(id);

  if (!terhapus) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null,
    });
  }

  res.status(204).end();
}

module.exports = { getAll, getById, create, update, remove, SORT_FIELDS, FIELDS };
