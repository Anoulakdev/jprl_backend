const express = require("express");
const router = express.Router();

// controllers
const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../controllers/sendlocation");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/sendlocations", auth, list);

router.get("/sendlocations/:sLocationId", auth, checkRole([4]), getById);

router.post("/sendlocations", auth, checkRole([4]), create);

router.put("/sendlocations/:sLocationId", auth, checkRole([4]), update);

router.delete("/sendlocations/:sLocationId", auth, checkRole([4]), remove);

module.exports = router;
