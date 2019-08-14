const PowermonitorRG = require("../classes/PowermonitorRG");
const config = require("config");
const path = require("path");
const logger = require("../logger/logger");
let powermonitorFilePath = path.join(
  config.get("powermonitorDirName"),
  config.get("powermonitorFileName")
);
const {
  createDirAsync,
  checkIfDirectoryExistsAsync
} = require("../utilities/utilities");
const pzoRGService = require("../services/pzoRGService");

let powermonitor = new PowermonitorRG(powermonitorFilePath);
let powermonitorRefreshingHandler = null;

module.exports.powermonitor = powermonitor;

module.exports.initPowermonitor = async () => {
  let powermonitorDirExists = await checkIfDirectoryExistsAsync(
    config.get("powermonitorDirName")
  );
  if (!powermonitorDirExists)
    await createDirAsync(config.get("powermonitorDirName"));

  try {
    await powermonitor.init();
  } catch (err) {
    logger.error(err.message, err);
  }
};

module.exports.startRefreshingPowermonitor = async () => {
  powermonitorRefreshingHandler = setInterval(async () => {
    try {
      let newData = await pzoRGService.getLastTotalEnergy();
      let dateUTC = Math.round(newData.timestamp / 1000);
      let value = Math.round(newData.value);

      await powermonitor.refresh(dateUTC, value);
    } catch (err) {
      logger.error(err.message, err);
    }
  }, 5000);
};

module.exports.stopRefreshingPowermonitor = async () => {
  if (powermonitorRefreshingHandler)
    clearInterval(powermonitorRefreshingHandler);
};
