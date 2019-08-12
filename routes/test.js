const express = require("express");
const router = express.Router();
const {} = require("../utilities/utilities");
const mindsphereService = require("../services/mindsphereService");

router.get("/", async (req, res) => {
  let data = await mindsphereService.getLastData(
    "7e7105980c05449fae4e63a89b3952a4",
    "TR1",
    ["Active_energy_import"]
  );
  return res.status(200).json({ data: data });
});

router.get("/getToken2", async (req, res) => {
  let data = await mindsphereService.getToken();

  return res.status(200).json({ data: data });
});

module.exports = router;
