'use strict'
const Campground = require('../models/campground')
const Comment = require('../models/comment')
const User = require('../models/user')
const Notification = require('../models/notif')

const helper = require('../helper')
const isEmpty = require('lodash').isEmpty

const middleware = {}

middleware.locals = async (req, res, next) => {
  res.locals.currentUser = req.user
  if (typeof req.user !== 'undefined') {
    try {
      const user = await User.findById(req.user.id)
        .populate('notifs', null, { isRead: false })
        .exec()

      res.locals.notifs = user.notifs.reverse()
    } catch (err) {
      helper.displayError(req, err)
      res.redirect('back')
    }
  }

  // If we are not logged in, store the current page, to redirect back if we log
  // in. If we are on the login page, do NOT store the page.
  if (req.originalUrl !== '/login') {
    req.session.returnTo = req.originalUrl
  }

  if (inRedirectPage(req.url)) {
    // We are not on a user facing page, so we do not set the flash messages,
    // as that will remove it from session storage.
    res.locals.error = []
    res.locals.success = []
  } else {
    res.locals.error = req.flash('error')
    res.locals.success = req.flash('success')
  }
  next()
}

/**
 * Checks to see if the current page we are on is a use facing page or a
 * redirect
 */
function inRedirectPage (url) {
  if (url === '/campgrounds' || url === '/campgrounds/page/') {
    return true
  } else {
    return false
  }
}

/**
 * Function to make sure user is logged in
 */
middleware.isLoggedIn = async (req, res, next) => {
  if (req.isAuthenticated()) {
    if (!req.user.activated) {
      req.flash('error', helper.customErrors.unActivated)
      return res.redirect('/campgrounds')
    }
    return next()
  } else {
    req.flash('error', 'You need to be logged in, matey!')
    res.redirect('/login')
  }
}

middleware.isNotLoggedIn = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next()
  } else {
    req.flash('error', 'You can\'t do that if you\'re already logged in!')
    res.redirect('back')
  }
}

/**
 * Function that return middleware, to check if the currently logged in user
 * owns the page they are trying to access
 */

function checkOwnership (database, missingError, authError) {
  return async (req, res, next) => {
    try {
      let id
      switch (database) {
        case Comment:
          id = req.params.comment_id
          break
        default:
          id = req.params.id
      }

      const accessItem = await database.findById(id)
      if (isEmpty(accessItem)) {
        throw missingError
      }

      // If the accessed item is the user, we can simply access its id directly.
      // Otherwise, we must access the author or the object and then its id

      let accessItemId
      switch (database) {
        case User:
          accessItemId = accessItem._id
          break
        default:
          accessItemId = accessItem.author.id
      }
      if (accessItemId.equals(req.user._id)) {
        next()
      } else {
        throw authError
      }
    } catch (err) {
      helper.displayError(req, err)
      res.redirect('back')
    }
  }
}

const checkCampOwnership = checkOwnership(
  Campground,
  helper.customErrors.campMiss,
  helper.customErrors.campAuth)

const checkCommentOwnership = checkOwnership(
  Comment,
  helper.customErrors.commentMiss,
  helper.customErrors.commentAuth)

const checkProfileOwnership = checkOwnership(
  User,
  helper.customErrors.userMiss,
  helper.customErrors.userAuth)

const checkNotificationOwnership = checkOwnership(
  Notification,
  helper.customErrors.notifMiss,
  helper.customErrors.notifAuth
)
/**
 * If we check if the user has authorization to a camp/comment, we must know
 * if they are logged in, for that request. Hence, we pass both middleware
 * functions to the request.
 */
middleware.checkCampStack = [middleware.isLoggedIn, checkCampOwnership]
middleware.checkCommentStack = [middleware.isLoggedIn, checkCommentOwnership]
middleware.checkProfileStack = [middleware.isLoggedIn, checkProfileOwnership]
middleware.checkNotificationStack = [
  middleware.isLoggedIn,
  checkNotificationOwnership]
module.exports = middleware
