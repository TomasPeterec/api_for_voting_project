const sgMail = require('@sendgrid/mail');
const { VERIFY_EMAIL } = require('./constants')

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const API_ROOT = process.env.API_ROOT_URL
const VOTING_PROJECT_MAIL = process.env.VOTING_PROJECT_MAIL_VAR

const sendVerificationEmail = async (email, newToken) => {
  try {
    await sgMail.send({
      to: email,
      from: `${VOTING_PROJECT_MAIL}`,
      subject: 'Registration confirmation mail from Voting project',
      text: `${API_ROOT}/api/users/${VERIFY_EMAIL}/${newToken}`,
      html: `<strong><a href="${API_ROOT}/api/users/${VERIFY_EMAIL}/${newToken}">Confirm your registration</strong>`,
    });
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error(`Failed to send verification email to ${email}`)
    throw error
  }
};

module.exports = { sendVerificationEmail };
