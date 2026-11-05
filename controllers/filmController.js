// Controller resource /film: film beserta jumlah Bioskopnya.
const mongoose = require("mongoose");
const { Film } = require("../models/filmModel");
const { Bioskop } = require("../models/BioskopModel");

// Daftar field yang boleh dipakai sorting dan projection pada endpoint ini.
const SORT_FIELDS = ["nama", "negara", "tahunLahir", "createdAt"];

// GET /film — daftar film dengan sorting, pagination, dan projection.
async function getAll(req, res) {
  const { sort, page, limit, skip, fields } = req.opsi;

  let query = Film.find().sort(sort).skip(skip).limit(limit);
  if (fields) {
    query = query.select(fields);
  }

  const [data, total] = await Promise.all([query.lean(), Film.countDocuments()]);

  const lengkap = await Promise.all(
    data.map(async (film) => ({
      ...film,
      jumlahBioskop: await Bioskop.countDocuments({ film: film._id }),
    }))
  );

  const totalPages = Math.max(1, Math.ceil(total / limit));

  res.status(200).json({
    status: "success",
    message: "Data film berhasil diambil",
    data: lengkap,
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

// GET /film/:id — detail film beserta daftar Bioskopnya.
async function getById(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ status: "error", message: "Format id tidak valid", data: null });
  }

  const film = await Film.findById(id).lean();

  if (!film) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null,
    });
  }

  const Bioskop = await Bioskop.find({ film: film._id }).select("judul genre createdAt durasiMenit");

  res.status(200).json({
    status: "success",
    message: "Data film berhasil diambil",
    data: { ...film, Bioskop },
  });
}

// POST /film — tambah film; 400 bila body tidak valid, 201 bila sukses.
async function create(req, res) {
  const { nama, negara, tahunLahir, genre, bio } = req.body;

  if (typeof nama !== "string" || nama.trim() === "") {
    return res.status(400).json({ status: "error", message: "Field nama wajib diisi", data: null });
  }

  if (tahunLahir !== undefined && tahunLahir !== null && (typeof tahunLahir !== "number" || Number.isNaN(tahunLahir))) {
    return res.status(400).json({ status: "error", message: "Field tahunLahir harus berupa angka", data: null });
  }

  const film = await Film.create({ nama, negara, tahunLahir, genre, bio });

  res.status(201).json({
    status: "success",
    message: "Data film berhasil ditambahkan",
    data: film,
  });
}

module.exports = { getAll, getById, create, SORT_FIELDS };
