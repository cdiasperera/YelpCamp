var Campground    = require("../models/campground");
var Comment       = require("../models/comment");

var middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You need to be logged in, matey!");
    res.redirect("/login");
  }
}

function checkCampOwnership (req, res, next) {
  Campground.findById(req.params.id, (err, foundCamp) => {
    if (err) {
      req.flash("error", err.message);
      res.redirect("/campgrounds");
    } else {
      if (foundCamp.author.id.equals(req.user._id)) {
        next();
      } else {
        req.flash("error", "You do not have access to that camp! Sneaky!");
        res.redirect("back");
      }
    }
  });
}

function checkCommentOwnership (req, res, next) {
  console.log(req.params.comment_id);
  Comment.findById(req.params.comment_id, (err, foundComment) => {
    if (err) {
      req.flash("error", err.message); 
      res.redirect("back");
    } else {
      if (foundComment.author.id.equals(req.user._id)) {
        next();
      } else {
        req.flash("error", "You do not have access to that comment! Crafty!");
        res.redirect("back");
      }
    }
  })
}

middlewareObj.checkCampStack    = [middlewareObj.isLoggedIn, checkCampOwnership];
middlewareObj.checkCommentStack = [middlewareObj.isLoggedIn, checkCommentOwnership];

module.exports = middlewareObj;
