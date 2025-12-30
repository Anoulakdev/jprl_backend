const fs = require("fs");
const prisma = require("../prisma/prisma");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const moment = require("moment-timezone");
const axios = require("axios");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, "./uploads/user");
    cb(null, path.join(process.env.UPLOAD_BASE_PATH, "user")); // The directory where user images will be stored
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Appending file extension
  },
});

const upload = multer({ storage: storage }).single("userimg");

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()); // ถ้าเป็นวันที่ที่ถูกต้องจะคืนค่า true
};

const formatDate = (dateString) => {
  return isValidDate(dateString) ? new Date(dateString) : null;
};

async function loginAndGetToken() {
  try {
    const loginResponse = await axios.post(
      `${process.env.URL_API}/auth-svc/auth/login`,
      {
        username: process.env.USERNAME_API,
        password: process.env.PASSWORD_API,
      }
    );

    return loginResponse.data.data.accessToken;
  } catch (error) {
    console.error("Error during login:", error.message);
    return null;
  }
}

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
      const {
        username,
        code,
        firstname,
        lastname,
        gender,
        tel,
        roleId,
        positionId,
        unitId,
        chuId,
      } = req.body;

      const checkUser = await prisma.user.findUnique({
        where: { username: username || code },
      });
      if (checkUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(
        process.env.DEFAULT_PASSWORD,
        salt
      );

      if (username) {
        const newUser = await prisma.user.create({
          data: {
            username: username ? username : code,
            password: hashPassword,
            code: username ? username : code,
            firstname,
            lastname,
            gender,
            tel,
            roleId: roleId ? Number(roleId) : null,
            positionId: positionId ? Number(positionId) : null,
            unitId: unitId ? Number(unitId) : null,
            chuId: chuId ? Number(chuId) : null,
            userimg: req.file ? `${req.file.filename}` : null, // Path to the uploaded image
          },
        });

        res.status(201).json({
          message: "User created successfully!",
          data: newUser,
        });
      } else {
        const token = await loginAndGetToken();
        if (!token) {
          return res.status(500).json({ message: "Failed to get API token" });
        }

        const response = await axios.get(
          `${process.env.URL_API}/organization-svc/employee/get?search=${code}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const employees = response.data.data?.employees;

        if (!employees || employees.length === 0) {
          return res.status(404).json({
            message: `No employees found for code: ${code}`,
          });
        }

        const emp_id = employees[0].emp_id;

        const userResponse = await axios.get(
          `${process.env.URL_API}/organization-svc/employee/getEmpDetail/${emp_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const userData = userResponse.data.data;
        if (!userData || Object.keys(userData).length === 0) {
          return res.status(404).json({
            message: `No employee details found for emp_id: ${emp_id}`,
          });
        }

        // 🔎 find party info
        const party1 = userData.party?.find((p) => p.organize_type_id === 1);
        const party4 = userData.party?.find((p) => p.organize_type_id === 4);
        const party6 = userData.party?.find((p) => p.organize_type_id === 6);
        const party8 = userData.party?.find((p) => p.organize_type_id === 8);

        const newUser = await prisma.user.create({
          data: {
            username: username ? username : code,
            password: hashPassword,
            code: username ? username : code,
            tel,
            roleId: roleId ? Number(roleId) : null,
            positionId: positionId ? Number(positionId) : null,
            unitId: unitId ? Number(unitId) : null,
            chuId: chuId ? Number(chuId) : null,
            userimg: req.file ? `${req.file.filename}` : null,

            firstname: userData.first_name_la,
            lastname: userData.last_name_la,
            gender: userData.gender,
            datebirth: formatDate(userData.birthday),
            tribe: userData.nationalitys?.nationality ?? null,
            religion: userData.religions?.religion_name ?? null,
            villagebirth: userData.village?.village_name ?? null,
            districtbirth: userData.district?.district_name ?? null,
            provincebirth: userData.province?.province_name ?? null,
            villagenow: userData.curVillage?.village_name ?? null,
            districtnow: userData.curDistrict?.district_name ?? null,
            provincenow: userData.curProvince?.province_name ?? null,
            edulevel:
              userData.education?.[0]?.educationType?.edu_type_name ?? null,
            edusubject: userData.education?.[0]?.subject?.subject_name ?? null,
            latcomein: formatDate(userData.placeOffice?.revolution_date),
            latposition: userData.placeOffice?.position?.pos_name ?? null,
            latdepartment:
              userData.placeOffice?.department?.department_name ?? null,
            latdivision: userData.placeOffice?.division?.division_name ?? null,
            latoffice: userData.placeOffice?.office?.office_name ?? null,
            latunit: userData.placeOffice?.unit?.unit_name ?? null,
            phaksamhong: formatDate(party8?.party_date),
            phaksomboun: formatDate(party8?.join_date),
            phakposition: party8?.party_position ?? null,
            kammabancomein: formatDate(party6?.party_date),
            kammabanposition: party6?.party_position ?? null,
            youthcomein: formatDate(party1?.party_date),
            womencomein: formatDate(party4?.party_date),
            womenposition: party4?.party_position ?? null,
          },
        });

        return res.status(201).json({
          message: "User created successfully from API!",
          data: newUser,
        });
      }
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).send("Server Error");
    }
  });
};

