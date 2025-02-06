const nodemailer = require('nodemailer');

// Create a transporter to send emails
const transporter = nodemailer.createTransport({
  service: 'gmail',  // or any other email provider (e.g., 'smtp', 'Outlook', etc.)
  host: process.env.EMAIL_HOST,  // Email host from .env file (e.g., 'smtp.gmail.com')
  port: process.env.EMAIL_PORT,  // Port for SMTP (usually 587 for TLS)
  auth: {
    user: process.env.EMAIL_USER,  // Your email address from .env
    pass: process.env.EMAIL_PASS,  // Your email password from .env
  },
});

// Function to send an email
const sendEmail = (to, subject, text, attachments = []) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,  // The sender email address
    to,  // Recipient's email address
    subject,  // Subject of the email
    text,  // The email body text
    attachments,  // Optional attachments (like PDFs or images)
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error occurred:', error);
      return false;
    }
    console.log('Email sent: ' + info.response);
    return true;
  });
};

module.exports = sendEmail;
