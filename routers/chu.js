const express = require("express");
const router = express.Router();

// controllers
const {
  list,
  getById,
  create,
  update,
  remove,
  chucount,
} = require("../controllers/chu");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/chus", auth, list);

router.get("/chus/count", auth, checkRole([1, 2]), chucount);

router.get("/chus/:chuId", auth, checkRole([2]), getById);

router.post("/chus", auth, checkRole([2]), create);

router.put("/chus/:chuId", auth, checkRole([2]), update);

router.delete("/chus/:chuId", auth, checkRole([2]), remove);

module.exports = router;
