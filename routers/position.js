const express = require("express");
const router = express.Router();

// controllers
const {
  list,
  getById,
  create,
  update,
  remove,
  sposition,
} = require("../controllers/position");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/positions", auth, checkRole([1]), list);

router.get("/positions/sposition", auth, sposition);

router.get("/positions/:positionId", auth, checkRole([1]), getById);

router.post("/positions", auth, checkRole([1]), create);

router.put("/positions/:positionId", auth, checkRole([1]), update);

router.delete("/positions/:positionId", auth, checkRole([1]), remove);

module.exports = router;
