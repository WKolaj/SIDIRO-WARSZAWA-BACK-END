const { adminUsers } = require("../services/user");

var jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
  const authorizationHeader = (authHeader = req.get("authorization"));

  if (authorizationHeader != null) {
    token = jwt.decode(authorizationHeader.replace("Bearer ", ""), {
      complete: true,
      json: true
    });

    if (!token) return res.status(401).send("Access denied. No token provided");

    let userName = token.payload["user_name"];

    if (!userName)
      return res.status(401).send("Access denied. Invalid token provided");

    if (!adminUsers.includes(userName))
      return res.status(403).send("Access forbidden.");

    next();
  } else {
    return res.status(401).send("Access denied. No token provided");
  }
};
