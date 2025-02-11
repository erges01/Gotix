const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = (to, subject, text, attachments = []) => {
  return transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text, attachments });
};

module.exports = sendEmail;
