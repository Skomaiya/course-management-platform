const nodemailer = require('nodemailer');

// Explicit email configuration
const EMAIL_USER = 's.komaiya@alustudent.com';
const EMAIL_PASS = 'mveo izxt vhsz kmiy';

// Check if email credentials are configured
const isEmailConfigured = EMAIL_USER && EMAIL_PASS && EMAIL_USER !== 'your-email@gmail.com' && EMAIL_PASS !== 'your-app-password';

let transporter = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
} else {
  console.warn('Email service not configured. Update EMAIL_USER and EMAIL_PASS in utils/emailService.js to enable email notifications.');
}

const sendEmail = async (to, subject, text) => {
  if (!transporter) {
    console.log('Email not sent (service not configured):', { to, subject });
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Course Platform" <${EMAIL_USER}>`,
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
