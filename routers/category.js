const express = require("express");
const router = express.Router();

// controllers
const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../controllers/category");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/categorys", auth, list);

router.get("/categorys/:catId", auth, checkRole([4]), getById);

router.post("/categorys", auth, checkRole([4]), create);

router.put("/categorys/:catId", auth, checkRole([4]), update);

router.delete("/categorys/:catId", auth, checkRole([4]), remove);

module.exports = router;
