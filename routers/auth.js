const express = require("express");
const router = express.Router();
// import Controllers
const { login, profile } = require("../controllers/auth");
const { auth } = require("../middleware/auth");

router.post("/login", login);

router.get("/profile", auth, profile);

// Export
module.exports = router;
