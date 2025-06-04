const prisma = require("../prisma/prisma");

exports.create = async (req, res) => {
  try {
    const { no, name } = req.body;

    // Validate input fields
    if ((!no, !name)) {
      return res.status(400).json({ message: "Invalid input fields" });
    }

    // Create new user in the database
    const newUnit = await prisma.unit.create({
      data: {
        no: Number(no),
        name,
      },
    });

    res.json({
      message: "unit created successfully!",
      data: newUnit,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const unit = await prisma.unit.findMany({
      orderBy: {
        id: "asc",
      },
    });

    res.json(unit);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.sunit = async (req, res) => {
  try {
    const unit = await prisma.unit.findMany({
      orderBy: {
        no: "asc",
      },
    });

    res.json(unit);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { unitId } = req.params;

    const unit = await prisma.unit.findUnique({
      where: {
        id: Number(unitId),
      },
    });

    if (!unit) {
      return res.status(404).json({ message: "unit not found" });
    }

    res.json(unit);
  } catch (err) {
    // err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { unitId } = req.params;
    const { no, name } = req.body;

    const updated = await prisma.unit.update({
      where: {
        id: Number(unitId),
      },
      data: {
        no: Number(no),
        name: name,
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
    const { unitId } = req.params;

    const removed = await prisma.unit.delete({
      where: {
        id: Number(unitId),
      },
    });

    res.status(200).json({ message: "unit deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.unitcount = async (req, res) => {
  try {
    const unitcount = await prisma.unit.count();

    res.json({ unitcount });
  } catch (err) {
    console.error("Error fetching unit count:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
