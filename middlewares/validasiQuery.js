// Middleware pengurai query string: filter, sorting, pagination, dan projection.
// Setiap resource mendaftarkan daftar field yang boleh dipakai agar tidak ada
// field sembarang yang lolos ke query MongoDB.

const BATAS_LIMIT = 50;

function tolak(res, message) {
  return res.status(400).json({ status: "error", message, data: null });
}

// Ubah "harga,-judul" menjadi { harga: 1, judul: -1 }.
function uraiSort(nilai, diizinkan) {
  const hasil = {};

  for (const bagian of nilai.split(",")) {
    const teks = bagian.trim();
    if (teks === "") continue;

    const menurun = teks.startsWith("-");
    const field = menurun ? teks.slice(1) : teks;

    if (!diizinkan.includes(field)) {
      return { error: `Field sort tidak dikenal: ${field}. Field yang diizinkan: ${diizinkan.join(", ")}` };
    }

    hasil[field] = menurun ? -1 : 1;
  }

  return { sort: hasil };
}

function validasiQuery({ sort: sortDiizinkan = [], fields: fieldsDiizinkan = [], angka: angkaDiizinkan = [] }) {
  const defaultSort = sortDiizinkan[0];

  return function (req, res, next) {
    const { page: pageMentah, limit: limitMentah, sort: sortMentah, fields: fieldsMentah, ...sisa } = req.query;

    // Pagination.
    let page = 1;
    if (pageMentah !== undefined) {
      if (!/^\d+$/.test(String(pageMentah))) {
        return tolak(res, "Parameter page harus berupa angka");
      }
      page = Number(pageMentah);
      if (page < 1) {
        return tolak(res, "Parameter page minimal 1");
      }
    }

    let limit = 10;
    if (limitMentah !== undefined) {
      if (!/^\d+$/.test(String(limitMentah))) {
        return tolak(res, "Parameter limit harus berupa angka");
      }
      limit = Number(limitMentah);
      if (limit < 1) {
        return tolak(res, "Parameter limit minimal 1");
      }
      if (limit > BATAS_LIMIT) {
        return tolak(res, `Parameter limit maksimal ${BATAS_LIMIT}`);
      }
    }

    // Sorting.
    let sort = { [defaultSort]: 1 };
    if (sortMentah !== undefined) {
      const hasil = uraiSort(String(sortMentah), sortDiizinkan);
      if (hasil.error) {
        return tolak(res, hasil.error);
      }
      if (Object.keys(hasil.sort).length > 0) {
        sort = hasil.sort;
      }
    }

    // Projection.
    let fields = null;
    if (fieldsMentah !== undefined && String(fieldsMentah).trim() !== "") {
      const daftar = String(fieldsMentah)
        .split(",")
        .map((bagian) => bagian.trim())
        .filter((bagian) => bagian !== "");

      for (const field of daftar) {
        if (!fieldsDiizinkan.includes(field)) {
          return tolak(res, `Field projection tidak dikenal: ${field}. Field yang diizinkan: ${fieldsDiizinkan.join(", ")}`);
        }
      }

      fields = daftar.join(" ");
    }

    // Filter: seluruh query selain page/limit/sort/fields.
    const filter = { ...sisa };
    for (const nama of angkaDiizinkan) {
      if (filter[nama] === undefined) continue;

      const teks = String(filter[nama]).trim();
      if (!/^\d+(\.\d+)?$/.test(teks)) {
        return tolak(res, `Parameter ${nama} harus berupa angka`);
      }
      filter[nama] = Number(teks);
    }

    req.opsi = { filter, sort, page, limit, skip: (page - 1) * limit, fields };
    next();
  };
}

module.exports = { validasiQuery, BATAS_LIMIT };
