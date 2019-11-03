var express     = require("express");
var router      = express.Router({mergeParams: true});

var Campground  = require("../models/campground");
var Comment     = require("../models/comment");

var middleware  = require("../middleware");
var helper      = require("../helper");

/**
 * Route to page to create a new comment.
 */
router.get("/new", middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err || !foundCampground) {
      helper.displayError(req, err, helper.customErrors.campId);
      res.render("back");
    } else {
      res.render("comments/new", {campground: foundCampground});
    }
  });
});

/**
 * Route to create a new comment. n the  
 */
router.post("/", middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    // Manually add user information
    var newComment = req.body.comment;
    newComment.author = {
        id: req.user._id,
        username: req.user.username
      }
    Comment.create(newComment, (err, createdComment) => {
      if (err || !createdComment) {
        helper.displayError(req, err, helper.customErrors.campId);
        res.redirect("/");
      } else {
        // Once the comment is created, associate it to the campground.
        campground.comments.push(createdComment);
        campground.save();

        req.flash("success", "Comment Created!");
        res.redirect("/campgrounds/" + campground._id);
      }
    });
  });
});

/**
 * Route to the page to edit a comment.
 */
router.get("/:comment_id/edit", middleware.checkCommentStack, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err || !foundCampground) {
      helper.displayError(req, err, helper.customErrors.campId);
      res.redirect("back");
    } else {
      Comment.findById(req.params.comment_id, (err, foundComment) => {
        if (err ||!foundComment) {
          // Handled in middleware.checkCommentStack
        } else {
          res.render("comments/edit", {
            campground: foundCampground, 
            comment: foundComment
          });
        }
      });
    }
  });
});

/**
 * Route to edit a comment.
 */
router.put("/:comment_id", middleware.checkCommentStack, (req, res) => {
  Comment.findByIdAndUpdate(
    req.params.comment_id, 
    {text: req.body.comment.text}, 
    (err, updatedComment) => {
      if (err || !updatedComment) {
        helper.displayError(req, err, helper.customErrors.commentUpdate);
        res.redirect("/campgrounds/" + req.params.id);
      } else {
        req.flash("success", "Comment Updated!");
        res.redirect("/campgrounds/" + req.params.id);
      }
  })
});

/**
 * Route to delete a comment.
 */
router.delete("/:comment_id", middleware.checkCommentStack, (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, (err, removedComment) => {
    if (err || !removedComment) {
      helper.displayError(req, err, helper.customErrors.commentDelete);
      res.redirect("/campgrounds/" + req.params.id);
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

module.exports = router;