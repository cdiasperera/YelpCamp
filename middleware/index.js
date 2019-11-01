var Campground    = require("../models/campground");
var middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.session.returnTo = req.originalUrl;
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
        res.redirect("back");
      }
    }
  });
}

function checkCommentOwnership (req, res, next) {
  Comment.findById(req.params.comment_id, (err, foundComment) => {
    if (err) {
      console.log(err);
    } else {
      if (foundComment.author.id.equals(req.user._id)) {
        next();
      } else {
        res.redirect("back");
      }
    }
  })
}

middlewareObj.checkCampStack    = [middlewareObj.isLoggedIn, checkCampOwnership];
middlewareObj.checkCommentStack = [middlewareObj.isLoggedIn, checkCampOwnership];

module.exports = middlewareObj;
