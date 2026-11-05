// Rute resource /film.
const express = require("express");
const controller = require("../controllers/filmController");
const { cekApiKey } = require("../middlewares/cekApiKey");
const { validasiQuery } = require("../middlewares/validasiQuery");

const router = express.Router();

const FIELDS = ["nama", "negara", "tahunLahir", "genre", "bio", "createdAt"];

router.get(
  "/",
  validasiQuery({ sort: controller.SORT_FIELDS, fields: FIELDS, angka: ["tahunLahir"] }),
  controller.getAll
);
router.get("/:id", controller.getById);
router.post("/", cekApiKey, controller.create);

module.exports = router;
