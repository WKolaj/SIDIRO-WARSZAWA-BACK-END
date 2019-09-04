const express = require("express");
const router = express.Router();
const { getUserFromReq } = require("../services/user");

router.get("/me", function(req, res, next) {
  return res.status(200).send(req.user);
});

module.exports = router;
