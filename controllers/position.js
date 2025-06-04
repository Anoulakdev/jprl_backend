const prisma = require("../prisma/prisma");

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate input fields
    if (!name) {
      return res.status(400).json({ message: "Invalid input fields" });
    }

    // Create new user in the database
    const newPosition = await prisma.position.create({
      data: {
        name,
        description,
      },
    });

    res.json({
      message: "Position created successfully!",
      data: newPosition,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const position = await prisma.position.findMany({
      orderBy: {
        id: "asc",
      },
    });

    res.json(position);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.sposition = async (req, res) => {
  try {
    const position = await prisma.position.findMany({
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    res.json(position);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { positionId } = req.params;

    const position = await prisma.position.findUnique({
      where: {
        id: Number(positionId),
      },
    });

    if (!position) {
      return res.status(404).json({ message: "position not found" });
    }

    res.json(position);
  } catch (err) {
    // err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { positionId } = req.params;
    const { name, description } = req.body;

    const updated = await prisma.position.update({
      where: {
        id: Number(positionId),
      },
      data: {
        name: name,
        description: description,
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
    const { positionId } = req.params;

    const removed = await prisma.position.delete({
      where: {
        id: Number(positionId),
      },
    });

    res.status(200).json({ message: "Position deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
