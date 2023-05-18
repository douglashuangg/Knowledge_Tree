const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    if (req.body.password) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(req.body.password, salt);

      await prisma.users.create({
        data: {
          username: req.body.username,
          password: hashedPassword,
          email: req.body.username,
        },
      });

      const users = await prisma.users.findMany({
        where: {
          username: req.body.username,
        },
      });

      const user = users[0];
      const payload = {
        id: user.user_id,
      };

      // create jwt token
      const token = jwt.sign(payload, process.env.JWT_secret, {
        expiresIn: "1d",
      });
      // set token in cookies
      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: true,
        })
        .status(200)
        .json({
          username: user.username,
        });
      // res.status(201).json("New User created");
    } else {
      res.status(403).json("Please provide a password");
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const login = async (req, res) => {
  try {
    // find username
    const users = await prisma.users.findMany({
      where: {
        username: req.body.username,
      },
    });

    const user = users[0];

    if (!user) {
      // automatically thought it returned
      return res.status(404).json("no user found");
    }
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json("wrong password");
    }
    // create jwt token
    const payload = {
      id: user.user_id,
    };
    const token = jwt.sign(payload, process.env.JWT_secret, {
      expiresIn: "1d",
    });
    // set token in cookies
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true,
      })
      .status(200)
      .json({
        username: user.username,
      });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const logout = (req, res) => {
  res.clearCookie("access_token");
  res.status(200).json("Logout successful");
};

module.exports = {
  register,
  login,
  logout,
};
