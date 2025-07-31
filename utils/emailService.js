const nodemailer = require('nodemailer');

// Email configuration from environment variables with fallbacks
const EMAIL_USER = process.env.EMAIL_USER || 's.komaiya@alustudent.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'mveo izxt vhsz kmiy';
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Course Platform';

// Check if email credentials are configured
const isEmailConfigured = EMAIL_USER && EMAIL_PASS && EMAIL_USER !== 'your-email@gmail.com' && EMAIL_PASS !== 'your-app-password';

let transporter = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
} else {
  console.warn('Email service not configured. Set EMAIL_USER and EMAIL_PASS environment variables to enable email notifications.');
}

const sendEmail = async (to, subject, text) => {
  if (!transporter) {
    console.log('Email not sent (service not configured):', { to, subject });
    return;
  }

  try {
    await transporter.sendMail({
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Failed to send email:', error.message);
  }
};

module.exports = sendEmail;
