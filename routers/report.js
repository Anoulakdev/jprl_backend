const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

// controllers
const {
  yearuseract,
  selectactuser,
  selectactimg,
  selectyearuser,
  selectdaterange,
  useractall,
  userall,
} = require("../controllers/report");
// middleware
const { auth, checkRole } = require("../middleware/auth");

// const limiter = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 นาที
//   max: 100, // จำกัดที่ 100 requests ต่อ IP ต่อ windowMs
//   message: {
//     status: 429,
//     message: "Too many requests. Please try again later.",
//   },
// });

// router.use("/reports", limiter);

router.get("/reports/yearuseract", auth, yearuseract);
router.get("/reports/selectactuser", auth, selectactuser);
router.get("/reports/selectactimg", auth, selectactimg);
router.get("/reports/selectyearuser", auth, selectyearuser);
router.get("/reports/selectdaterange", auth, selectdaterange);
router.get("/reports/useractall", auth, checkRole([2]), useractall);
router.get("/reports/userall", auth, checkRole([2]), userall);

module.exports = router;
