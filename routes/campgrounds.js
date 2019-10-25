var express    = require("express");
var router     = express.Router();
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

router.post("/", (req, res) => {
    var newCampground = {   name: req.body.name, image:req.body.source,
                            desc: req.body.desc};
    Campground.create(newCampground, (err, campground) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("campgrounds/index");
        }
    });
});

router.get("/new", (req, res) => {
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

module.exports = router;
