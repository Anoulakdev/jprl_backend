const fs = require("fs");
const prisma = require("../prisma/prisma");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const moment = require("moment-timezone");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, "./uploads/notice");
    cb(null, path.join(process.env.UPLOAD_BASE_PATH, "category"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Appending file extension
  },
});

const upload = multer({ storage: storage }).single("catimg");

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
      const { name, code } = req.body;

      // Step 1: Validate input fields
      if (!name) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Step 4: Create new user
      const categorys = await prisma.category.create({
        data: {
          name,
          code,
          catimg: req.file ? `${req.file.filename}` : null,
        },
      });

      res.status(201).json({
        message: "Category created successfully!",
        data: categorys,
      });
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).send("Server Error");
    }
  });
};

exports.list = async (req, res) => {
  try {
    const categorys = await prisma.category.findMany({
      orderBy: {
        code: "asc",
      },
    });

    res.json(categorys);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { catId } = req.params;

    const category = await prisma.category.findUnique({
      where: {
        id: Number(catId),
      },
    });

    if (!category) {
      return res.status(404).json({ message: "categorys not found" });
    }

    res.json(category);
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
      const { catId } = req.params;
      const { name, code } = req.body;

      // Step 1: Find the user to update
      const categorys = await prisma.category.findUnique({
        where: {
          id: Number(catId),
        },
      });

      if (!categorys) {
        return res.status(404).json({ message: "categorys not found" });
      }

      // Step 2: If a new photo is uploaded and an old photo exists, delete the old photo
      let categoryfilePath = categorys.catimg; // Keep old photo path
      if (req.file) {
        // Only attempt to delete if there is an existing photo path
        if (categorys.catimg) {
          const oldCategoryFilePath = path.join(
            process.env.UPLOAD_BASE_PATH,
            "category",
            path.basename(categorys.catimg),
          );
          fs.unlink(oldCategoryFilePath, (err) => {
            if (err) {
              console.error("Error deleting old file: ", err);
            }
          });
        }

        // Set the new photo path
        categoryfilePath = `${req.file.filename}`;
      }

      // Step 3: Update the user record
      const updated = await prisma.category.update({
        where: {
          id: Number(catId),
        },
        data: {
          name,
          code,
          catimg: categoryfilePath,
        },
      });

      res.json({ message: "Update successful!", data: updated });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server Error" });
    }
  });
};

exports.remove = async (req, res) => {
  try {
    const { catId } = req.params;

    // Step 1: Find the user by ID
    const categorys = await prisma.category.findUnique({
      where: {
        id: Number(catId),
      },
    });

    if (!categorys) {
      return res.status(404).json({ message: "categorys not found" });
    }

    // Step 2: Delete the photo file if it exists
    if (categorys.catimg) {
      const categoryfilePath = path.join(
        process.env.UPLOAD_BASE_PATH,
        "category",
        categorys.catimg,
      );
      fs.unlink(categoryfilePath, (err) => {
        if (err) {
          console.error("Error deleting userimg file: ", err);
          return res
            .status(500)
            .json({ message: "Error deleting userimg file" });
        }
      });
    }

    // Step 3: Delete the user from the database
    const removed = await prisma.category.delete({
      where: {
        id: Number(catId),
      },
    });

    res
      .status(200)
      .json({ message: "category and image deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