exports.ngcreate = (req, res) => {
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
      const {
        code,
        firstname,
        lastname,
        gender,
        tel,
        roleId,
        positionId,
        unitId,
        chuId,
        datebirth,
        tribe,
        religion,
        villagebirth,
        districtbirth,
        provincebirth,
        villagenow,
        districtnow,
        provincenow,
        edusaman,
        edulevel,
        edusubject,
        edutheory,
        latcomein,
        latposition,
        latdepartment,
        latdivision,
        latunit,
        phaksupport,
        phakrule,
        phaksamhong,
        phaksomboun,
        phakposition,
        phakcard,
        phakissuedcard,
        phakbook,
        kammabancomein,
        kammabanposition,
        youthcomein,
        womencomein,
        womenposition,
      } = req.body;

      const checkUser = await prisma.user.findUnique({
        where: { username: code },
      });
      if (checkUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(
        process.env.DEFAULT_PASSWORD,
        salt
      );

      const newUser = await prisma.user.create({
        data: {
          username: code,
          password: hashPassword,
          code: code,
          firstname,
          lastname,
          gender,
          tel,
          roleId: roleId ? Number(roleId) : null,
          positionId: positionId ? Number(positionId) : null,
          unitId: unitId ? Number(unitId) : null,
          chuId: chuId ? Number(chuId) : null,
          userimg: req.file ? `${req.file.filename}` : null,
          datebirth: formatDate(datebirth),
          tribe,
          religion,
          villagebirth,
          districtbirth,
          provincebirth,
          villagenow,
          districtnow,
          provincenow,
          edusaman,
          edulevel,
          edusubject,
          edutheory,
          latcomein: formatDate(latcomein),
          latposition,
          latdepartment,
          latdivision,
          latunit,
          phaksupport: formatDate(phaksupport),
          phakrule: formatDate(phakrule),
          phaksamhong: formatDate(phaksamhong),
          phaksomboun: formatDate(phaksomboun),
          phakposition,
          phakcard,
          phakissuedcard: formatDate(phakissuedcard),
          phakbook,
          kammabancomein: formatDate(kammabancomein),
          kammabanposition,
          youthcomein: formatDate(youthcomein),
          womencomein: formatDate(womencomein),
          womenposition,
        },
      });

      res.status(201).json({
        message: "User created successfully!",
        data: newUser,
      });
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).send("Server Error");
    }
  });
};

