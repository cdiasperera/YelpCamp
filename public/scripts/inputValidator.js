"use strict";
// CHANGE REQUIREMENT CSS BASED ON INPUT
function InputValidator(input, requirementsHTML, requirements) {
  this.input        = input;
  this.requirementsHTML = requirementsHTML;
  this.prevValue    = "";

  this.rulesPassed = [];

  this.start = () => {
    this.input.addEventListener("input", this.checkValidation);
  }

  this.checkValidation = (event) => {
    var currentInput = event.target.value;
    var change = this.determineChange(currentInput);
    this.checkRules(change);
  }

  this.determineChange = (currentInput) => {
    var changedChar, changedType;
    if (currentInput.length > this.prevValue.length) {
      // character was added
      changedChar = currentInput[currentInput.length - 1];
      changedType = InputValidator.prototype.CHANGETYPES.ADD;
    } else if (currentInput.length === this.prevValue.length) {
      // character was changed
      changedChar = currentInput[currentInput.length - 1];
      changedType = InputValidator.prototype.CHANGETYPES.CHANGE;
    } else {
      // character was deleted
      changedChar = this.prevValue[this.prevValue.length - 1]
      changedType = InputValidator.prototype.CHANGETYPES.DELETE;
    }

    // Update previous value and return changed output
    this.prevValue = currentInput;
    return {char: changedChar, type: changedType};
  }

  this.checkRules = (change) => {
    if (change.type === InputValidator.prototype.CHANGETYPES.ADD) {
      
    } else if (change.type === InputValidator.prototype.CHANGETYPES.CHANGE) {

    } else {
      // Deleted Key
    }
  }
}

InputValidator.prototype = {
  CHANGETYPES: {
    ADD: "add",
    CHANGE: "change",
    DELETE: "delete"
  }
}

var usernameValidator = new InputValidator(
  document.querySelector("input[name=username]"),
  document.querySelector("input[name=password] + .input-requirements")  
);

var passwordValidator = new InputValidator(
  document.querySelector("input[name=password]"),
  document.querySelector("input[name=password] + .input-requirements")
);

usernameValidator.start();
passwordValidator.start();

// REMOVE POPUP FOR FORMS
$(disableValidationPopup);
$(clearFormOnInvalid);

function disableValidationPopup() {
  document.addEventListener("invalid", (function () {
    return function (e) {
      $("input").focus();
      e.preventDefault();
    };
  })(), true);
}

function clearFormOnInvalid() {
  $("input").on("invalid", function() {
    this.value = "";
  });
}