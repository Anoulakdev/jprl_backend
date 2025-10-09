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
    const newMeeting = await prisma.meeting.create({
      data: {
        name,
        dateactive: new Date(dateactive),
      },
    });

    res.json({
      message: "meeting created successfully!",
      data: newMeeting,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
      orderBy: {
        dateactive: "desc",
      },
      include: {
        detailmeets: true,
      },
    });

    // Format dates
    const formattedMeetings = meetings.map((meeting) => ({
      ...meeting,
      createdAt: moment(meeting.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(meeting.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
    }));

    res.json(formattedMeetings);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.smeeting = async (req, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
      orderBy: {
        dateactive: "desc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Format dates
    const formattedMeetings = meetings.map((meeting) => ({
      ...meeting,
      createdAt: moment(meeting.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(meeting.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
    }));

    res.json(formattedMeetings);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: {
        id: Number(meetingId),
      },
      include: {
        detailmeets: {
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

    if (!meeting) {
      return res.status(404).json({ message: "meeting not found" });
    }

    // Format dates
    const formattedMeetings = {
      ...meeting,
      // dateactive: moment(meeting.dateactive)
      //   .tz("Asia/Vientiane")
      //   .format("YYYY-MM-DD"),
      createdAt: moment(meeting.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(meeting.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
    };

    res.json(formattedMeetings);
  } catch (err) {
    // err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { name, dateactive } = req.body;

    const updated = await prisma.meeting.update({
      where: {
        id: Number(meetingId),
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
    const { meetingId } = req.params;

    const removed = await prisma.meeting.delete({
      where: {
        id: Number(meetingId),
      },
    });

    res.status(200).json({ message: "meeting deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.meetcount = async (req, res) => {
  try {
    const meetcount = await prisma.meeting.count();

    res.json({ meetcount });
  } catch (err) {
    console.error("Error fetching meeting count:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
