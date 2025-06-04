const express = require("express");
const router = express.Router();

// controllers
const {
  list,
  getById,
  create,
  update,
  remove,
  unitcount,
  sunit,
} = require("../controllers/unit");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/units", auth, checkRole([2]), list);

router.get("/units/sunit", auth, sunit);

router.get("/units/count", auth, checkRole([1, 2]), unitcount);

router.get("/units/:unitId", auth, checkRole([2]), getById);

router.post("/units", auth, checkRole([2]), create);

router.put("/units/:unitId", auth, checkRole([2]), update);

router.delete("/units/:unitId", auth, checkRole([2]), remove);

module.exports = router;
