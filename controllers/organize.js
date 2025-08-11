const fs = require("fs");
const prisma = require("../prisma/prisma");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const moment = require("moment-timezone");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, "./uploads/organize");
    cb(null, path.join(process.env.UPLOAD_BASE_PATH, "organize"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Appending file extension
  },
});

const upload = multer({ storage: storage }).single("organizeimg");

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
      const { unitId } = req.body;

      if (unitId) {
        const existing = await prisma.organize.findFirst({
          where: {
            unitId: Number(unitId),
          },
        });

        if (existing) {
          // ลบไฟล์ที่อัปโหลดออก (ถ้ามี) เพราะไม่ต้องการเก็บไว้
          if (req.file) {
            const filePath = path.join(
              process.env.UPLOAD_BASE_PATH,
              "organize",
              req.file.filename
            );
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error("Error removing uploaded file:", unlinkErr);
              }
            });
          }

          return res.status(400).json({
            message: "UnitId ມີ​ຢູ່",
          });
        }
      }

      // Step 4: Create new user
      const organizes = await prisma.organize.create({
        data: {
          unitId: unitId ? Number(unitId) : null,
          organizeimg: req.file ? `${req.file.filename}` : null,
        },
      });

      res.status(201).json({
        message: "Organize created successfully!",
        data: organizes,
      });
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).send("Server Error");
    }
  });
};

exports.list = async (req, res) => {
  try {
    const { unitId } = req.query;

    let filter = {};

    if (unitId) {
      filter = {
        where: { unitId: Number(unitId) },
      };
    }

    const organizes = await prisma.organize.findMany({
      orderBy: {
        unitId: "asc",
      },
      ...filter,
      include: {
        unit: true,
      },
    });

    res.json(organizes);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { organizeId } = req.params;

    const organize = await prisma.organize.findUnique({
      where: {
        id: Number(organizeId),
      },
    });

    if (!organize) {
      return res.status(404).json({ message: "organizes not found" });
    }

    res.json(organize);
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
      const { organizeId } = req.params;
      const { unitId } = req.body;

      // Step 1: Find the user to update
      const organizes = await prisma.organize.findUnique({
        where: {
          id: Number(organizeId),
        },
      });

      if (!organizes) {
        return res.status(404).json({ message: "organizes not found" });
      }

      // Step 2: If a new photo is uploaded and an old photo exists, delete the old photo
      let organizeimgPath = organizes.organizeimg; // Keep old photo path
      if (req.file) {
        // Only attempt to delete if there is an existing photo path
        if (organizes.organizeimg) {
          const oldOrganizeImgPath = path.join(
            process.env.UPLOAD_BASE_PATH,
            "organize",
            path.basename(organizes.organizeimg)
          );
          fs.unlink(oldOrganizeImgPath, (err) => {
            if (err) {
              console.error("Error deleting old file: ", err);
            }
          });
        }

        // Set the new photo path
        organizeimgPath = `${req.file.filename}`;
      }

      // Step 3: Update the user record
      const updated = await prisma.organize.update({
        where: {
          id: Number(organizeId),
        },
        data: {
          unitId: Number(unitId),
          organizeimg: organizeimgPath,
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
    const { organizeId } = req.params;

    // Step 1: Find the user by ID
    const organizes = await prisma.organize.findUnique({
      where: {
        id: Number(organizeId),
      },
    });

    if (!organizes) {
      return res.status(404).json({ message: "organizes not found" });
    }

    // Step 2: Delete the photo file if it exists
    if (organizes.organizeimg) {
      const organizeImgPath = path.join(
        process.env.UPLOAD_BASE_PATH,
        "organize",
        organizes.organizeimg
      );
      fs.unlink(organizeImgPath, (err) => {
        if (err) {
          console.error("Error deleting userimg file: ", err);
          return res
            .status(500)
            .json({ message: "Error deleting userimg file" });
        }
      });
    }

    // Step 3: Delete the user from the database
    const removed = await prisma.organize.delete({
      where: {
        id: Number(organizeId),
      },
    });

    res.status(200).json({ message: "organize and img deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
