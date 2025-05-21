const express = require("express");
const router = express.Router();

// controllers
const {
  list,
  getById,
  create,
  update,
  remove,
  checkact,
} = require("../controllers/detailact");
// middleware
const { auth } = require("../middleware/auth");

router.get("/detailacts", auth, list);
router.get("/detailacts/checkact", auth, checkact);
router.get("/detailacts/:detailactId", auth, getById);
router.post("/detailacts", auth, create);
router.put("/detailacts/:detailactId", auth, update);
router.delete("/detailacts/:detailactId", auth, remove);

module.exports = router;
