var express    = require("express");
var router     = express.Router({mergeParams: true});

var Campground = require("../models/campground");
var Comment    = require("../models/comment");

var middleware = require("../middleware");

router.get("/new", middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      req.flash("Narp! We had an issue with the commets! Message us!");
      res.render("back");
    } else {
      res.render("comments/new", {campground: foundCampground});
    }
  });
});

router.post("/", middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    var newComment = req.body.comment;
    Comment.create(req.body.comment, (err, comment) => {
      if (err) {
        req.flash("error", "Hmmm, we had an issue making that comment. Message us!");
        res.redirect("/");
      } else {
        comment.author.id = req.user._id;
        comment.author.username = req.user.username;
        comment.save();
        campground.comments.push(comment);
        campground.save();

        req.flash("success", "Comment Created!");
        res.redirect("/campgrounds/" + campground._id);
      }
    });
  });
});

router.get("/:comment_id/edit", middleware.checkCommentStack, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      req.flash("error", "Darn dude, we had an issue! Call us");
      res.redirect("back");
    } else {
      Comment.findById(req.params.comment_id, (err, foundComment) => {
        if (err) {
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
      if (err) {
        req.flash("error", "Oh no! We couldn't update your comment! Sorry :(");
        res.redirect("/campgrounds/" + req.params.id);
      } else {
        req.flash("success", "Comment Updated!");
        res.redirect("/campgrounds/" + req.params.id);
      }
  })
});

router.delete("/:comment_id", middleware.checkCommentStack, (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, (err, removedComment) => {
    if (err) {
      req.flash("error", "Hmmm, we couldn't delete that comment. Send us an email!");
      res.redirect("/campgrounds/" + req.params.id);
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

module.exports = router;