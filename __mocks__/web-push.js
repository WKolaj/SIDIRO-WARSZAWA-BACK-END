const privateKey = null;
const publicKey = null;
const email = null;

module.exports.setVapidDetails = jest.fn((email, publicKey, privateKey) => {
  privateKey = privateKey;
  publicKey = publicKey;
  email = email;
});

module.exports.sendNotification = jest.fn(async (subscriber, content) => {});
