const express = require("express");
const router = express.Router();

// controllers
const {
  list,
  listpopular,
  getProduct,
  getById,
  create,
  update,
  remove,
  listapproved,
  actionapproved,
  listUser,
} = require("../controllers/product");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/products", auth, checkRole([3]), list);

router.get("/products/productpopular", auth, checkRole([3]), listpopular);

router.get("/products/listuser", auth, checkRole([3]), listUser);

router.get("/products/listapproved", auth, checkRole([4]), listapproved);

router.get("/products/getproduct/:productId", auth, checkRole([3]), getProduct);

router.get("/products/:productId", auth, checkRole([3, 4]), getById);

router.post("/products", auth, checkRole([3]), create);

router.put("/products/:productId", auth, checkRole([3]), update);

router.put(
  "/products/approved/:productId",
  auth,
  checkRole([4]),
  actionapproved,
);

router.delete("/products/:productId", auth, checkRole([3]), remove);

module.exports = router;
