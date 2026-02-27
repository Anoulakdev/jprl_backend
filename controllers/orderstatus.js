const fs = require("fs");
const prisma = require("../prisma/prisma");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const moment = require("moment-timezone");
const admin = require("../config/firebase");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, "./uploads/organize");
    cb(null, path.join(process.env.UPLOAD_BASE_PATH, "payment"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Appending file extension
  },
});

const upload = multer({ storage: storage }).single("payimg");

exports.create = (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // Handle multer-specific errors
      return res.status(500).json({
        message: "Multer error occurred when uploading.",
        error: err.message,
      });
    } else if (err) {
      // Handle other types of errors
      return res.status(500).json({
        message: "Unknown error occurred when uploading.",
        error: err.message,
      });
    }

    try {
      // Destructure body values
      const { orderId, productstatusId, comment, sendlocationId } = req.body;

      // Step 1: Validate input fields
      if (!orderId || !productstatusId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const order = await prisma.order.findUnique({
        where: { id: Number(orderId) },
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const shoptoken = await prisma.shop.findUnique({
        where: { id: Number(order.shopId) },
        include: {
          user: {
            include: {
              fcmTokens: true,
            },
          },
        },
      });

      const usertoken = await prisma.user.findUnique({
        where: { code: order.userCode },
        include: {
          fcmTokens: true,
        },
      });

      const psname = await prisma.productStatus.findUnique({
        where: { id: Number(productstatusId) },
      });

      // ทำ Transaction
      const result = await prisma.$transaction(async (tx) => {
        const orderStatus = await tx.orderStatus.create({
          data: {
            orderId: Number(orderId),
            productstatusId: Number(productstatusId),
            payimg: req.file ? req.file.filename : null,
            comment,
            sendlocationId: sendlocationId ? Number(sendlocationId) : null,
            userCode: req.user.code,
          },
        });

        await tx.order.update({
          where: { id: Number(orderId) },
          data: { currentStatusId: Number(productstatusId) },
        });

        return orderStatus;
      });

      // ================= SEND FCM =================
      let tokens = [];

      if (order.userCode === req.user.code) {
        // ส่งไป shop
        if (shoptoken?.user?.fcmTokens?.length > 0) {
          tokens = shoptoken.user.fcmTokens.map((t) => t.fcmtoken);
        }
      } else {
        // ส่งไป user
        if (usertoken?.fcmTokens?.length > 0) {
          tokens = usertoken.fcmTokens.map((t) => t.fcmtoken);
        }
      }

      if (tokens.length > 0) {
        const message = {
          notification: {
            title: psname?.name,
            body: `ເລກທີ່ອໍເດີ ${order.orderNo}`,
          },
          data: {
            orderId: String(order.id),
          },
          tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        if (response.failureCount > 0) {
          const invalidTokens = [];

          response.responses.forEach((resp, index) => {
            if (!resp.success) {
              invalidTokens.push(tokens[index]);
            }
          });

          if (invalidTokens.length > 0) {
            await prisma.fcmToken.deleteMany({
              where: {
                fcmtoken: { in: invalidTokens },
              },
            });
          }
        }

        console.log("Notification sent successfully");
      }

      // =============================================

      res.status(201).json({
        message: "OrderStatus created successfully",
        data: result,
      });
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).send("Server Error");
    }
  });
};
