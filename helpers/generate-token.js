const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, isAdmin: user.isAdmin },
    process.env.TOKEN_SECRET,
    { expiresIn: "30s" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id, isAdmin: user.isAdmin },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
