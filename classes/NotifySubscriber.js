const fs = require("fs");
const path = require("path");
const webpush = require("web-push");
const config = require("config");
const logger = require("../logger/logger");

const publicKey = config.get("notfyServerPublicKey");
const privateKey = config.get("notfyServerPrivateKey");

webpush.setVapidDetails("mailto:pzorgsiemens@gmail.com", publicKey, privateKey);

const {
  checkIfDirectoryExistsAsync,
  checkIfFileExistsAsync,
  writeFileAsync,
  readFileAsync,
  exists,
  existsAndIsNotEmpty
} = require("../utilities/utilities");

const fileName = config.get("notifySubscriberFileName");

class NotifySubscriber {
  constructor() {
    this._subscribers = {};
  }

  get Subscribers() {
    return this._subscribers;
  }

  get DirPath() {
    return this._dirPath;
  }

  get FilePath() {
    return path.join(this.DirPath, fileName);
  }

  async init(dirPath) {
    if (!(await checkIfDirectoryExistsAsync(dirPath)))
      throw new Error("given directory does not exist!");

    this._dirPath = dirPath;

    if (await checkIfFileExistsAsync(this.FilePath)) {
      await this._loadFromFile();
    }
  }

  async _loadFromFile() {
    let fileContent = JSON.parse(await readFileAsync(this.FilePath));

    if (exists(fileContent.subscribers))
      this._subscribers = fileContent.subscribers;
  }

  isSubscriberAdded(group, subscriber) {
    if (!exists(this.Subscribers[group])) return false;
    let allSubscribersStrings = this.Subscribers[group].map(subscriber => {
      return JSON.stringify(subscriber);
    });

    return allSubscribersStrings.includes(JSON.stringify(subscriber));
  }

  async addSubscriber(group, subscriber) {
    if (!exists(this.Subscribers[group])) this.Subscribers[group] = [];
    if (!this.isSubscriberAdded(group, subscriber))
      this.Subscribers[group].push(subscriber);

    await this._saveToFile();
    return subscriber;
  }

  async removeSubscriber(group, subscriber) {
    if (exists(this.Subscribers[group])) {
      if (this.isSubscriberAdded(group, subscriber)) {
        this.Subscribers[group] = this.Subscribers[group].filter(sub => {
          return JSON.stringify(sub) !== JSON.stringify(subscriber);
        });
        await this._saveToFile();
        return subscriber;
      }
    }
  }

  async _saveToFile() {
    await writeFileAsync(this.FilePath, JSON.stringify(this.Payload));
  }

  _generatePayload() {
    return {
      subscribers: this.Subscribers
    };
  }

  get Payload() {
    return this._generatePayload();
  }

  async sendNotifyMessage(group, content) {
    let allSubscribers = this.Subscribers[group];

    if (existsAndIsNotEmpty(allSubscribers)) {
      for (let subscriber of allSubscribers) {
        try {
          await webpush.sendNotification(subscriber, JSON.stringify(content));
        } catch (err) {
          logger.error(err.message, err);
        }
      }
    }
  }
}

module.exports = NotifySubscriber;
