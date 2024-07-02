const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../helpers/generate-token");

let refreshTokens = [];

//Get count of users
router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments({});

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.status(200).json({ success: true, count: userCount });
});

router.get(`/`, async (req, res) => {
  const pageSize = parseInt(req.query.pageSize) || 5;
  const pageNo = parseInt(req.query.pageNo) || 1;

  const userList = await User.find()
    .select("name email phone country")
    .limit(pageSize)
    .skip((pageNo - 1) * pageSize)
    .sort("_id");

  if (!userList) {
    return res.status(500).json({ success: false });
  }
  res.send(userList);
});

router.get(`/:id`, async (req, res) => {
  const pageSize = parseInt(req.query.pageSize) || 5;
  const pageNo = parseInt(req.query.pageNo) || 1;

  const userList = await User.findById(req.params.id)
    .select("-passwordHash")
    .limit(pageSize)
    .skip((pageNo - 1) * pageSize)
    .sort("_id");

  if (!userList) {
    return res.status(500).json({
      success: false,
      message: "The category with given ID was not found.",
    });
  }
  res.status(200).send(userList);
});

router.post(`/`, async (req, res) => {
  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    country: req.body.country,
    zip: req.body.zip,
    isAdmin: req.body.isAdmin,
  });

  newUser = await newUser.save();

  if (!newUser) {
    return res.status(400).send("The user cannot be created.");
  }
  res.status(201).send(newUser);
});

router.post(`/register`, async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    street,
    apartment,
    city,
    country,
    zip,
    isAdmin,
  } = req.body;

  if (!password) {
    return res.status(400).send({ message: "Password is required" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  let newUser = new User({
    name,
    email,
    passwordHash,
    phone,
    street,
    apartment,
    city,
    country,
    zip,
    isAdmin,
  });

  newUser = await newUser.save();

  if (!newUser) {
    return res.status(400).send({ message: "The user cannot be created." });
  }
  res.status(201).send({ message: "The user is successfully created." });
});

router.post(`/login`, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "The user is not found. Please register!",
    });
  }

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken); // Store refresh token securely

    return res.status(200).send({
      message: "user is authenticated",
      token: token,
      refreshToken: refreshToken,
    });
  } else {
    return res.status(404).send("password is wrong");
  }
});

router.post("/logout", (req, res) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter((t) => t !== token);
  return res.status(204).status({ message: "User has logged out" });
});

router.post("/refresh-token", (req, res) => {
  const { token } = req.body;
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

  if (!token) return res.status(401).send("User is unauthorized");

  if (!refreshTokens.includes(token)) {
    return res.status(403).send("Invalid refresh token");
  }

  jwt.verify(token, refreshTokenSecret, (err, user) => {
    if (err) return res.status(404).send("Invalid refresh token");

    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({ accessToken: newAccessToken });
  });
});

module.exports = router;
