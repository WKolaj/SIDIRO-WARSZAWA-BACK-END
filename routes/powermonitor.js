const express = require("express");
const router = express.Router();
const project = require("../project/project");
const validate = require("../middleware/validation/powermonitor");
const { validateTimeRange } = require("../middleware/validation/timeRange");
const { exists } = require("../utilities/utilities");
const {
  getTotalPowerFromRange
} = require("../services/pzoPowermonitorService");
const { getLastTotalEnergy } = require("../services/pzoRGService");
const isAdmin = require("../middleware/isAdmin");
const isUser = require("../middleware/isUser");

router.get("/", [isUser], async (req, res) => {
  return res.status(200).send(project.getPowermonitor().Payload);
});

router.put("/", [isUser, isAdmin, validate.edit], async (req, res) => {
  //Editing powermonitor and returning it
  let result = await project.getPowermonitor().editWithPayload(req.body);
  return res.status(200).send(result.Payload);
});

router.get("/totalActivePower", [isUser], async (req, res) => {
  //Validate time range given in query
  let timeRangeValidationResult = validateTimeRange(req);
  if (exists(timeRangeValidationResult))
    return res.status(400).send(timeRangeValidationResult);

  try {
    let result = await getTotalPowerFromRange(req.query.from, req.query.to);
    return res.status(200).send(result);
  } catch (err) {
    if (exists(err.response) && exists(err.response.body)) {
      //Error with calling mindsphere
      let body = err.response.body;
      return res.status(body.status).send(body.message);
    } else {
      throw err;
    }
  }
});

module.exports = router;
