const mindsphereService = require("./mindsphereService");
const powermonitorEntityId = "67c6e23ec82e4213ac888368c484c128";
const activePowerPropertySetName = "PZO_Powermonitor";
const activePowerVariableName = "Total_active_power_15_min";

/**
 * @description Method for fetching calculated active power value into mindsphere
 */
module.exports.fetchActivePower = async (date, value) => {
  return mindsphereService.postData(
    date,
    powermonitorEntityId,
    activePowerPropertySetName,
    activePowerVariableName,
    value
  );
};

/**
 * @description Method sending event associated with powermonitoring to mindsphere
 */
module.exports.sendEvent = async (date, description, severity) => {
  return mindsphereService.postEvent(
    date,
    powermonitorEntityId,
    description,
    severity,
    "Powermonitor"
  );
};
