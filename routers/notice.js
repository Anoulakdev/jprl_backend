const express = require("express");
const router = express.Router();

// controllers
const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../controllers/notice");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/notices", auth, checkRole([2, 3]), list);

router.get("/notices/:noticeId", auth, checkRole([2]), getById);

router.post("/notices", auth, checkRole([2]), create);

router.put("/notices/:noticeId", auth, checkRole([2]), update);

router.delete("/notices/:noticeId", auth, checkRole([2]), remove);

module.exports = router;
