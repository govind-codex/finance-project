const express = require("express");
const {
  loginUser,
  logoutUser,
  registerUser,
} = require("../controller/authController");

const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/register", registerUser);

module.exports = router;
