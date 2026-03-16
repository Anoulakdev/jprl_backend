const fs = require("fs");
const prisma = require("../prisma/prisma");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const moment = require("moment-timezone");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, "./uploads/notice");
    cb(null, path.join(process.env.UPLOAD_BASE_PATH, "product"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Appending file extension
  },
});

const upload = multer({ storage: storage }).single("pimg");

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
      const { categoryId, productunitId, title, detail, price } = req.body;

      // Step 1: Validate input fields
      if (!title) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const shop = await prisma.user.findUnique({
        where: { code: req.user.code },
        include: {
          shop: {
            select: { id: true },
          },
        },
      });

      // Step 4: Create new user
      const products = await prisma.product.create({
        data: {
          shopId: shop.shop.id,
          categoryId: Number(categoryId),
          productunitId: Number(productunitId),
          title,
          detail,
          price: Number(price),
          pimg: req.file ? `${req.file.filename}` : null,
        },
      });

      res.status(201).json({
        message: "Product created successfully!",
        data: products,
      });
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).send("Server Error");
    }
  });
};

exports.list = async (req, res) => {
  try {
    const shop = await prisma.user.findUnique({
      where: { code: req.user.code },
      include: {
        shop: {
          select: { id: true },
        },
      },
    });

    // ✅ ตรวจว่าผู้ใช้มี shop หรือไม่
    const shopId = shop?.shop?.id || null;

    const products = await prisma.product.findMany({
      where: {
        categoryId: req.query.categoryId
          ? Number(req.query.categoryId)
          : undefined,
        approved: 2,
        actived: "A",
        ...(shopId
          ? {
              NOT: {
                shopId: shopId,
              },
            }
          : {}),
      },
      orderBy: {
        id: "desc",
      },
      include: {
        category: true,
        productunit: true,
        shop: {
          select: {
            id: true,
            name: true,
            tel: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
        users: {
          where: {
            userCode: req.user.code, // ✅ match user ที่ login
          },
          select: { productId: true }, // ✅ match productId ของสินค้านั้นด้วย
        },
      },
    });

    const formatted = products.map((product) => {
      const ratings = product.reviews.map((r) => r.rating).filter(Boolean);
      const avgRating =
        ratings.length > 0
          ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
          : null;

      return {
        ...product,
        avgRating, // ✅ ค่าเฉลี่ย rating
        favorite: product.users.length > 0,
        createdAt: moment(product.createdAt)
          .tz("Asia/Vientiane")
          .format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment(product.updatedAt)
          .tz("Asia/Vientiane")
          .format("YYYY-MM-DD HH:mm:ss"),
      };
    });

    res.json(formatted);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.listpopular = async (req, res) => {
  try {
    // 🔹 1️⃣ หา shop ของ user (ถ้ามี)
    const shop = await prisma.user.findUnique({
      where: { code: req.user.code },
      include: {
        shop: {
          select: { id: true },
        },
      },
    });

    const shopId = shop?.shop?.id || null;

    // 🔹 2️⃣ group ยอดขาย เฉพาะ order ที่สำเร็จ (status = 7)
    const bestSeller = await prisma.orderDetail.groupBy({
      by: ["productId"],
      where: {
        productId: { not: null },
        order: {
          currentStatusId: 7, // ✅ เฉพาะออเดอร์ที่สำเร็จ
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
    });

    if (bestSeller.length === 0) {
      return res.json([]);
    }

    const productIds = bestSeller.map((item) => item.productId);

    // 🔹 3️⃣ ดึงข้อมูล product
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        approved: 2,
        actived: "A",
        ...(req.query.categoryId
          ? { categoryId: Number(req.query.categoryId) }
          : {}),
        ...(shopId
          ? {
              NOT: {
                shopId: shopId,
              },
            }
          : {}),
      },
      include: {
        category: true,
        productunit: true,
        shop: {
          select: {
            id: true,
            name: true,
            tel: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
        users: {
          where: {
            userCode: req.user.code,
          },
          select: { productId: true },
        },
      },
    });

    // 🔹 4️⃣ เรียงตามลำดับยอดขาย
    const sortedProducts = productIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean);

    // 🔹 5️⃣ format response
    const formatted = sortedProducts.map((product) => {
      const saleData = bestSeller.find((b) => b.productId === product.id);

      const ratings = product.reviews
        .map((r) => r.rating)
        .filter((r) => r !== null);

      const avgRating =
        ratings.length > 0
          ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
          : null;

      return {
        ...product,
        totalSold: saleData?._sum.quantity || 0, // ✅ จำนวนขาย
        avgRating,
        favorite: product.users.length > 0,
        createdAt: moment(product.createdAt)
          .tz("Asia/Vientiane")
          .format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment(product.updatedAt)
          .tz("Asia/Vientiane")
          .format("YYYY-MM-DD HH:mm:ss"),
      };
    });

    res.json(formatted);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.listUser = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        shop: {
          user: {
            code: req.user.code, // ✅ filter user ผ่าน relation ของ shop
          },
        },
      },
      orderBy: {
        id: "desc",
      },
      include: {
        category: true,
        productunit: true,
        shop: {
          select: {
            id: true,
            name: true,
            tel: true,
          },
        },
        userAction: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            gender: true,
          },
        },
      },
    });

    const formatteds = products.map((product) => ({
      ...product,
      createdAt: moment(product.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(product.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
    }));

    res.json(formatteds);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const shop = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: {
        shop: {
          select: { id: true },
        },
      },
    });

    // ✅ ตรวจว่ามี product และ shop ไหม
    if (!shop) {
      return res.status(404).json({ message: "Product or Shop not found" });
    }

    const products = await prisma.product.findMany({
      where: {
        shopId: shop.shop.id,
        approved: 2,
      },
      orderBy: {
        id: "asc",
      },
      include: {
        category: true,
        productunit: true,
        shop: {
          select: {
            id: true,
            name: true,
            tel: true,
          },
        },
        reviews: {
          select: { rating: true }, // ✅ ดึง rating
        },
        users: {
          where: {
            userCode: req.user.code, // ✅ match user ที่ login
          },
          select: { productId: true },
        },
      },
    });

    const formatted = products.map((product) => {
      // ✅ คำนวณ avgRating
      const ratings = product.reviews.map((r) => r.rating).filter(Boolean);
      const avgRating =
        ratings.length > 0
          ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
          : null;

      return {
        ...product,
        avgRating,
        favorite: product.users.length > 0, // ✅ เช็คว่า user login เคย favorite ไหม
        createdAt: moment(product.createdAt)
          .tz("Asia/Vientiane")
          .format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment(product.updatedAt)
          .tz("Asia/Vientiane")
          .format("YYYY-MM-DD HH:mm:ss"),
      };
    });

    res.json(formatted);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id: Number(productId),
      },
      include: {
        category: true,
        productunit: true,
        shop: {
          select: {
            id: true,
            name: true,
            tel: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: "products not found" });
    }

    // ✅ คำนวณค่าเฉลี่ย rating
    const ratings = product.reviews.map((r) => r.rating).filter(Boolean);
    const avgRating =
      ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
        : null;

    // ✅ นับจำนวนแต่ละ rating 1-5
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach((r) => {
      if (ratingCounts[r] !== undefined) {
        ratingCounts[r]++;
      }
    });

    // ✅ format response
    const formatted = {
      ...product,
      avgRating,
      reviewCount: ratings.length,
      ratingCounts, // {1: x, 2: y, 3: z, 4: w, 5: k}
      createdAt: moment(product.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(product.updatedAt)
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
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({
        message: "Multer error occurred during upload.",
        error: err,
      });
    } else if (err) {
      return res.status(500).json({
        message: "Unknown error occurred during upload.",
        error: err,
      });
    }

    try {
      const { productId } = req.params;
      const { categoryId, productunitId, title, detail, price } = req.body;

      // Step 1: Find the user to update
      const products = await prisma.product.findUnique({
        where: {
          id: Number(productId),
        },
      });

      if (!products) {
        return res.status(404).json({ message: "products not found" });
      }

      // Step 2: If a new photo is uploaded and an old photo exists, delete the old photo
      let productfilePath = products.pimg; // Keep old photo path
      if (req.file) {
        // Only attempt to delete if there is an existing photo path
        if (products.pimg) {
          const oldProductFilePath = path.join(
            process.env.UPLOAD_BASE_PATH,
            "product",
            path.basename(products.pimg),
          );
          fs.unlink(oldProductFilePath, (err) => {
            if (err) {
              console.error("Error deleting old file: ", err);
            }
          });
        }

        // Set the new photo path
        productfilePath = `${req.file.filename}`;
      }

      // Step 3: Update the user record
      const updated = await prisma.product.update({
        where: {
          id: Number(productId),
        },
        data: {
          categoryId: Number(categoryId),
          productunitId: Number(productunitId),
          title,
          detail,
          price: Number(price),
          pimg: productfilePath,
        },
      });

      res.json({ message: "Update successful!", data: updated });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server Error" });
    }
  });
};

