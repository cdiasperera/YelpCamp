'use strict'
const PasswordValidator = require('password-validator')

const schema = new PasswordValidator()

schema.errorMessages = {
  min: 'at least 8 characters',
  uppercase: 'at least 1 uppercase character',
  lowercase: 'at least 1 lowercase character',
  digits: 'at least 1 digit'
}

schema
  .is().min(8)
  .has().uppercase()
  .has().lowercase()
  .has().digits()

module.exports = schema
