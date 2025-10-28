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
  selectdaterangecount,
  useractall,
  userall,
  yearusermeet,
  selectmeetuser,
  selectmeetimg,
  selectmeetyearuser,
  selectmeetdaterange,
  selectmeetdaterangecount,
  usermeetall,
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

// Activity
router.get("/reports/yearuseract", auth, checkRole([3]), yearuseract);
router.get("/reports/selectactuser", auth, checkRole([2]), selectactuser);
router.get("/reports/selectactimg", auth, checkRole([2]), selectactimg);
router.get("/reports/selectyearuser", auth, checkRole([2]), selectyearuser);
router.get("/reports/selectdaterange", auth, checkRole([2]), selectdaterange);
router.get(
  "/reports/selectdaterangecount",
  auth,
  checkRole([2]),
  selectdaterangecount
);
router.get("/reports/useractall", auth, checkRole([2]), useractall);
router.get("/reports/userall", auth, checkRole([2]), userall);

// Meeting
router.get("/reports/yearusermeet", auth, checkRole([3]), yearusermeet);
router.get("/reports/selectmeetuser", auth, checkRole([2]), selectmeetuser);
router.get("/reports/selectmeetimg", auth, checkRole([2]), selectmeetimg);
router.get(
  "/reports/selectmeetyearuser",
  auth,
  checkRole([2]),
  selectmeetyearuser
);
router.get(
  "/reports/selectmeetdaterange",
  auth,
  checkRole([2]),
  selectmeetdaterange
);
router.get(
  "/reports/selectmeetdaterangecount",
  auth,
  checkRole([2]),
  selectmeetdaterangecount
);
router.get("/reports/usermeetall", auth, checkRole([2]), usermeetall);

module.exports = router;
