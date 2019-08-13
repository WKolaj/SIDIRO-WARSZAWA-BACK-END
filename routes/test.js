const express = require("express");
const router = express.Router();
const {} = require("../utilities/utilities");
const mindsphereService = require("../services/mindsphereService");
const rgPZOService = require("../services/pzoRGService");
const pzoPowermonitorService = require("../services/pzoPowermonitorService");

let handler;

router.get("/start", async (req, res) => {
  handler = setInterval(async () => {
    let now = Date.now();
    await pzoPowermonitorService.sendEvent(
      new Date(now),
      `test event from date ${new Date(now).toISOString()}`,
      20
    );
  }, 5000);
  return res.status(200).send("Started");
});

router.get("/stop", async (req, res) => {
  if (handler) clearInterval(handler);

  return res.status(200).send("Started");
});

router.get("/getToken2", async (req, res) => {
  let data = await mindsphereService.getToken();

  return res.status(200).json({ data: data });
});

router.get("/setData", async (req, res) => {
  let data = await mindsphereService.postData(
    new Date(Date.now()),
    "93b2623649ee48f4adf065521ddc2bf1",
    "TEST_BACKEND",
    "Variable",
    Date.now().toString()
  );

  return res.status(200).json({ data: data });
});

router.get("/postEvent", async (req, res) => {
  let data = await mindsphereService.postEvent(
    new Date(Date.now()),
    "93b2623649ee48f4adf065521ddc2bf1",
    "test event",
    20,
    "Variable"
  );

  return res.status(200).json({ data: data });
});

module.exports = router;
