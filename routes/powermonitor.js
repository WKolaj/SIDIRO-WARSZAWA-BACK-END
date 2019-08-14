const express = require("express");
const router = express.Router();
const project = require("../project/project");
const validate = require("../middleware/validation/powermonitor");

router.get("/", async (req, res) => {
  return res.status(200).send(project.powermonitor.Payload);
});

router.put("/", [validate.edit], async (req, res) => {
  //Editing powermonitor and returning it
  let result = await project.powermonitor.editWithPayload(req.body);
  return res.status(200).send(result.Payload);
});

module.exports = router;
