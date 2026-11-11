// Controller resource /studio: daftar dan tambah Studio.
const { Studio } = require("../models/studioModel");

// Daftar field yang boleh dipakai sorting dan projection pada endpoint ini.
const SORT_FIELDS = ["kode", "nama"];
const FIELDS = ["kode", "nama"];

// GET /studio — daftar studio dengan sorting, pagination, dan projection.
async function getAll(req, res) {
  const { sort, page, limit, skip, fields } = req.opsi;

  let query = Studio.find().sort(sort).skip(skip).limit(limit);
  if (fields) {
    query = query.select(fields);
  }

  const [data, total] = await Promise.all([query.lean(), Studio.countDocuments()]);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  res.status(200).json({
    status: "success",
    message: "Data studio berhasil diambil",
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

// POST /studio — tambah studio; 400 (validasi) dan 409 (kode duplikat) lewat errorHandler.
async function create(req, res) {
  const { kode, nama } = req.body ?? {};
  const studio = await Studio.create({ kode, nama });

  res.status(201).json({
    status: "success",
    message: "Data berhasil ditambahkan",
    data: studio,
  });
}

module.exports = { getAll, create, SORT_FIELDS, FIELDS };
