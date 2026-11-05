// Helper pelindung nilai pencarian agar karakter regex diperlakukan sebagai teks biasa.
function escapeRegex(teks) {
  return teks.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { escapeRegex };
