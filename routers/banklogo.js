const express = require("express");
const router = express.Router();

// controllers
const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../controllers/banklogo");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/banklogos", auth, list);

router.get("/banklogos/:bankId", auth, getById);

router.post("/banklogos", auth, checkRole([4]), create);

router.put("/banklogos/:bankId", auth, checkRole([4]), update);

router.delete("/banklogos/:bankId", auth, checkRole([4]), remove);

module.exports = router;
