const prisma = require("../prisma/prisma");

exports.create = async (req, res) => {
  try {
    const { name, code } = req.body;

    // Validate input fields
    if (!name) {
      return res.status(400).json({ message: "Invalid input fields" });
    }

    // Create new user in the database
    const pUnit = await prisma.productUnit.create({
      data: {
        name,
        code,
      },
    });

    res.json({
      message: "productUnit created successfully!",
      data: pUnit,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const pUnits = await prisma.productUnit.findMany({
      orderBy: {
        id: "asc",
      },
    });

    res.json(pUnits);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { pUnitId } = req.params;

    const productUnit = await prisma.productUnit.findUnique({
      where: {
        id: Number(pUnitId),
      },
    });

    if (!productUnit) {
      return res.status(404).json({ message: "productUnit not found" });
    }

    res.json(productUnit);
  } catch (err) {
    // err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { pUnitId } = req.params;
    const { name, code } = req.body;

    const updated = await prisma.productUnit.update({
      where: {
        id: Number(pUnitId),
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
    const { pUnitId } = req.params;

    const removed = await prisma.productUnit.delete({
      where: {
        id: Number(pUnitId),
      },
    });

    res.status(200).json({ message: "productUnit deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
