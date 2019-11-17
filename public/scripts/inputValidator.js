"use strict";
// CHANGE REQUIREMENT CSS BASED ON INPUT
function InputValidator(input, requirementsHTML, rules) {
  this.input        = input;
  this.requirementsHTML = requirementsHTML;
  this.rules = rules;
  this.prevValue    = "";

  this.rulesPassed = [];

  this.start = () => {
    this.input.addEventListener("input", this.checkValidation);
  }

  this.checkValidation = (event) => {
    let currentInput = event.target.value;

    if (currentInput === "") {
      this.prevValue = currentInput;
      return requirementsHTML.forEach((requirement) => {
        requirement.classList.remove("valid");
        requirement.classList.remove("invalid");
      })
    }
    // If input is non-empty, check the rules
    this.checkRules(currentInput);

    // Update previous value and return changed output
    this.prevValue = currentInput;
  }

  this.checkRules = (currentInput) => {
    this.rules.forEach((rule, index) => {
      let targetClassList = requirementsHTML[index].classList;
      let toggleAction = rule(currentInput);
      toggleClasses(targetClassList, toggleAction, "valid", "invalid");
    }) 
  }
}

// An dictionary that contains functions to validate a rule. The
// definition of the rule is implicit in the function.
InputValidator.prototype.rules = {
 // Check that the input is within the bounds
  fitLength: (currentValue, minLength, maxLength) => { 
    //  Incorrect input checking
    if (minLength === undefined) {
      minLength = 0;
    } else if (maxLength === undefined) {
      maxLength = Infinity;
    }
    if (currentValue.length >= minLength && currentValue.length <= maxLength) {
      return true;
    } else {
      return false;
    }
  },
  noSpecialChar: (currentValue) => {
    return /^[A-Za-z0-9_]{1,15}$/.test(currentValue);
  },
  // At least one character of type "type", given in th regex format
  atLeastOne: (currentValue, type) => {
    return type.test(currentValue);
  },
}

// Selects whatever rules are needed from the rules dictionary for the username
InputValidator.prototype.usernameRules = [
  bindEndArgs(InputValidator.prototype.rules.fitLength, 2, 15),
  InputValidator.prototype.rules.noSpecialChar
];

// Selects whatever rules are needed from the rules dictionary for the password
InputValidator.prototype.passwordRules = [
  bindEndArgs(InputValidator.prototype.rules.fitLength, 8, Infinity),
  // At least one number
  bindEndArgs(InputValidator.prototype.rules.atLeastOne, /\d/),
  // At least one uppcase letter
  bindEndArgs(InputValidator.prototype.rules.atLeastOne, /[A-Z]/),
  // At least one lowercase letter
  bindEndArgs(InputValidator.prototype.rules.atLeastOne, /[a-z]/)
];
// HELPER FUNCTION
// A function to toggle class states, depending on toggleAction.
// If toggleAction is true, turn onClass on. Else turn offClass off.
function toggleClasses(element, toggleAction, onClass, offClass) {
  if(toggleAction) {
    element.add(onClass);
    element.remove(offClass);
  } else {
    element.add(offClass);
    element.remove(onClass);
  }
}

// Function to partially implement functions to be referenced later
function bindEndArgs(fn, ...boundArgs) {
  return (...args) => {
    return fn(...args, ...boundArgs);
  }
}

let usernameValidator = new InputValidator(
  document.querySelector("input[name=username]"),
  document.querySelectorAll("input[name=username] + .input-requirements li"),
  InputValidator.prototype.usernameRules  
);

let passwordValidator = new InputValidator(
  document.querySelector("input[name=password]"),
  document.querySelectorAll("input[name=password] + .input-requirements li"),
  InputValidator.prototype.passwordRules
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