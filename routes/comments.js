'use strict'
const express = require('express')
const router = express.Router({ mergeParams: true })

const lodash = require('lodash')
const isEmpty = lodash.isEmpty

const Campground = require('../models/campground')
const Comment = require('../models/comment')
const User = require('../models/user')

const middleware = require('../middleware')
const helper = require('../helper')

/**
 * Route to create a new comment. n the
 */
router.post('/', middleware.isLoggedIn, async (req, res) => {
  try {
    if (!req.body.comment.rating) {
      throw helper.customErrors.commentRatingMiss
    }
    // Template for the new comment
    const newCommentTemp = req.body.comment

    newCommentTemp.author = {
      id: req.user.id
    }

    const [camp, newComment, user] = await Promise.all([
      Campground.findById(req.params.id),
      Comment.create(newCommentTemp),
      User.findById(req.user.id)
    ])

    if (req.user.campsRated.includes(camp)) {
      throw helper.customErrors.commetExists
    }
    if (isEmpty(camp)) {
      throw helper.customErrors.commentMiss
    } else if (isEmpty(newComment)) {
      throw helper.customErrors.commentMiss
    } else if (isEmpty(user)) {
      throw helper.customErrors.userMiss
    }

    // Update rating for the camp
    camp.averageRating =
      (camp.averageRating * camp.numRatings + newComment.rating) /
      (camp.numRatings + 1)
    camp.numRatings++

    camp.comments.push(newComment)
    user.campsRated.push(camp._id)

    await Promise.all([
      camp.save(),
      user.save()
    ])

    req.flash('success', 'Comment Created!')
    res.redirect('/campgrounds/' + camp.id)
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('/campgrounds/')
  }
})

/**
 * Route to edit a comment.
 */
router.put('/:comment_id', middleware.checkCommentStack, async (req, res) => {
  try {
    const [comment, camp] = await Promise.all([
      Comment.findById(req.params.comment_id),
      Campground.findById(req.params.id)
    ])

    if (isEmpty(comment)) {
      throw helper.customErrors.commentMiss
    } else if (isEmpty(camp)) {
      throw helper.customErrors.campMiss
    }

    // Adjust camp rating
    const oldRatingTotal = camp.averageRating * camp.numRatings
    const ratingAdjustment = req.body.comment.rating - comment.rating
    camp.averageRating = (oldRatingTotal + ratingAdjustment) / camp.numRatings

    // Update comment
    comment.text = req.body.comment.text
    comment.rating = req.body.comment.rating

    await Promise.all([
      camp.save(),
      comment.save()
    ])

    req.flash('success', 'Comment Updated!')
    res.redirect('/campgrounds/' + req.params.id)
  } catch (err) {
    helper.displayError(req, err)
    // Go back to the original campground show page
    res.redirect('/campgrounds/')
  }
})

/**
 * Route to delete a comment.
 */
router.delete('/:comment_id', middleware.checkCommentStack, async (req, res) => {
  try {
    const [removedComment, camp, user] = await Promise.all([
      Comment.findByIdAndRemove(req.params.comment_id),
      Campground.findById(req.params.id),
      User.findById(req.user.id)
    ])

    if (isEmpty(removedComment)) {
      throw helper.customErrors.commentDelete
    }

    // Remove comment ID from camp
    camp.comments.splice(camp.comments.indexOf(removedComment._id), 1)

    // Adjust camp rating
    const oldRatingTotal = camp.averageRating * camp.numRatings
    camp.numRatings--
    camp.averageRating = (oldRatingTotal - removedComment.rating) / camp.numRatings

    // Adjust rated camps of user
    user.campsRated.splice(user.campsRated.indexOf(camp._id), 1)

    await Promise.all([
      camp.save(),
      user.save()
    ])
    req.flash('success', 'Comment deleted!')
    res.redirect('/campgrounds/' + req.params.id)
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('/campgrounds/' + req.params.id)
  }
})

module.exports = router
