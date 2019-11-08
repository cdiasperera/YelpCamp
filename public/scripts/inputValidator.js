;(function() {
  "use strict";
  var errorMessage = "Sorry!";
  
  /**
   * For each input form
   * Grab list requirements
   * 
   */

  /**
   * Disable popups and clear the forms if the input is invalid
   */
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
})();