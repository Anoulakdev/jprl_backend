const express = require("express");
const router = express.Router();

// controllers
const { list, create } = require("../controllers/favorite");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/favorites", auth, checkRole([3]), list);

router.post("/favorites", auth, checkRole([3]), create);

module.exports = router;
