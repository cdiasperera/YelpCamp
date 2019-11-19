"use strict";
const express     = require("express");
const router      = express.Router({mergeParams: true});

const lodash      = require("lodash")
const isEmpty     = lodash.isEmpty;

const Campground  = require("../models/campground");
const Comment     = require("../models/comment");

const middleware  = require("../middleware");
const helper      = require("../helper");

/**
 * Route to page to create a new comment.
 */
router.get("/new", middleware.isLoggedIn, async (req, res) => {
  try{
    let foundCamp = await Campground.findById(req.params.id);
    if (isEmpty(foundCamp)) {
      throw helper.customErrors.campMiss
    }

    res.render("comments/new", {camp: foundCamp});
  } catch (err) {
    helper.displayError(req, err);
    res.render("back");
  }
});

/**
 * Route to create a new comment. n the  
 */
router.post("/", middleware.isLoggedIn, async (req, res) => {
  try {
    // Template for the new comment
    let newCommentTemp = req.body.comment;
    newCommentTemp.author = {
      id: req.user._id,
      username: req.user.username
    }

    let [camp, newComment] = await Promise.all([
      Campground.findById(req.params.id),
      Comment.create(newCommentTemp)
    ]);

    if (isEmpty(camp)) {
      throw helper.customErrors.commentMiss;
    } else if (isEmpty(newComment)) {
      throw helper.customErrors.commentMiss;
    }

    camp.comments.push(newComment);
    camp.save();

    req.flash("success", "Comment Created!");
    res.redirect("/campgrounds/" + camp.id);
  } catch (err) {
    helper.displayError(req, err);
    res.redirect("/");
  }
});

/**
 * Route to the page to edit a comment.
 */
router.get("/:comment_id/edit", middleware.checkCommentStack, async (req, res) => {
  try {
    let [foundCamp, foundComment] = await Promise.all([
      Campground.findById(req.params.id),
      Comment.findById(req.params.comment_id)
    ]);

    if (isEmpty(foundCamp)) {
      throw helper.customErrors.campMiss;
    }
    // Missing comment error handled in middleware

    console.log(foundComment);
    res.render("comments/edit", {camp: foundCamp, comment: foundComment})
  } catch (err) {
    helper.displayError(req, err);
    res.redirect("back");
  }
});

/**
 * Route to edit a comment.
 */
router.put("/:comment_id", middleware.checkCommentStack, async (req, res) => {
  try {
    let updatedComment= await Comment.findByIdAndUpdate(
      req.params.comment_id,
      {text: req.body.comment.text}
    );

    if (isEmpty(updatedComment)) {
      throw helper.customErrors.commentUpdate;
    }

    req.flash("success", "Comment Updated!");
    // Go back to the original campground show page
    res.redirect("/campgrounds/" + req.params.id);
  } catch (err) {
    helper.displayError(req, err);
    // Go back to the original campground show page
    res.redirect("/campgrounds/" + req.params.id);
  }
});

/**
 * Route to delete a comment.
 */
router.delete("/:comment_id", middleware.checkCommentStack, async (req, res) => {
  try {
    let removedComment = await Comment.findByIdAndRemove(req.params.comment_id);
    if (isEmpty(removedComment)) {
      throw helper.customErrors.commentDelete;
    }

    res.redirect("/campgrounds/" + req.params.id);
  } catch (err) {
    helper.displayError(req, err);
    res.redirect("/campgrounds/" + req.params.id);
  }
});

module.exports = router;