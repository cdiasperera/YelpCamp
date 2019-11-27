'use strict'
const Campground = require('../models/campground')
const Comment = require('../models/comment')
const User = require('../models/user')

const helper = require('../helper')
const isEmpty = require('lodash').isEmpty

const middleware = {}

middleware.locals = async (req, res, next) => {
  res.locals.currentUser = req.user
  if (typeof req.user !== 'undefined') {
    try {
      const user = await User.findById(req.user.id)
        .populate('notifs')
        .exec()

      // Only send notifications that aren't read
      const notifsUnordered = user.notifs.filter((notif) => {
        return !notif.isRead
      })

      res.locals.notifs = notifsUnordered
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

  res.locals.error = req.flash('error')
  res.locals.success = req.flash('success')
  next()
}

/**
 * Function to make sure user is logged in
 */
middleware.isLoggedIn = async (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  } else {
    req.flash('error', 'You need to be logged in, matey!')
    res.redirect('/login')
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
        case Campground:
          id = req.params.id
          break
        case Comment:
          id = req.params.comment_id
          break
        case User:
          id = req.params.id
          break
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
          accessItemId = accessItemId.author.id
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

/**
 * If we check if the user has authorization to a camp/comment, we must know
 * if they are logged in, for that request. Hence, we pass both middleware
 * functions to the request.
 */
middleware.checkCampStack = [middleware.isLoggedIn, checkCampOwnership]
middleware.checkCommentStack = [middleware.isLoggedIn, checkCommentOwnership]
middleware.checkProfileStrack = [middleware.isLoggedIn, checkProfileOwnership]

module.exports = middleware
