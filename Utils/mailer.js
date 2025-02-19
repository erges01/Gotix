const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const sendEmail = (to, subject, text, attachments = []) => {
  return transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, text, attachments })
    .then(info => console.log("Email sent:", info.response))
    .catch(error => console.error("Email error:", error));
};


module.exports = sendEmail;
