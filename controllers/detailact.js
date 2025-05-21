const fs = require("fs");
const prisma = require("../prisma/prisma");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const moment = require("moment-timezone");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/activity"); // The directory where user images will be stored
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Appending file extension
  },
});

const upload = multer({ storage: storage }).single("actimg");

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
      const { activityId, userCode, content, lat, lng } = req.body;

      // Step 1: Validate input fields
      if ((!activityId, !content, !userCode)) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Optional: Validate latitude and longitude
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      if (isNaN(latitude) || isNaN(longitude)) {
        return res
          .status(400)
          .json({ message: "Invalid latitude or longitude" });
      }

      // Step 4: Create new user
      const newActivity = await prisma.detailAct.create({
        data: {
          activityId: Number(activityId),
          userCode: userCode,
          content,
          lat: latitude,
          lng: longitude,
          actimg: req.file ? `${req.file.filename}` : null, // Path to the uploaded image
        },
      });

      res.status(201).json({
        message: "User created successfully!",
        data: newActivity,
      });
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).send("Server Error");
    }
  });
};

exports.list = async (req, res) => {
  try {
    const detailacts = await prisma.detailAct.findMany({
      where: {
        userCode: req.user.code,
      },
      orderBy: {
        id: "desc", // Change this to the field you want to sort by
      },
      include: {
        activity: true,
        user: {
          select: {
            code: true,
            firstname: true,
            lastname: true,
            actived: true,
            gender: true,
            tel: true,
          },
        },
      },
    });

    // Format dates
    const formatted = detailacts.map((detailact) => ({
      ...detailact,
      createdAt: moment(detailact.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(detailact.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
    }));

    res.json(formatted);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { detailactId } = req.params;

    const detailact = await prisma.detailAct.findUnique({
      where: {
        id: Number(detailactId),
      },
      include: {
        activity: true,
        user: {
          select: {
            code: true,
            firstname: true,
            lastname: true,
            actived: true,
            gender: true,
            tel: true,
          },
        },
      },
    });

    if (!detailact) {
      return res.status(404).json({ message: "detailact not found" });
    }

    // Format dates
    const formatted = {
      ...detailact,
      createdAt: moment(detailact.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(detailact.updatedAt)
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
      const { detailactId } = req.params;
      const { userCode, content, lat, lng } = req.body;

      // Step 1: Find the user to update
      const detailact = await prisma.detailAct.findUnique({
        where: {
          id: Number(detailactId),
        },
      });

      if (!detailact) {
        return res.status(404).json({ message: "detailact not found" });
      }

      // Step 2: If a new photo is uploaded and an old photo exists, delete the old photo
      let actimgPath = detailact.actimg; // Keep old photo path
      if (req.file) {
        // Only attempt to delete if there is an existing photo path
        if (detailact.actimg) {
          const oldActimgPath = path.join(
            __dirname,
            "../uploads/activity",
            path.basename(detailact.actimg)
          );
          fs.unlink(oldActimgPath, (err) => {
            if (err) {
              console.error("Error deleting old image: ", err);
            }
          });
        }

        // Set the new photo path
        actimgPath = `${req.file.filename}`;
      }

      // Step 3: Update the user record
      const updated = await prisma.detailAct.update({
        where: {
          id: Number(detailactId),
        },
        data: {
          userCode,
          content,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          actimg: actimgPath,
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
    const { detailactId } = req.params;

    // Step 1: Find the user by ID
    const detailact = await prisma.detailAct.findUnique({
      where: {
        id: Number(detailactId),
      },
    });

    if (!detailact) {
      return res.status(404).json({ message: "detailact not found" });
    }

    // Step 2: Delete the photo file if it exists
    if (detailact.actimg) {
      const actimgPath = path.join(
        __dirname,
        "../uploads/activity",
        detailact.actimg
      );
      fs.unlink(actimgPath, (err) => {
        if (err) {
          console.error("Error deleting userimg file: ", err);
          return res
            .status(500)
            .json({ message: "Error deleting userimg file" });
        }
      });
    }

    // Step 3: Delete the user from the database
    const removed = await prisma.detailAct.delete({
      where: {
        id: Number(detailactId),
      },
    });

    res.status(200).json({ message: "User and userimg deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.checkact = async (req, res) => {
  try {
    const { activityId, userCode } = req.query;

    // Validate the query parameters
    if (!activityId || !userCode) {
      return res.status(400).json({
        success: false,
        message: "Missing activityId or userCode",
      });
    }

    // Query the database
    const existingRecord = await prisma.detailAct.findFirst({
      where: {
        activityId: Number(activityId),
        userCode: userCode,
      },
    });

    if (existingRecord) {
      return res.status(200).json({
        // exists: true,
        message: "ມີ​ຂໍ້​ມູນ​ແລ້ວ",
      });
    }
  } catch (error) {
    console.error("Error checking for duplicate record:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
