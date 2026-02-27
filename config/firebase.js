const admin = require("firebase-admin");
const path = require("path");

// ใช้ service account json
const serviceAccount = require(
  path.join(__dirname, "firebase-service-account.json"),
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
