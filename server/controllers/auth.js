const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const pool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
    });
    if (req.body.password) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(req.body.password, salt);

      // add username and hashed password to database.
      await pool.query(
        "INSERT INTO users (username, password, email) VALUES ($1, $2, $3)",
        [req.body.username, hashedPassword, req.body.username]
      );

      const { rows } = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [req.body.username]
      );

      pool.end();

      const user = rows[0];
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
        })
        .status(200)
        .json({
          username: user.username,
        });
      res.status(201).json("New User created");
      console.log("logged in");
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
    const pool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
    });
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [req.body.username]
    );

    pool.end();

    const user = rows[0];

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
      })
      .status(200)
      .json({
        username: user.username,
      });
    console.log("logged in");
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const logout = (req, res) => {
  res.clearCookie("access_token");
  console.log("logged out");
  res.status(200).json("Logout successful");
};

module.exports = {
  register,
  login,
  logout,
};
