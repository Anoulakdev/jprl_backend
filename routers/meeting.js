const express = require("express");
const router = express.Router();

// controllers
const {
  list,
  getById,
  create,
  update,
  remove,
  meetcount,
  smeeting,
} = require("../controllers/meeting");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/meetings", auth, checkRole([2, 3]), list);

router.get("/meetings/smeeting", auth, smeeting);

router.get("/meetings/count", auth, checkRole([1, 2]), meetcount);

router.get("/meetings/:meetingId", auth, checkRole([2, 3]), getById);

router.post("/meetings", auth, checkRole([2]), create);

router.put("/meetings/:meetingId", auth, checkRole([2]), update);

router.delete("/meetings/:meetingId", auth, checkRole([2]), remove);

module.exports = router;
