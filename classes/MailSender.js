const nodemailer = require("nodemailer");
const config = require("config");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.get("emailAccount"),
    pass: config.get("emailPassword")
  }
});

module.exports.sendEmail = async (recipient, subject, html) => {
  let mailOptions = {
    from: config.get("emailAccount"),
    to: recipient,
    subject: subject,
    html: html
  };

  return transporter.sendMail(mailOptions);
};
