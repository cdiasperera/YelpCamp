// IMPORTS
var express               = require("express");
var bodyParser            = require("body-parser");
var mongoose              = require("mongoose");
var passport              = require("passport");
var LocalStrategy         = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var session               = require("express-session");
var Campground            = require("./models/campground");
var Comment               = require("./models/comment");
var User                  = require("./models/user");
var seedDB                = require("./seeds");
var sessionSecret         = require("./secret.js");

// CONFIG APP
app = express();
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }))


// PASSPORT CONFIG
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Pass in the user information to all pages
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  console.log(req.user);
  next();
});

// DB CONFIG
mongoose.connect(
  "mongodb://localhost:27017/yelp_camp", 
  {useNewUrlParser: true, useUnifiedTopology: true}
);

// Reset Database
// seedDB();

// ROUTING - CAMPGROUNDS
app.get("/", (req, res) => {
    res.render("homepage");
});

app.get("/campgrounds", (req, res) => {
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

app.post("/campgrounds", (req, res) => {
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

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

app.get("/campgrounds/:id", (req, res) => {
    Campground.findById(req.params.id).populate("comments").exec( 
    (err, foundCampground) => {
      if (err) {
        console.log(err);
      } else {
        res.render("campgrounds/show", {campground: foundCampground});
      }
    });
});

// ROUTING - COMMENTS
app.get("/campgrounds/:id/comments/new", isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", {campground: foundCampground});
    }
  });
});

app.post("/campgrounds/:id/comments", isLoggedIn, (req, res) => {
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

// ROUTING - AUTH
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  User.register(
    new User({username: req.body.username}),
    req.body.password,
    (err, username) => {
      if (err) {
        console.log(err);
        return res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/campgrounds");
        })
      }
    });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate(
    "local",
    {
      successRedirect: "/campgrounds",
      failureRedirect: "/login"
    }),
  (req, res) => {}
);

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
})

// Start server
port = process.env.port || 3000;
app.listen(port, () => {
    console.log("YelpCamp server is running.")
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}