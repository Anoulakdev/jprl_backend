const prisma = require("../prisma/prisma");
const moment = require("moment-timezone");

exports.create = async (req, res) => {
  try {
    const { productId, favorite } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Invalid input fields" });
    }

    const key = {
      userCode_productId: {
        userCode: req.user.code,
        productId: Number(productId),
      },
    };

    if (favorite === true) {
      // 🔎 check ว่ามีอยู่แล้วหรือยัง
      const existing = await prisma.userProduct.findUnique({ where: key });
      if (existing) {
        return res.status(400).json({ message: "Already favorited" });
      }

      const newFavorite = await prisma.userProduct.create({
        data: {
          productId: Number(productId),
          userCode: req.user.code,
        },
      });

      return res.json({
        message: "favorite created successfully!",
        data: newFavorite,
      });
    } else {
      // 🔎 check ว่ามี record อยู่จริงไหม
      const existing = await prisma.userProduct.findUnique({ where: key });
      if (!existing) {
        return res.status(404).json({ message: "Favorite not found" });
      }

      const deletedFavorite = await prisma.userProduct.delete({ where: key });

      return res.json({
        message: "favorite removed successfully!",
        data: deletedFavorite,
      });
    }
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const favorites = await prisma.userProduct.findMany({
      where: {
        userCode: req.user.code,
      },
      include: {
        product: {
          include: {
            shop: true,
            category: true,
            productunit: true,
            reviews: {
              select: { rating: true }, // ดึง rating
            },
          },
        },
      },
    });

    const formatted = favorites.map((favorite) => {
      const ratings = favorite.product.reviews
        .map((r) => r.rating)
        .filter(Boolean);
      const avgRating =
        ratings.length > 0
          ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
          : null;

      return {
        userCode: favorite.userCode,
        productId: favorite.productId,
        favorite: true, // เพราะ favorites list
        avgRating, // ✅ เพิ่ม avgRating
        product: {
          ...favorite.product,
          createdAt: moment(favorite.product.createdAt)
            .tz("Asia/Vientiane")
            .format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: moment(favorite.product.updatedAt)
            .tz("Asia/Vientiane")
            .format("YYYY-MM-DD HH:mm:ss"),
        },
      };
    });

    res.json(formatted);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
