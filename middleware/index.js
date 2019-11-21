'use strict'
const Campground = require('../models/campground')
const Comment = require('../models/comment')

const helper = require('../helper')

const middlewareObj = {}

/**
 * Function to make sure user is logged in
 */
middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  } else {
    req.session.returnTo = req.originalUrl
    req.flash('error', 'You need to be logged in, matey!')
    res.redirect('/login')
  }
}
/**
 * Middleware to check if the user has authorization, with regards to that camp
 */
function checkCampOwnership (req, res, next) {
  Campground.findById(req.params.id, (err, foundCamp) => {
    if (err || !foundCamp) {
      helper.displayError(req, err, helper.customErrors.campId)
      res.redirect('/campgrounds')
    } else {
      if (foundCamp.author.id.equals(req.user._id)) {
        next()
      } else {
        req.flash('error', 'You do not have access to that camp! Sneaky!')
        res.redirect('back')
      }
    }
  })
}

/**
 * Middleware to check if the user has authorization, with regards to a comment
 */
function checkCommentOwnership (req, res, next) {
  Comment.findById(req.params.comment_id, (err, foundComment) => {
    if (err || !foundComment) {
      helper.displayError(req, err, helper.customErrors.commentId)
      res.redirect('back')
    } else {
      if (foundComment.author.id.equals(req.user._id)) {
        next()
      } else {
        req.flash('error', 'You do not have access to that comment! Crafty!')
        res.redirect('back')
      }
    }
  })
}

/**
 * If we check if the user has authorization to a camp/comment, we must know
 * if they are logged in, for that request. Hence, we pass both middleware
 * functions to the request.
 */
middlewareObj.checkCampStack = [middlewareObj.isLoggedIn, checkCampOwnership]
middlewareObj.checkCommentStack = [middlewareObj.isLoggedIn, checkCommentOwnership]

module.exports = middlewareObj
