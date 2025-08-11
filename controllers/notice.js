const fs = require("fs");
const prisma = require("../prisma/prisma");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const moment = require("moment-timezone");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, "./uploads/notice");
    cb(null, path.join(process.env.UPLOAD_BASE_PATH, "notice"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Appending file extension
  },
});

const upload = multer({ storage: storage }).single("noticefile");

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
      const { title, date } = req.body;

      // Step 1: Validate input fields
      if ((!title, !date)) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Step 4: Create new user
      const notices = await prisma.notice.create({
        data: {
          title: title,
          date: new Date(date),
          noticefile: req.file ? `${req.file.filename}` : null,
        },
      });

      res.status(201).json({
        message: "User created successfully!",
        data: notices,
      });
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).send("Server Error");
    }
  });
};

exports.list = async (req, res) => {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: {
        id: "desc",
      },
    });

    // Format dates
    const formatted = notices.map((notice) => ({
      ...notice,
      createdAt: moment(notice.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(notice.updatedAt)
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
    const { noticeId } = req.params;

    const notice = await prisma.notice.findUnique({
      where: {
        id: Number(noticeId),
      },
    });

    if (!notice) {
      return res.status(404).json({ message: "notices not found" });
    }

    // Format dates
    const formatted = {
      ...notice,
      createdAt: moment(notice.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(notice.updatedAt)
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
      const { noticeId } = req.params;
      const { title, date } = req.body;

      // Step 1: Find the user to update
      const notices = await prisma.notice.findUnique({
        where: {
          id: Number(noticeId),
        },
      });

      if (!notices) {
        return res.status(404).json({ message: "notices not found" });
      }

      // Step 2: If a new photo is uploaded and an old photo exists, delete the old photo
      let noticefilePath = notices.noticefile; // Keep old photo path
      if (req.file) {
        // Only attempt to delete if there is an existing photo path
        if (notices.noticefile) {
          const oldNoticeFilePath = path.join(
            process.env.UPLOAD_BASE_PATH,
            "notice",
            path.basename(notices.noticefile)
          );
          fs.unlink(oldNoticeFilePath, (err) => {
            if (err) {
              console.error("Error deleting old file: ", err);
            }
          });
        }

        // Set the new photo path
        noticefilePath = `${req.file.filename}`;
      }

      // Step 3: Update the user record
      const updated = await prisma.notice.update({
        where: {
          id: Number(noticeId),
        },
        data: {
          title,
          date: new Date(date),
          noticefile: noticefilePath,
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
    const { noticeId } = req.params;

    // Step 1: Find the user by ID
    const notices = await prisma.notice.findUnique({
      where: {
        id: Number(noticeId),
      },
    });

    if (!notices) {
      return res.status(404).json({ message: "notices not found" });
    }

    // Step 2: Delete the photo file if it exists
    if (notices.noticefile) {
      const noticefilePath = path.join(
        process.env.UPLOAD_BASE_PATH,
        "notice",
        notices.noticefile
      );
      fs.unlink(noticefilePath, (err) => {
        if (err) {
          console.error("Error deleting userimg file: ", err);
          return res
            .status(500)
            .json({ message: "Error deleting userimg file" });
        }
      });
    }

    // Step 3: Delete the user from the database
    const removed = await prisma.notice.delete({
      where: {
        id: Number(noticeId),
      },
    });

    res.status(200).json({ message: "notice and file deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
