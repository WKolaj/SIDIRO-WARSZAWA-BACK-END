const logger = require("../logger/logger");
const error = require("../middleware/error");
const powermonitor = require("../routes/powermonitor");
const user = require("../routes/user");

module.exports = async function(app) {
  logger.info("initializing routes...");

  app.use("/customApi/powermonitor", powermonitor);
  logger.info("Powermonitor route initialized");

  app.use("/customApi/user", user);
  logger.info("User route initialized");

  app.use(error);

  logger.info("Route error handler initialized");

  logger.info("routes initialized");
};
