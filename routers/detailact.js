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
const { auth, checkRole } = require("../middleware/auth");

router.get("/detailacts", auth, checkRole([3]), list);
router.get("/detailacts/checkact", auth, checkRole([3]), checkact);
router.get("/detailacts/listapproved", auth, checkRole([3]), listapproved);
router.get("/detailacts/:detailactId", auth, checkRole([3]), getById);
router.post("/detailacts", auth, checkRole([3]), create);
router.put("/detailacts/:detailactId", auth, checkRole([3]), update);
router.put(
  "/detailacts/approved/:detailactId",
  auth,
  checkRole([3]),
  actionapproved
);
router.delete("/detailacts/:detailactId", auth, checkRole([3]), remove);

module.exports = router;
