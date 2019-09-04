const express = require("express");
const router = express.Router();
const project = require("../project/project");
const isAdmin = require("../middleware/isAdmin");
const isUser = require("../middleware/isUser");

router.post("/:groupName", [isUser, isAdmin], async (req, res) => {
  const subscription = req.body;
  const groupName = req.params.groupName;

  let result = await project
    .getNotifySubscriber()
    .addSubscriber(groupName, subscription);

  return res.status(200).send(result);
});

router.delete("/:groupName", [isUser, isAdmin], async (req, res) => {
  const subscription = req.body;
  const groupName = req.params.groupName;

  let result = await project
    .getNotifySubscriber()
    .removeSubscriber(groupName, subscription);

  return res.status(200).send(result);
});

router.post("/isRegistered/:groupName", [isUser], async (req, res) => {
  const subscription = req.body;
  const groupName = req.params.groupName;

  let result = await project
    .getNotifySubscriber()
    .isSubscriberAdded(groupName, subscription);

  return res.status(200).send(result);
});

module.exports = router;
