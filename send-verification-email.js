const sgMail = require('@sendgrid/mail');
const { VERIFY_EMAIL } = require('./constants');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { API_ROOT_URL, VOTING_PROJECT_MAIL_VAR } = process.env;

const sendVerificationEmail = async (email, newToken) => {
  try {
    await sgMail.send({
      to: email,
      from: `${VOTING_PROJECT_MAIL_VAR}`,
      subject: 'Registration confirmation mail from Voting project',
      text: `${API_ROOT_URL}/api/users/${VERIFY_EMAIL}/${newToken}`,
      html: `<strong><a href="${API_ROOT_URL}/api/users/${VERIFY_EMAIL}/${newToken}">Confirm your registration</strong>`,
    });
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error(`Failed to send verification email to ${email}`);
    throw error;
  }
};

module.exports = { sendVerificationEmail };
