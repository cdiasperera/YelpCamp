var express     = require("express");
var router      = express.Router({mergeParams: true});

var Campground  = require("../models/campground");
var Comment     = require("../models/comment");

var middleware  = require("../middleware");
var helper      = require("../helper");

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

router.post("/", middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    var newComment = req.body.comment;
    Comment.create(req.body.newComment, (err, newComment) => {
      if (err || !newComment) {
        helper.displayError(req, err, helper.customErrors.campId);
        res.redirect("/");
      } else {
        newComment.author.id = req.user._id;
        newComment.author.username = req.user.username;
        newComment.save();
        campground.comments.push(newComment);
        campground.save();

        req.flash("success", "Comment Created!");
        res.redirect("/campgrounds/" + campground._id);
      }
    });
  });
});

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