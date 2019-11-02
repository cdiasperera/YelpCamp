var Campground    = require("../models/campground");
var Comment       = require("../models/comment");

var middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "Please Login First");
    res.redirect("/login");
  }
}

function checkCampOwnership (req, res, next) {
  Campground.findById(req.params.id, (err, foundCamp) => {
    if (err) {
      console.log(err);
    } else {
      if (foundCamp.author.id.equals(req.user._id)) {
        next();
      } else {
        req.flash("error", "You do not have access to that camp!");
        res.redirect("back");
      }
    }
  });
}

function checkCommentOwnership (req, res, next) {
  console.log(req.params.comment_id);
  Comment.findById(req.params.comment_id, (err, foundComment) => {
    if (err) {
      console.log(err);
    } else {
      if (foundComment.author.id.equals(req.user._id)) {
        next();
      } else {
        req.flash("error", "You do not have access to that comment!");
        res.redirect("back");
      }
    }
  })
}

middlewareObj.checkCampStack    = [middlewareObj.isLoggedIn, checkCampOwnership];
middlewareObj.checkCommentStack = [middlewareObj.isLoggedIn, checkCommentOwnership];

module.exports = middlewareObj;
