const express = require("express");
const router = express.Router();

// controllers
const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../controllers/organize");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/organizes", auth, list);

router.get("/organizes/:organizeId", auth, getById);

router.post("/organizes", auth, create);

router.put("/organizes/:organizeId", auth, update);

router.delete("/organizes/:organizeId", auth, remove);

module.exports = router;
