const express = require("express");
const checkAuth = require("../middlewares/checkAuth.js");
const { Client } = require("pg");

const router = express.Router();

// I see how the middleware fits in
// middleware first calls checkAuth, and then goes to private route.
router.get("/", checkAuth, (req, res) => {
  console.log("work");
  res.send({ loggedIn: true });
});

router.get("/fetchFiles", checkAuth, async (req, res) => {
  console.log(req.user);
  try {
    // database connection
    const client = new Client({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
    });
    await client.connect();
    const result = await client.query(
      "SELECT * from files WHERE user_id = $1",
      [req.user.id]
    );
    console.log(result.rows);
    await client.end();
    res.json(result.rows);
  } catch (error) {
    console.log(error);
  }
});

module.exports = { privateRoutes: router };
