const prisma = require("../prisma/prisma");
const moment = require("moment-timezone");

exports.create = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Validate input fields
    if (!productId) {
      return res.status(400).json({ message: "Invalid input fields" });
    }

    const checkReview = await prisma.review.findFirst({
      where: { userCode: req.user.code, productId: Number(productId) },
    });
    if (checkReview) {
      return res
        .status(409)
        .json({ message: "You have already reviewed this product" });
    }

    // Create new user in the database
    const newReview = await prisma.review.create({
      data: {
        productId: Number(productId),
        rating: rating ? Number(rating) : null,
        comment,
        userCode: req.user.code,
      },
    });

    res.json({
      message: "review created successfully!",
      data: newReview,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const { productId } = req.query;

    const reviews = await prisma.review.findMany({
      where: {
        productId: Number(productId),
      },
      orderBy: {
        id: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            code: true,
          },
        },
      },
    });

    const formatted = reviews.map((review) => ({
      ...review,
      createdAt: moment(review.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(review.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
    }));

    res.json(formatted);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.personReviews = async (req, res) => {
  try {
    const { productId } = req.query;

    const reviews = await prisma.review.findMany({
      where: {
        productId: Number(productId),
        userCode: req.user.code,
      },
      orderBy: {
        id: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            code: true,
          },
        },
      },
    });

    const formatted = reviews.map((review) => ({
      ...review,
      createdAt: moment(review.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(review.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
    }));

    res.json(formatted);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.productReviews = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        orderDetails: {
          some: {
            order: {
              userCode: req.user.code,
              currentStatusId: 7,
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        pimg: true,
        shop: {
          select: {
            id: true,
            name: true,
            tel: true,
            userCode: true,
          },
        },

        // ⬇ ดึง order ล่าสุด 1 อันเท่านั้น
        orderDetails: {
          where: {
            order: {
              userCode: req.user.code,
              currentStatusId: 7,
            },
          },
          orderBy: {
            order: {
              createdAt: "desc",
            },
          },
          take: 1, // เอาอันล่าสุดตัวเดียว
          select: {
            order: {
              select: {
                id: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    // จัดรูปผลลัพธ์ ไม่ให้มี orderDetails
    const result = products.map((p) => {
      const latest = p.orderDetails[0]?.order;

      return {
        id: p.id,
        title: p.title,
        pimg: p.pimg,
        shop: p.shop,
        // latestOrderId: latest?.id || null,
        // latestOrderDate: latest
        //   ? moment(latest.createdAt)
        //       .tz("Asia/Vientiane")
        //       .format("YYYY-MM-DD HH:mm:ss")
        //   : null,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({
      where: {
        id: Number(reviewId),
      },
    });

    if (!review) {
      return res.status(404).json({ message: "review not found" });
    }

    const formatted = {
      ...review,
      createdAt: moment(review.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(review.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
    };

    res.json(formatted);
  } catch (err) {
    // err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { productId, rating, comment } = req.body;

    const updated = await prisma.review.update({
      where: {
        id: Number(reviewId),
      },
      data: {
        productId: Number(productId),
        rating: rating ? Number(rating) : null,
        comment,
      },
    });

    res.json({ message: "Updated Success!! ", data: updated });
  } catch (err) {
    // err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const removed = await prisma.review.delete({
      where: {
        id: Number(reviewId),
      },
    });

    res.status(200).json({ message: "review deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
