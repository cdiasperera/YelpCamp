'use strict'
const PasswordValidator = require('password-validator')

const schema = new PasswordValidator()

schema.errorMessages = {
  min: 'at least 2 characters',
  symbol: 'no symbols',
  spaces: 'no spaces'
}

schema
  .is().min(2)
  .has().not().spaces()
  .has().not().symbols()

module.exports = schema
