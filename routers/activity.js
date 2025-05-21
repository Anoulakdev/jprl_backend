const express = require("express");
const router = express.Router();

// controllers
const {
  list,
  getById,
  create,
  update,
  remove,
  actcount,
} = require("../controllers/activity");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/activitys", auth, checkRole([2, 3]), list);

router.get("/activitys/count", auth, checkRole([1, 2]), actcount);

router.get("/activitys/:activityId", auth, checkRole([2, 3]), getById);

router.post("/activitys", auth, checkRole([2]), create);

router.put("/activitys/:activityId", auth, checkRole([2]), update);

router.delete("/activitys/:activityId", auth, checkRole([2]), remove);

module.exports = router;
