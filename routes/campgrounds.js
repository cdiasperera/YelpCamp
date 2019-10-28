var express    = require("express");
var router     = express.Router({mergeParams: true});
var Campground = require("../models/campground");

router.get("/", (req, res) => {
    Campground.find({}, (err, allCampgrounds) => {
      if (err) {
            console.log(err);
        } else {
        res.render(
          "campgrounds/index",
          {
            campgrounds: allCampgrounds,
          });
        }
    });
});

router.post("/", isLoggedIn, (req, res) => {
    var newCampground = {   image:req.body.source,
                            desc: req.body.desc,
                            author: {
                              id: req.user.id,
                              username: req.user.username
                            }};
    console.log(newCampground.author);
    Campground.create(newCampground, (err, campground) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect("campgrounds/");
        }
    });
});

router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

router.get("/:id", (req, res) => {
    Campground.findById(req.params.id).populate("comments").exec( 
    (err, foundCampground) => {
      if (err) {
        console.log(err);
      } else {
        res.render("campgrounds/show", {campground: foundCampground});
      }
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
