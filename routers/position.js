const express = require("express");
const router = express.Router();

// controllers
const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../controllers/position");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/positions", auth, list);

router.get("/positions/:positionId", auth, checkRole([1]), getById);

router.post("/positions", auth, checkRole([1]), create);

router.put("/positions/:positionId", auth, checkRole([1]), update);

router.delete("/positions/:positionId", auth, checkRole([1]), remove);

module.exports = router;
