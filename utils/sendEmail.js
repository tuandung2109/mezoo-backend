const nodemailer = require('nodemailer');
const sendgridMail = (() => {
  try {
    return require('@sendgrid/mail');
  } catch (err) {
    return null;
  }
})();

const buildFromField = () => {
  const fromEmail = process.env.FROM_EMAIL;
  const fromName = process.env.FROM_NAME;
  return fromName ? `${fromName} <${fromEmail}>` : fromEmail;
};

const sendEmail = async (options) => {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;

  if (sendgridApiKey && sendgridMail) {
    // Prefer SendGrid HTTP API to avoid outbound SMTP limits in hosts like Render.
    sendgridMail.setApiKey(sendgridApiKey);
    await sendgridMail.send({
      to: options.email,
      from: {
        email: process.env.FROM_EMAIL,
        name: process.env.FROM_NAME
      },
      subject: options.subject,
      text: options.message
    });
    console.log('Message sent via SendGrid');
    return;
  }

  // Fallback to SMTP when SendGrid is not configured.
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: smtpPort,
    secure: smtpPort === 465,
    requireTLS: smtpPort !== 465,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.replace(/\s+/g, '') : ''
    },
    connectionTimeout: 20_000
  });

  const message = {
    from: buildFromField(),
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent via SMTP: %s', info.messageId);
};

module.exports = sendEmail;
