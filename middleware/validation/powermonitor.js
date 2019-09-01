const Joi = require("joi");
const validationMiddleware = require("../validation.js");

let powermonitorEditSchema = Joi.object().keys({
  active: Joi.boolean(),
  activePowerLimitWarning: Joi.number()
    .min(0)
    .max(1000000000),
  activePowerLimitAlarm: Joi.number()
    .min(0)
    .max(1000000000),
  trafoPowerLosses: Joi.number()
    .min(0)
    .max(1000000000),
  sendingEventsEnabled: Joi.boolean(),
  sendingEmailsEnabled: Joi.boolean(),
  notificationsEnabled: Joi.boolean(),
  recipients: Joi.array()
});

/**
 * @description Method for validate if element is valid while editing - return error message if object is not valid or undefined instead
 */
let validateEdit = function(req) {
  return new Promise(async (resolve, reject) => {
    Joi.validate(req.body, powermonitorEditSchema, (err, value) => {
      if (err) {
        return resolve(err.details[0].message);
      } else {
        return resolve();
      }
    });
  });
};

//Validator for edition
module.exports.edit = validationMiddleware(validateEdit);
