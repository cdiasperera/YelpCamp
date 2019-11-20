'use strict'
/* global $ */
// REMOVE POPUP FOR FORMS
$(disableValidationPopup)
$(clearFormOnInvalid)

function disableValidationPopup () {
  document.addEventListener('invalid', (function () {
    return function (e) {
      $('input').focus()
      e.preventDefault()
    }
  })(), true)
}

function clearFormOnInvalid () {
  $('input').on('invalid', function () {
    this.value = ''
  })
}
