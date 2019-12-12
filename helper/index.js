'use strict'
const moment = require('moment')

const helper = {}

helper.customErrors = {
  campCreate: 'We could not create your camp! :((',
  campMiss: 'Uh oh! We could not find out campgrounds',
  campUpdate: 'Huh??? We could not update your camp for some reason',
  campDelete: 'Que??? We could not delete your camp',
  campAuth: 'Yarr, you don\t have permission to enter this page!',
  commentMiss: 'Dios Mio! We could not find that comment',
  commenCreate: 'Whoops! We could not create your comment for some reason',
  commentUpdate: 'Alas! We could not update your comment!!',
  commentDelete: 'Eggo! We could not delete your comment for some reason :(',
  commentAuth: 'I\'m not sure what you\re trying to do with this commnent, but I ain\'t down for that!',
  commentExists: 'You already have a comment on this camp!',
  commentRatingMiss: 'You need to rate your comment!',
  notifMiss: 'Uhh, we could not find that notification!',
  notifAuth: 'Hmmm, you should not need that notification!',
  userMiss: 'This is not the user you are looking for',
  userUpdate: 'Sorry! We couldn\'t change your details! Try again in a few seconds',
  userAuth: 'Hmmm, I do not think you are who you say you are!',
  followerAuth: 'You can\'t follow someone, on someone elses behalf matey!',
  resetUserMiss: 'The user associated with this reset token does not exist',
  resetExpire: 'Your reset token has expired',
  resetInvalid: 'Your reset token is invalid',
  emailInvalid: 'Your email was not accepted!',
  emailUsed: 'Your email is already in use',
  activateTokenInvalid: 'You activation token is invalid!',
  unActivated: 'You need to activate your account!',
  locationInvalid: 'Sorry! That location is not valid'
}

/**
 * Function to create flash messages for errors. It passes the custom errors
 * ONLY if there exists no pre-existing error. In this case, err is null.
 */
helper.displayError = (req, err) => {
  // For debugging purposes
  console.log(err)
  console.log(typeof err)
  // If the error is just a message, print it. Otherwise, find the message in the error
  if (typeof err === 'string') {
    req.flash('error', err)
  } else {
    req.flash('error', err.message)
  }
}

/**
 * Function to create the appropriate URI, to access the database, depending
 * on whether the app is in production or development.
 */
helper.makeMongoURI = () => {
  if (process.env.NODE_ENV === 'production') {
    let uri = 'mongodb+srv://yelpcampadmin:'
    uri += process.env.DB_PASS
    uri += '@cluster0-uqaxm.mongodb.net/test?retryWrites=true&w=majority'
    return uri
  } else {
    return 'mongodb://localhost:27017/yelp_camp'
  }
}

/**
 * Function to return a string listing the errors in the password.
 * */
helper.validationErrorMessage = (errors, rules) => {
  let message = 'You need '
  for (let i = 0; i < errors.length; i++) {
    message += rules[errors[i]]
    // Choose which type of punctuation is needed, between listing the errors
    if (i === errors.length - 1) {
      message += '!'
    } else if (i === errors.length - 2) {
      message += ' and '
    } else {
      message += ', '
    }
  }

  return message
}

helper.validate = (schema, item, options) => {
  const errors = schema.validate(item, options)
  if (errors.length > 0) {
    throw helper.validationErrorMessage(
      errors,
      schema.errorMessages
    )
  }
}

/**
 * Checks to see if img should be set to the default "no image" image
 * Sets it, if it were the case
 */
helper.setNoImage = (img) => {
  /**
   * The image is trying to access an image outside the internet. Thus, it
   * will ping the server. We must set the image to be no-image.jpg
  */
  if (!/^http.*/.test(img)) {
    return '/imgs/no-image.jpg'
  }
}
helper.mostRecentUpdate = moment('20191211', 'YYYYMMDD')

// Booleans that tells if we are seeding the database or not
helper.producSeeding = false
helper.devSeeding = true

module.exports = helper
