const express = require("express");
const router = express.Router();
const {
  getUserCount,
  getUsers,
  getUser,
  addUser,
  register,
  login,
  logout,
  getRefreshToken,
  searchContacts,
} = require("../controllers/users");

//Get count of users
router.get(`/get/count`, getUserCount);

router.get(`/`, getUsers);

router.get(`/:id`, getUser);

router.post(`/`, addUser);

router.post(`/register`, register);

router.post(`/login`, login);

router.post("/logout", logout);

router.post("/refresh-token", getRefreshToken);

router.post("/searchContact", searchContacts);

module.exports = router;
