// Controller resource /artists: pelukis beserta jumlah lukisannya.
const mongoose = require("mongoose");
const { Artist } = require("../models/artistsModel");
const { Painting } = require("../models/paintingsModel");

// Daftar field yang boleh dipakai sorting dan projection pada endpoint ini.
const SORT_FIELDS = ["nama", "negara", "tahunLahir", "createdAt"];

// GET /artists — daftar pelukis dengan sorting, pagination, dan projection.
async function getAll(req, res) {
  const { sort, page, limit, skip, fields } = req.opsi;

  let query = Artist.find().sort(sort).skip(skip).limit(limit);
  if (fields) {
    query = query.select(fields);
  }

  const [data, total] = await Promise.all([query.lean(), Artist.countDocuments()]);

  const lengkap = await Promise.all(
    data.map(async (artist) => ({
      ...artist,
      jumlahLukisan: await Painting.countDocuments({ pelukis: artist._id }),
    }))
  );

  const totalPages = Math.max(1, Math.ceil(total / limit));

  res.status(200).json({
    status: "success",
    message: "Data pelukis berhasil diambil",
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

// GET /artists/:id — detail pelukis beserta daftar lukisannya.
async function getById(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ status: "error", message: "Format id tidak valid", data: null });
  }

  const artist = await Artist.findById(id).lean();

  if (!artist) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null,
    });
  }

  const lukisan = await Painting.find({ pelukis: artist._id }).select("judul aliran tahunDibuat harga");

  res.status(200).json({
    status: "success",
    message: "Data pelukis berhasil diambil",
    data: { ...artist, lukisan },
  });
}

// POST /artists — tambah pelukis; 400 bila body tidak valid, 201 bila sukses.
async function create(req, res) {
  const { nama, negara, tahunLahir, aliran, bio } = req.body;

  if (typeof nama !== "string" || nama.trim() === "") {
    return res.status(400).json({ status: "error", message: "Field nama wajib diisi", data: null });
  }

  if (tahunLahir !== undefined && tahunLahir !== null && (typeof tahunLahir !== "number" || Number.isNaN(tahunLahir))) {
    return res.status(400).json({ status: "error", message: "Field tahunLahir harus berupa angka", data: null });
  }

  const artist = await Artist.create({ nama, negara, tahunLahir, aliran, bio });

  res.status(201).json({
    status: "success",
    message: "Data pelukis berhasil ditambahkan",
    data: artist,
  });
}

module.exports = { getAll, getById, create, SORT_FIELDS };
