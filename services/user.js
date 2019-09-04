const jwt = require("jsonwebtoken");
const config = require("config");
const { exists } = require("../utilities/utilities");

const userScopeName = config.get("userScopeName");
const adminScopeName = config.get("adminScopeName");

const getDefaultUser = () => {
  if (process.env.NODE_ENV === "production")
    return { isAdmin: false, isUser: false };
  else return { isAdmin: true, isUser: true };
};

const isAdmin = userPayload => {
  return (
    userPayload &&
    userPayload.scope &&
    userPayload.scope.includes(adminScopeName)
  );
};

const isUser = userPayload => {
  return (
    userPayload &&
    userPayload.scope &&
    userPayload.scope.includes(userScopeName)
  );
};

module.exports.getUserFromReq = req => {
  if (!exists(req)) return getDefaultUser();

  const authorizationHeader = (authHeader = req.get("authorization"));

  if (!exists(authorizationHeader)) return getDefaultUser();

  let token = authorizationHeader.replace("Bearer ", "");

  if (!exists(token)) return getDefaultUser();

  let decodedToken = jwt.decode(token, {
    complete: true,
    json: true
  });

  if (!exists(decodedToken) || !exists(decodedToken.payload))
    return getDefaultUser();

  let userToReturn = decodedToken.payload;

  userToReturn.isUser = isUser(decodedToken.payload);
  userToReturn.isAdmin = isAdmin(decodedToken.payload);

  return userToReturn;
};
