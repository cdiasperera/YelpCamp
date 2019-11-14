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
    var currentInput = event.target.value;

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
      var targetClassList = requirementsHTML[index].classList;
      var toggleAction = rule(currentInput);
      toggleClasses(targetClassList, toggleAction, "valid", "invalid");
    }) 
  }
}

// An dictionary that contains functions to validate a rule. The
// definition of the rule is implicit in the function.
InputValidator.prototype.rules = {
 // Length Rule
  length: (currentValue, minLength, maxLength) => { 
    if (minLength === undefined) {
      minLength = 0;
    } else if (maxLength === undefined) {
      maxLength = Infinity;
    }
    if (currentValue.length > minLength && currentValue.length < maxLength) {
      return true;
    } else {
      return false;
    }
  },
  // Special Characters rule
  specialChar: (currentValue) => {
    if (/^[A-Za-z0-9_]{1,15}$/.test(currentValue)) {
      return true;
    } else {
      return false;
    }
  }
}

InputValidator.prototype.usernameRules = [
  bindEndArgs(InputValidator.prototype.rules.length, 1,Infinity),
  InputValidator.prototype.rules.specialChar
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

var usernameValidator = new InputValidator(
  document.querySelector("input[name=username]"),
  document.querySelectorAll("input[name=username] + .input-requirements li"),
  InputValidator.prototype.usernameRules  
);

var passwordValidator = new InputValidator(
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