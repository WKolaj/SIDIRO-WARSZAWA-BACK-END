const Powermonitor = require("../../classes/Powermonitor");
const config = require("config");
const path = require("path");
const {
  checkIfDirectoryExistsAsync,
  createDirAsync,
  clearDirectoryAsync,
  writeFileAsync,
  snooze
} = require("../../utilities/utilities");

let testDirName = "_testContainer";

describe("Powermonitor", () => {
  let powermonitorDirPath;
  let powermonitorFileName;
  let powermonitorFilePath;

  beforeEach(async () => {
    powermonitorDirPath = config.get("powermonitorDirName");
    powermonitorFileName = config.get("powermonitorFileName");
    powermonitorFilePath = path.join(powermonitorDirPath, powermonitorFileName);

    //Creating test dir if it does not exist
    let testDirExists = await checkIfDirectoryExistsAsync(testDirName);
    if (!testDirExists) await createDirAsync(testDirName);

    //Clearing test directory
    await clearDirectoryAsync(testDirName);

    //Creating clear powermonitor dir
    await createDirAsync(powermonitorDirPath);
  });

  afterEach(async () => {
    //Clearing test directory if exists
    let testDirExists = await checkIfDirectoryExistsAsync(testDirName);
    if (testDirExists) await clearDirectoryAsync(testDirName);
  });

  describe("isCompletePeriodDate", () => {
    let date;

    let exec = () => {
      return Powermonitor.isCompletePeriodDate(date);
    };

    it("should return true if time is complete period (can be diveded by 15*60s)", async () => {
      date = 15657300;
      let result = await exec();

      expect(result).toEqual(true);
    });

    it("should return false if time is not complete period (can not be diveded by 15*60s)", async () => {
      date = 15657310;
      let result = await exec();

      expect(result).toEqual(false);
    });
  });

  describe("getUTCDateOfPeriodBegining", () => {
    let date;

    let exec = () => {
      return Powermonitor.getUTCDateOfPeriodBegining(date);
    };

    it("should return begining of 15-min period date for given date", async () => {
      date = 15657310;
      let result = await exec();

      expect(result).toEqual(15657300);
    });

    it("should return the same variable if it is a begining of period", async () => {
      date = 15657300;
      let result = await exec();

      expect(result).toEqual(15657300);
    });
  });

  describe("getUTCDateOfPeriodEnding", () => {
    let date;

    let exec = () => {
      return Powermonitor.getUTCDateOfPeriodEnding(date);
    };

    it("should return begining of 15-min period date for given date", async () => {
      date = 15657310;
      let result = await exec();

      expect(result).toEqual(15658200);
    });

    it("should return variable extended with 900 if it is an ending of period", async () => {
      date = 15658200;
      let result = await exec();

      expect(result).toEqual(15658200 + 15 * 60);
    });
  });

  describe("getUTCDateOfStepBegining", () => {
    let date;

    let exec = () => {
      return Powermonitor.getUTCDateOfStepBegining(date);
    };

    it("should return begining of 1-min Step date for given date", async () => {
      date = 15658220;
      let result = await exec();

      expect(result).toEqual(15658200);
    });

    it("should return the same variable if it is a begining of Step", async () => {
      date = 15658200;
      let result = await exec();

      expect(result).toEqual(15658200);
    });
  });

  describe("getUTCDateOfStepEnding", () => {
    let date;

    let exec = () => {
      return Powermonitor.getUTCDateOfStepEnding(date);
    };

    it("should return ending of 1-min Step date for given date", async () => {
      date = 15658220;
      let result = await exec();

      expect(result).toEqual(15658260);
    });

    it("should return variable extended with 60 if it is an ending of Step", async () => {
      date = 15658200;
      let result = await exec();

      expect(result).toEqual(15658200 + 60);
    });
  });

  describe("getStepNumber", () => {
    let date;

    let exec = () => {
      return Powermonitor.getStepNumber(date);
    };

    it("should return 1 if value is a begining of 15-min period", async () => {
      date = 15658200;
      let result = await exec();

      expect(result).toEqual(1);
    });

    it("should return 1 if value is between first and second step of 15-min period", async () => {
      date = 15658210;
      let result = await exec();

      expect(result).toEqual(1);
    });

    it("should return 2 if value is between second step of 15-min period", async () => {
      date = 15658260;
      let result = await exec();

      expect(result).toEqual(2);
    });

    it("should return 2 if value is between second and thrid step of 15-min period", async () => {
      date = 15658280;
      let result = await exec();

      expect(result).toEqual(2);
    });
  });

  describe("constructor", () => {
    let filePath;

    beforeEach(() => {
      filePath = "testFilePath";
    });

    let exec = () => {
      return new Powermonitor(filePath);
    };

    it("should create new Powermonitor", () => {
      let result = exec();

      expect(result).toBeDefined();
    });

    it("should set file path according to given path", () => {
      let result = exec();

      expect(result.FilePath).toEqual(filePath);
    });

    it("should initialize properties based to init values", () => {
      let result = exec();

      expect(result.CurrentPeriodStartDateUTC).toEqual(0);
      expect(result.CurrentPeriodStopDateUTC).toEqual(0);

      expect(result.CurrentStepStartDateUTC).toEqual(0);
      expect(result.CurrentStepStopDateUTC).toEqual(0);
      expect(result.CurrentStepActiveEnergyValueAtBegining).toEqual(0);
      expect(result.CurrentStepNumber).toEqual(0);

      expect(result.Warning).toEqual(false);
      expect(result.Alarm).toEqual(false);

      expect(result.ActivePowerLimitWarning).toEqual(0);
      expect(result.ActivePowerLimitAlarm).toEqual(0);

      expect(result.TrafoPowerLosses).toEqual(0);

      expect(result.ActiveEnergyOnBegining).toEqual(0);
      expect(result.ActiveEnergyOnEnding).toEqual(0);
      expect(result.AverageActivePower).toEqual(0);
      expect(result.PredictedActivePower).toEqual(0);

      expect(result.Steps).toEqual({
        "1": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "2": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "3": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "4": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "5": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "6": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "7": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "8": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "9": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "10": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "11": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "12": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "13": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "14": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "15": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        }
      });

      expect(result.Active).toEqual(false);
      expect(result.Initialized).toEqual(false);
      expect(result.Ready).toEqual(false);
    });
  });

  describe("init", () => {
    let createFile;
    let fileContent;
    let powermonitor;

    beforeEach(() => {
      createFile = true;
      fileContent = {
        currentPeriodStartDateUTC: 50,
        currentPeriodStopDateUTC: 100,
        activeEnergyOnBegining: 123,
        activeEnergyOnEnding: 321,
        averageActivePower: 1234,
        predictedActivePower: 1235,
        warning: true,
        alarm: true,
        activePowerLimitWarning: 2310,
        activePowerLimitAlarm: 3210,
        trafoPowerLosses: 123456,
        currentStepStartDateUTC: 150,
        currentStepStopDateUTC: 200,
        currentStepActiveEnergyValueAtBegining: 54321,
        currentStepNumber: 2,
        steps: {
          "1": {
            activeEnergyValue: 10,
            averageActivePower: 20,
            stepStartDateUTC: 30,
            stepStopDateUTC: 40
          },
          "2": {
            activeEnergyValue: 50,
            averageActivePower: 60,
            stepStartDateUTC: 70,
            stepStopDateUTC: 80
          },
          "3": {
            activeEnergyValue: 90,
            averageActivePower: 100,
            stepStartDateUTC: 110,
            stepStopDateUTC: 120
          },
          "4": {
            activeEnergyValue: 130,
            averageActivePower: 140,
            stepStartDateUTC: 150,
            stepStopDateUTC: 160
          },
          "5": {
            activeEnergyValue: 170,
            averageActivePower: 180,
            stepStartDateUTC: 190,
            stepStopDateUTC: 20
          },
          "6": {
            activeEnergyValue: 210,
            averageActivePower: 220,
            stepStartDateUTC: 230,
            stepStopDateUTC: 240
          },
          "7": {
            activeEnergyValue: 250,
            averageActivePower: 260,
            stepStartDateUTC: 270,
            stepStopDateUTC: 280
          },
          "8": {
            activeEnergyValue: 290,
            averageActivePower: 300,
            stepStartDateUTC: 310,
            stepStopDateUTC: 320
          },
          "9": {
            activeEnergyValue: 330,
            averageActivePower: 340,
            stepStartDateUTC: 350,
            stepStopDateUTC: 360
          },
          "10": {
            activeEnergyValue: 370,
            averageActivePower: 380,
            stepStartDateUTC: 390,
            stepStopDateUTC: 400
          },
          "11": {
            activeEnergyValue: 410,
            averageActivePower: 420,
            stepStartDateUTC: 430,
            stepStopDateUTC: 440
          },
          "12": {
            activeEnergyValue: 450,
            averageActivePower: 460,
            stepStartDateUTC: 470,
            stepStopDateUTC: 480
          },
          "13": {
            activeEnergyValue: 490,
            averageActivePower: 500,
            stepStartDateUTC: 510,
            stepStopDateUTC: 520
          },
          "14": {
            activeEnergyValue: 530,
            averageActivePower: 540,
            stepStartDateUTC: 550,
            stepStopDateUTC: 560
          },
          "15": {
            activeEnergyValue: 570,
            averageActivePower: 580,
            stepStartDateUTC: 590,
            stepStopDateUTC: 600
          }
        },
        active: true,
        ready: true
      };
    });

    let exec = async () => {
      if (createFile)
        await writeFileAsync(
          powermonitorFilePath,
          JSON.stringify(fileContent),
          "utf8"
        );

      powermonitor = new Powermonitor(path.join(powermonitorFilePath));
      return powermonitor.init();
    };

    it("should initialize all properties based on given payload - if there is a valid file", async () => {
      await exec();

      expect(powermonitor.Payload).toEqual(fileContent);
    });

    it("should set initialized to true - if there is a valid file", async () => {
      await exec();

      expect(powermonitor.Initialized).toEqual(true);
    });

    it("should not throw and leave properies as default if file does not exists", async () => {
      createFile = false;

      await exec();

      expect(powermonitor.CurrentPeriodStartDateUTC).toEqual(0);
      expect(powermonitor.CurrentPeriodStopDateUTC).toEqual(0);

      expect(powermonitor.CurrentStepStartDateUTC).toEqual(0);
      expect(powermonitor.CurrentStepStopDateUTC).toEqual(0);
      expect(powermonitor.CurrentStepActiveEnergyValueAtBegining).toEqual(0);
      expect(powermonitor.CurrentStepNumber).toEqual(0);

      expect(powermonitor.Warning).toEqual(false);
      expect(powermonitor.Alarm).toEqual(false);

      expect(powermonitor.ActivePowerLimitWarning).toEqual(0);
      expect(powermonitor.ActivePowerLimitAlarm).toEqual(0);

      expect(powermonitor.TrafoPowerLosses).toEqual(0);

      expect(powermonitor.ActiveEnergyOnBegining).toEqual(0);
      expect(powermonitor.ActiveEnergyOnEnding).toEqual(0);
      expect(powermonitor.AverageActivePower).toEqual(0);
      expect(powermonitor.PredictedActivePower).toEqual(0);

      expect(powermonitor.Steps).toEqual({
        "1": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "2": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "3": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "4": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "5": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "6": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "7": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "8": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "9": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "10": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "11": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "12": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "13": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "14": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "15": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        }
      });

      expect(powermonitor.Active).toEqual(false);
      expect(powermonitor.Ready).toEqual(false);

      //Initialzied should be set to true
      expect(powermonitor.Initialized).toEqual(true);
    });
  });

  describe("refresh", () => {
    let initialFileContent;
    let powermonitor;
    let energyValue;
    let energyDate;
    let onPeriodEndNotificationMock;
    let onAlarmActivationMock;
    let onWarningActivationMock;
    let onAlarmDeactivationMock;
    let onWarningDeactivationMock;
    let initPowermonitor;

    let initializeValuesForStep2 = () => {
      initialFileContent.predictedActivePower = 143;
      initialFileContent.currentStepStartDateUTC = 1565766060;
      initialFileContent.currentStepStopDateUTC = 1565766120;
      initialFileContent.currentStepActiveEnergyValueAtBegining = 100002.05;
      initialFileContent.currentStepNumber = 2;
      initialFileContent.steps["1"].activeEnergyValue = 100000;
      initialFileContent.steps["1"].averageActivePower = 143;
      initialFileContent.steps["1"].stepStartDateUTC = 1565766000;
      initialFileContent.steps["1"].stepStopDateUTC = 1565766060;
      initialFileContent.steps["2"].activeEnergyValue = 100002.05;
      initialFileContent.steps["2"].averageActivePower = 0;
      initialFileContent.steps["2"].stepStartDateUTC = 1565766060;
      initialFileContent.steps["2"].stepStopDateUTC = 1565766120;

      energyDate = 1565766120;
      energyValue = 100004.116666667;
    };

    let initializeValuesForStep15 = () => {
      initialFileContent.predictedActivePower = 149.933333333291;
      initialFileContent.currentStepStartDateUTC = 1565766840;
      initialFileContent.currentStepStopDateUTC = 1565766900;
      initialFileContent.currentStepActiveEnergyValueAtBegining = 100030.216666667;
      initialFileContent.currentStepNumber = 15;
      initialFileContent.steps["1"].activeEnergyValue = 100000;
      initialFileContent.steps["1"].averageActivePower = 143;
      initialFileContent.steps["1"].stepStartDateUTC = 1565766000;
      initialFileContent.steps["1"].stepStopDateUTC = 1565766060;

      initialFileContent.steps["2"].activeEnergyValue = 100002.05;
      initialFileContent.steps["2"].averageActivePower = 144;
      initialFileContent.steps["2"].stepStartDateUTC = 1565766060;
      initialFileContent.steps["2"].stepStopDateUTC = 1565766120;

      initialFileContent.steps["3"].activeEnergyValue = 100004.116666667;
      initialFileContent.steps["3"].averageActivePower = 145;
      initialFileContent.steps["3"].stepStartDateUTC = 1565766120;
      initialFileContent.steps["3"].stepStopDateUTC = 1565766180;

      initialFileContent.steps["4"].activeEnergyValue = 100006.2;
      initialFileContent.steps["4"].averageActivePower = 146;
      initialFileContent.steps["4"].stepStartDateUTC = 1565766180;
      initialFileContent.steps["4"].stepStopDateUTC = 1565766240;

      initialFileContent.steps["5"].activeEnergyValue = 100008.3;
      initialFileContent.steps["5"].averageActivePower = 147;
      initialFileContent.steps["5"].stepStartDateUTC = 1565766240;
      initialFileContent.steps["5"].stepStopDateUTC = 1565766300;

      initialFileContent.steps["6"].activeEnergyValue = 100010.416666667;
      initialFileContent.steps["6"].averageActivePower = 148;
      initialFileContent.steps["6"].stepStartDateUTC = 1565766300;
      initialFileContent.steps["6"].stepStopDateUTC = 1565766360;

      initialFileContent.steps["7"].activeEnergyValue = 100012.55;
      initialFileContent.steps["7"].averageActivePower = 149;
      initialFileContent.steps["7"].stepStartDateUTC = 1565766360;
      initialFileContent.steps["7"].stepStopDateUTC = 1565766420;

      initialFileContent.steps["8"].activeEnergyValue = 100014.7;
      initialFileContent.steps["8"].averageActivePower = 150;
      initialFileContent.steps["8"].stepStartDateUTC = 1565766420;
      initialFileContent.steps["8"].stepStopDateUTC = 1565766480;

      initialFileContent.steps["9"].activeEnergyValue = 100016.866666667;
      initialFileContent.steps["9"].averageActivePower = 151;
      initialFileContent.steps["9"].stepStartDateUTC = 1565766480;
      initialFileContent.steps["9"].stepStopDateUTC = 1565766540;

      initialFileContent.steps["10"].activeEnergyValue = 100019.05;
      initialFileContent.steps["10"].averageActivePower = 152;
      initialFileContent.steps["10"].stepStartDateUTC = 1565766540;
      initialFileContent.steps["10"].stepStopDateUTC = 1565766600;

      initialFileContent.steps["11"].activeEnergyValue = 100021.25;
      initialFileContent.steps["11"].averageActivePower = 153;
      initialFileContent.steps["11"].stepStartDateUTC = 1565766600;
      initialFileContent.steps["11"].stepStopDateUTC = 1565766660;

      initialFileContent.steps["12"].activeEnergyValue = 100023.466666667;
      initialFileContent.steps["12"].averageActivePower = 154;
      initialFileContent.steps["12"].stepStartDateUTC = 1565766660;
      initialFileContent.steps["12"].stepStopDateUTC = 1565766720;

      initialFileContent.steps["13"].activeEnergyValue = 100025.7;
      initialFileContent.steps["13"].averageActivePower = 155;
      initialFileContent.steps["13"].stepStartDateUTC = 1565766720;
      initialFileContent.steps["13"].stepStopDateUTC = 1565766780;

      initialFileContent.steps["14"].activeEnergyValue = 100027.95;
      initialFileContent.steps["14"].averageActivePower = 156;
      initialFileContent.steps["14"].stepStartDateUTC = 1565766780;
      initialFileContent.steps["14"].stepStopDateUTC = 1565766840;

      initialFileContent.steps["15"].activeEnergyValue = 100030.216666667;
      initialFileContent.steps["15"].averageActivePower = 0;
      initialFileContent.steps["15"].stepStartDateUTC = 1565766840;
      initialFileContent.steps["15"].stepStopDateUTC = 1565766900;

      energyDate = 1565766900;
      energyValue = 100032.5;
    };

    beforeEach(() => {
      onPeriodEndNotificationMock = jest.fn();
      onAlarmActivationMock = jest.fn();
      onWarningActivationMock = jest.fn();
      onAlarmDeactivationMock = jest.fn();
      onWarningDeactivationMock = jest.fn();
      initPowermonitor = true;

      initialFileContent = {
        currentPeriodStartDateUTC: 1565766000,
        currentPeriodStopDateUTC: 1565766900,
        activeEnergyOnBegining: 100000,
        activeEnergyOnEnding: 0,
        averageActivePower: 0,
        predictedActivePower: 0,
        warning: false,
        alarm: false,
        activePowerLimitWarning: 160,
        activePowerLimitAlarm: 170,
        trafoPowerLosses: 20,
        currentStepStartDateUTC: 1565766000,
        currentStepStopDateUTC: 1565766060,
        currentStepActiveEnergyValueAtBegining: 100000,
        currentStepNumber: 1,
        steps: {
          "1": {
            activeEnergyValue: 100000,
            averageActivePower: 0,
            stepStartDateUTC: 1565766000,
            stepStopDateUTC: 1565766060
          },
          "2": {
            activeEnergyValue: 0,
            averageActivePower: 0,
            stepStartDateUTC: 0,
            stepStopDateUTC: 0
          },
          "3": {
            activeEnergyValue: 0,
            averageActivePower: 0,
            stepStartDateUTC: 0,
            stepStopDateUTC: 0
          },
          "4": {
            activeEnergyValue: 0,
            averageActivePower: 0,
            stepStartDateUTC: 0,
            stepStopDateUTC: 0
          },
          "5": {
            activeEnergyValue: 0,
            averageActivePower: 0,
            stepStartDateUTC: 0,
            stepStopDateUTC: 0
          },
          "6": {
            activeEnergyValue: 0,
            averageActivePower: 0,
            stepStartDateUTC: 0,
            stepStopDateUTC: 0
          },
          "7": {
            activeEnergyValue: 0,
            averageActivePower: 0,
            stepStartDateUTC: 0,
            stepStopDateUTC: 0
          },
          "8": {
            activeEnergyValue: 0,
            averageActivePower: 0,
            stepStartDateUTC: 0,
            stepStopDateUTC: 0
          },
          "9": {
            activeEnergyValue: 0,
            averageActivePower: 0,
            stepStartDateUTC: 0,
            stepStopDateUTC: 0
          },
          "10": {
            activeEnergyValue: 0,
            averageActivePower: 0,
            stepStartDateUTC: 0,
            stepStopDateUTC: 0
          },
          "11": {
            activeEnergyValue: 0,
            averageActivePower: 0,
            stepStartDateUTC: 0,
            stepStopDateUTC: 0
          },
          "12": {
            activeEnergyValue: 0,
            averageActivePower: 0,
            stepStartDateUTC: 0,
            stepStopDateUTC: 0
          },
          "13": {
            activeEnergyValue: 0,
            averageActivePower: 0,
            stepStartDateUTC: 0,
            stepStopDateUTC: 0
          },
          "14": {
            activeEnergyValue: 0,
            averageActivePower: 0,
            stepStartDateUTC: 0,
            stepStopDateUTC: 0
          },
          "15": {
            activeEnergyValue: 0,
            averageActivePower: 0,
            stepStartDateUTC: 0,
            stepStopDateUTC: 0
          }
        },
        active: true,
        ready: true
      };

      energyDate = 1565766060;
      energyValue = 100002.05;
    });

    let exec = async () => {
      //creating initial file
      await writeFileAsync(
        powermonitorFilePath,
        JSON.stringify(initialFileContent),
        "utf8"
      );

      powermonitor = new Powermonitor(path.join(powermonitorFilePath));
      powermonitor._onPeriodEndNotification = onPeriodEndNotificationMock;
      powermonitor._onAlarmActivation = onAlarmActivationMock;
      powermonitor._onWarningActivation = onWarningActivationMock;
      powermonitor._onAlarmDeactivation = onAlarmDeactivationMock;
      powermonitor._onWarningDeactivation = onWarningDeactivationMock;

      if (initPowermonitor) await powermonitor.init();

      return powermonitor.refresh(energyDate, energyValue);
    };

    it("should not change anything if powermonitor has not been initialized", async () => {
      initPowermonitor = false;

      await exec();

      expect(powermonitor.CurrentPeriodStartDateUTC).toEqual(0);
      expect(powermonitor.CurrentPeriodStopDateUTC).toEqual(0);

      expect(powermonitor.CurrentStepStartDateUTC).toEqual(0);
      expect(powermonitor.CurrentStepStopDateUTC).toEqual(0);
      expect(powermonitor.CurrentStepActiveEnergyValueAtBegining).toEqual(0);
      expect(powermonitor.CurrentStepNumber).toEqual(0);

      expect(powermonitor.Warning).toEqual(false);
      expect(powermonitor.Alarm).toEqual(false);

      expect(powermonitor.ActivePowerLimitWarning).toEqual(0);
      expect(powermonitor.ActivePowerLimitAlarm).toEqual(0);

      expect(powermonitor.TrafoPowerLosses).toEqual(0);

      expect(powermonitor.ActiveEnergyOnBegining).toEqual(0);
      expect(powermonitor.ActiveEnergyOnEnding).toEqual(0);
      expect(powermonitor.AverageActivePower).toEqual(0);
      expect(powermonitor.PredictedActivePower).toEqual(0);

      expect(powermonitor.Steps).toEqual({
        "1": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "2": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "3": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "4": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "5": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "6": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "7": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "8": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "9": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "10": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "11": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "12": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "13": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "14": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        },
        "15": {
          activeEnergyValue: 0,
          averageActivePower: 0,
          stepStartDateUTC: 0,
          stepStopDateUTC: 0
        }
      });

      expect(powermonitor.Active).toEqual(false);
      expect(powermonitor.Initialized).toEqual(false);
      expect(powermonitor.Ready).toEqual(false);
    });

    it("should not call onAlarm/warning/activation/deactivation if ending of step 1 date is invalid ", async () => {
      initPowermonitor = false;

      await exec();

      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningActivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
    });

    it("should not change anything if powermonitor is not active", async () => {
      initialFileContent.active = false;

      await exec();

      expect(powermonitor.Payload).toEqual(initialFileContent);
    });

    it("should not call onAlarm/warning/activation/deactivation if ending of step 1 date is invalid ", async () => {
      initialFileContent.active = false;

      await exec();

      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningActivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
    });

    //Step 1

    it("should calculate new predicted active power - valid ending of step 1", async () => {
      await exec();

      //123 Power + 20 trafo power losses
      expect(powermonitor.PredictedActivePower).toBeCloseTo(143);
    });

    it("should not call onAlarm/warning/activation/deactivation if active power is below limits and Alarm/warning is not active - valid ending of step 1", async () => {
      await exec();

      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningActivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
    });

    it("should not call on period end notification - valid ending of step 1", async () => {
      await exec();

      expect(onPeriodEndNotificationMock).not.toHaveBeenCalled();
    });

    it("should call onWarningActivation if active power is above warning limit and warning is not activated - valid ending of step 1", async () => {
      initialFileContent.warning = false;
      initialFileContent.activePowerLimitWarning = 140;

      await exec();

      expect(onWarningActivationMock).toHaveBeenCalledTimes(1);
      expect(onWarningActivationMock.mock.calls[0][0]).toEqual(energyDate);
      expect(onWarningActivationMock.mock.calls[0][1]).toEqual(140);
      //123 Power + 20 trafo power losses
      expect(onWarningActivationMock.mock.calls[0][2]).toBeCloseTo(143);

      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
    });

    it("should not call onWarningActivation if active power is above warning limit and warning is activated - valid ending of step 1", async () => {
      initialFileContent.warning = true;
      initialFileContent.activePowerLimitWarning = 140;

      await exec();

      expect(onWarningActivationMock).not.toHaveBeenCalled();
      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
    });

    it("should call onWarningDeactivation if active power is below warning limit and warning is activated - valid ending of step 1", async () => {
      initialFileContent.warning = true;
      initialFileContent.activePowerLimitWarning = 150;

      await exec();

      expect(onWarningDeactivationMock).toHaveBeenCalledTimes(1);
      expect(onWarningDeactivationMock.mock.calls[0][0]).toEqual(energyDate);
      expect(onWarningDeactivationMock.mock.calls[0][1]).toEqual(150);
      //123 Power + 20 trafo power losses
      expect(onWarningDeactivationMock.mock.calls[0][2]).toBeCloseTo(143);

      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningActivationMock).not.toHaveBeenCalled();
    });

    it("should call onAlarmActivation if active power is above Alarm limit and Alarm is not activated - valid ending of step 1", async () => {
      initialFileContent.alarm = false;
      initialFileContent.activePowerLimitAlarm = 140;

      await exec();

      expect(onAlarmActivationMock).toHaveBeenCalledTimes(1);
      expect(onAlarmActivationMock.mock.calls[0][0]).toEqual(energyDate);
      expect(onAlarmActivationMock.mock.calls[0][1]).toEqual(140);
      //123 Power + 20 trafo power losses
      expect(onAlarmActivationMock.mock.calls[0][2]).toBeCloseTo(143);

      expect(onWarningActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
    });

    it("should not call onAlarmActivation if active power is above Alarm limit and Alarm is  activated - valid ending of step 1", async () => {
      initialFileContent.alarm = true;
      initialFileContent.activePowerLimitAlarm = 140;

      await exec();

      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onWarningActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
    });

    it("should call onAlarmDeactivation if active power is below alarm limit and alarm is activated - valid ending of step 1", async () => {
      initialFileContent.alarm = true;
      initialFileContent.activePowerLimitAlarm = 150;

      await exec();

      expect(onAlarmDeactivationMock).toHaveBeenCalledTimes(1);
      expect(onAlarmDeactivationMock.mock.calls[0][0]).toEqual(energyDate);
      expect(onAlarmDeactivationMock.mock.calls[0][1]).toEqual(150);
      //123 Power + 20 trafo power losses
      expect(onAlarmDeactivationMock.mock.calls[0][2]).toBeCloseTo(143);

      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningActivationMock).not.toHaveBeenCalled();
    });

    it("should set current step start and stop date to new step date and current step energy at begining - valid ending of step 1", async () => {
      await exec();

      expect(powermonitor.CurrentStepStartDateUTC).toEqual(1565766060);
      expect(powermonitor.CurrentStepStopDateUTC).toEqual(1565766120);
      expect(powermonitor.CurrentStepActiveEnergyValueAtBegining).toEqual(
        energyValue
      );
    });

    it("should set current step start and stop date and current step energy at begining to new step inside steps - valid ending of step 1", async () => {
      await exec();

      expect(powermonitor.Steps["2"].averageActivePower).toEqual(0);
      expect(powermonitor.Steps["2"].activeEnergyValue).toEqual(energyValue);
      expect(powermonitor.Steps["2"].stepStartDateUTC).toEqual(1565766060);
      expect(powermonitor.Steps["2"].stepStopDateUTC).toEqual(1565766120);
    });

    it("should set new current step number - valid ending of step 1", async () => {
      await exec();

      expect(powermonitor.CurrentStepNumber).toEqual(2);
    });

    it("should set averageActivePower inside previous step - valid ending of step 1", async () => {
      await exec();

      //123 Power + 20 trafo power losses
      expect(powermonitor.Steps["1"].averageActivePower).toBeCloseTo(143);
    });

    it("should not change anything if ending of step 1 date is invalid - cannot be devided by 60", async () => {
      energyDate = 1565766061;
      await exec();

      //123 Power + 20 trafo power losses
      expect(powermonitor.Payload).toEqual(initialFileContent);
    });

    it("should not call onAlarm/warning/activation/deactivation if ending of step 1 date is invalid ", async () => {
      energyDate = 1565766061;
      await exec();

      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningActivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
    });

    //Step 2

    it("should calculate new predicted active power - valid ending of step 2", async () => {
      initializeValuesForStep2();

      await exec();

      expect(powermonitor.PredictedActivePower).toBeCloseTo(143.933333333349);
    });

    it("should not call onAlarm/warning/activation/deactivation if active power is below limits and Alarm/warning is not active - valid ending of step 2", async () => {
      initializeValuesForStep2();

      await exec();

      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningActivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
    });

    it("should not call on period end notification - valid ending of step 2", async () => {
      initializeValuesForStep2();

      await exec();

      expect(onPeriodEndNotificationMock).not.toHaveBeenCalled();
    });

    it("should call onWarningActivation if active power is above warning limit and warning is not activated - valid ending of step 2", async () => {
      initializeValuesForStep2();

      initialFileContent.warning = false;
      initialFileContent.activePowerLimitWarning = 140;

      await exec();

      expect(onWarningActivationMock).toHaveBeenCalledTimes(1);
      expect(onWarningActivationMock.mock.calls[0][0]).toEqual(energyDate);
      expect(onWarningActivationMock.mock.calls[0][1]).toEqual(140);
      //123 Power + 20 trafo power losses
      expect(onWarningActivationMock.mock.calls[0][2]).toBeCloseTo(
        143.933333333349
      );

      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
    });

    it("should not call onWarningActivation if active power is above warning limit and warning is activated - valid ending of step 2", async () => {
      initializeValuesForStep2();

      initialFileContent.warning = true;
      initialFileContent.activePowerLimitWarning = 140;

      await exec();

      expect(onWarningActivationMock).not.toHaveBeenCalled();
      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
    });

    it("should call onWarningDeactivation if active power is below warning limit and warning is activated - valid ending of step 2", async () => {
      initializeValuesForStep2();

      initialFileContent.warning = true;
      initialFileContent.activePowerLimitWarning = 150;

      await exec();

      expect(onWarningDeactivationMock).toHaveBeenCalledTimes(1);
      expect(onWarningDeactivationMock.mock.calls[0][0]).toEqual(energyDate);
      expect(onWarningDeactivationMock.mock.calls[0][1]).toEqual(150);
      //123 Power + 20 trafo power losses
      expect(onWarningDeactivationMock.mock.calls[0][2]).toBeCloseTo(
        143.933333333349
      );

      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningActivationMock).not.toHaveBeenCalled();
    });

    it("should call onAlarmActivation if active power is above Alarm limit and Alarm is not activated - valid ending of step 2", async () => {
      initializeValuesForStep2();

      initialFileContent.alarm = false;
      initialFileContent.activePowerLimitAlarm = 140;

      await exec();

      expect(onAlarmActivationMock).toHaveBeenCalledTimes(1);
      expect(onAlarmActivationMock.mock.calls[0][0]).toEqual(energyDate);
      expect(onAlarmActivationMock.mock.calls[0][1]).toEqual(140);
      //123 Power + 20 trafo power losses
      expect(onAlarmActivationMock.mock.calls[0][2]).toBeCloseTo(
        143.933333333349
      );

      expect(onWarningActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
    });

    it("should not call onAlarmActivation if active power is above Alarm limit and Alarm is  activated - valid ending of step 2", async () => {
      initializeValuesForStep2();

      initialFileContent.alarm = true;
      initialFileContent.activePowerLimitAlarm = 140;

      await exec();

      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onWarningActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
    });

    it("should call onAlarmDeactivation if active power is below alarm limit and alarm is activated - valid ending of step 2", async () => {
      initializeValuesForStep2();

      initialFileContent.alarm = true;
      initialFileContent.activePowerLimitAlarm = 150;

      await exec();

      expect(onAlarmDeactivationMock).toHaveBeenCalledTimes(1);
      expect(onAlarmDeactivationMock.mock.calls[0][0]).toEqual(energyDate);
      expect(onAlarmDeactivationMock.mock.calls[0][1]).toEqual(150);
      //123 Power + 20 trafo power losses
      expect(onAlarmDeactivationMock.mock.calls[0][2]).toBeCloseTo(
        143.933333333349
      );

      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningActivationMock).not.toHaveBeenCalled();
    });

    it("should set current step start and stop date to new step date and current step energy at begining - valid ending of step 2", async () => {
      initializeValuesForStep2();

      await exec();

      expect(powermonitor.CurrentStepStartDateUTC).toEqual(1565766120);
      expect(powermonitor.CurrentStepStopDateUTC).toEqual(1565766180);
      expect(powermonitor.CurrentStepActiveEnergyValueAtBegining).toEqual(
        energyValue
      );
    });

    it("should set current step start and stop date and current step energy at begining to new step inside steps - valid ending of step 2", async () => {
      initializeValuesForStep2();

      await exec();

      expect(powermonitor.Steps["3"].averageActivePower).toEqual(0);
      expect(powermonitor.Steps["3"].activeEnergyValue).toEqual(energyValue);
      expect(powermonitor.Steps["3"].stepStartDateUTC).toEqual(1565766120);
      expect(powermonitor.Steps["3"].stepStopDateUTC).toEqual(1565766180);
    });

    it("should set new current step number - valid ending of step 2", async () => {
      initializeValuesForStep2();

      await exec();

      expect(powermonitor.CurrentStepNumber).toEqual(3);
    });

    it("should set averageActivePower inside previous step - valid ending of step 2", async () => {
      initializeValuesForStep2();

      await exec();

      //124 Power + 20 trafo power losses
      expect(powermonitor.Steps["2"].averageActivePower).toBeCloseTo(144);
    });

    it("should not change anything if ending of step 2 date is invalid - cannot be devided by 60", async () => {
      initializeValuesForStep2();

      energyDate = 1565766121;
      await exec();

      //123 Power + 20 trafo power losses
      expect(powermonitor.Payload).toEqual(initialFileContent);
    });

    it("should not call onAlarm/warning/activation/deactivation if ending of step 2 date is invalid ", async () => {
      initializeValuesForStep2();

      energyDate = 1565766121;
      await exec();

      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningActivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
    });

    //Step 5 - omit 3,4,5

    it("should not calculate new predicted active power - invalid ending of step2 - skip to step 5", async () => {
      initializeValuesForStep2();
      energyDate = 1565766240;
      energyValue = 100008.3;

      await exec();

      expect(powermonitor.PredictedActivePower).toBeCloseTo(143);
    });

    it("should set current step start and stop date to new step date and current step energy at begining - invalid ending of step2 - skip to step 5", async () => {
      initializeValuesForStep2();
      energyDate = 1565766240;
      energyValue = 100008.3;

      await exec();

      expect(powermonitor.CurrentStepStartDateUTC).toEqual(1565766240);
      expect(powermonitor.CurrentStepStopDateUTC).toEqual(1565766300);
      expect(powermonitor.CurrentStepActiveEnergyValueAtBegining).toEqual(
        energyValue
      );
    });

    it("should set current step start and stop date and current step energy at begining to new step inside steps - invalid ending of step2 - skip to step 5", async () => {
      initializeValuesForStep2();
      energyDate = 1565766240;
      energyValue = 100008.3;

      await exec();

      expect(powermonitor.Steps["5"].averageActivePower).toEqual(0);
      expect(powermonitor.Steps["5"].activeEnergyValue).toEqual(energyValue);
      expect(powermonitor.Steps["5"].stepStartDateUTC).toEqual(1565766240);
      expect(powermonitor.Steps["5"].stepStopDateUTC).toEqual(1565766300);
    });

    it("should set new current step number - invalid ending of step2 - skip to step 5", async () => {
      initializeValuesForStep2();
      energyDate = 1565766240;
      energyValue = 100008.3;

      await exec();

      expect(powermonitor.CurrentStepNumber).toEqual(5);
    });

    it("should not set averageActivePower inside previous step - invalid ending of step2 - skip to step 5", async () => {
      initializeValuesForStep2();
      energyDate = 1565766240;
      energyValue = 100008.3;

      await exec();

      //124 Power + 20 trafo power losses
      expect(powermonitor.Steps["2"].averageActivePower).toEqual(0);
    });

    it("should not change anything if ending of step 2 date is invalid - cannot be divided by 60", async () => {
      initializeValuesForStep2();
      energyDate = 1565766241;
      await exec();

      //123 Power + 20 trafo power losses
      expect(powermonitor.Payload).toEqual(initialFileContent);
    });

    it("should not call onAlarm/warning/activation/deactivation if ending of step 2 date is invalid ", async () => {
      initializeValuesForStep2();
      energyDate = 1565766240;
      energyValue = 100008.3;

      energyDate = 1565766241;
      await exec();

      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningActivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
    });

    //Step 15

    it("should start completly new period - valid ending of step 15", async () => {
      initializeValuesForStep15();

      await exec();

      expect(powermonitor.CurrentPeriodStartDateUTC).toEqual(1565766900);
      expect(powermonitor.CurrentPeriodStopDateUTC).toEqual(1565767800);
    });

    it("should reset stepNumber to 1 - valid ending of step 15", async () => {
      initializeValuesForStep15();

      await exec();

      expect(powermonitor.CurrentStepNumber).toEqual(1);
    });

    it("should reset predicted active power and average active power to 0 - valid ending of step 15", async () => {
      initializeValuesForStep15();

      await exec();

      expect(powermonitor.PredictedActivePower).toEqual(0);
      expect(powermonitor.AverageActivePower).toEqual(0);
    });

    it("should set new Active energy on begining and set active energy on ending to 0 - valid ending of step 15", async () => {
      initializeValuesForStep15();

      await exec();

      expect(powermonitor.ActiveEnergyOnBegining).toEqual(energyValue);
      expect(powermonitor.ActiveEnergyOnEnding).toEqual(0);
    });

    it("should set current step to 1 and initialize it - valid ending of step 15", async () => {
      initializeValuesForStep15();

      await exec();

      expect(powermonitor.CurrentStepNumber).toEqual(1);
      expect(powermonitor.CurrentStepActiveEnergyValueAtBegining).toEqual(
        energyValue
      );
      expect(powermonitor.CurrentStepStartDateUTC).toEqual(1565766900);
      expect(powermonitor.CurrentStepStopDateUTC).toEqual(1565766960);

      expect(powermonitor.Steps["1"].activeEnergyValue).toEqual(energyValue);
      expect(powermonitor.Steps["1"].averageActivePower).toEqual(0);
      expect(powermonitor.Steps["1"].stepStartDateUTC).toEqual(1565766900);
      expect(powermonitor.Steps["1"].stepStopDateUTC).toEqual(1565766960);

      for (let i = 2; i <= 15; i++) {
        expect(powermonitor.Steps[i.toString()].activeEnergyValue).toEqual(0);
        expect(powermonitor.Steps[i.toString()].averageActivePower).toEqual(0);
        expect(powermonitor.Steps[i.toString()].stepStartDateUTC).toEqual(0);
        expect(powermonitor.Steps[i.toString()].stepStopDateUTC).toEqual(0);
      }
    });

    it("should not call onAlarm/warning/activation/deactivation even if new calculated predicted active power is above limits  - valid ending of step 15 ", async () => {
      initializeValuesForStep15();
      initialFileContent.alarm = false;
      initialFileContent.warning = false;
      initialFileContent.ActivePowerLimitAlarm = 100;
      initialFileContent.ActivePowerLimitWarning = 100;

      await exec();

      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningActivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
    });

    it("should call _onPeriodEndNotification with proper arguments - valid ending of step 15 ", async () => {
      initializeValuesForStep15();

      await exec();

      expect(onPeriodEndNotificationMock).toHaveBeenCalledTimes(1);
      expect(onPeriodEndNotificationMock.mock.calls[0][0]).toEqual(energyDate);
      expect(onPeriodEndNotificationMock.mock.calls[0][1]).toEqual(150);
    });

    it("should not start new period but set ready to false - if new timestamp is from different period but not a proper ending on previous period - invalid ending of step 15", async () => {
      initializeValuesForStep15();

      energyDate = 1565766960;
      await exec();

      expect(powermonitor.Payload).toEqual({
        ...initialFileContent,
        ready: false
      });
    });

    it("should start completly new period - invalid ending of step 15 - additional offset in time", async () => {
      initializeValuesForStep15();
      energyDate = 1565766900 + 900;

      await exec();

      expect(powermonitor.CurrentPeriodStartDateUTC).toEqual(1565766900 + 900);
      expect(powermonitor.CurrentPeriodStopDateUTC).toEqual(1565767800 + 900);
    });

    it("should reset stepNumber to 1 - invalid ending of step 15 - additional offset in time", async () => {
      initializeValuesForStep15();
      energyDate = 1565766900 + 900;

      await exec();

      expect(powermonitor.CurrentStepNumber).toEqual(1);
    });

    it("should reset predicted active power and average active power to 0 - invalid ending of step 15 - additional offset in time", async () => {
      initializeValuesForStep15();
      energyDate = 1565766900 + 900;

      await exec();

      expect(powermonitor.PredictedActivePower).toEqual(0);
      expect(powermonitor.AverageActivePower).toEqual(0);
    });

    it("should set new Active energy on begining and set active energy on ending to 0 - invalid ending of step 15 - additional offset in time", async () => {
      initializeValuesForStep15();
      energyDate = 1565766900 + 900;

      await exec();

      expect(powermonitor.ActiveEnergyOnBegining).toEqual(energyValue);
      expect(powermonitor.ActiveEnergyOnEnding).toEqual(0);
    });

    it("should set current step to 1 and initialize it - invalid ending of step 15 - additional offset in time", async () => {
      initializeValuesForStep15();
      energyDate = 1565766900 + 900;

      await exec();

      expect(powermonitor.CurrentStepNumber).toEqual(1);
      expect(powermonitor.CurrentStepActiveEnergyValueAtBegining).toEqual(
        energyValue
      );
      expect(powermonitor.CurrentStepStartDateUTC).toEqual(1565766900 + 900);
      expect(powermonitor.CurrentStepStopDateUTC).toEqual(1565766960 + 900);

      expect(powermonitor.Steps["1"].activeEnergyValue).toEqual(energyValue);
      expect(powermonitor.Steps["1"].averageActivePower).toEqual(0);
      expect(powermonitor.Steps["1"].stepStartDateUTC).toEqual(
        1565766900 + 900
      );
      expect(powermonitor.Steps["1"].stepStopDateUTC).toEqual(1565766960 + 900);

      for (let i = 2; i <= 15; i++) {
        expect(powermonitor.Steps[i.toString()].activeEnergyValue).toEqual(0);
        expect(powermonitor.Steps[i.toString()].averageActivePower).toEqual(0);
        expect(powermonitor.Steps[i.toString()].stepStartDateUTC).toEqual(0);
        expect(powermonitor.Steps[i.toString()].stepStopDateUTC).toEqual(0);
      }
    });

    it("should not call onAlarm/warning/activation/deactivation even if new calculated predicted active power is above limits  - invalid ending of step 15 - additional offset in time ", async () => {
      initializeValuesForStep15();
      energyDate = 1565766900 + 900;

      initialFileContent.alarm = false;
      initialFileContent.warning = false;
      initialFileContent.ActivePowerLimitAlarm = 100;
      initialFileContent.ActivePowerLimitWarning = 100;

      await exec();

      expect(onAlarmActivationMock).not.toHaveBeenCalled();
      expect(onAlarmDeactivationMock).not.toHaveBeenCalled();
      expect(onWarningActivationMock).not.toHaveBeenCalled();
      expect(onWarningDeactivationMock).not.toHaveBeenCalled();
    });

    it("should not call _onPeriodEndNotification - invalid ending of step 15 - additional offset in time ", async () => {
      initializeValuesForStep15();
      energyDate = 1565766900 + 900;

      await exec();

      expect(onPeriodEndNotificationMock).not.toHaveBeenCalled();
    });

    it("should not start new period but set ready to false - if new timestamp is from different period but not a proper ending on previous period - ininvalid ending of step 15 - additional offset in time", async () => {
      initializeValuesForStep15();
      energyDate = 1565766900 + 960;

      await exec();

      expect(powermonitor.Payload).toEqual({
        ...initialFileContent,
        ready: false
      });
    });

    //starting new period after invalid period

    it("should start new period if new energy date is complete valid period", async () => {
      initialFileContent.ready = false;
      energyDate = 1565766900;

      await exec();

      expect(powermonitor.Ready).toEqual(true);
      expect(powermonitor.CurrentPeriodStartDateUTC).toEqual(1565766900);
      expect(powermonitor.CurrentPeriodStopDateUTC).toEqual(1565767800);
    });
  });
});
