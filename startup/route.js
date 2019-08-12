const logger = require("../logger/logger");
const error = require("../middleware/error");
const test = require("../routes/test");

module.exports = async function(app) {
  logger.info("initializing routes...");

  app.use("/customApi/test", test);
  logger.info("Test route initialized");

  app.use(error);

  logger.info("Route error handler initialized");

  logger.info("routes initialized");
};
