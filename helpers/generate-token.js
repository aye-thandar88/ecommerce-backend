const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, isAdmin: user.isAdmin },
    process.env.TOKEN_SECRET,
    { expiresIn: "3m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id, isAdmin: user.isAdmin },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
