const Powermonitor = require("./Powermonitor");
const pzoPowermonitorService = require("../services/pzoPowermonitorService");
const MailSender = require("./MailSender");
const logger = require("../logger/logger");
const { exists } = require("../utilities/utilities");
const project = require("../project/project");
const config = require("config");

const warningIcon = config.get("notifySubscriberWarningIcon");
const alertIcon = config.get("notifySubscriberAlertIcon");
const infoIcon = config.get("notifySubscriberInfoIcon");

class PowermonitorRG extends Powermonitor {
  constructor(filePath) {
    super(filePath);
    this._sendingEventsEnabled = false;
    this._sendingEmailsEnabled = false;
    this._notificationsEnabled = false;
    this._recipients = [];
  }

  /**
   * @description Method called on the end of valid period
   */
  async _onPeriodEndNotification(periodDate, periodTotalActivePower) {
    let date = new Date(periodDate * 1000);
    await pzoPowermonitorService.fetchActivePower(date, periodTotalActivePower);
  }

  /**
   * @description Method called on alert activation - should be override in child classes
   */
  async _onAlarmActivation(periodDate, alertLimit, predictedTotalActivePower) {
    let date = new Date(periodDate * 1000);
    if (this.SendingEventsEnabled)
      await pzoPowermonitorService.sendEvent(
        date,
        `Alarm przekroczenia mocy - przewidywana moc ${(
          predictedTotalActivePower / 1000
        ).toFixed(2)} kW`,
        20
      );

    if (this.SendingEmailsEnabled) {
      for (let recipient of this.Recipients) {
        try {
          await MailSender.sendEmail(
            recipient,
            "Strażnik mocy - alarm",
            `<p>Alarm przekroczenia mocy - przewidywana moc ${(
              predictedTotalActivePower / 1000
            ).toFixed(2)} kW</p>`
          );
        } catch (err) {
          logger.error(err.message, err);
        }
      }
    }

    if (this.NotificationsEnabled) {
      project
        .getNotifySubscriber()
        .sendNotifyMessage(
          config.get("notifySubscriberPowermonitorGroupName"),
          {
            title: "Strażnik mocy - alarm",
            body: `Alarm przekroczenia mocy - przewidywana moc ${(
              predictedTotalActivePower / 1000
            ).toFixed(2)} kW`,
            icon: alertIcon
          }
        );
    }
  }

  /**
   * @description Method called on alert activation - should be override in child classes
   */
  async _onWarningActivation(
    periodDate,
    warningLimit,
    predictedTotalActivePower
  ) {
    let date = new Date(periodDate * 1000);
    if (this.SendingEventsEnabled)
      await pzoPowermonitorService.sendEvent(
        date,
        `Ostrzeżenie przed przekroczeniem mocy - przewidywana moc ${(
          predictedTotalActivePower / 1000
        ).toFixed(2)} kW`,
        30
      );

    if (this.SendingEmailsEnabled) {
      for (let recipient of this.Recipients) {
        try {
          await MailSender.sendEmail(
            recipient,
            "Strażnik mocy - ostrzeżenie",
            `<p>Ostrzeżenie przed przekroczeniem mocy - przewidywana moc ${(
              predictedTotalActivePower / 1000
            ).toFixed(2)} kW</p>`
          );
        } catch (err) {
          logger.error(err.message, err);
        }
      }
    }

    if (this.NotificationsEnabled) {
      project
        .getNotifySubscriber()
        .sendNotifyMessage(
          config.get("notifySubscriberPowermonitorGroupName"),
          {
            title: "Strażnik mocy - ostrzeżenie",
            body: `Ostrzeżenie przed przekroczeniem mocy - przewidywana moc ${(
              predictedTotalActivePower / 1000
            ).toFixed(2)} kW`,
            icon: warningIcon
          }
        );
    }
  }

