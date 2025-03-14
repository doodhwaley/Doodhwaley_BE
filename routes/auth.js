const express = require("express");
const {
  registerUser,
  loginUser,
  loginOrRegisterUser,
  refreshAccessToken,
  logout,
} = require("../controllers/authController");

const router = express.Router();

// Register API
router.post("/register", (req, res, next) => {
  console.log("Register endpoint hit:", new Date().toISOString());
  console.log("Request body:", req.body);

  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({
      message: "Phone number and password are required",
      received: {
        phone: !!phone,
        password: !!password,
      },
    });
  }

  registerUser(req, res, next);
});

// Login API
router.post("/login", (req, res, next) => {
  console.log("Login endpoint hit:", new Date().toISOString());
  console.log("Request body:", req.body);

  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({
      message: "Phone number and password are required",
      received: {
        phone: !!phone,
        password: !!password,
      },
    });
  }

  loginUser(req, res, next);
});

// Refresh Token API
router.post("/refresh-token", refreshAccessToken);

// Logout API
router.post("/logout", logout);

router.get("/signup", (req, res) => {
  const { email, password } = req.query;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  res.status(200).json({ message: "Login successful", email });
});

router.post("/loginOrRegister", loginOrRegisterUser);

module.exports = router;
