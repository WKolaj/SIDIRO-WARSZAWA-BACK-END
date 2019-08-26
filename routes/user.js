const express = require("express");
const router = express.Router();
const { adminUsers } = require("../services/user");

var jwt = require("jsonwebtoken");

router.get("/me", function(req, res, next) {
  const authorizationHeader = (authHeader = req.get("authorization"));

  if (authorizationHeader != null) {
    token = jwt.decode(authorizationHeader.replace("Bearer ", ""), {
      complete: true,
      json: true
    });

    if (token) res.status(200).send(token.payload);
    else res.status(200).send({});
  }
});

router.get("/adminUsers", function(req, res, next) {
  res.status(200).send(adminUsers);
});

module.exports = router;
