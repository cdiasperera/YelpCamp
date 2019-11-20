'use strict'
const passwordValidator = require('password-validator')

const schema = new passwordValidator()

const invalidUsernameMessages = {
  min: 'at least 2 characters',
  symbol: 'no symbols',
  spaces: 'no spaces'
}

schema
  .is().min(2)
  .has().not().spaces()
  .has().not().symbols()

module.exports = schema
