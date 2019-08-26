const config = require("config");

module.exports.adminUsers = config.get("adminUsers").split(",");
