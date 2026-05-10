const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/User");

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
const SALT_ROUNDS = 10;

const createSession = () => ({
  token: crypto.randomBytes(32).toString("hex"),
  expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
});

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, SALT_ROUNDS),
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to register user",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const session = createSession();

    user.sessionToken = session.token;
    user.sessionExpiresAt = session.expiresAt;
    await user.save();

    return res.json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      session: {
        token: session.token,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to login user",
      error: error.message,
    });
  }
};

module.exports = {
  loginUser,
  registerUser,
};
