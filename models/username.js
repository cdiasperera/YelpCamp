"use strict";
const passwordValidator = require("password-validator");

var schema = new passwordValidator();

var invalidUsernameMessages = {
  "min": "at least 2 characters",
  "symbol": "no symbols",
  "spaces": "no spaces"
}

schema
  .is().min(2)
  .has().not().spaces()
  .has().not().symbols()

 module.exports = schema;