const prisma = require("../prisma/prisma");
const moment = require("moment-timezone");

exports.yearuseract = async (req, res) => {
  try {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({ message: "Year parameter is required" });
    }

    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    const detailacts = await prisma.detailAct.findMany({
      where: {
        approved: 2,
        userCode: req.user.code,
        createdAt: {
          gte: startOfYear, // Greater than or equal to start of the year
          lte: endOfYear, // Less than or equal to end of the year
        },
      },
      include: {
        activity: true,
      },
    });

    // Format dates for each activity
    const formattedActivities = detailacts.map((activity) => ({
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

exports.selectactuser = async (req, res) => {
  try {
    const { activity } = req.query;

    if (!activity) {
      return res.status(400).json({ message: "Year parameter is required" });
    }

    const activities = await prisma.activity.findMany({
      where: {
        id: Number(activity),
      },
      include: {
        detailacts: {
          where: {
            approved: 2,
          },
          include: {
            user: {
              select: {
                code: true,
                firstname: true,
                lastname: true,
                gender: true,
                tel: true,
                unitId: true,
                unit: true,
                chu: true,
              },
            },
          },
        },
      },
    });

    // Format dates for each activity
    const formattedActivities = activities.map((activity) => ({
      ...activity,
      createdAt: moment(activity.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(activity.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      detailacts: activity.detailacts.map((detailact) => ({
        ...detailact,
        createdAt: moment(detailact.createdAt)
          .tz("Asia/Vientiane")
          .format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment(detailact.updatedAt)
          .tz("Asia/Vientiane")
          .format("YYYY-MM-DD HH:mm:ss"),
      })),
    }));

    res.json(formattedActivities);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.selectactimg = async (req, res) => {
  try {
    const { activity } = req.query;

    if (!activity) {
      return res.status(400).json({ message: "Year parameter is required" });
    }

    const activities = await prisma.activity.findMany({
      where: {
        id: Number(activity), // ใช้ค่าของ query parameter
      },
      include: {
        detailacts: {
          where: {
            approved: 2,
          },
          select: {
            actimg: true,
          },
        },
      },
    });

    // Format dates for each activity
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

exports.selectyearuser = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({ message: "Year parameter is required" });
    }

    // กำหนดช่วงเวลาของปี
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    // Query เพื่อนับจำนวนกิจกรรมโดยจัดกลุ่มตาม userCode
    const groupedActivities = await prisma.detailAct.groupBy({
      by: ["userCode"], // จัดกลุ่มตาม userCode
      where: {
        approved: 2, // เฉพาะกิจกรรมที่อนุมัติแล้ว
        createdAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      _count: {
        id: true, // นับจำนวน id
      },
      orderBy: {
        _count: {
          id: "desc", // เรียงลำดับจากมากไปน้อย
        },
      },
    });

    // ดึง userCode ทั้งหมดจากผลลัพธ์
    const userCodes = groupedActivities.map((group) => group.userCode);

    // ค้นหาข้อมูลผู้ใช้จากตาราง `User`
    const users = await prisma.user.findMany({
      where: {
        code: { in: userCodes }, // ใช้ `code` แทน `id`
      },
      select: {
        code: true, // ใช้ code แทน userCode
        firstname: true,
        lastname: true,
        gender: true,
        unit: true,
        chu: true,
      },
    });

    // รวมข้อมูล user + count
    const formattedResult = groupedActivities.map((group) => {
      const user = users.find((u) => u.code === group.userCode);
      return {
        code: user.code,
        firstname: user ? user.firstname : null,
        lastname: user ? user.lastname : null,
        gender: user ? user.gender : null,
        unit: user ? user.unit : null,
        chu: user ? user.chu : null,
        count: group._count.id,
      };
    });

    res.json(formattedResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.selectdaterange = async (req, res) => {
  try {
    const { datestart, dateend } = req.query;
    if (!datestart) {
      return res.status(400).json({ message: "datestart is required" });
    }
    if (!dateend) {
      return res.status(400).json({ message: "dateend is required" });
    }

    const startOfDate = new Date(`${datestart}T00:00:00+07:00`);
    const endOfDate = new Date(`${dateend}T23:59:59+07:00`);

    // Query เพื่อนับจำนวนกิจกรรมโดยจัดกลุ่มตาม userCode
    const groupedActivities = await prisma.detailAct.groupBy({
      by: ["userCode"], // จัดกลุ่มตาม userCode
      where: {
        approved: 2, // เฉพาะกิจกรรมที่อนุมัติแล้ว
        createdAt: {
          gte: new Date(startOfDate.toISOString()),
          lte: new Date(endOfDate.toISOString()),
        },
      },
      _count: {
        id: true, // นับจำนวน id
      },
      orderBy: {
        _count: {
          id: "desc", // เรียงลำดับจากมากไปน้อย
        },
      },
    });

    // ดึง userCode ทั้งหมดจากผลลัพธ์
    const userCodes = groupedActivities.map((group) => group.userCode);

    // ค้นหาข้อมูลผู้ใช้จากตาราง `User`
    const users = await prisma.user.findMany({
      where: {
        code: { in: userCodes }, // ใช้ `code` แทน `id`
      },
      select: {
        code: true, // ใช้ code แทน userCode
        firstname: true,
        lastname: true,
        gender: true,
        unit: true,
        chu: true,
      },
    });

    // รวมข้อมูล user + count
    const formattedResult = groupedActivities.map((group) => {
      const user = users.find((u) => u.code === group.userCode);
      return {
        code: user.code,
        firstname: user ? user.firstname : null,
        lastname: user ? user.lastname : null,
        gender: user ? user.gender : null,
        unit: user ? user.unit : null,
        chu: user ? user.chu : null,
        count: group._count.id,
      };
    });

    res.json(formattedResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.useractall = async (req, res) => {
  try {
    const { datestart, dateend, userCode } = req.query;

    if (!datestart) {
      return res.status(400).json({ message: "datestart is required" });
    }
    if (!dateend) {
      return res.status(400).json({ message: "dateend is required" });
    }

    if (!userCode) {
      return res.status(400).json({ message: "userCode is required" });
    }

    const startOfDate = new Date(`${datestart}T00:00:00+07:00`);
    const endOfDate = new Date(`${dateend}T23:59:59+07:00`);

    const detailacts = await prisma.detailAct.findMany({
      where: {
        approved: 2,
        userCode: userCode,
        createdAt: {
          gte: new Date(startOfDate.toISOString()),
          lte: new Date(endOfDate.toISOString()),
        },
      },
      include: {
        activity: true,
      },
    });

    // Format dates for each activity
    const formattedActivities = detailacts.map((activity) => ({
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

exports.userall = async (req, res) => {
  try {
    const { unitId, chuId } = req.query;

    const where = {
      roleId: 3,
      actived: "A",
    };

    if (unitId) {
      where.unitId = Number(unitId);
    }
    if (chuId) {
      where.chuId = Number(chuId);
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: [{ unitId: "asc" }, { chuId: "asc" }, { positionId: "asc" }],
      include: {
        unit: true,
        chu: true,
        position: true,
      },
    });

    // Format dates
    const formattedUsers = users.map(({ username, password, ...user }) => ({
      ...user,
      createdAt: moment(user.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(user.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
    }));

    res.json(formattedUsers);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.yearusermeet = async (req, res) => {
  try {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({ message: "Year parameter is required" });
    }

    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    const detailmeets = await prisma.detailMeet.findMany({
      where: {
        approved: 2,
        userCode: req.user.code,
        createdAt: {
          gte: startOfYear, // Greater than or equal to start of the year
          lte: endOfYear, // Less than or equal to end of the year
        },
      },
      include: {
        meeting: true,
      },
    });

    // Format dates for each activity
    const formattedMeets = detailmeets.map((meet) => ({
      ...meet,
      createdAt: moment(meet.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(meet.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
    }));

    res.json(formattedMeets);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.selectmeetuser = async (req, res) => {
  try {
    const { meeting } = req.query;

    if (!meeting) {
      return res.status(400).json({ message: "Year parameter is required" });
    }

    const meetings = await prisma.meeting.findMany({
      where: {
        id: Number(meeting),
      },
      include: {
        detailmeets: {
          where: {
            approved: 2,
          },
          include: {
            user: {
              select: {
                code: true,
                firstname: true,
                lastname: true,
                gender: true,
                tel: true,
                unitId: true,
                unit: true,
                chu: true,
              },
            },
          },
        },
      },
    });

    // Format dates for each meeting
    const formattedMeetings = meetings.map((meeting) => ({
      ...meeting,
      createdAt: moment(meeting.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(meeting.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      detailmeets: meeting.detailmeets.map((detailmeet) => ({
        ...detailmeet,
        createdAt: moment(detailmeet.createdAt)
          .tz("Asia/Vientiane")
          .format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment(detailmeet.updatedAt)
          .tz("Asia/Vientiane")
          .format("YYYY-MM-DD HH:mm:ss"),
      })),
    }));

    res.json(formattedMeetings);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.selectmeetimg = async (req, res) => {
  try {
    const { meeting } = req.query;

    if (!meeting) {
      return res.status(400).json({ message: "Year parameter is required" });
    }

    const meetings = await prisma.meeting.findMany({
      where: {
        id: Number(meeting), // ใช้ค่าของ query parameter
      },
      include: {
        detailmeets: {
          where: {
            approved: 2,
          },
          select: {
            meetimg: true,
          },
        },
      },
    });

    // Format dates for each activity
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

exports.selectmeetyearuser = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({ message: "Year parameter is required" });
    }

    // กำหนดช่วงเวลาของปี
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    // Query เพื่อนับจำนวนกิจกรรมโดยจัดกลุ่มตาม userCode
    const groupedMeetings = await prisma.detailMeet.groupBy({
      by: ["userCode"], // จัดกลุ่มตาม userCode
      where: {
        approved: 2, // เฉพาะกิจกรรมที่อนุมัติแล้ว
        createdAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      _count: {
        id: true, // นับจำนวน id
      },
      orderBy: {
        _count: {
          id: "desc", // เรียงลำดับจากมากไปน้อย
        },
      },
    });

    // ดึง userCode ทั้งหมดจากผลลัพธ์
    const userCodes = groupedMeetings.map((group) => group.userCode);

    // ค้นหาข้อมูลผู้ใช้จากตาราง `User`
    const users = await prisma.user.findMany({
      where: {
        code: { in: userCodes }, // ใช้ `code` แทน `id`
      },
      select: {
        code: true, // ใช้ code แทน userCode
        firstname: true,
        lastname: true,
        gender: true,
        unit: true,
        chu: true,
      },
    });

    // รวมข้อมูล user + count
    const formattedResult = groupedMeetings.map((group) => {
      const user = users.find((u) => u.code === group.userCode);
      return {
        code: user.code,
        firstname: user ? user.firstname : null,
        lastname: user ? user.lastname : null,
        gender: user ? user.gender : null,
        unit: user ? user.unit : null,
        chu: user ? user.chu : null,
        count: group._count.id,
      };
    });

    res.json(formattedResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.selectmeetdaterange = async (req, res) => {
  try {
    const { datestart, dateend } = req.query;
    if (!datestart) {
      return res.status(400).json({ message: "datestart is required" });
    }
    if (!dateend) {
      return res.status(400).json({ message: "dateend is required" });
    }

    const startOfDate = new Date(`${datestart}T00:00:00+07:00`);
    const endOfDate = new Date(`${dateend}T23:59:59+07:00`);

    // Query เพื่อนับจำนวนกิจกรรมโดยจัดกลุ่มตาม userCode
    const groupedMeetings = await prisma.detailMeet.groupBy({
      by: ["userCode"], // จัดกลุ่มตาม userCode
      where: {
        approved: 2, // เฉพาะกิจกรรมที่อนุมัติแล้ว
        createdAt: {
          gte: new Date(startOfDate.toISOString()),
          lte: new Date(endOfDate.toISOString()),
        },
      },
      _count: {
        id: true, // นับจำนวน id
      },
      orderBy: {
        _count: {
          id: "desc", // เรียงลำดับจากมากไปน้อย
        },
      },
    });

    // ดึง userCode ทั้งหมดจากผลลัพธ์
    const userCodes = groupedMeetings.map((group) => group.userCode);

    // ค้นหาข้อมูลผู้ใช้จากตาราง `User`
    const users = await prisma.user.findMany({
      where: {
        code: { in: userCodes }, // ใช้ `code` แทน `id`
      },
      select: {
        code: true, // ใช้ code แทน userCode
        firstname: true,
        lastname: true,
        gender: true,
        unit: true,
        chu: true,
      },
    });

    // รวมข้อมูล user + count
    const formattedResult = groupedMeetings.map((group) => {
      const user = users.find((u) => u.code === group.userCode);
      return {
        code: user.code,
        firstname: user ? user.firstname : null,
        lastname: user ? user.lastname : null,
        gender: user ? user.gender : null,
        unit: user ? user.unit : null,
        chu: user ? user.chu : null,
        count: group._count.id,
      };
    });

    res.json(formattedResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
