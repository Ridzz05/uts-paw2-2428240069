// Middleware pemeriksa API key via header x-api-key.
function cekApiKey(req, res, next) {
  if (req.get("x-api-key") !== process.env.API_KEY) {
    return res.status(401).json({
      status: "error",
      message: "API key tidak valid atau tidak ditemukan",
      data: null,
    });
  }
  next();
}

module.exports = { cekApiKey };
