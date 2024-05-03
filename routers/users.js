const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

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
  res.status(201).send("The user is successfully created.");
});

router.post(`/login`, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.TOKEN_SECRET;

  if (!user) {
    return res.status(400).send("The user is not found");
  }

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, secret, {
      expiresIn: "1d",
    });
    return res
      .status(200)
      .send({ message: "user is authenticated", token: token });
  } else {
    return res.status(400).send("password is wrong");
  }
});

module.exports = router;
