const {
  checkIfFileExistsAsync,
  readFileAsync,
  isValidJson,
  exists
} = require("../utilities/utilities");
const { writeFileAsync } = require("../utilities/utilities");

class Powermonitor {
  constructor(filePath) {
    this._filePath = filePath;

    this._currentPeriodStartDateUTC = 0;
    this._currentPeriodStopDateUTC = 0;
    this._currentStepStartDateUTC = 0;
    this._currentStepStopDateUTC = 0;
    this._activeEnergyOnBegining = 0;
    this._activeEnergyOnEnding = 0;
    this._averageActivePower = 0;
    this._predictedActivePower = 0;
    this._activePowerLimitWarning = 0;
    this._activePowerLimitAlarm = 0;
    this._currentStepActiveEnergyValueAtBegining = 0;
    this._steps = {
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
    };

    this._active = false;

    this._initialized = false;
    this._ready = false;
    this._currentStepNumber = 0;
    this._warning = false;
    this._alarm = false;

    this._trafoPowerLosses = 0;
  }

  /**
   * @description Method called on the end of valid period - should be override in child classes
   */
  async _onPeriodEndNotification(periodDate, periodTotalActivePower) {}

  /**
   * @description Method called on alert activation - should be override in child classes
   */
  async _onAlarmActivation(periodDate, alertLimit, predictedTotalActivePower) {}

  /**
   * @description Method called on alert activation - should be override in child classes
   */
  async _onWarningActivation(
    periodDate,
    warningLimit,
    predictedTotalActivePower
  ) {}

  /**
   * @description Method called on alert deactivation - should be override in child classes
   */
  async _onAlarmDeactivation(
    periodDate,
    alertLimit,
    predictedTotalActivePower
  ) {}

  /**
   * @description Method called on alert deactivation - should be override in child classes
   */
  async _onWarningDeactivation(
    periodDate,
    warningLimit,
    predictedTotalActivePower
  ) {}

  /**
   * @description Method for initializing powermonitor - based on file if exists or anew
   */
  async init() {
    let fileExists = await checkIfFileExistsAsync(this.FilePath);

    if (fileExists) {
      //Initializng based on file content
      let fileContent = await readFileAsync(this.FilePath, "utf8");

      if (isValidJson(fileContent)) {
        let jsonFileContent = JSON.parse(fileContent);
        await this._initBasedOnFilePayload(jsonFileContent);
      }
    }

    this._initialized = true;
  }

  /**
   * @description Method for initializing powermonitor based on file payload
   * @param {object} filePayload File payload
   */
  async _initBasedOnFilePayload(filePayload) {
    if (exists(filePayload.currentPeriodStartDateUTC))
      this._currentPeriodStartDateUTC = filePayload.currentPeriodStartDateUTC;

    if (exists(filePayload.currentPeriodStopDateUTC));
    this._currentPeriodStopDateUTC = filePayload.currentPeriodStopDateUTC;

    if (exists(filePayload.currentStepStartDateUTC))
      this._currentStepStartDateUTC = filePayload.currentStepStartDateUTC;

    if (exists(filePayload.currentStepStopDateUTC));
    this._currentStepStopDateUTC = filePayload.currentStepStopDateUTC;

    if (exists(filePayload.activeEnergyOnBegining));
    this._activeEnergyOnBegining = filePayload.activeEnergyOnBegining;

    if (exists(filePayload.activeEnergyOnEnding));
    this._activeEnergyOnEnding = filePayload.activeEnergyOnEnding;

    if (exists(filePayload.averageActivePower));
    this._averageActivePower = filePayload.averageActivePower;

    if (exists(filePayload.predictedActivePower));
    this._predictedActivePower = filePayload.predictedActivePower;

    if (exists(filePayload.activePowerLimitWarning));
    this._activePowerLimitWarning = filePayload.activePowerLimitWarning;

    if (exists(filePayload.activePowerLimitAlarm));
    this._activePowerLimitAlarm = filePayload.activePowerLimitAlarm;

    if (exists(filePayload.currentStepActiveEnergyValueAtBegining));
    this._currentStepActiveEnergyValueAtBegining =
      filePayload.currentStepActiveEnergyValueAtBegining;

    if (exists(filePayload.steps));
    this._steps = filePayload.steps;

    if (exists(filePayload.active));
    this._active = filePayload.active;

    if (exists(filePayload.ready));
    this._ready = filePayload.ready;

    if (exists(filePayload.currentStepNumber));
    this._currentStepNumber = filePayload.currentStepNumber;

    if (exists(filePayload.warning));
    this._warning = filePayload.warning;

    if (exists(filePayload.alarm));
    this._alarm = filePayload.alarm;

    if (exists(filePayload.trafoPowerLosses));
    this._trafoPowerLosses = filePayload.trafoPowerLosses;
  }

