// Controller resource /paintings: validasi body, susun query MongoDB, lalu kirim respons.
const mongoose = require("mongoose");
const { Painting } = require("../models/paintingsModel");
const { escapeRegex } = require("../utils/escapeRegex");

// Daftar field yang boleh dipakai sorting dan projection pada endpoint ini.
const SORT_FIELDS = ["judul", "aliran", "tahunDibuat", "harga", "createdAt"];
const FIELDS = [
  "kodeLukisan",
  "judul",
  "pelukis",
  "aliran",
  "tahunDibuat",
  "harga",
  "ukuran",
  "kritik",
  "createdAt",
  "updatedAt",
];

// Validasi body lukisan; mengembalikan pesan error atau null bila valid.
function validasiLukisan(body) {
  const fieldString = ["judul", "kodeLukisan", "pelukis", "aliran"];

  for (const field of fieldString) {
    if (typeof body[field] !== "string" || body[field].trim() === "") {
      return `Field ${field} wajib diisi`;
    }
  }

  if (typeof body.harga !== "number" || Number.isNaN(body.harga)) {
    return "Field harga wajib diisi dan harus berupa angka";
  }

  if (
    body.tahunDibuat !== undefined &&
    body.tahunDibuat !== null &&
    (typeof body.tahunDibuat !== "number" || Number.isNaN(body.tahunDibuat))
  ) {
    return "Field tahunDibuat harus berupa angka";
  }

  if (body.ukuran !== undefined && body.ukuran !== null && typeof body.ukuran !== "object") {
    return "Field ukuran harus berupa object";
  }

  if (body.kritik !== undefined && body.kritik !== null) {
    if (!Array.isArray(body.kritik)) {
      return "Field kritik tidak valid";
    }
    for (const item of body.kritik) {
      const namaValid = item && typeof item.nama === "string" && item.nama.trim() !== "";
      const ratingValid = item && typeof item.rating === "number" && item.rating >= 1 && item.rating <= 5;
      if (!namaValid || !ratingValid) {
        return "Field kritik tidak valid";
      }
    }
  }

  return null;
}

// Susun filter MongoDB dari query string yang sudah divalidasi middleware.
async function susunFilter(mentah) {
  const filter = {};

  if (mentah.aliran) {
    filter.aliran = String(mentah.aliran).toLowerCase();
  }

  if (mentah.pelukis) {
    const nilai = String(mentah.pelukis).trim();
    if (/^[0-9a-fA-F]{24}$/.test(nilai)) {
      filter.pelukis = new mongoose.Types.ObjectId(nilai);
    } else {
      const pencarian = new RegExp(`^${escapeRegex(nilai)}$`, "i");
      const artist = await Painting.db.model("Artist").findOne({ nama: pencarian });
      filter.pelukis = artist ? artist._id : new mongoose.Types.ObjectId();
    }
  }

  if (mentah.hargaMin !== undefined || mentah.hargaMax !== undefined) {
    filter.harga = {};
    if (mentah.hargaMin !== undefined) filter.harga.$gte = mentah.hargaMin;
    if (mentah.hargaMax !== undefined) filter.harga.$lte = mentah.hargaMax;
  }

  if (mentah.tahunDibuat !== undefined) {
    filter.tahunDibuat = mentah.tahunDibuat;
  }

  if (mentah.q) {
    filter.judul = { $regex: escapeRegex(String(mentah.q)), $options: "i" };
  }

  return filter;
}

// GET /paintings — daftar lukisan dengan filter, sorting, pagination, dan projection.
async function getAll(req, res) {
  const { filter: mentah, sort, page, limit, skip, fields } = req.opsi;
  const filter = await susunFilter(mentah);
  const perluPopulate = !fields || fields.split(" ").includes("pelukis");

  const { data, total } = await Painting.list({
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
    message: "Data lukisan berhasil diambil",
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

// GET /paintings/:id — satu data; 404 bila tidak ditemukan.
async function getById(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      status: "error",
      message: "Format id tidak valid",
      data: null,
    });
  }

  const lukisan = await Painting.findById(id).populate("pelukis");

  if (!lukisan) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Data lukisan berhasil diambil",
    data: lukisan,
  });
}

// POST /paintings — tambah data; 400 bila body tidak valid, 201 bila sukses.
async function create(req, res) {
  const pesanError = validasiLukisan(req.body);

  if (pesanError) {
    return res.status(400).json({ status: "error", message: pesanError, data: null });
  }

  const { artist, error } = await Painting.resolveArtist(req.body.pelukis);

  if (error) {
    return res.status(400).json({ status: "error", message: error, data: null });
  }

  const lukisanBaru = await Painting.create({
    kodeLukisan: req.body.kodeLukisan,
    judul: req.body.judul,
    pelukis: artist._id,
    aliran: req.body.aliran,
    tahunDibuat: req.body.tahunDibuat ?? null,
    harga: req.body.harga,
    ukuran: req.body.ukuran,
    kritik: req.body.kritik,
  });

  await lukisanBaru.populate("pelukis");

  res.status(201).json({
    status: "success",
    message: "Data berhasil ditambahkan",
    data: lukisanBaru,
  });
}

// PUT /paintings/:id — perbarui data; 404 lalu 400, 200 bila sukses.
async function update(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ status: "error", message: "Format id tidak valid", data: null });
  }

  if (!(await Painting.findById(id))) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null,
    });
  }

  const pesanError = validasiLukisan(req.body);

  if (pesanError) {
    return res.status(400).json({ status: "error", message: pesanError, data: null });
  }

  const { artist, error } = await Painting.resolveArtist(req.body.pelukis);

  if (error) {
    return res.status(400).json({ status: "error", message: error, data: null });
  }

  const lukisanDiperbarui = await Painting.findByIdAndUpdate(
    id,
    {
      kodeLukisan: req.body.kodeLukisan,
      judul: req.body.judul,
      pelukis: artist._id,
      aliran: req.body.aliran,
      tahunDibuat: req.body.tahunDibuat ?? null,
      harga: req.body.harga,
      ukuran: req.body.ukuran,
      kritik: req.body.kritik,
    },
    { new: true, runValidators: true }
  ).populate("pelukis");

  res.status(200).json({
    status: "success",
    message: `Data lukisan dengan id ${id} berhasil diperbarui`,
    data: lukisanDiperbarui,
  });
}

// DELETE /paintings/:id — hapus data; 404 bila tidak ada, 204 tanpa isi.
async function remove(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ status: "error", message: "Format id tidak valid", data: null });
  }

  const terhapus = await Painting.findByIdAndDelete(id);

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
