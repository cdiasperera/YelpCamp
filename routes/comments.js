var express    = require("express");
var router     = express.Router({mergeParams: true});

var Campground = require("../models/campground");
var Comment    = require("../models/comment");

router.get("/new", isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", {campground: foundCampground});
    }
  });
});

router.post("/", isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    Comment.create(req.body.comment, (err, comment) => {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        campground.comments.push(comment);
        campground.save();
        res.redirect("/campgrounds/" + campground._id);
      }
    });
  });
});

// Middleware. TODO: Refactor
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

module.exports = router;
