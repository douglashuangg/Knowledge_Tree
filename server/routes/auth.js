const express = require("express");
const { register, login, logout } = require("../controllers/auth.js");

const router = express.Router();

router.post("/login", login);

router.post("/register", register);

router.get("/logout", logout);

module.exports = router;
