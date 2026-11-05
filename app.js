// ===========================================================================
// Tugas 3 - RESTful API Express.js + MongoDB (embedding & referencing)
// Nama    : M. Rizki Algipari
// NIM     : 2428240069
// Kelas   : SI5B
// tahun: Galeri Seni - Bioskop
// Resource: /Bioskop (referensi ke collection film, embed drama & komedi)
// ===========================================================================

// Muat variabel lingkungan dari .env (harus paling awal).
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { connectDB } = require("./config/db");
const { logger } = require("./middlewares/logger");
const BioskopRoutes = require("./routes/BioskopRoutes");
const filmRoutes = require("./routes/filmRoutes");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

// Membuat instance aplikasi Express.
const app = express();

// Middleware global: CORS, parsing JSON, dan pencatat log.
app.use(cors());
app.use(express.json());
app.use(logger);

// GET / — informasi API.
app.get("/", (req, res) => {
  res.status(200).json({
    nama: "M. Rizki Algipari",
    nim: "2428240069",
    kelas: "SI5B",
    topik: "tahun - Galeri Seni: Bioskop",
    database: "MongoDB",
    resource: "/Bioskop",
    endpoints: [
      "GET /",
      "GET /Bioskop (filter, sort, page/limit, fields)",
      "GET /Bioskop/:id",
      "POST /Bioskop (x-api-key)",
      "PUT /Bioskop/:id (x-api-key)",
      "DELETE /Bioskop/:id (x-api-key)",
      "GET /film",
      "GET /film/:id",
      "POST /film (x-api-key)",
    ],
  });
});

// Route resource /Bioskop dan /film.
app.use("/Bioskop", BioskopRoutes);
app.use("/film", filmRoutes);

// Catch-all 404 untuk endpoint tak dikenal.
app.use(notFound);

// Error handler terpusat (paling bawah).
app.use(errorHandler);

// Menyambung ke MongoDB sebelum server menerima permintaan.
const siapDatabase = connectDB().catch((err) => {
  console.error(`Gagal terhubung ke MongoDB: ${err.message}`);
  if (process.env.NODE_ENV !== "production") {
    process.exit(1);
  }
  return null;
});

// Menjalankan server hanya di luar mode production (mis. Vercel).
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  siapDatabase.then(() => {
    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  });
}

// Ekspor app agar bisa dipakai Vercel (serverless) dan pengujian.
module.exports = app;
