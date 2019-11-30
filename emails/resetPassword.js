const passwordResetMail = {}

passwordResetMail.mailContent =
  '<p>Hi there!</p>' +
  '<p>' +
  'It seems like you have requested a password! Please follow the link below.' +
  '</p>'

passwordResetMail.addLink = (linkString) => {
  passwordResetMail.mailContent +=
  '<p><a href="' + linkString + '">Password Reset </a></p>'
}

module.exports = passwordResetMail
