const prisma = require("../prisma/prisma");
const moment = require("moment-timezone");

exports.create = async (req, res) => {
  try {
    const { name, dateactive } = req.body;

    // Validate input fields
    if ((!name, !dateactive)) {
      return res.status(400).json({ message: "Invalid input fields" });
    }

    // Create new user in the database
    const newActivity = await prisma.activity.create({
      data: {
        name,
        dateactive: new Date(dateactive),
      },
    });

    res.json({
      message: "activity created successfully!",
      data: newActivity,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: {
        dateactive: "desc",
      },
      include: {
        detailacts: true,
      },
    });

    // Format dates
    const formattedActivities = activities.map((activity) => ({
      ...activity,
      createdAt: moment(activity.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(activity.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
    }));

    res.json(formattedActivities);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.sactivity = async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: {
        dateactive: "desc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Format dates
    const formattedActivities = activities.map((activity) => ({
      ...activity,
      createdAt: moment(activity.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(activity.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
    }));

    res.json(formattedActivities);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { activityId } = req.params;

    const activity = await prisma.activity.findUnique({
      where: {
        id: Number(activityId),
      },
      include: {
        detailacts: {
          include: {
            user: {
              select: {
                gender: true,
                firstname: true,
                lastname: true,
              },
            },
          },
        },
      },
    });

    if (!activity) {
      return res.status(404).json({ message: "activity not found" });
    }

    // Format dates
    const formattedActivities = {
      ...activity,
      // dateactive: moment(activity.dateactive)
      //   .tz("Asia/Vientiane")
      //   .format("YYYY-MM-DD"),
      createdAt: moment(activity.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(activity.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
    };

    res.json(formattedActivities);
  } catch (err) {
    // err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { name, dateactive } = req.body;

    const updated = await prisma.activity.update({
      where: {
        id: Number(activityId),
      },
      data: {
        name: name,
        dateactive: new Date(dateactive),
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
    const { activityId } = req.params;

    const removed = await prisma.activity.delete({
      where: {
        id: Number(activityId),
      },
    });

    res.status(200).json({ message: "activity deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.actcount = async (req, res) => {
  try {
    const actcount = await prisma.activity.count();

    res.json({ actcount });
  } catch (err) {
    console.error("Error fetching activity count:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
