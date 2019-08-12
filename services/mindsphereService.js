const request = require("superagent");
const config = require("config");

let xSpaceAuthKey = config.get("xSpaceAuthKey");
let appName = config.get("appName");
let appVersion = config.get("appVersion");
let hostTenant = config.get("hostTenant");
let userTenant = config.get("userTenant");

let prepareVariablesString = variables => {
  let stringToReturn = "";

  for (let i = 0; i < variables.length; i++) {
    if (i !== 0) stringToReturn += ",";
    stringToReturn += variables[i];
  }

  return stringToReturn;
};

/**
 * @description Method for getting last data of given variables - FROM LAST GATEWAY PUSH!
 */
module.exports.getLastData = async (assetId, aspectName, variables) => {
  let token = await module.exports.getToken();

  let variablesString = prepareVariablesString(variables);

  let data = await request
    .get(
      `https://gateway.eu1.mindsphere.io/api/iottimeseries/v3/timeseries/${assetId}/${aspectName}?select=${variablesString}`
    )
    .set("Authorization", `Bearer ${token}`)
    .set("Accept", "application/json");

  return data;
};

/**
 * @description Method for getting current Token
 */
module.exports.getToken = async () => {
  let data = await request
    .post(
      `https://gateway.eu1.mindsphere.io/api/technicaltokenmanager/v3/oauth/token`
    )
    .set("Content-Type", "application/json")
    .set("X-SPACE-AUTH-KEY", `Basic ${xSpaceAuthKey}`)
    .set("Accept", "application/json")
    .send({
      appName: appName,
      appVersion: appVersion,
      hostTenant: hostTenant,
      userTenant: userTenant
    });

  let result = data.text;
  if (data.text) result = JSON.parse(data.text)["access_token"];

  return result;
};
