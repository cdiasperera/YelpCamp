var Campground    = require("../models/campground");
var middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
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

middlewareObj.checkOwnershipStack = [middlewareObj.isLoggedIn, checkCampOwnership];

module.exports = middlewareObj;
