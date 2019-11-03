var express     = require("express");
var router      = express.Router({mergeParams: true});

var Campground  = require("../models/campground");
var Comment     = require("../models/comment");

var middleware  = require("../middleware");

router.get("/", (req, res) => {
  Campground.find({}, (err, allCampgrounds) => {
    if (err) {
      req.flash("error", "No campgrounds could be reached! Call 911! Help!");
      res.redirect("/");
    } else {
      res.render(
        "campgrounds/index",
        {campgrounds: allCampgrounds});
      }
  });
});

router.post("/", middleware.isLoggedIn, (req, res) => {
    var newCampground = {   
      name: req.body.name,
      image:req.body.source,
      desc: req.body.desc,
      author: {
        id: req.user._id,
        username: req.user.username
      }
    };
    Campground.create(newCampground, (err, campground) => {
        if (err) {
          req.flash("error", "Whoops! We could not create your camp! Call 911!")
          res.redirect("/campgrounds");
        } else {
          req.flash("success", "Campground Created!");
          res.redirect("campgrounds/");
        }
    });
});

router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

router.get("/:id", (req, res) => {
    Campground.findById(req.params.id).populate("comments").exec( 
    (err, foundCampground) => {
      if (err) {
        req.flash("error", "Dios mio! That campground doesn't exist dawg!");
        res.redirect("/campgrounds");
      }
        res.render("campgrounds/show", {campground: foundCampground});
    });
});

router.get("/:id/edit", middleware.checkCampStack, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      // Handled in middleware.checkCampStack
    } else {
      res.render("campgrounds/edit", {campground: foundCampground});
    }
  });
});

router.put("/:id", middleware.checkCampStack, (req, res) => {
  Campground.findByIdAndUpdate(
    req.params.id, 
    req.body.campground, 
    (err, updatedCampground) => {
      if (err) {
        req.flash("error", "Eggo! We couldn't update your campground!");
        res.redirect("/campgrounds");
      } else {
        req.flash("success", "Campground Updated!");
        res.redirect("/campgrounds/" + req.params.id);
      }
    }); 
});

router.delete("/:id", middleware.checkCampStack, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, (err, campRemoved) => {
    if (err) {
      req.flash("error", "We couldn't remove your campground???");
      res.redirect("back");
    } else {
      Comment.deleteMany( {_id: { $in: campRemoved.comments } }, (err) => {
        if (err) {
          req.flash("error", "Oh no! Something went wrong deleting the comments!");
          res.redirect("back");
        }
        req.flash("success", "Campground Deleted!");
        res.redirect("/campgrounds"); 
      })
    }
  })
});

module.exports = router;
