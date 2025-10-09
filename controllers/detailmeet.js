const fs = require("fs");
const prisma = require("../prisma/prisma");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const moment = require("moment-timezone");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, "./uploads/activity");
    cb(null, path.join(process.env.UPLOAD_BASE_PATH, "meeting"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Appending file extension
  },
});

const upload = multer({ storage: storage }).single("meetimg");

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
      const { meetingId, userCode, content } = req.body;

      // Step 1: Validate input fields
      if ((!meetingId, !content, !userCode)) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Step 4: Create new user
      const newMeeting = await prisma.detailMeet.create({
        data: {
          meetingId: Number(meetingId),
          userCode: userCode,
          content,
          meetimg: req.file ? `${req.file.filename}` : null, // Path to the uploaded image
        },
      });

      res.status(201).json({
        message: "meeting created successfully!",
        data: newMeeting,
      });
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).send("Server Error");
    }
  });
};

exports.list = async (req, res) => {
  try {
    const detailmeets = await prisma.detailMeet.findMany({
      where: {
        userCode: req.user.code,
      },
      orderBy: {
        id: "desc", // Change this to the field you want to sort by
      },
      include: {
        meeting: true,
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
    const formatted = detailmeets.map((detailmeet) => ({
      ...detailmeet,
      createdAt: moment(detailmeet.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(detailmeet.updatedAt)
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
    const { detailmeetId } = req.params;

    const detailmeet = await prisma.detailMeet.findUnique({
      where: {
        id: Number(detailmeetId),
      },
      include: {
        meeting: true,
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

    if (!detailmeet) {
      return res.status(404).json({ message: "detailmeet not found" });
    }

    // Format dates
    const formatted = {
      ...detailmeet,
      createdAt: moment(detailmeet.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(detailmeet.updatedAt)
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
      const { detailmeetId } = req.params;
      const { userCode, content } = req.body;

      // Step 1: Find the user to update
      const detailmeet = await prisma.detailMeet.findUnique({
        where: {
          id: Number(detailmeetId),
        },
      });

      if (!detailmeet) {
        return res.status(404).json({ message: "detailmeet not found" });
      }

      // Step 2: If a new photo is uploaded and an old photo exists, delete the old photo
      let meetimgPath = detailmeet.meetimg; // Keep old photo path
      if (req.file) {
        // Only attempt to delete if there is an existing photo path
        if (detailmeet.meetimg) {
          const oldMeetimgPath = path.join(
            process.env.UPLOAD_BASE_PATH,
            "meeting",
            path.basename(detailmeet.meetimg)
          );
          fs.unlink(oldMeetimgPath, (err) => {
            if (err) {
              console.error("Error deleting old image: ", err);
            }
          });
        }

        // Set the new photo path
        meetimgPath = `${req.file.filename}`;
      }

      // Step 3: Update the user record
      const updated = await prisma.detailMeet.update({
        where: {
          id: Number(detailmeetId),
        },
        data: {
          userCode,
          content,
          meetimg: meetimgPath,
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
    const { detailmeetId } = req.params;

    // Step 1: Find the user by ID
    const detailmeet = await prisma.detailMeet.findUnique({
      where: {
        id: Number(detailmeetId),
      },
    });

    if (!detailmeet) {
      return res.status(404).json({ message: "detailmeet not found" });
    }

    // Step 2: Delete the photo file if it exists
    if (detailmeet.meetimg) {
      const meetimgPath = path.join(
        process.env.UPLOAD_BASE_PATH,
        "meeting",
        detailmeet.meetimg
      );
      fs.unlink(meetimgPath, (err) => {
        if (err) {
          console.error("Error deleting userimg file: ", err);
          return res
            .status(500)
            .json({ message: "Error deleting userimg file" });
        }
      });
    }

    // Step 3: Delete the user from the database
    const removed = await prisma.detailMeet.delete({
      where: {
        id: Number(detailmeetId),
      },
    });

    res
      .status(200)
      .json({ message: "Meeting and meetimg deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.checkmeet = async (req, res) => {
  try {
    const { meetingId, userCode } = req.query;

    // Validate the query parameters
    if (!meetingId || !userCode) {
      return res.status(400).json({
        success: false,
        message: "Missing meetingId or userCode",
      });
    }

    // Query the database
    const existingRecord = await prisma.detailMeet.findFirst({
      where: {
        meetingId: Number(meetingId),
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

exports.listapproved = async (req, res) => {
  const { meetingId, approved } = req.query;
  try {
    const detailmeets = await prisma.detailMeet.findMany({
      where: {
        meetingId: meetingId ? Number(meetingId) : undefined,
        approved: Number(approved),
      },
      orderBy: {
        id: "asc", // Change this to the field you want to sort by
      },
      include: {
        meeting: true,
        user: {
          select: {
            code: true,
            firstname: true,
            lastname: true,
            actived: true,
            gender: true,
            tel: true,
            unit: true,
          },
        },
        userAction: {
          select: {
            code: true,
            firstname: true,
            lastname: true,
            gender: true,
          },
        },
      },
    });

    // Format dates
    const formatted = detailmeets.map((detailmeet) => ({
      ...detailmeet,
      createdAt: moment(detailmeet.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(detailmeet.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
    }));

    res.json(formatted);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.actionapproved = async (req, res) => {
  try {
    const { detailmeetId } = req.params;
    const { approved } = req.body;

    // Step 1: Find the user to update
    const detailmeet = await prisma.detailMeet.findUnique({
      where: {
        id: Number(detailmeetId),
      },
    });

    if (!detailmeet) {
      return res.status(404).json({ message: "detailmeet not found" });
    }

    const updated = await prisma.detailMeet.update({
      where: {
        id: Number(detailmeetId),
      },
      data: {
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
