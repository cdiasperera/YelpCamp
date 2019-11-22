'use strict'
const moment = require('moment')

const helperObj = {}

helperObj.customErrors = {
  campCreate: 'We could not create your camp! :((',
  campMiss: 'Uh oh! We could not find out campgrounds',
  campUpdate: 'Huh??? We could not update your camp for some reason',
  campDelete: 'Que??? We could not delete your camp',
  commentMiss: 'Dios Mio! We could not find that comment',
  commenCreate: 'Whoops! We could not create your comment for some reason',
  commentUpdate: 'Alas! We could not update your comment!!',
  commentDelete: 'Eggo! We could not delete your comment for some reason :(',
  notifMiss: 'Uhh, we could not find that notification!'
}

/**
 * Function to create flash messages for errors. It passes the custom errors
 * ONLY if there exists no pre-existing error. In this case, err is null.
 */
helperObj.displayError = (req, err) => {
  // If the error is just a message, print it. Otherwise, find the message in the error
  if (typeof error === 'string') {
    req.flash('error', err)
  } else {
    req.flash('error', err.message)
  }
}

/**
 * Function to create the appropriate URI, to access the database, depending
 * on whether the app is in production or development.
 */
helperObj.makeMongoURI = () => {
  if (process.env.NODE_ENV === 'production') {
    let uri = 'mongodb+srv://yelpcampadmin:'
    uri += process.env.DB_PASS
    uri += '@cluster0-uqaxm.mongodb.net/test?retryWrites=true&w=majority'
    return uri
  } else {
    return 'mongodb://localhost:27017/yelp_camp'
  }
}

helperObj.mostRecentUpdate = moment('20191121', 'YYYYMMDD')
module.exports = helperObj
