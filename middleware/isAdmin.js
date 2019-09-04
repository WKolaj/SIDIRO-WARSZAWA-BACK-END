const { exists } = require("../utilities/utilities");

module.exports = function(req, res, next) {
  if (!exists(req.user))
    return res.status(401).send("Access denied. No token provided");

  if (!exists(req.user.isAdmin))
    return res.status(401).send("Access denied. No token provided");

  if (!req.user.isAdmin) return res.status(403).send("Access forbidden.");

  next();
};
