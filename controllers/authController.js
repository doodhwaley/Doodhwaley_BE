const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper function to generate tokens
const generateTokens = (userId) => {
  // Access token payload
  const accessPayload = {
    user: {
      id: userId,
    },
  };

  // Generate access token with shorter expiry
  const accessToken = jwt.sign(accessPayload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  // Generate refresh token with longer expiry
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET, // Using same secret for simplicity, but ideally use a different one
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    user = new User({
      phone,
      password,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Refresh access token using refresh token
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

      // Find user with this refresh token
      const user = await User.findOne({
        _id: decoded.userId,
        refreshToken,
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      // Generate new tokens
      const tokens = generateTokens(user.id);

      // Update refresh token in database
      user.refreshToken = tokens.refreshToken;
      await user.save();

      // Return new tokens
      res.json({
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Refresh token expired" });
      }
      return res.status(401).json({ message: "Invalid refresh token" });
    }
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout User
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Find user with this refresh token and clear it
    const user = await User.findOneAndUpdate(
      { refreshToken },
      { refreshToken: null }
    );

    if (!user) {
      return res.status(200).json({ message: "Already logged out" });
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const loginOrRegisterUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        message: "Phone number and password are required",
      });
    }

    // Check if user exists
    let user = await User.findOne({ phone });
    let isNewUser = false;

    if (!user) {
      // User doesn't exist - Register new user
      isNewUser = true;
      user = new User({
        phone,
        password,
      });

      // Hash password for new user
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
    } else {
      // User exists - Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
      },
      isNewUser, // indicates if this was a registration or login
    });
  } catch (err) {
    console.error("Auth Error:", err.message);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  loginOrRegisterUser,
  refreshAccessToken,
  logout,
};
