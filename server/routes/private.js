const express = require("express");
const checkAuth = require("../middlewares/checkAuth.js");
const { Client } = require("pg");
const { PrismaClient } = require("@prisma/client");
const { encryptData, decryptData } = require("../utils/encryption.js");
const prisma = new PrismaClient();
const router = express.Router();

// I see how the middleware fits in
// middleware first calls checkAuth, and then goes to private route.
router.get("/", checkAuth, (req, res) => {
  res.send({ loggedIn: true });
});

// this has to be here because it needs to get the user id
router.get("/fetchFiles", checkAuth, async (req, res) => {
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
      "SELECT * from files WHERE user_id = $1 order by FILE_ID ASC",
      [req.user.id]
    );

    const decryptedResult = result.rows.map((row) => {
      return {
        ...row,
        title: decryptData(row.title),
        body: decryptData(row.body),
      };
    });
    console.log("decrypted", decryptedResult);
    await client.end();
    res.json(decryptedResult);
  } catch (error) {
    console.error(error);
  }
});

router.post("/addFile", checkAuth, async (req, res) => {
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
  try {
    await prisma.nodes.deleteMany({
      where: {
        file_id: req.body.id,
      },
    });

    await prisma.edges.deleteMany({
      where: {
        file_id: req.body.id,
      },
    });
    await prisma.files.delete({
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
