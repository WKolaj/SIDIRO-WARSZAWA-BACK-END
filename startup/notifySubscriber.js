const project = require("../project/project");
const logger = require("../logger/logger");

module.exports = async function() {
  logger.info("Initializing notifySubscriber object");

  await project.initNotifySubscriber();

  logger.info("notifySubscriber object initialized...");
};
