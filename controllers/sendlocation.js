const prisma = require("../prisma/prisma");

exports.create = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate input fields
    if (!name) {
      return res.status(400).json({ message: "Invalid input fields" });
    }

    // Create new user in the database
    const sLocation = await prisma.sendLocation.create({
      data: {
        name,
      },
    });

    res.json({
      message: "sendLocation created successfully!",
      data: sLocation,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const sLocation = await prisma.sendLocation.findMany({
      orderBy: {
        id: "asc",
      },
    });

    res.json(sLocation);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { sLocationId } = req.params;

    const sendLocation = await prisma.sendLocation.findUnique({
      where: {
        id: Number(sLocationId),
      },
    });

    if (!sendLocation) {
      return res.status(404).json({ message: "sendLocation not found" });
    }

    res.json(sendLocation);
  } catch (err) {
    // err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { sLocationId } = req.params;
    const { name } = req.body;

    const updated = await prisma.sendLocation.update({
      where: {
        id: Number(sLocationId),
      },
      data: {
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
    const { sLocationId } = req.params;

    const removed = await prisma.sendLocation.delete({
      where: {
        id: Number(sLocationId),
      },
    });

    res.status(200).json({ message: "sendLocation deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
