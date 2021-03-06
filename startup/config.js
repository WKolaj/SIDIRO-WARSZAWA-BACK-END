const logger = require("../logger/logger");
const config = require("config");

let throwIfConfigDoesNotExist = configName => {
  if (!config.get(configName))
    throw new Error(`FATAL ERROR: ${configName} is not defined in config file`);
};

module.exports = async function() {
  logger.info("initializing app configuration files...");

  throwIfConfigDoesNotExist("xSpaceAuthKey");
  throwIfConfigDoesNotExist("appName");
  throwIfConfigDoesNotExist("appVersion");
  throwIfConfigDoesNotExist("hostTenant");
  throwIfConfigDoesNotExist("userTenant");

  throwIfConfigDoesNotExist("userScopeName");
  throwIfConfigDoesNotExist("adminScopeName");

  throwIfConfigDoesNotExist("powermonitorDirName");
  throwIfConfigDoesNotExist("powermonitorFileName");
  throwIfConfigDoesNotExist("notifySubscriberDirName");
  throwIfConfigDoesNotExist("notifySubscriberFileName");
  throwIfConfigDoesNotExist("notifySubscriberPowermonitorGroupName");

  throwIfConfigDoesNotExist("notifySubscriberWarningIcon");
  throwIfConfigDoesNotExist("notifySubscriberAlertIcon");
  throwIfConfigDoesNotExist("notifySubscriberInfoIcon");

  throwIfConfigDoesNotExist("emailAccount");
  throwIfConfigDoesNotExist("emailPassword");

  throwIfConfigDoesNotExist("logging");
  throwIfConfigDoesNotExist("logging.info");
  throwIfConfigDoesNotExist("logging.info.path");
  throwIfConfigDoesNotExist("logging.info.maxsize");
  throwIfConfigDoesNotExist("logging.info.maxFiles");
  throwIfConfigDoesNotExist("logging.warning");
  throwIfConfigDoesNotExist("logging.warning.path");
  throwIfConfigDoesNotExist("logging.warning.maxsize");
  throwIfConfigDoesNotExist("logging.warning.maxFiles");
  throwIfConfigDoesNotExist("logging.error");
  throwIfConfigDoesNotExist("logging.error.path");
  throwIfConfigDoesNotExist("logging.error.maxsize");
  throwIfConfigDoesNotExist("logging.error.maxFiles");

  logger.info("app configuration files initialized");
};
