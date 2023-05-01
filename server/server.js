const { Client } = require("pg");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { privateRoutes } = require("./routes/private.js");
const authRoutes = require("./routes/auth.js");

dotenv.config();

const hostname = "127.0.0.1";
const port = 5000;

const app = express();

// cors middleware
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

// cookie parser middleware
app.use(cookieParser());

// body parser middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// authentication and routes that are private
app.use("/auth", authRoutes);
app.use("/private", privateRoutes);

app.post("/savePost", (req, res) => {
  console.log("your post data", req.body);
  // post to postgres
  res.send({ status: "success" });
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