exports.updateProductStatus = async (req, res) => {
  const { productId } = req.params;
  const { actived } = req.body;

  try {
    // ตัวอย่างการอัปเดตในฐานข้อมูลด้วย Prisma
    const updatedProduct = await prisma.product.update({
      where: { id: Number(productId) },
      data: { actived },
    });

    res.status(200).json({ message: "ອັບ​ເດດ​ສຳ​ເລັດ", user: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: "​ອັບ​ເດດ​ບໍ່​ສ​ຳ​ເລັ​ດ" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { productId } = req.params;

    // Step 1: Find the user by ID
    const products = await prisma.product.findUnique({
      where: {
        id: Number(productId),
      },
    });

    if (!products) {
      return res.status(404).json({ message: "products not found" });
    }

    // Step 2: Delete the photo file if it exists
    if (products.pimg) {
      const productfilePath = path.join(
        process.env.UPLOAD_BASE_PATH,
        "product",
        products.pimg,
      );
      fs.unlink(productfilePath, (err) => {
        if (err) {
          console.error("Error deleting pimg file: ", err);
          return res.status(500).json({ message: "Error deleting pimg file" });
        }
      });
    }

    // Step 3: Delete the user from the database
    const removed = await prisma.product.delete({
      where: {
        id: Number(productId),
      },
    });

    res
      .status(200)
      .json({ message: "product and image deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.listapproved = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        id: "desc",
      },
      include: {
        productunit: true,
        shop: {
          select: {
            id: true,
            name: true,
            tel: true,
          },
        },
        userAction: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            gender: true,
          },
        },
      },
    });

    const formatteds = products.map((product) => ({
      ...product,
      createdAt: moment(product.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(product.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
    }));

    res.json(formatteds);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.actionapproved = async (req, res) => {
  try {
    const { productId } = req.params;
    const { categoryId, percent, approved } = req.body;

    // Step 1: Find the user to update
    const product = await prisma.product.findUnique({
      where: {
        id: Number(productId),
      },
    });

    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    const updated = await prisma.product.update({
      where: {
        id: Number(productId),
      },
      data: {
        categoryId: Number(categoryId),
        percent: Number(percent),
        approved: Number(approved),
        userActionId: req.user.id,
      },
    });

    res.json({ message: "Update successful!", data: updated });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
