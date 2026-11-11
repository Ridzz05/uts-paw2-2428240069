// Rute resource /studio.
const express = require("express");
const controller = require("../controllers/studioController");
const { validasiQuery } = require("../middlewares/validasiQuery");

const router = express.Router();

router.get("/", validasiQuery({ sort: controller.SORT_FIELDS, fields: controller.FIELDS }), controller.getAll);
router.post("/", controller.create);

module.exports = router;
