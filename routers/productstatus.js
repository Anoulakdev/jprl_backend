const express = require("express");
const router = express.Router();

// controllers
const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../controllers/productstatus");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/productstatus", auth, list);

router.get("/productstatus/:pStatusId", auth, checkRole([4]), getById);

router.post("/productstatus", auth, checkRole([4]), create);

router.put("/productstatus/:pStatusId", auth, checkRole([4]), update);

router.delete("/productstatus/:pStatusId", auth, checkRole([4]), remove);

module.exports = router;
