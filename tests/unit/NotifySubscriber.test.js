const {
  clearDirectoryAsync,
  writeFileAsync,
  readFileAsync
} = require("../../utilities/utilities");

const testDirPath = "_testContainer";
const subscriberFilePath = "_testContainer/notifySubscriber.json";
let webpush = null;
let NotifySubscriber = null;

describe("NotifySubscriber", () => {
  beforeEach(async () => {
    await clearDirectoryAsync(testDirPath);
    NotifySubscriber = require("../../classes/NotifySubscriber");
    webpush = require("web-push");
  });

  afterEach(async () => {
    await clearDirectoryAsync(testDirPath);
    await jest.resetModules();
  });

  describe("constructor", () => {
    let exec = () => {
      return new NotifySubscriber();
    };

    it("should return new object of notifySubscriber", () => {
      let result = exec();

      expect(result).toBeDefined();
    });

    it("should set Subscribers to empty object", () => {
      let result = exec();

      expect(result.Subscribers).toEqual({});
    });
  });

  describe("init", () => {
    let initialSubscribers;
    let notifySubscriber;
    let dirName;

    beforeEach(async () => {
      initialSubscribers = {
        group1: [{ id: "subscriber1" }, { id: "subscriber2" }],

        group2: [{ id: "subscriber3" }, { id: "subscriber4" }],

        group3: [{ id: "subscriber5" }, { id: "subscriber6" }]
      };

      await writeFileAsync(
        subscriberFilePath,
        JSON.stringify({
          subscribers: initialSubscribers
        })
      );

      dirName = testDirPath;
    });

    let exec = async () => {
      notifySubscriber = new NotifySubscriber();
      return notifySubscriber.init(dirName);
    };

    it("should set dirPath to given value", async () => {
      await exec();

      expect(notifySubscriber.DirPath).toEqual(dirName);
    });

    it("should inialize subscriber based on file content", async () => {
      await exec();

      expect(notifySubscriber.Payload).toEqual({
        subscribers: initialSubscribers
      });
    });

    it("should inialize subscriber based on file content", async () => {
      await exec();

      expect(notifySubscriber.Payload).toEqual({
        subscribers: initialSubscribers
      });
    });

    it("should throw if dir is fake", async () => {
      dirName = "fakeDir";

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });
  });

  describe("addSubscriber", () => {
    let initialSubscribers;
    let notifySubscriber;
    let group = "group4";
    let subscriber = { id: "subscriber7" };
    let dirName;

    beforeEach(async () => {
      initialSubscribers = {
        group1: [{ id: "subscriber1" }, { id: "subscriber2" }],

        group2: [{ id: "subscriber3" }, { id: "subscriber4" }],

        group3: [{ id: "subscriber5" }, { id: "subscriber6" }]
      };

      await writeFileAsync(
        subscriberFilePath,
        JSON.stringify({
          subscribers: initialSubscribers
        })
      );

      dirName = testDirPath;
    });

    let exec = async () => {
      notifySubscriber = new NotifySubscriber();
      await notifySubscriber.init(dirName);
      return notifySubscriber.addSubscriber(group, subscriber);
    };

    it("should return created subscriber", async () => {
      let result = await exec();

      expect(result).toEqual(subscriber);
    });

    it("should create new group if it does not exists and add new subscriber to it", async () => {
      let result = await exec();

      expect(notifySubscriber.Subscribers[group]).toBeDefined();
      expect(notifySubscriber.Subscribers[group].length).toEqual(1);
      expect(notifySubscriber.Subscribers[group][0]).toEqual(subscriber);
    });

    it("should not create new group but append current group with new subscriber - if group exists", async () => {
      group = "group2";

      let result = await exec();

      expect(notifySubscriber.Subscribers[group]).toBeDefined();
      expect(notifySubscriber.Subscribers[group].length).toEqual(3);
      expect(notifySubscriber.Subscribers[group]).toEqual([
        ...initialSubscribers[group],
        subscriber
      ]);
    });

    it("should not create new group but and not append current group with new subscriber - if group and subscriber exists", async () => {
      group = "group2";
      subscriber = { id: "subscriber4" };

      let result = await exec();

      expect(notifySubscriber.Subscribers[group]).toBeDefined();
      expect(notifySubscriber.Subscribers[group].length).toEqual(2);
      expect(notifySubscriber.Subscribers[group]).toEqual([
        ...initialSubscribers[group]
      ]);
    });

    it("should save new Payload to file content", async () => {
      let result = await exec();

      let fileContent = JSON.parse(await readFileAsync(subscriberFilePath));

      expect(notifySubscriber.Payload).toEqual(fileContent);
    });
  });

  describe("removeSubscriber", () => {
    let initialSubscribers;
    let notifySubscriber;
    let group;
    let subscriber;
    let dirName;

    beforeEach(async () => {
      group = "group2";
      subscriber = { id: "subscriber4" };

      initialSubscribers = {
        group1: [{ id: "subscriber1" }, { id: "subscriber2" }],

        group2: [{ id: "subscriber3" }, { id: "subscriber4" }],

        group3: [{ id: "subscriber5" }, { id: "subscriber6" }]
      };

      await writeFileAsync(
        subscriberFilePath,
        JSON.stringify({
          subscribers: initialSubscribers
        })
      );

      dirName = testDirPath;
    });

    let exec = async () => {
      notifySubscriber = new NotifySubscriber();
      await notifySubscriber.init(dirName);
      return notifySubscriber.removeSubscriber(group, subscriber);
    };

    it("should return removed subscriber", async () => {
      let result = await exec();

      expect(result).toEqual(subscriber);
    });

    it("should remove subscriber from notifySubscriber if group and subscriber exist", async () => {
      let result = await exec();

      expectedSubscribers = {
        group1: [{ id: "subscriber1" }, { id: "subscriber2" }],

        group2: [{ id: "subscriber3" }],

        group3: [{ id: "subscriber5" }, { id: "subscriber6" }]
      };

      expect(notifySubscriber.Subscribers).toEqual(expectedSubscribers);
    });

    it("should not remove and not throw if group does not exist", async () => {
      group = "group4";
      let result = await exec();

      expect(notifySubscriber.Subscribers).toEqual(initialSubscribers);
    });

    it("should not remove and not throw if subscriber does not exist", async () => {
      subscriber = { id: "subscriber9" };
      let result = await exec();

      expect(notifySubscriber.Subscribers).toEqual(initialSubscribers);
    });

    it("should save subscribers file with new changes", async () => {
      let result = await exec();

      expectedSubscribers = {
        group1: [{ id: "subscriber1" }, { id: "subscriber2" }],

        group2: [{ id: "subscriber3" }],

        group3: [{ id: "subscriber5" }, { id: "subscriber6" }]
      };

      let fileContent = JSON.parse(await readFileAsync(subscriberFilePath));

      expect(fileContent.subscribers).toEqual(expectedSubscribers);
    });
  });

  describe("sendNotifyMessage", () => {
    let initialSubscribers;
    let notifySubscriber;
    let group;
    let content;
    let dirName;

    beforeEach(async () => {
      group = "group2";
      content = { title: "testContent" };

      initialSubscribers = {
        group1: [{ id: "subscriber1" }, { id: "subscriber2" }],

        group2: [{ id: "subscriber3" }, { id: "subscriber4" }],

        group3: [{ id: "subscriber5" }, { id: "subscriber6" }]
      };

      await writeFileAsync(
        subscriberFilePath,
        JSON.stringify({
          subscribers: initialSubscribers
        })
      );

      dirName = testDirPath;
    });

    let exec = async () => {
      notifySubscriber = new NotifySubscriber();
      await notifySubscriber.init(dirName);
      return notifySubscriber.sendNotifyMessage(group, content);
    };

    it("should call webpusher.sendNotification for every subscriber in group", async () => {
      let result = await exec();

      expect(webpush.sendNotification).toHaveBeenCalledTimes(2);

      expect(webpush.sendNotification.mock.calls[0][0]).toEqual(
        initialSubscribers[group][0]
      );
      expect(webpush.sendNotification.mock.calls[0][1]).toEqual(
        JSON.stringify(content)
      );

      expect(webpush.sendNotification.mock.calls[1][0]).toEqual(
        initialSubscribers[group][1]
      );
      expect(webpush.sendNotification.mock.calls[1][1]).toEqual(
        JSON.stringify(content)
      );
    });

    it("should not call webpusher.sendNotification if there is no such group", async () => {
      group = "fakeGroup";

      let result = await exec();

      expect(webpush.sendNotification).not.toHaveBeenCalled();
    });

    it("should not call webpusher.sendNotification if there is no subscriber in groups", async () => {
      initialSubscribers = {
        group1: [{ id: "subscriber1" }, { id: "subscriber2" }],

        group2: [],

        group3: [{ id: "subscriber5" }, { id: "subscriber6" }]
      };

      await writeFileAsync(
        subscriberFilePath,
        JSON.stringify({
          subscribers: initialSubscribers
        })
      );

      group = "group2";

      let result = await exec();

      expect(webpush.sendNotification).not.toHaveBeenCalled();
    });
  });
});
