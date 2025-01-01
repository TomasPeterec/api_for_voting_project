const axios = require('axios');
const { VERIFY_EMAIL } = require('./constants');

const { API_ROOT_URL, VOTING_PROJECT_MAIL_VAR, SENDGRID_API_URL } = process.env;

const sendVerificationEmail = async (email, newToken) => {
  try {
    const response = await axios.post(
      `${SENDGRID_API_URL}/mail/send`,
      {
        personalizations: [
          {
            to: [{ email }],
            subject: 'Registration confirmation mail from Voting project',
          },
        ],
        from: {
          email: VOTING_PROJECT_MAIL_VAR,
        },
        content: [
          {
            type: 'text/plain',
            value: `${API_ROOT_URL}/api/users/${VERIFY_EMAIL}/${newToken}`,
          },
          {
            type: 'text/html',
            value: `<strong><a href="${API_ROOT_URL}/api/users/${VERIFY_EMAIL}/${newToken}">Confirm your registration</a></strong>`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('Verification email sent successfully', response.data);
  } catch (error) {
    console.error(`Failed to send verification email to ${email}`, error.response?.data || error.message);
    throw error;
  }
};

module.exports = { sendVerificationEmail };
