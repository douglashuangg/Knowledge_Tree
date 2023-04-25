const express = require("express");
const checkAuth = require("../middlewares/checkAuth.js");

const router = express.Router();

// I see how the middleware fits in
// middleware first calls checkAuth, and then goes to private route.
router.get("/", checkAuth, (req, res) => {
  console.log("work");
  console.log(req.user);
  res.send({ loggedIn: true });

  //   res.json("You got the private route");
});

module.exports = router;
