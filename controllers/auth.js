const prisma = require("../prisma/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username) {
      return res
        .status(400)
        .json({ message: "ກະ​ລຸ​ນາ​ເພີ່ມຊື່​ເຂົ້າ​ລະ​ບົບ" });
    }
    if (!password) {
      return res.status(400).json({ message: "ກະ​ລຸ​ນາ​ເພີ່ມລະ​ຫັດ" });
    }

    // async function loginAndGetToken() {
    //   try {
    //     const loginResponse = await axios.post(
    //       `${process.env.URL_API}/auth-svc/auth/login`,
    //       {
    //         username: process.env.USERNAME_API,
    //         password: process.env.PASSWORD_API,
    //       }
    //     );

    //     return loginResponse.data.data.accessToken;
    //   } catch (error) {
    //     console.error("Error during login:", error.message);
    //     return null;
    //   }
    // }

    // const token = await loginAndGetToken();

    // if (token) {
    //   try {
    //     const response = await axios.get(
    //       `${process.env.URL_API}/organization-svc/employee/get?search=${username}`,
    //       {
    //         headers: { Authorization: `Bearer ${token}` },
    //       }
    //     );

    //     const employees = response.data.data?.employees;

    //     if (employees && employees.length > 0) {
    //       const emp_id = employees[0].emp_id;

    //       const userResponse = await axios.get(
    //         `${process.env.URL_API}/organization-svc/employee/getEmpDetail/${emp_id}`,
    //         {
    //           headers: { Authorization: `Bearer ${token}` },
    //         }
    //       );

    //       const userData = userResponse.data.data;

    //       if (userData && Object.keys(userData).length > 0) {
    //         // หาแต่ละ organize_type_id
    //         const party1 = userData.party?.find(
    //           (p) => p.organize_type_id === 1
    //         );
    //         const party4 = userData.party?.find(
    //           (p) => p.organize_type_id === 4
    //         );
    //         const party6 = userData.party?.find(
    //           (p) => p.organize_type_id === 6
    //         );
    //         const party8 = userData.party?.find(
    //           (p) => p.organize_type_id === 8
    //         );

    //         await prisma.user.update({
    //           where: { code: userData.emp_code },
    //           data: {
    //             firstname: userData.first_name_la,
    //             lastname: userData.last_name_la,
    //             gender: userData.gender,
    //             datebirth: userData.birthday ?? null,
    //             tribe: userData.nationalitys?.nationality ?? null,
    //             religion: userData.religions?.religion_name ?? null,
    //             villagebirth: userData.village?.village_name ?? null,
    //             districtbirth: userData.district?.district_name ?? null,
    //             provincebirth: userData.province?.province_name ?? null,
    //             villagenow: userData.curVillage?.village_name ?? null,
    //             districtnow: userData.curDistrict?.district_name ?? null,
    //             provincenow: userData.curProvince?.province_name ?? null,
    //             edulevel:
    //               userData.education?.[0]?.educationType?.edu_type_name ?? null,
    //             edusubject:
    //               userData.education?.[0]?.subject?.subject_name ?? null,
    //             latcomein: userData.placeOffice?.revolution_date ?? null,
    //             latposition: userData.placeOffice?.position?.pos_name ?? null,
    //             latdepartment:
    //               userData.placeOffice?.department?.department_name ?? null,
    //             latdivision:
    //               userData.placeOffice?.division?.division_name ?? null,
    //             latoffice: userData.placeOffice?.office?.office_name ?? null,
    //             latunit: userData.placeOffice?.unit?.unit_name ?? null,
    //             phaksamhong: party8?.party_date ?? null,
    //             phaksomboun: party8?.join_date ?? null,
    //             phakposition: party8?.party_position ?? null,
    //             kammabancomein: party6?.party_date ?? null,
    //             kammabanposition: party6?.party_position ?? null,
    //             youthcomein: party1?.party_date ?? null,
    //             womencomein: party4?.party_date ?? null,
    //             womenposition: party4?.party_position ?? null,
    //           },
    //         });
    //       }
    //     } else {
    //       console.warn(
    //         `No employees found for username: ${username}. Skipping sync.`
    //       );
    //     }
    //   } catch (err) {
    //     console.warn("Failed to fetch employee info. Continuing without sync.");
    //   }
    // }

    // Step 1 Check Email in DB
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (!user) {
      return res.status(400).json({
        message: "ບໍ່​ມີ​ຂໍ້​ມູນຜູ້​ໃຊ້",
      });
    }

    if (user.actived !== "A") {
      return res.status(400).json({
        message: "ລະ​ຫັດ​ຂອງ​ທ່ານ​ໄດ້​ຖືກ​ປິດ​ການ​ໃຊ້​ງານ",
      });
    }

    // Step 2 Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "​ລະ​ຫັດ​ບໍ່​ຕົງ",
      });
    }

    const userWithAll = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        role: true,
        position: true,
        unit: true,
        chu: true,
      },
    });
    // Step 3 Create payload
    const payload = {
      id: userWithAll.id,
      username: userWithAll.username,
      code: userWithAll.code,
      firstname: userWithAll.firstname,
      lastname: userWithAll.lastname,
      actived: userWithAll.actived,
      gender: userWithAll.gender,
      tel: userWithAll.tel,
      userimg: userWithAll.userimg,
      roleId: userWithAll.roleId,
      positionId: userWithAll.positionId,
      unitId: userWithAll.unitId,
      chuId: userWithAll.chuId,
      role: userWithAll.role,
      position: userWithAll.position,
      unit: userWithAll.unit,
      chu: userWithAll.chu,
    };
    // Step 4 Create Token
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({
      user: payload,
      token: accessToken,
    });
  } catch (err) {
    console.log(err);
    res.json({ message: "Server Error" }).status(500);
  }
};

exports.profile = async (req, res) => {
  try {
    // Ensure the JWT middleware has populated req.user with the user's ID
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Fetch the user data from the database using Prisma
    const user = await prisma.user.findUnique({
      where: {
        code: req.user.code, // Use the user ID from the decoded token
      },
    });

    // If the user does not exist, return a 404 error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Exclude sensitive fields (username, password)
    const {
      password,
      actived,
      roleId,
      positionId,
      unitId,
      chuId,
      createdAt,
      updatedAt,
      ...filteredUser
    } = user;

    // Respond with the filtered user data
    res.json(filteredUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
