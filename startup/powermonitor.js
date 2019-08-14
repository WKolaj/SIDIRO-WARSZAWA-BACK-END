const project = require("../project/project");
const logger = require("../logger/logger");

module.exports = async function() {
  logger.info("Initializing powermonitor object");

  await project.initPowermonitor();
  await project.startRefreshingPowermonitor();

  logger.info("powermonitor object initialized...");
};