  /**
   * @description File path representing powermonitor
   */
  get FilePath() {
    return this._filePath;
  }

  /**
   * @description Is warning active in powermonitor
   */
  get Warning() {
    return this._warning;
  }

  /**
   * @description Is alarm active in powermonitor
   */
  get Alarm() {
    return this._alarm;
  }

  /**
   * @description Date of starting current period in UTC
   */
  get CurrentPeriodStartDateUTC() {
    return this._currentPeriodStartDateUTC;
  }

  /**
   * @description Date of ending current period in UTC
   */
  get CurrentPeriodStopDateUTC() {
    return this._currentPeriodStopDateUTC;
  }

  /**
   * @description Date of starting current step in UTC
   */
  get CurrentStepStartDateUTC() {
    return this._currentStepStartDateUTC;
  }

  /**
   * @description Date of ending current step in UTC
   */
  get CurrentStepStopDateUTC() {
    return this._currentStepStopDateUTC;
  }

  /**
   * @description Active energy on begining of period
   */
  get ActiveEnergyOnBegining() {
    return this._activeEnergyOnBegining;
  }

  /**
   * @description Active energy on ending of period
   */
  get ActiveEnergyOnEnding() {
    return this._activeEnergyOnEnding;
  }

  /**
   * @description Average active power calculated on the basis of energy on end and start of period
   */
  get AverageActivePower() {
    return this._averageActivePower;
  }

  /**
   * @description Current predicted average active power
   */
  get PredictedActivePower() {
    return this._predictedActivePower;
  }

  /**
   * @description Active power warning limit
   */
  get ActivePowerLimitWarning() {
    return this._activePowerLimitWarning;
  }

  /**
   * @description Active power alert limit
   */
  get ActivePowerLimitAlarm() {
    return this._activePowerLimitAlarm;
  }

  /**
   * @description Value of active energy on the begining of current step
   */
  get CurrentStepActiveEnergyValueAtBegining() {
    return this._currentStepActiveEnergyValueAtBegining;
  }

  /**
   * @description Current step number
   */
  get CurrentStepNumber() {
    return this._currentStepNumber;
  }

  /**
   * @description is powermonitor active
   */
  get Active() {
    return this._active;
  }

  /**
   * @description Calculated steps
   */
  get Steps() {
    return this._steps;
  }

  /**
   * @description is powermonitor initialized
   */
  get Initialized() {
    return this._initialized;
  }

  /**
   * @description is powermonitor ready to make calculations - used for waiting for begning of period on the begining
   */
  get Ready() {
    return this._ready;
  }

  /**
   * @description Method for generating payload representing powermonitor element
   */
  _generatePayload() {
    return {
      currentPeriodStartDateUTC: this.CurrentPeriodStartDateUTC,
      currentPeriodStopDateUTC: this.CurrentPeriodStopDateUTC,
      currentStepStartDateUTC: this.CurrentStepStartDateUTC,
      currentStepStopDateUTC: this.CurrentStepStopDateUTC,
      activeEnergyOnBegining: this.ActiveEnergyOnBegining,
      activeEnergyOnEnding: this.ActiveEnergyOnEnding,
      averageActivePower: this.AverageActivePower,
      predictedActivePower: this.PredictedActivePower,
      activePowerLimitWarning: this.ActivePowerLimitWarning,
      activePowerLimitAlarm: this.ActivePowerLimitAlarm,
      currentStepActiveEnergyValueAtBegining: this
        .CurrentStepActiveEnergyValueAtBegining,
      steps: this.Steps,
      active: this.Active,
      ready: this.Ready,
      currentStepNumber: this.CurrentStepNumber,
      alarm: this.Alarm,
      warning: this.Warning,
      trafoPowerLosses: this.TrafoPowerLosses
    };
  }

