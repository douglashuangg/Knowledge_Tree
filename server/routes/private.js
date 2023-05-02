const express = require("express");
const checkAuth = require("../middlewares/checkAuth.js");
const { Client } = require("pg");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

// I see how the middleware fits in
// middleware first calls checkAuth, and then goes to private route.
router.get("/", checkAuth, (req, res) => {
  console.log("work");
  res.send({ loggedIn: true });
});

// this has to be here because it needs to get the user id
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

router.post("/addFile", checkAuth, async (req, res) => {
  console.log(req.body);
  try {
    const createdFile = await prisma.files.create({
      data: {
        ...req.body,
        user_id: req.user.id,
      },
    });
    res.status(200).json(createdFile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating file" });
  }
});

router.post("/deleteFile", checkAuth, async (req, res) => {
  console.log(req.body);
  try {
    const deletedFile = await prisma.files.delete({
      where: {
        file_id: req.body.id,
      },
    });
    res.status(200).json({ message: "File deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting file" });
  }
});

module.exports = { privateRoutes: router };
