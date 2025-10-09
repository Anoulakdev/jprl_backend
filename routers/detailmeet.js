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
const { auth } = require("../middleware/auth");

router.get("/detailmeets", auth, list);
router.get("/detailmeets/checkmeet", auth, checkmeet);
router.get("/detailmeets/listapproved", auth, listapproved);
router.get("/detailmeets/:detailmeetId", auth, getById);
router.post("/detailmeets", auth, create);
router.put("/detailmeets/:detailmeetId", auth, update);
router.put("/detailmeets/approved/:detailmeetId", auth, actionapproved);
router.delete("/detailmeets/:detailmeetId", auth, remove);

module.exports = router;
