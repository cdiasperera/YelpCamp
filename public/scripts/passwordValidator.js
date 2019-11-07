;(function() {
  "use strict";
    var errorMessage = "Sorry!";

  $(disableValidationPopup);
  $(clearFormOnInvalid);
  
  function disableValidationPopup() {
    document.addEventListener('invalid', (function () {
      return function (e) {
        $("input[name=password]").focus();
        e.preventDefault();
      };
    })(), true);
  }

  function clearFormOnInvalid() {
    $("input[name=password").on("invalid", function() {
      this.value = "";
    });
  }
})();