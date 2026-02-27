const express = require("express");
const router = express.Router();

// controllers
const {
  list,
  getById,
  create,
  update,
  remove,
  listapproved,
  actionapproved,
  checkshop,
} = require("../controllers/shop");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/shops", auth, checkRole([3]), list);

router.get("/shops/listapproved", auth, checkRole([4]), listapproved);

router.get("/shops/checkshop", auth, checkRole([3]), checkshop);

router.get("/shops/:shopId", auth, checkRole([3]), getById);

router.post("/shops", auth, checkRole([3]), create);

router.put("/shops/:shopId", auth, checkRole([3]), update);

router.put("/shops/approved/:shopId", auth, checkRole([4]), actionapproved);

router.delete("/shops/:shopId", auth, checkRole([3]), remove);

module.exports = router;