  /**
   * @description Payload representing powermonitor element
   */
  get Payload() {
    return this._generatePayload();
  }

  /**
   * @description trafo power losses added to active power
   */
  get TrafoPowerLosses() {
    return this._trafoPowerLosses;
  }

  /**
   * @description Method for refreshing powermonitor mechanism
   * @param {number} energyDate Date of new energy value (in UTC, UNIX)
   * @param {number} energyValue New energy valu
   */
  async refresh(energyDate, energyValue) {
    //Do nothing if not initialized yet
    if (!this.Initialized) return;

    //Do nothing it is not active
    if (!this.Active) return;

    //If new date is not a date of complete step - it is pointless to continue
    if (!Powermonitor.isCompleteStepDate(energyDate)) return;

    if (!this.Ready) {
      //if not ready - wait for begining of period

      if (Powermonitor.isCompletePeriodDate(energyDate)) {
        await this._startPowermonitor(energyDate, energyValue);
      }
    } else {
      await this._refreshPowermonitor(energyDate, energyValue);
    }

    //Refreshing limit values
    await this._checkLimits(energyDate, energyValue);

    //Saving changes
    await this._notifyChange();
  }

  /**
   * @description Method for activating alert
   */
  async _activeAlarm(periodDate, alertLimit, predictedTotalActivePower) {
    this._alarm = true;
    await this._onAlarmActivation(
      periodDate,
      alertLimit,
      predictedTotalActivePower
    );
  }

  /**
   * @description Method for deactivating alert
   */
  async _deactiveAlarm(periodDate, alertLimit, predictedTotalActivePower) {
    this._alarm = false;
    await this._onAlarmDeactivation(
      periodDate,
      alertLimit,
      predictedTotalActivePower
    );
  }

  /**
   * @description Method for activating alert
   */
  async _activeWarning(periodDate, warningLimit, predictedTotalActivePower) {
    this._warning = true;
    await this._onWarningActivation(
      periodDate,
      warningLimit,
      predictedTotalActivePower
    );
  }

  /**
   * @description Method for deactivating alert
   */
  async _deactiveWarning(periodDate, warningLimit, predictedTotalActivePower) {
    this._warning = false;
    await this._onWarningDeactivation(
      periodDate,
      warningLimit,
      predictedTotalActivePower
    );
  }

  /**
   * @description Method for checking predicted active power vs limits
   */
  async _checkLimits(energyDate, energyValue) {
    //Checking warning
    if (this.PredictedActivePower >= this.ActivePowerLimitWarning) {
      //Warning

      //Activate warning if not activate
      if (!this.Warning)
        await this._activeWarning(
          energyDate,
          this.ActivePowerLimitWarning,
          this.PredictedActivePower
        );
    } else {
      //Deactive  warning

      //Deactivate warninig if activate
      if (this.Warning)
        await this._deactiveWarning(
          energyDate,
          this.ActivePowerLimitWarning,
          this.PredictedActivePower
        );
    }

    //Checking alert
    if (this.PredictedActivePower >= this.ActivePowerLimitAlarm) {
      //Alarm

      //Activate alarm if not activate
      if (!this.Alarm)
        await this._activeAlarm(
          energyDate,
          this.ActivePowerLimitAlarm,
          this.PredictedActivePower
        );
    } else {
      //Deactivate alert

      //Deactivate alarm if activate
      if (this.Alarm)
        await this._deactiveAlarm(
          energyDate,
          this.ActivePowerLimitAlarm,
          this.PredictedActivePower
        );
    }
  }

  /**
   * @description Method for starting powermonitor mechanism
   */
  async _startPowermonitor(energyDate, energyValue) {
    await this._startNewPeriod(energyDate, energyValue);
    this._ready = true;
  }

  /**
   * @description Method for stopping powermonitor mechanism
   */
  async _stopPowermonitor() {
    this._ready = false;
  }

