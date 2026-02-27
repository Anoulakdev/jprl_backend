const express = require("express");
const router = express.Router();

// controllers
const { create } = require("../controllers/orderstatus");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.post("/orders/orderstatus", auth, checkRole([3]), create);

module.exports = router;
