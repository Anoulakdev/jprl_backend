const express = require("express");
const router = express.Router();

// controllers
const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../controllers/productunit");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/productunits", auth, list);

router.get("/productunits/:pUnitId", auth, checkRole([4]), getById);

router.post("/productunits", auth, checkRole([4]), create);

router.put("/productunits/:pUnitId", auth, checkRole([4]), update);

router.delete("/productunits/:pUnitId", auth, checkRole([4]), remove);

module.exports = router;