  /**
   * @description Method for starting new calculation period
   */
  async _startNewPeriod(energyDate, energyValue) {
    this._currentPeriodStartDateUTC = Powermonitor.getUTCDateOfPeriodBegining(
      energyDate
    );
    this._currentPeriodStopDateUTC = Powermonitor.getUTCDateOfPeriodEnding(
      energyDate
    );
    this._activeEnergyOnBegining = energyValue;
    this._activeEnergyOnEnding = 0;
    this._averageActivePower = 0;
    this._predictedActivePower = 0;

    for (let i = 1; i <= 15; i++) {
      this.Steps[i.toString()].activeEnergyValue = 0;
      this.Steps[i.toString()].averageActivePower = 0;
      this.Steps[i.toString()].stepStartDateUTC = 0;
      this.Steps[i.toString()].stepStopDateUTC = 0;
    }

    //Starting new step of new period
    await this._startNewStep(energyDate, energyValue);
  }

  async editWithPayload(payload) {
    if (exists(payload.active)) this._active = payload.active;
    if (exists(payload.activePowerLimitWarning))
      this._activePowerLimitWarning = payload.activePowerLimitWarning;
    if (exists(payload.activePowerLimitAlarm))
      this._activePowerLimitAlarm = payload.activePowerLimitAlarm;
    if (exists(payload.trafoPowerLosses))
      this._trafoPowerLosses = payload.trafoPowerLosses;

    await this._notifyChange();

    return this;
  }

  /**
   * @description Method for ending current calculation period
   */
  async _notifyCurrentPeriodEnd(energyDate, energyValue) {
    this._activeEnergyOnEnding = energyValue;
    let totalActivePower = Powermonitor.calculateActivePower(
      this.CurrentPeriodStartDateUTC,
      this.CurrentPeriodStopDateUTC,
      this.ActiveEnergyOnBegining,
      this.ActiveEnergyOnEnding,
      this.TrafoPowerLosses
    );
    await this._onPeriodEndNotification(energyDate, totalActivePower);
  }

  /**
   * @description Method for starting new step
   */
  async _startNewStep(energyDate, energyValue) {
    let stepBeginUTC = Powermonitor.getUTCDateOfStepBegining(energyDate);
    let stepEndUTC = Powermonitor.getUTCDateOfStepEnding(energyDate);
    let stepNumber = Powermonitor.getStepNumber(energyDate);
    this.Steps[stepNumber].activeEnergyValue = energyValue;
    this.Steps[stepNumber].stepStartDateUTC = stepBeginUTC;
    this.Steps[stepNumber].stepStopDateUTC = stepEndUTC;
    this._currentStepActiveEnergyValueAtBegining = energyValue;
    this._currentStepStartDateUTC = stepBeginUTC;
    this._currentStepStopDateUTC = stepEndUTC;

    this._currentStepNumber = stepNumber;
  }

  /**
   * @description Method for ending current step
   */
  async _notifyCurrentStepEnd(energyDate, energyValue) {
    //Set step average power
    let stepAveragePower = Powermonitor.calculateActivePower(
      this.CurrentStepStartDateUTC,
      this.CurrentStepStopDateUTC,
      this.CurrentStepActiveEnergyValueAtBegining,
      energyValue,
      this.TrafoPowerLosses
    );
    this.Steps[
      this.CurrentStepNumber.toString()
    ].averageActivePower = stepAveragePower;

    //Predict active power
    let stepEnergyDelta =
      energyValue - this.CurrentStepActiveEnergyValueAtBegining;

    let stepsRemain = 15 - this.CurrentStepNumber;

    let predictedEnergyRemain = stepsRemain * stepEnergyDelta;

    let predictedEnergyAtTheEndOfPeriod = energyValue + predictedEnergyRemain;

    //No need to add trafo losses - already implemented in calculation of step active power
    this._predictedActivePower = Powermonitor.calculateActivePower(
      this.CurrentPeriodStartDateUTC,
      this.CurrentPeriodStopDateUTC,
      this.ActiveEnergyOnBegining,
      predictedEnergyAtTheEndOfPeriod,
      this.TrafoPowerLosses
    );
  }

