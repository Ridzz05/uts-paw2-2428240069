// Rute resource /Bioskop.
const express = require("express");
const controller = require("../controllers/BioskopController");
const { cekApiKey } = require("../middlewares/cekApiKey");
const { validasiQuery } = require("../middlewares/validasiQuery");

const router = express.Router();

// Filter numerik yang divalidasi middleware.
const ANGKA = ["durasiMenitMin", "durasiMenitMax", "createdAt"];

router.get(
  "/",
  validasiQuery({ sort: controller.SORT_FIELDS, fields: controller.FIELDS, angka: ANGKA }),
  controller.getAll
);
router.get("/:id", controller.getById);
router.post("/", cekApiKey, controller.create);
router.put("/:id", cekApiKey, controller.update);
router.delete("/:id", cekApiKey, controller.remove);

module.exports = router;
