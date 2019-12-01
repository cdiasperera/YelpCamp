const verifyEmailMail = {}

verifyEmailMail.mailContent =
  `<p>Hi there!</p>
   <p>
   Thanks for signing up to YelpCamp! Please click the link below to activate
   your account!
   </p>`

verifyEmailMail.addLink = (linkString) => {
  verifyEmailMail.mailContent +=
  `<p><a href="${linkString}">Activate Account</a></p>`
}

module.exports = verifyEmailMail
