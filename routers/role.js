const express = require("express");
const router = express.Router();

// controllers
const {
  list,
  getById,
  create,
  update,
  remove,
  srole,
} = require("../controllers/role");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/roles", auth, checkRole([1]), list);

router.get("/roles/srole", auth, srole);

router.get("/roles/:roleId", auth, checkRole([1]), getById);

router.post("/roles", auth, checkRole([1]), create);

router.put("/roles/:roleId", auth, checkRole([1]), update);

router.delete("/roles/:roleId", auth, checkRole([1]), remove);

module.exports = router;
