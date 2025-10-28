const express = require("express");
const router = express.Router();

// controllers
const {
  list,
  getById,
  create,
  update,
  remove,
  checkmeet,
  listapproved,
  actionapproved,
} = require("../controllers/detailmeet");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/detailmeets", auth, checkRole([3]), list);
router.get("/detailmeets/checkmeet", auth, checkRole([3]), checkmeet);
router.get("/detailmeets/listapproved", auth, checkRole([2]), listapproved);
router.get("/detailmeets/:detailmeetId", auth, checkRole([3]), getById);
router.post("/detailmeets", auth, checkRole([3]), create);
router.put("/detailmeets/:detailmeetId", auth, checkRole([3]), update);
router.put(
  "/detailmeets/approved/:detailmeetId",
  auth,
  checkRole([2]),
  actionapproved
);
router.delete("/detailmeets/:detailmeetId", auth, checkRole([3]), remove);

module.exports = router;
