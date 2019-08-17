const request = require("superagent");
const config = require("config");

let xSpaceAuthKey = config.get("xSpaceAuthKey");
let appName = config.get("appName");
let appVersion = config.get("appVersion");
let hostTenant = config.get("hostTenant");
let userTenant = config.get("userTenant");

let token;
let tokenExpireDateUTC;
//Offset of switching token to new one
let tokenExpireDateOffsetUTC = 100;

/**
 * @description Method for check if new token should be fetched
 */
let shouldTokenBeFetched = utcDate => {
  if (!token || !tokenExpireDateUTC) return true;

  if (utcDate >= tokenExpireDateUTC - tokenExpireDateOffsetUTC) return true;

  return false;
};

/**
 * @description Method for fetching new Token
 */
let fetchNewToken = async () => {
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

  let newTokenResult = JSON.parse(data.text);

  token = newTokenResult["access_token"];
  tokenExpireDateUTC =
    newTokenResult["timestamp"] / 1000 + newTokenResult["expires_in"];
};

/**
 * @description Method for getting current token or getting new one from Mindsphere
 */
let getToken = async () => {
  let utcToken = Date.now() / 1000;
  if (shouldTokenBeFetched(utcToken)) {
    await fetchNewToken();
  }

  return token;
};

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
  let token = await getToken();

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
 * @description Method for setting data to mindsphere
 */
module.exports.postData = async (
  date,
  entityId,
  propertySetName,
  variableName,
  variableValue
) => {
  let token = await getToken();

  let data = await request
    .put(`https://gateway.eu1.mindsphere.io/api/iottimeseries/v3/timeseries`)
    .set("Authorization", `Bearer ${token}`)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send({
      timeseries: [
        {
          entityId: entityId,
          propertySetName: propertySetName,
          data: [
            {
              _time: date.toISOString(),
              [variableName]: variableValue,
              [variableName + "_qc"]: 0
            }
          ]
        }
      ]
    });

  return data;
};

/**
 * @description Method for setting data to mindsphere
 */
module.exports.postEvent = async (
  date,
  entityId,
  description,
  severity,
  source
) => {
  let token = await getToken();

  let data = await request
    .post(`https://gateway.eu1.mindsphere.io/api/eventmanagement/v3/events`)
    .set("Authorization", `Bearer ${token}`)
    .set("Content-Type", "application/json")
    .send({
      entityId: entityId,
      timestamp: date.toISOString(),
      description: description,
      severity: severity,
      source: source
    });

  return data;
};

/**
 * @description Method for getting data from given time range
 */
module.exports.getDataFromRange = async (
  assetId,
  aspectName,
  variables,
  dateFrom,
  dateTo
) => {
  let token = await getToken();

  let variablesString = prepareVariablesString(variables);

  let data = await request
    .get(
      `https://gateway.eu1.mindsphere.io/api/iottimeseries/v3/timeseries/${assetId}/${aspectName}?select=${variablesString}&from=${dateFrom}&to=${dateTo}&limit=2000`
    )
    .set("Authorization", `Bearer ${token}`)
    .set("Accept", "application/json");

  return data;
};
