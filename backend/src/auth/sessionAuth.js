const User = require("../models/User");

const getSessionToken = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return req.body.sessionToken || req.body.token;
};

const sessionAuth = async (req, res, next) => {
  try {
    const sessionToken = getSessionToken(req);

    if (!sessionToken) {
      return res.status(401).json({
        message: "Session token is required",
      });
    }

    const user = await User.findOne({
      sessionToken,
      sessionExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid or expired session",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Failed to verify session",
      error: error.message,
    });
  }
};

module.exports = sessionAuth;