  /**
   * @description Method for refreshing powermonitor mechanism
   */
  async _refreshPowermonitor(energyDate, energyValue) {
    let calculatedBeginPeriod = Powermonitor.getUTCDateOfPeriodBegining(
      energyDate
    );

    //Checking if energyDate is a date for begining of new period
    if (this.CurrentPeriodStartDateUTC !== calculatedBeginPeriod) {
      //Checking if date is complete new period
      if (Powermonitor.isCompletePeriodDate(energyDate)) {
        //Checking if it is next period or further
        if (calculatedBeginPeriod === this.CurrentPeriodStopDateUTC) {
          //if it is next period - end current one and start new one
          await this._notifyCurrentPeriodEnd(energyDate, energyValue);
          await this._startNewPeriod(energyDate, energyValue);
        } else {
          //if it is completly new period - not the next one - do not end current period (do not notify calculation, cause we don't know energy value at the end of period)
          await this._startNewPeriod(energyDate, energyValue);
        }
      } else {
        //if it is not complete data, and period should be new - set ready to false and wait for new date of complete period begining
        await this._stopPowermonitor();
      }
    } else {
      //if it is the period - check if date is a begining of new step or the same as before
      let stepNumber = Powermonitor.getStepNumber(energyDate);

      if (stepNumber !== this.CurrentStepNumber) {
        //if stepNumber is next step end last one and start new one
        if (stepNumber === this.CurrentStepNumber + 1) {
          await this._notifyCurrentStepEnd(energyDate, energyValue);
          await this._startNewStep(energyDate, energyValue);
        }
        //if not only start new one and do not end last one (we don't know about energy on the end of current step)
        else {
          await this._startNewStep(energyDate, energyValue);
        }
      }
    }
  }

  /**
   * @description Method for notifing any change in powermonitors properties
   */
  async _notifyChange() {
    await this._savePayloadToFile();
  }

  /**
   * @description Method for saving powermonitor payload to its file
   */
  async _savePayloadToFile() {
    return writeFileAsync(this.FilePath, JSON.stringify(this.Payload), "utf8");
  }

  /**
   * @description is date a date of complete period ending or begining
   */
  static isCompletePeriodDate(utcDate) {
    return utcDate % (15 * 60) === 0;
  }

  /**
   * @description get begin period based on given date
   */
  static getUTCDateOfPeriodBegining(utcDate) {
    let rest = utcDate % (15 * 60);
    let beginingUTC = utcDate - rest;
    return beginingUTC;
  }

  /**
   * @description get end period based on given date
   */
  static getUTCDateOfPeriodEnding(utcDate) {
    let rest = utcDate % (15 * 60);
    let endingUTC = utcDate - rest + 15 * 60;
    return endingUTC;
  }

  /**
   * @description get begin step based on given date
   */
  static getUTCDateOfStepBegining(utcDate) {
    let rest = utcDate % 60;
    let beginingUTC = utcDate - rest;
    return beginingUTC;
  }

  /**
   * @description get end step based on given date
   */
  static getUTCDateOfStepEnding(utcDate) {
    let rest = utcDate % 60;
    let endingUTC = utcDate - rest + 60;
    return endingUTC;
  }

  /**
   * @description get step number based on given date
   */
  static getStepNumber(utcDate) {
    let periodBegining = this.getUTCDateOfPeriodBegining(utcDate);
    let timeAfterBegining = utcDate - periodBegining;
    return Math.floor(timeAfterBegining / 60) + 1;
  }

  /**
   * @description is date a date of complete step ending or begining
   */
  static isCompleteStepDate(utcDate) {
    return utcDate % 60 === 0;
  }

  /**
   * @description Method for calculating average active power based on energy delta
   * @param {number} utcDateStart utc date of start
   * @param {number} utcDateEnd utc date of end
   * @param {number} energyStart energy value of start
   * @param {number} energyEnd energy value of end
   */
  static calculateActivePower(
    utcDateStart,
    utcDateEnd,
    energyStart,
    energyEnd,
    trafoPowerLosses
  ) {
    return (
      trafoPowerLosses +
      (60 * 60 * (energyEnd - energyStart)) / (utcDateEnd - utcDateStart)
    );
  }
}

module.exports = Powermonitor;
