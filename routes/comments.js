var express    = require("express");
var router     = express.Router({mergeParams: true});

var Campground = require("../models/campground");
var Comment    = require("../models/comment");

var middleware = require("../middleware");

router.get("/new", middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", {campground: foundCampground});
    }
  });
});

router.post("/", middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    Comment.create(req.body.comment, (err, comment) => {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        comment.author.id = req.user.username._id;
        comment.author.username = req.user.username;
        comment.save();
        campground.comments.push(comment);
        campground.save();
        res.redirect("/campgrounds/" + campground._id);
      }
    });
  });
});

router.get("/:comment_id/edit", (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.log(err);
    } else {
      Comment.findById(req.params.comment_id, (err, foundComment) => {
        res.render("comments/edit", {
          campground: foundCampground, 
          comment: foundComment
        });
      });
    }
  });
});

router.put("/:comment_id", (req, res) => {
  Comment.findByIdAndUpdate(
    req.params.comment_id, 
    {text: req.body.comment.text}, 
    (err, updatedComment) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/campgrounds/" + req.params.id);
      }
  })
});

router.delete("/:comment_id", (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, (err, removedComment) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

module.exports = router;