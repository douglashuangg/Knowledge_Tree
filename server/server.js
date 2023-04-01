const { Client } = require("pg");
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// body parser middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/savePost", (req, res) => {
  console.log(req.body);
  res.send({ status: "success" }); // this is needed?
});

const hostname = "127.0.0.1";
const port = 3000;
const connectDb = async () => {
  try {
    const client = new Client({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
    });
    await client.connect();
    const res = await client.query("SELECT * FROM files");
    console.log(res);
    await client.end();
  } catch (error) {
    console.log(error);
  }
};
// connectDb();

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader("Content-Type", "text/plain");
//   res.end("Hello World\n");
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
