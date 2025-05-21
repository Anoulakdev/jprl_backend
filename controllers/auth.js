const prisma = require("../prisma/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

    if (user.actived !== 'A') {
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
      username,
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
