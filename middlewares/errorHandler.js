// Penanganan endpoint tak dikenal dan error terpusat.

// Catch-all 404: semua rute yang tidak cocok.
function notFound(req, res) {
  res.status(404).json({
    status: "error",
    message: "Endpoint tidak ditemukan",
    data: null,
  });
}

// Error handler terpusat (4 argumen agar dikenali Express sebagai error handler).
function errorHandler(err, req, res, next) {
  // JSON rusak yang dilempar express.json().
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      status: "error",
      message: "Format JSON tidak valid",
      data: null,
    });
  }

  // Kegagalan validasi schema mongoose.
  if (err.name === "ValidationError") {
    const pesan = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return res.status(400).json({ status: "error", message: pesan, data: null });
  }

  // Id yang bukan ObjectId.
  if (err.name === "CastError") {
    return res.status(400).json({
      status: "error",
      message: "Format id tidak valid",
      data: null,
    });
  }

  // Pelanggaran index unik.
  if (err.code === 11000) {
    return res.status(409).json({
      status: "error",
      message: `Data duplikat: ${Object.keys(err.keyValue || {}).join(", ")} sudah digunakan`,
      data: null,
    });
  }

  // Database tidak dapat dijangkau.
  if (err.name === "MongoServerSelectionError" || err.name === "MongooseServerSelectionError") {
    return res.status(503).json({
      status: "error",
      message: "Database tidak tersedia",
      data: null,
    });
  }

  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Terjadi kesalahan pada server",
    data: null,
  });
}

module.exports = { notFound, errorHandler };
