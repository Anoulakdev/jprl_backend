const express = require("express");
const router = express.Router();

// controllers
const {
  listOrder,
  listCancel,
  listProcess,
  listFinish,
  listSeller,
  sellerProcess,
  getById,
  create,
  remove,
  reportAllOrder,
  reportShopOrder,
} = require("../controllers/order");
// middleware
const { auth, checkRole } = require("../middleware/auth");

router.get("/orderlist", auth, checkRole([3]), listOrder);

router.get("/ordercancle", auth, checkRole([3]), listCancel);

router.get("/orderprocess", auth, checkRole([3]), listProcess);

router.get("/orderfinish", auth, checkRole([3]), listFinish);

router.get("/orderseller", auth, checkRole([3]), listSeller);

router.get("/sellerprocess", auth, checkRole([3]), sellerProcess);

router.get("/reportallorder", auth, checkRole([4]), reportAllOrder);

router.get("/reportshoporder", auth, checkRole([3]), reportShopOrder);

router.get("/orders/:orderId", auth, checkRole([3, 4]), getById);

router.post("/orders", auth, checkRole([3]), create);

router.delete("/orders/:orderId", auth, checkRole([3]), remove);

module.exports = router;
