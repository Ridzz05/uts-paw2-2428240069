// Rute resource /film.
const express = require("express");
const controller = require("../controllers/filmController");
const { validasiQuery } = require("../middlewares/validasiQuery");

const router = express.Router();

router.get("/", validasiQuery({ sort: controller.SORT_FIELDS, fields: controller.FIELDS }), controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);

module.exports = router;
