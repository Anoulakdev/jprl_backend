const fs = require("fs");
const prisma = require("../prisma/prisma");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const moment = require("moment-timezone");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, "./uploads/notice");
    cb(null, path.join(process.env.UPLOAD_BASE_PATH, "bank"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Appending file extension
  },
});

const upload = multer({ storage: storage }).single("bankqr");

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
      const { banklogoId, accountNo, accountName } = req.body;

      // Step 1: Validate input fields
      if (!banklogoId) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
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

      if (!shop.shop) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ message: "Shop not found for user" });
      }

      const checkBank = await prisma.bank.findFirst({
        where: { shopId: shop.shop.id, banklogoId: Number(banklogoId) },
      });
      if (checkBank) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(409).json({ message: "qr already exists" });
      }

      // Step 4: Create new user
      const banks = await prisma.bank.create({
        data: {
          shopId: shop.shop.id,
          banklogoId: Number(banklogoId),
          accountNo,
          accountName,
          bankqr: req.file ? `${req.file.filename}` : null,
        },
      });

      res.status(201).json({
        message: "bank created successfully!",
        data: banks,
      });
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).send("Server Error");
    }
  });
};

exports.list = async (req, res) => {
  try {
    const banks = await prisma.bank.findMany({
      where: {
        shop: {
          user: {
            code: req.user.code,
          },
        },
      },
      include: {
        banklogo: true,
      },
    });

    res.json(banks);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.bankOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: {
        id: Number(orderId),
      },
      select: {
        shopId: true,
      },
    });

    const banks = await prisma.bank.findMany({
      where: {
        shopId: order.shopId,
      },
      include: {
        banklogo: true,
      },
    });

    res.json(banks);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { bankId } = req.params;

    const bank = await prisma.bank.findUnique({
      where: {
        id: Number(bankId),
      },
      include: {
        banklogo: true,
      },
    });

    if (!bank) {
      return res.status(404).json({ message: "banks not found" });
    }

    res.json(bank);
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
      const { bankId } = req.params;
      const { banklogoId, accountNo, accountName } = req.body;

      // Step 1: Find the user to update
      const banks = await prisma.bank.findUnique({
        where: {
          id: Number(bankId),
        },
      });

      if (!banks) {
        return res.status(404).json({ message: "banks not found" });
      }

      // Step 2: If a new photo is uploaded and an old photo exists, delete the old photo
      let bankfilePath = banks.bankqr; // Keep old photo path
      if (req.file) {
        // Only attempt to delete if there is an existing photo path
        if (banks.bankqr) {
          const oldBankFilePath = path.join(
            process.env.UPLOAD_BASE_PATH,
            "bank",
            path.basename(banks.bankqr),
          );
          fs.unlink(oldBankFilePath, (err) => {
            if (err) {
              console.error("Error deleting old file: ", err);
            }
          });
        }

        // Set the new photo path
        bankfilePath = `${req.file.filename}`;
      }

      // Step 3: Update the user record
      const updated = await prisma.bank.update({
        where: {
          id: Number(bankId),
        },
        data: {
          banklogoId: Number(banklogoId),
          accountNo,
          accountName,
          bankqr: bankfilePath,
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
    const { bankId } = req.params;

    // Step 1: Find the user by ID
    const banks = await prisma.bank.findUnique({
      where: {
        id: Number(bankId),
      },
    });

    if (!banks) {
      return res.status(404).json({ message: "banks not found" });
    }

    // Step 2: Delete the photo file if it exists
    if (banks.bankqr) {
      const bankfilePath = path.join(
        process.env.UPLOAD_BASE_PATH,
        "bank",
        banks.bankqr,
      );
      fs.unlink(bankfilePath, (err) => {
        if (err) {
          console.error("Error deleting userimg file: ", err);
          return res
            .status(500)
            .json({ message: "Error deleting userimg file" });
        }
      });
    }

    // Step 3: Delete the user from the database
    const removed = await prisma.bank.delete({
      where: {
        id: Number(bankId),
      },
    });

    res.status(200).json({ message: "bank and bankqr deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
