const prisma = require("../prisma/prisma");

exports.create = async (req, res) => {
  try {
    const { unitId, code, name } = req.body;

    // Validate input fields
    if (!name) {
      return res.status(400).json({ message: "Invalid input fields" });
    }

    const checkChu = await prisma.chu.findFirst({
      where: { code: code },
    });
    if (checkChu) {
      return res.status(409).json({ message: "chu already exists" });
    }

    // Create new user in the database
    const newChu = await prisma.chu.create({
      data: {
        unitId: Number(unitId),
        code,
        name,
      },
    });

    res.json({
      message: "chu created successfully!",
      data: newChu,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const chu = await prisma.chu.findMany({
      orderBy: {
        unit: {
          no: "asc",
        },
      },
      include: {
        unit: true,
      },
    });

    res.json(chu);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.schu = async (req, res) => {
  try {
    const { unitId } = req.query;

    let filter = {};

    if (unitId) {
      filter = {
        where: { unitId: Number(unitId) },
      };
    }

    const chu = await prisma.chu.findMany({
      orderBy: {
        id: "asc",
      },
      ...filter,
      include: {
        unit: true,
      },
    });

    res.json(chu);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { chuId } = req.params;

    const chu = await prisma.chu.findUnique({
      where: {
        id: Number(chuId),
      },
    });

    if (!chu) {
      return res.status(404).json({ message: "chu not found" });
    }

    res.json(chu);
  } catch (err) {
    // err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { chuId } = req.params;
    const { unitId, code, name } = req.body;

    const updated = await prisma.chu.update({
      where: {
        id: Number(chuId),
      },
      data: {
        unitId: Number(unitId),
        code: code,
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
    const { chuId } = req.params;

    const removed = await prisma.chu.delete({
      where: {
        id: Number(chuId),
      },
    });

    res.status(200).json({ message: "chu deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.chucount = async (req, res) => {
  try {
    const chucount = await prisma.chu.count();

    res.json({ chucount });
  } catch (err) {
    console.error("Error fetching chu count:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
