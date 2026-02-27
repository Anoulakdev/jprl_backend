const prisma = require("../prisma/prisma");

exports.create = async (req, res) => {
  try {
    const { name, code } = req.body;

    // Validate input fields
    if (!name) {
      return res.status(400).json({ message: "Invalid input fields" });
    }

    // Create new user in the database
    const pStatus = await prisma.productStatus.create({
      data: {
        name,
        code,
      },
    });

    res.json({
      message: "productStatus created successfully!",
      data: pStatus,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const pStatuss = await prisma.productStatus.findMany({
      orderBy: {
        id: "asc",
      },
    });

    res.json(pStatuss);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { pStatusId } = req.params;

    const productStatus = await prisma.productStatus.findUnique({
      where: {
        id: Number(pStatusId),
      },
    });

    if (!productStatus) {
      return res.status(404).json({ message: "productStatus not found" });
    }

    res.json(productStatus);
  } catch (err) {
    // err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { pStatusId } = req.params;
    const { name, code } = req.body;

    const updated = await prisma.productStatus.update({
      where: {
        id: Number(pStatusId),
      },
      data: {
        name: name,
        code: code,
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
    const { pStatusId } = req.params;

    const removed = await prisma.productStatus.delete({
      where: {
        id: Number(pStatusId),
      },
    });

    res.status(200).json({ message: "productStatus deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
