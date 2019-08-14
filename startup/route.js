const logger = require("../logger/logger");
const error = require("../middleware/error");
const powermonitor = require("../routes/powermonitor");

module.exports = async function(app) {
  logger.info("initializing routes...");

  app.use("/customApi/powermonitor", powermonitor);
  logger.info("Powermonitor route initialized");

  app.use(error);

  logger.info("Route error handler initialized");

  logger.info("routes initialized");
};