exports.listsuperadmin = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        roleId: {
          in: [2, 4],
        },
      },
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        username: true,
        code: true,
        firstname: true,
        lastname: true,
        actived: true,
        gender: true,
        tel: true,
        userimg: true,
        roleId: true,
        positionId: true,
        unitId: true,
        roleId: true,
        chuId: true,
        position: true,
        unit: true,
        chu: true,
      },
    });

    // Format dates
    const formattedUsers = users.map((user) => ({
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

exports.listadmin = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        roleId: 3,
      },
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        code: true,
        firstname: true,
        lastname: true,
        actived: true,
        gender: true,
        tel: true,
        userimg: true,
        roleId: true,
        positionId: true,
        unitId: true,
        roleId: true,
        chuId: true,
        position: true,
        unit: true,
        chu: true,
        DetailActUser: {
          take: 1,
        },
      },
    });

    // Format dates
    const formattedUsers = users.map((user) => ({
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

exports.listuser = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        roleId: 3,
        actived: "A",
        unitId: req.user.unitId,
        // id: {
        //   not: req.user.id,
        // },
      },
      orderBy: {
        // id: "desc",
        chu: {
          code: "asc",
        },
      },
      select: {
        id: true,
        code: true,
        firstname: true,
        lastname: true,
        actived: true,
        gender: true,
        tel: true,
        userimg: true,
        roleId: true,
        positionId: true,
        unitId: true,
        roleId: true,
        chuId: true,
        position: true,
        unit: true,
        chu: true,
        DetailActUser: {
          take: 1,
        },
      },
    });

    // Format dates
    const formattedUsers = users.map((user) => ({
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

exports.getById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Exclude username and password fields and format dates
    const { password, ...rest } = user;
    const formattedUser = {
      ...rest,
      createdAt: moment(user.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(user.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
    };

    res.json(formattedUser);
  } catch (err) {
    console.error(err);
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
      const { userId } = req.params;
      const {
        username,
        firstname,
        lastname,
        gender,
        tel,
        roleId,
        positionId,
        unitId,
        chuId,
      } = req.body;

      // Step 1: Find the user to update
      const user = await prisma.user.findUnique({
        where: {
          id: Number(userId),
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Step 2: If a new photo is uploaded and an old photo exists, delete the old photo
      let userimgPath = user.userimg; // Keep old photo path
      if (req.file) {
        // Only attempt to delete if there is an existing photo path
        if (user.userimg) {
          const oldUserimgPath = path.join(
            process.env.UPLOAD_BASE_PATH,
            "user",
            path.basename(user.userimg)
          );
          fs.unlink(oldUserimgPath, (err) => {
            if (err) {
              console.error("Error deleting old image: ", err);
            }
          });
        }

        // Set the new photo path
        userimgPath = `${req.file.filename}`;
      }

      // Step 3: Update the user record
      const updated = await prisma.user.update({
        where: {
          id: Number(userId),
        },
        data: {
          username,
          firstname,
          lastname,
          gender,
          tel,
          roleId: Number(roleId),
          positionId: Number(positionId),
          unitId: Number(unitId),
          chuId: Number(chuId),
          userimg: userimgPath,
        },
      });

      res.json({ message: "Update successful!", data: updated });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server Error" });
    }
  });
};

exports.ngupdate = async (req, res) => {
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
      const { userId } = req.params;
      const {
        firstname,
        lastname,
        gender,
        tel,
        roleId,
        positionId,
        unitId,
        chuId,
        datebirth,
        tribe,
        religion,
        villagebirth,
        districtbirth,
        provincebirth,
        villagenow,
        districtnow,
        provincenow,
        edusaman,
        edulevel,
        edusubject,
        edutheory,
        phaksupport,
        phakrule,
        phaksamhong,
        phaksomboun,
        phakposition,
        phakcard,
        phakissuedcard,
        phakbook,
        latcomein,
        latposition,
        latdepartment,
        latdivision,
        latunit,
        kammabancomein,
        kammabanposition,
        youthcomein,
        womencomein,
        womenposition,
      } = req.body;

      // Step 1: Find the user to update
      const user = await prisma.user.findUnique({
        where: {
          id: Number(userId),
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Step 2: If a new photo is uploaded and an old photo exists, delete the old photo
      let userimgPath = user.userimg; // Keep old photo path
      if (req.file) {
        // Only attempt to delete if there is an existing photo path
        if (user.userimg) {
          const oldUserimgPath = path.join(
            process.env.UPLOAD_BASE_PATH,
            "user",
            path.basename(user.userimg)
          );
          fs.unlink(oldUserimgPath, (err) => {
            if (err) {
              console.error("Error deleting old image: ", err);
            }
          });
        }

        // Set the new photo path
        userimgPath = `${req.file.filename}`;
      }

      // Step 3: Update the user record
      const updated = await prisma.user.update({
        where: {
          id: Number(userId),
        },
        data: {
          firstname,
          lastname,
          gender,
          tel,
          roleId: Number(roleId),
          positionId: Number(positionId),
          unitId: Number(unitId),
          chuId: Number(chuId),
          userimg: userimgPath,
          datebirth: formatDate(datebirth),
          tribe,
          religion,
          villagebirth,
          districtbirth,
          provincebirth,
          villagenow,
          districtnow,
          provincenow,
          edusaman,
          edulevel,
          edusubject,
          edutheory,
          latcomein: formatDate(latcomein),
          latposition,
          latdepartment,
          latdivision,
          latunit,
          phaksupport: formatDate(phaksupport),
          phakrule: formatDate(phakrule),
          phaksamhong: formatDate(phaksamhong),
          phaksomboun: formatDate(phaksomboun),
          phakposition,
          phakcard,
          phakissuedcard: formatDate(phakissuedcard),
          phakbook,
          kammabancomein: formatDate(kammabancomein),
          kammabanposition,
          youthcomein: formatDate(youthcomein),
          womencomein: formatDate(womencomein),
          womenposition,
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
    const { userId } = req.params;

    // Step 1: Find the user by ID
    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 2: Delete the photo file if it exists
    if (user.userimg) {
      const userimgPath = path.join(
        process.env.UPLOAD_BASE_PATH,
        "user",
        user.userimg
      );
      fs.unlink(userimgPath, (err) => {
        if (err) {
          console.error("Error deleting userimg file: ", err);
          return res
            .status(500)
            .json({ message: "Error deleting userimg file" });
        }
      });
    }

    // Step 3: Delete the user from the database
    const removed = await prisma.user.delete({
      where: {
        id: Number(userId),
      },
    });

    res.status(200).json({ message: "User and userimg deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateStatus = async (req, res) => {
  const { userId } = req.params;
  const { actived } = req.body;

  try {
    // ตัวอย่างการอัปเดตในฐานข้อมูลด้วย Prisma
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: { actived },
    });

    res.status(200).json({ message: "ອັບ​ເດດ​ສຳ​ເລັດ", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "​ອັບ​ເດດ​ບໍ່​ສ​ຳ​ເລັ​ດ" });
  }
};

exports.updateprofile = async (req, res) => {
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
      const { userId } = req.params;
      const {
        // firstname,
        // lastname,
        // gender,
        tel,
        // datebirth,
        // tribe,
        // religion,
        // villagebirth,
        // districtbirth,
        // provincebirth,
        // villagenow,
        // districtnow,
        // provincenow,
        edusaman,
        // edulevel,
        // edusubject,
        edutheory,
        phaksupport,
        phakrule,
        // phaksamhong,
        // phaksomboun,
        // phakposition,
        phakcard,
        phakissuedcard,
        phakbook,
        // latcomein,
        // latposition,
        // kammabancomein,
        // kammabanposition,
        // youthcomein,
        // womencomein,
        // womenposition,
        arts,
        sports,
        fbusiness,
        ideas,
      } = req.body;

      // Step 1: Find the user to update
      const user = await prisma.user.findUnique({
        where: {
          id: Number(userId),
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Step 2: If a new photo is uploaded and an old photo exists, delete the old photo
      let userimgPath = user.userimg; // Keep old photo path
      if (req.file) {
        // Only attempt to delete if there is an existing photo path
        if (user.userimg) {
          const oldUserimgPath = path.join(
            process.env.UPLOAD_BASE_PATH,
            "user",
            path.basename(user.userimg)
          );
          fs.unlink(oldUserimgPath, (err) => {
            if (err) {
              console.error("Error deleting old image: ", err);
            }
          });
        }

        // Set the new photo path
        userimgPath = `${req.file.filename}`;
      }

      // const formatteddatebirth = formatDate(datebirth);
      const formattedphaksupport = formatDate(phaksupport);
      const formattedphakrule = formatDate(phakrule);
      // const formattedphaksamhong = formatDate(phaksamhong);
      // const formattedphaksomboun = formatDate(phaksomboun);
      const formattedphakissuedcard = formatDate(phakissuedcard);
      // const formattedlatcomein = formatDate(latcomein);
      // const formattedkammabancomein = formatDate(kammabancomein);
      // const formattedyouthcomein = formatDate(youthcomein);
      // const formattedwomencomein = formatDate(womencomein);

      // Step 3: Update the user record
      const updated = await prisma.user.update({
        where: {
          id: Number(userId),
        },
        data: {
          // firstname,
          // lastname,
          // gender,
          tel,
          // datebirth: formatteddatebirth,
          // tribe,
          // religion,
          // villagebirth,
          // districtbirth,
          // provincebirth,
          // villagenow,
          // districtnow,
          // provincenow,
          edusaman,
          // edulevel,
          // edusubject,
          edutheory,
          phaksupport: formattedphaksupport,
          phakrule: formattedphakrule,
          // phaksamhong: formattedphaksamhong,
          // phaksomboun: formattedphaksomboun,
          // phakposition,
          phakcard,
          phakissuedcard: formattedphakissuedcard,
          phakbook,
          // latcomein: formattedlatcomein,
          // latposition,
          // kammabancomein: formattedkammabancomein,
          // kammabanposition,
          // youthcomein: formattedyouthcomein,
          // womencomein: formattedwomencomein,
          // womenposition,
          arts,
          sports,
          fbusiness,
          ideas,
          userimg: userimgPath,
        },
      });

      res.json({ message: "Update successful!", data: updated });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server Error" });
    }
  });
};

exports.updateDataHRM = async (req, res) => {
  try {
    const { userId } = req.params;
    const { code } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = await loginAndGetToken();
    if (!token) {
      return res.status(500).json({ message: "Failed to get API token" });
    }

    const response = await axios.get(
      `${process.env.URL_API}/organization-svc/employee/get?search=${code}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const employees = response.data.data?.employees;

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        message: `No employees found for code: ${code}`,
      });
    }

    const emp_id = employees[0].emp_id;

    const userResponse = await axios.get(
      `${process.env.URL_API}/organization-svc/employee/getEmpDetail/${emp_id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const userData = userResponse.data.data;
    if (!userData || Object.keys(userData).length === 0) {
      return res.status(404).json({
        message: `No employee details found for emp_id: ${emp_id}`,
      });
    }

    // 🔎 find party info
    const party1 = userData.party?.find((p) => p.organize_type_id === 1);
    const party4 = userData.party?.find((p) => p.organize_type_id === 4);
    const party6 = userData.party?.find((p) => p.organize_type_id === 6);
    const party8 = userData.party?.find((p) => p.organize_type_id === 8);

    const updated = await prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        firstname: userData.first_name_la,
        lastname: userData.last_name_la,
        gender: userData.gender,
        datebirth: formatDate(userData.birthday),
        tribe: userData.nationalitys?.nationality ?? null,
        religion: userData.religions?.religion_name ?? null,
        villagebirth: userData.village?.village_name ?? null,
        districtbirth: userData.district?.district_name ?? null,
        provincebirth: userData.province?.province_name ?? null,
        villagenow: userData.curVillage?.village_name ?? null,
        districtnow: userData.curDistrict?.district_name ?? null,
        provincenow: userData.curProvince?.province_name ?? null,
        edulevel: userData.education?.[0]?.educationType?.edu_type_name ?? null,
        edusubject: userData.education?.[0]?.subject?.subject_name ?? null,
        latcomein: formatDate(userData.placeOffice?.revolution_date),
        latposition: userData.placeOffice?.position?.pos_name ?? null,
        latdepartment:
          userData.placeOffice?.department?.department_name ?? null,
        latdivision: userData.placeOffice?.division?.division_name ?? null,
        latoffice: userData.placeOffice?.office?.office_name ?? null,
        latunit: userData.placeOffice?.unit?.unit_name ?? null,
        phaksamhong: formatDate(party8?.party_date),
        phaksomboun: formatDate(party8?.join_date),
        phakposition: party8?.party_position ?? null,
        kammabancomein: formatDate(party6?.party_date),
        kammabanposition: party6?.party_position ?? null,
        youthcomein: formatDate(party1?.party_date),
        womencomein: formatDate(party4?.party_date),
        womenposition: party4?.party_position ?? null,
      },
    });

    return res.status(201).json({
      message: "Update successfully from API!",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ error: "​ອັບ​ເດດ​ບໍ່​ສ​ຳ​ເລັ​ດ" });
  }
};

exports.changepassword = async (req, res) => {
  try {
    const { oldpassword, password1, password2 } = req.body;

    if (!oldpassword || !password1 || !password2) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (password1 !== password2) {
      return res.status(400).json({ error: "ລະ​ຫັດ​ໃໝ່​ບໍ່​ຕົງ​ກັນ" });
    }

    // กำหนดเงื่อนไขค้นหาผู้ใช้ตาม role
    const userIdentifier =
      req.user.roleId === 3
        ? { code: req.user.code }
        : { username: req.user.username };

    const user = await prisma.user.findUnique({
      where: userIdentifier,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(oldpassword, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ error: "ລະ​ຫັດ​ເກ​ົ່າ​ບໍ່​ຕົງ​ກັບ​ຖານ​ຂໍ້​ມູນ" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password1, salt);

    await prisma.user.update({
      where: userIdentifier,
      data: { password: hashPassword },
    });

    res.status(201).json({ message: "ອັບ​ເດດ​ລະ​ຫັດ​ສຳ​ເລ​ັດ" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).send("Server Error");
  }
};

exports.resetpassword = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(process.env.DEFAULT_PASSWORD, salt);

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { password: hashPassword },
    });

    res.status(201).json({
      message: "ຣີ​ເສັດ​ລະ​ຫັດ​ສຳ​ເລ​ັດ",
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).send("Server Error");
  }
};

exports.profileview = async (req, res) => {
  try {
    const { code } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        code: code,
      },
      include: {
        position: true,
        unit: true,
        chu: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Exclude username and password fields and format dates
    const { username, password, roleId, ...rest } = user;
    const formattedUser = {
      ...rest,
      createdAt: moment(user.createdAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(user.updatedAt)
        .tz("Asia/Vientiane")
        .format("YYYY-MM-DD HH:mm:ss"),
    };

    res.json(formattedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.usercount = async (req, res) => {
  try {
    const usercount = await prisma.user.count({
      where: {
        roleId: 3,
      },
    });

    res.json({ usercount });
  } catch (err) {
    console.error("Error fetching user count:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
