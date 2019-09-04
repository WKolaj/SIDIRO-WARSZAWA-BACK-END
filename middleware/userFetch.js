const logger = require("../logger/logger");
const { getUserFromReq } = require("../services/user");

module.exports = function(req, res, next) {
  req.user = getUserFromReq(req);

  next();
};
