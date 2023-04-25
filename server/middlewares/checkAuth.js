const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    console.log("stuck");
    return res.send({ loggedIn: false });
    // return res.status(401).json("Not authenticated.");
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json("Invalid token");
    }
    req.user = {
      id: payload.id,
    };
    next();
  });
};

module.exports = checkAuth;
