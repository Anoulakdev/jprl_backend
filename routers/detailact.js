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
  listapproved,
  actionapproved,
} = require("../controllers/detailact");
// middleware
const { auth } = require("../middleware/auth");

router.get("/detailacts", auth, list);
router.get("/detailacts/checkact", auth, checkact);
router.get("/detailacts/listapproved", auth, listapproved);
router.get("/detailacts/:detailactId", auth, getById);
router.post("/detailacts", auth, create);
router.put("/detailacts/:detailactId", auth, update);
router.put("/detailacts/approved/:detailactId", auth, actionapproved);
router.delete("/detailacts/:detailactId", auth, remove);

module.exports = router;
