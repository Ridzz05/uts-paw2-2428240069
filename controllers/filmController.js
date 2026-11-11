// Controller resource /film: filter genre, sorting, detail dengan studio ter-populate, dan tambah film.
const { Film } = require("../models/filmModel");
const { Studio } = require("../models/studioModel");
const { escapeRegex } = require("../utils/escapeRegex");

// Daftar field yang boleh dipakai sorting dan projection pada endpoint ini.
const SORT_FIELDS = ["createdAt", "durasiMenit", "judul", "genre", "kodeFilm"];
const FIELDS = ["kodeFilm", "judul", "durasiMenit", "genre", "produksi", "studioId", "createdAt"];

const ID_HEX = /^[0-9a-fA-F]{24}$/;

// GET /film — daftar film; filter ?genre= (tanpa membedakan huruf besar-kecil), ?sort=, page/limit, fields.
async function getAll(req, res) {
  const { filter: mentah, sort, page, limit, skip, fields } = req.opsi;

  const filter = {};
  if (typeof mentah.genre === "string" && mentah.genre.trim() !== "") {
    filter.genre = new RegExp(`^${escapeRegex(mentah.genre.trim())}$`, "i");
  }

  let query = Film.find(filter).sort(sort).skip(skip).limit(limit);
  if (fields) {
    query = query.select(fields);
  }

  const [data, total] = await Promise.all([query.lean(), Film.countDocuments(filter)]);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  res.status(200).json({
    status: "success",
    message: "Data film berhasil diambil",
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

// GET /film/:id — satu film dengan studioId ter-populate (kode dan nama).
async function getById(req, res) {
  const { id } = req.params;

  if (!ID_HEX.test(id)) {
    return res.status(400).json({ status: "error", message: "Format id tidak valid", data: null });
  }

  const film = await Film.findById(id).populate("studioId", "kode nama");

  if (!film) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Data film berhasil diambil",
    data: film,
  });
}

// POST /film — tambah film; 400 (validasi/studio tidak ada), 409 (kodeFilm duplikat), 201 bila sukses.
async function create(req, res) {
  const { kodeFilm, judul, durasiMenit, genre, produksi, studioId } = req.body ?? {};
  const film = new Film({ kodeFilm, judul, durasiMenit, genre, produksi, studioId });

  await film.validate();

  if (!(await Studio.exists({ _id: film.studioId }))) {
    return res.status(400).json({
      status: "error",
      message: `Studio dengan id ${film.studioId} tidak ditemukan`,
      data: null,
    });
  }

  await film.save();

  res.status(201).json({
    status: "success",
    message: "Data berhasil ditambahkan",
    data: film,
  });
}

module.exports = { getAll, getById, create, SORT_FIELDS, FIELDS };
