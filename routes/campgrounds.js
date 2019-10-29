var express     = require("express");
var router      = express.Router({mergeParams: true});

var Campground  = require("../models/campground");
var Comment     = require("../models/comment");
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
    var newCampground = {   
                            name: req.body.name,
                            image:req.body.source,
                            desc: req.body.desc,
                            author: {
                              id: req.user.id,
                              username: req.user.username
                            }};
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

router.get("/:id/edit", (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.log(err); 
    } else {
      res.render("campgrounds/edit", {campground: foundCampground});
    }
  });
});

router.put("/:id", (req, res) => {
  Campground.findByIdAndUpdate(
    req.params.id, 
    req.body.campground, 
    (err, updatedCampground) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/campgrounds/" + req.params.id);
      }
    }); 
});

router.delete("/:id", (req, res) => {
  Campground.findByIdAndRemove(req.params.id, (err, campRemoved) => {
    if (err) {
      console.log(err);
    } else {
      Comment.deleteMany( {_id: { $in: campRemoved.comments } }, (err) => {
        if (err) {
          console.log(err);
        }
        res.redirect("/campgrounds"); 
      })
    }
  })
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
