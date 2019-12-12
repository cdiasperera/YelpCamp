const emails = {}

emails.resetPassword = require('./resetPassword')

emails.verifyEmail = require('./verifyEmail')

emails.transporConfig = {
  host: process.env.SMTP_SERVER,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
}

emails.serverEmail = 'cdiasperera@gmail.com'
module.exports = emails
