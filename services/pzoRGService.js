const { exists } = require("../utilities/utilities");
const mindsphereService = require("./mindsphereService");
const pzoRGAssetId = "a5eebd59cd1348c5b38f8d74ab432780";
const tr1AspectName = "TR1_1_min";
const tr2AspectName = "TR2_1_min";
const activeEnergyVariableName = "Active_energy_import";
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
