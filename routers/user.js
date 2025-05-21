const express = require("express");
const router = express.Router();

// controllers
const {
  listsuperadmin,
  listadmin,
  listuser,
  getById,
  create,
  update,
  remove,
  updateStatus,
  updateprofile,
  changepassword,
  resetpassword,
  profileview,
  usercount,
} = require("../controllers/user");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/users/count", auth, checkRole([1, 2]), usercount);
router.get("/users/superadmin", auth, checkRole([1]), listsuperadmin);
router.get("/users/admin", auth, checkRole([2]), listadmin);
router.get("/users/user", auth, checkRole([3]), listuser);
router.get("/users/:userId", auth, getById);
router.get("/users/profileview/:code", auth, profileview);
router.post("/users", auth, create);
router.post("/users/changepassword", auth, changepassword);
router.put("/users/:userId", auth, update);
router.put("/users/updateprofile/:userId", auth, updateprofile);
router.put("/users/resetpassword/:userId", auth, resetpassword);
router.delete("/users/:userId", auth, remove);
router.put("/users/:userId/status", auth, updateStatus);

module.exports = router;
