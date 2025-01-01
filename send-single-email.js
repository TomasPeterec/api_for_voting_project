const axios = require('axios');
require('dotenv').config(); // Ensure .env is loaded

const { VOTING_PROJECT_MAIL_VAR, MAILERSEND_API_KEY, FRONTEND_URL } = process.env;

const SendSingleEmail = async (email, newToken) => {
  console.log('Function invoked');
  console.log(`Using "from" email: ${VOTING_PROJECT_MAIL_VAR}`);

  try {
    const response = await axios.post(
      'https://api.mailersend.com/v1/email',
      {
        from: {
          email: VOTING_PROJECT_MAIL_VAR, // Verified "from" email in MailerSend
          name: 'Voting Project', // Optional: Add a name for the sender
        },
        to: [
          {
            email: email.trim(), // Array of recipient emails
            name: 'Recipient', // Optional: Add a name for the recipient
          },
        ],
        subject: 'Registration confirmation mail from Voting project',
        text: `Your token: ${newToken}`, // Plain text content
        html: `<strong><a href='${FRONTEND_URL}${newToken}'>Click here for voting</a></strong>`, // HTML content
      },
      {
        headers: {
          Authorization: `Bearer ${MAILERSEND_API_KEY}`, // MailerSend API key
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('Verification email sent successfully to ' + email);
    console.log('MailerSend response:', response.data);
  } catch (error) {
    console.error(`Failed to send verification email to ${email}`);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = SendSingleEmail;
