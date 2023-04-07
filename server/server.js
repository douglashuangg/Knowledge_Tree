const { Client } = require("pg");
// const http = require("http");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const privateRoutes = require("./routes/private.js");
const authRoutes = require("./routes/auth.js");

dotenv.config();

const app = express();

// cors middleware
app.use(cors());

// cookie parser middleware
app.use(cookieParser());

// body parser middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/private", privateRoutes);

app.get("/fetchFiles", async (req, res) => {
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
    const result = await client.query("SELECT * from files");
    console.log(result.rows);
    await client.end();
    res.json(result.rows);
  } catch (error) {
    console.log(error);
  }
});

app.post("/savePost", (req, res) => {
  console.log(req.body);
  // post to postgres
  res.send({ status: "success" });
});

const hostname = "127.0.0.1";
const port = 5000;
// const connectDb = async () => {
//   try {
//     const client = new Client({
//       user: process.env.PGUSER,
//       host: process.env.PGHOST,
//       database: process.env.PGDATABASE,
//       password: process.env.PGPASSWORD,
//       port: process.env.PGPORT,
//     });
//     await client.connect();
//     const res = await client.query("SELECT * FROM files");
//     console.log(res.rows);
//     await client.end();
//   } catch (error) {
//     console.log(error);
//   }
// };
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
