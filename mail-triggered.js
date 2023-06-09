require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const { VERIFY_EMAIL } = require('./constants')

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const API_ROOT = process.env.API_ROOT_URL

const sendVerificationEmail = async (email, newToken) => {
  try {
    await sgMail.send({
      to: email,
      from: 'info@tomaspeterec.sk',
      subject: 'Sending with SendGrid is Fun',
      text: `${API_ROOT}/api/users/${VERIFY_EMAIL}/${newToken}`,
      html: `<strong><a href="${API_ROOT}/api/users/${VERIFY_EMAIL}/${newToken}">Confirm your registration</strong>`,
    });
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

module.exports = { sendVerificationEmail };