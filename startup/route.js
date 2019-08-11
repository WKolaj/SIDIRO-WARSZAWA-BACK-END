const logger = require("../logger/logger");
const error = require("../middleware/error");

module.exports = async function(app) {
  logger.info("initializing routes...");

  app.use(error);

  logger.info("Route error handler initialized");

  logger.info("routes initialized");
};
