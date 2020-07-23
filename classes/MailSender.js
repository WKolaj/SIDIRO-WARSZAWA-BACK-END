const nodemailer = require("nodemailer");
const config = require("config");

let transporter = nodemailer.createTransport({
  pool: true,
  host: "pricelist.nazwa.pl",
  port: 465,
  secure: true,
  auth: {
    user: config.get("emailAccount"),
    pass: config.get("emailPassword"),
  },
});

module.exports.sendEmail = async (recipient, subject, html) => {
  let mailOptions = {
    from: config.get("emailAccount"),
    to: recipient,
    subject: subject,
    html: html,
  };

  return transporter.sendMail(mailOptions);
};
