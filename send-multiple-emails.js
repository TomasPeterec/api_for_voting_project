const sgMail = require('@sendgrid/mail')
// const { VERIFY_EMAIL } = require('./constants')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
// const { API_ROOT_URL, VOTING_PROJECT_MAIL_VAR } = process.env
const { VOTING_PROJECT_MAIL_VAR } = process.env

const SendMultipleEmails = async (email, newToken) => {
  try {
    await sgMail.send({
      to: email.trim(),
      from: `${VOTING_PROJECT_MAIL_VAR}`,
      subject: 'Registration confirmation mail from Voting project',
      text: 'skusobny mail',
      html: '<strong>skusobny mail</strong>'
    })

    console.log('Verification email sent successfully on ' + email)
  } catch (error) {
    console.error(`Failed to send verification email to ${email}`)
    throw error
  }
}

module.exports = SendMultipleEmails
