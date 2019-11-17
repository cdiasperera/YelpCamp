"use strict";
const passwordValidator = require("password-validator");

let schema = new passwordValidator();

let invalidPasswordMessages = {
  "min": "at least 8 characters",
  "uppercase": "at least 1 uppercase character",
  "lowercase": "at least 1 lowercase character",
  "digits": "at least 1 digit"
}

schema
  .is().min(8)
  .has().uppercase()
  .has().lowercase()
  .has().digits();

/**
 * Function to return a string listing the errors in the password. 
 * */  
schema.errorMessage = (errors) => {
  let message = "You need "
  for (let i = 0; i < errors.length; i++) {
    message += invalidPasswordMessages[errors[i]]
    // Choose which type of punctuation is needed, between listing the errors
    if (i === errors.length - 1) {
      message += "!";
    } else if (i === errors.length - 2) {
      message += " and ";
    } else {
      message += ", ";
    }
  }

  return message;
};

 module.exports = schema;