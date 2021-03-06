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

let { exists } = require("../utilities/utilities");

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

/**
 * @description Method for getting last data of given variable - FROM LAST GATEWAY PUSH!
 */
module.exports.getLastData = async (assetId, aspectName, variable) => {
  let last1000Data = await module.exports.getLast1000Data(
    assetId,
    aspectName,
    variable
  );

  if (!exists(last1000Data) || last1000Data === []) return null;

  //Finding highest date index
  let indexWithHighestDate = 0;
  let highestDate = new Date(last1000Data[0]["_time"]);

  for (let i = 1; i < last1000Data.length; i++) {
    let newDate = new Date(last1000Data[i]["_time"]);
    if (newDate.getTime() > highestDate.getTime()) {
      highestDate = newDate;
      indexWithHighestDate = i;
    }
  }

  return last1000Data[indexWithHighestDate];
};

/**
 * @description Method for getting last data of given variable - FROM LAST GATEWAY PUSH!
 */
module.exports.getLast1000Data = async (assetId, aspectName, variable) => {
  let token = await getToken();

  let now = Date.now();
  let endDate = new Date(now);
  let beginDate = new Date(now - 1000 * 1000);

  let data = await request
    .get(
      `https://gateway.eu1.mindsphere.io/api/iottimeseries/v3/timeseries/${assetId}/${aspectName}?select=${variable}&from=${beginDate.toISOString()}&to=${endDate.toISOString()}&limit=1000`
    )
    .set("Authorization", `Bearer ${token}`)
    .set("Accept", "application/json");

  return JSON.parse(data.text);
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
  variable,
  dateFrom,
  dateTo
) => {
  let token = await getToken();

  let data = await request
    .get(
      `https://gateway.eu1.mindsphere.io/api/iottimeseries/v3/timeseries/${assetId}/${aspectName}?select=${variable}&from=${dateFrom}&to=${dateTo}&limit=2000`
    )
    .set("Authorization", `Bearer ${token}`)
    .set("Accept", "application/json");

  return data;
};