  /**
   * @description Method called on alert deactivation - should be override in child classes
   */
  async _onAlarmDeactivation(
    periodDate,
    alertLimit,
    predictedTotalActivePower
  ) {
    let date = new Date(periodDate * 1000);
    if (this.SendingEventsEnabled)
      await pzoPowermonitorService.sendEvent(
        date,
        `Przewidywana moc poniżej progu alarmu - wartość ${(
          predictedTotalActivePower / 1000
        ).toFixed(2)} kW`,
        40
      );

    if (this.SendingEmailsEnabled) {
      for (let recipient of this.Recipients) {
        try {
          await MailSender.sendEmail(
            recipient,
            "Strażnik mocy - wyłączenie alarmu",
            `<p>Przewidywana moc poniżej progu alarmu - wartość ${(
              predictedTotalActivePower / 1000
            ).toFixed(2)} kW</p>`
          );
        } catch (err) {
          logger.error(err.message, err);
        }
      }
    }

    if (this.NotificationsEnabled) {
      project
        .getNotifySubscriber()
        .sendNotifyMessage(
          config.get("notifySubscriberPowermonitorGroupName"),
          {
            title: "Strażnik mocy - wyłączenie alarmu",
            body: `Przewidywana moc poniżej progu alarmu - wartość ${(
              predictedTotalActivePower / 1000
            ).toFixed(2)} kW`,
            icon: infoIcon
          }
        );
    }
  }

  /**
   * @description Method called on alert deactivation - should be override in child classes
   */
  async _onWarningDeactivation(
    periodDate,
    warningLimit,
    predictedTotalActivePower
  ) {
    let date = new Date(periodDate * 1000);
    if (this.SendingEventsEnabled)
      await pzoPowermonitorService.sendEvent(
        date,
        `Przewidywana moc poniżej progu ostrzeżenia - wartość ${(
          predictedTotalActivePower / 1000
        ).toFixed(2)} kW`,
        40
      );

    if (this.SendingEmailsEnabled) {
      for (let recipient of this.Recipients) {
        try {
          await MailSender.sendEmail(
            recipient,
            "Strażnik mocy - wyłączenie ostrzeżenia",
            `<p>Przewidywana moc poniżej progu ostrzeżenia - wartość ${(
              predictedTotalActivePower / 1000
            ).toFixed(2)} kW</p>`
          );
        } catch (err) {
          logger.error(err.message, err);
        }
      }
    }

    if (this.NotificationsEnabled) {
      project
        .getNotifySubscriber()
        .sendNotifyMessage(
          config.get("notifySubscriberPowermonitorGroupName"),
          {
            title: "Strażnik mocy - wyłączenie ostrzeżenia",
            body: `Przewidywana moc poniżej progu ostrzeżenia - wartość ${(
              predictedTotalActivePower / 1000
            ).toFixed(2)} kW`,
            icon: infoIcon
          }
        );
    }
  }

  /**
   * @description Method for initializing powermonitor based on file payload
   * @param {object} filePayload File payload
   */
  async _initBasedOnFilePayload(filePayload) {
    await super._initBasedOnFilePayload(filePayload);

    if (exists(filePayload.sendingEventsEnabled));
    this._sendingEventsEnabled = filePayload.sendingEventsEnabled;

    if (exists(filePayload.sendingEmailsEnabled));
    this._sendingEmailsEnabled = filePayload.sendingEmailsEnabled;

    if (exists(filePayload.notificationsEnabled));
    this._notificationsEnabled = filePayload.notificationsEnabled;

    if (exists(filePayload.recipients));
    this._recipients = filePayload.recipients;
  }

  get SendingEventsEnabled() {
    return this._sendingEventsEnabled;
  }

  get SendingEmailsEnabled() {
    return this._sendingEmailsEnabled;
  }

  get NotificationsEnabled() {
    return this._notificationsEnabled;
  }

  get Recipients() {
    return this._recipients;
  }

  /**
   * @description Method for generating payload representing powermonitor element
   */
  _generatePayload() {
    let superPayload = super._generatePayload();
    superPayload.sendingEventsEnabled = this.SendingEventsEnabled;
    superPayload.recipients = this.Recipients;
    superPayload.sendingEmailsEnabled = this.SendingEmailsEnabled;
    superPayload.notificationsEnabled = this.NotificationsEnabled;

    return superPayload;
  }

  async editWithPayload(payload) {
    if (exists(payload.sendingEventsEnabled))
      this._sendingEventsEnabled = payload.sendingEventsEnabled;

    if (exists(payload.notificationsEnabled))
      this._notificationsEnabled = payload.notificationsEnabled;

    if (exists(payload.sendingEmailsEnabled))
      this._sendingEmailsEnabled = payload.sendingEmailsEnabled;

    if (exists(payload.recipients)) this._recipients = payload.recipients;

    return super.editWithPayload(payload);
  }
}

module.exports = PowermonitorRG;
