const { exists } = require("../utilities/utilities");
const mindsphereService = require("./mindsphereService");
const pzoRGAssetId = "7e7105980c05449fae4e63a89b3952a4";
const pzoRGEntityId = "7e7105980c05449fae4e63a89b3952a4";
const tr1AspectName = "TR1";
const tr2AspectName = "TR2";
const activeEnergyVariableName = "Active_energy_import";
const activePowerVariableName = "Total_active_power_import_15_min";
/**
 * @description Method for getting last data of given variables - FROM LAST GATEWAY PUSH!
 */
module.exports.getLastEnergyTR1 = async () => {
  let tr1Data = await mindsphereService.getLastData(
    pzoRGAssetId,
    tr1AspectName,
    activeEnergyVariableName
  );

  let jsonData = tr1Data;
  if (!exists(tr1Data)) return null;

  let value = jsonData[activeEnergyVariableName];
  let timestamp = new Date(jsonData["_time"]).getTime();
  return { timestamp, value };
};

/**
 * @description Method for getting last data of given variables - FROM LAST GATEWAY PUSH!
 */
module.exports.getLastEnergyTR2 = async () => {
  let tr2Data = await mindsphereService.getLastData(
    pzoRGAssetId,
    tr2AspectName,
    activeEnergyVariableName
  );

  let jsonData = tr2Data;
  if (!exists(tr2Data)) return null;

  let value = jsonData[activeEnergyVariableName];
  let timestamp = new Date(jsonData["_time"]).getTime();
  return { timestamp, value };
};

/**
 * @description Method for getting last data of given variables - FROM LAST GATEWAY PUSH!
 */
module.exports.getLastTotalEnergy = async () => {
  let tr1Data = await module.exports.getLastEnergyTR1();
  let tr2Data = await module.exports.getLastEnergyTR2();

  if (!exists(tr1Data) || !exists(tr2Data)) return {};

  //returning only if tr1Data has the same timeId as tr2Data
  if (tr1Data.timestamp !== tr2Data.timestamp) return {};

  return { timestamp: tr1Data.timestamp, value: tr1Data.value + tr2Data.value };
};
