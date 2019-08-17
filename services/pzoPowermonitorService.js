const mindsphereService = require("./mindsphereService");
//For testing
//const powermonitorEntityId = "67c6e23ec82e4213ac888368c484c128";
//For production
const powermonitorEntityId = "82b4893792e74f959028ef2afca51bf4";
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

/**
 * @description Method for getting last data of given variables - FROM LAST GATEWAY PUSH!
 */
module.exports.getTotalPowerFromRange = async (fromDate, toDate) => {
  let data = await mindsphereService.getDataFromRange(
    powermonitorEntityId,
    activePowerPropertySetName,
    [activePowerVariableName],
    fromDate,
    toDate
  );

  let dataToReturn = [];

  let jsonData = JSON.parse(data.text);

  for (let msData of jsonData) {
    dataToReturn.push({
      value: msData[activePowerVariableName],
      timestamp: new Date(msData["_time"]).getTime()
    });
  }

  return dataToReturn;
};
