const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  try {
    const authHeader = req.header("authorization"); // Extract the "authorization" header

    if (!authHeader) {
      return res.status(401).json({
        message: "No token, authorization denied!!",
      });
    }

    // Split the authHeader and check if it starts with 'Bearer'
    const token = authHeader.split(" ")[1]; // Extract the token part after 'Bearer'

    if (!token) {
      return res.status(401).json({
        message: "Authorization format is Bearer <token>",
      });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        return res.status(401).json({ message: "Token is invalid" });
      }
      // Set the decoded user information in the request object
      req.user = decode;
      next();
    });
  } catch (err) {
    console.log("Something went wrong in middleware");
    res.status(500).json({ message: "Server Error!!" });
  }
};

exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.roleId)) {
      return res.status(403).json({ message: "Access denied!!" });
    }
    next();
  };
};

exports.checkPosition = (positions) => {
  return (req, res, next) => {
    if (!req.user || !positions.includes(req.user.positionId)) {
      return res.status(403).json({ message: "Access denied!! Invalid Position" });
    }
    next();
  };
};
