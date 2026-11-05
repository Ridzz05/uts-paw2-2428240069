// Koneksi database MongoDB memakai mongoose.
const mongoose = require("mongoose");

// Menyambung ke MongoDB sesuai MONGODB_URI pada .env.
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI belum diisi. Salin .env.example menjadi .env lalu isi MONGODB_URI."
    );
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`MongoDB terhubung: ${mongoose.connection.name}`);

  return mongoose.connection;
}

// Kegagalan koneksi setelah tersambung hanya dicatat agar proses tidak berhenti.
mongoose.connection.on("error", (err) => {
  console.error(`Kesalahan koneksi MongoDB: ${err.message}`);
});

module.exports = { connectDB };
