// IMPORTS
var express               = require("express");
var bodyParser            = require("body-parser");
var mongoose              = require("mongoose");
var passport              = require("passport");
var LocalStrategy         = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var session               = require("express-session");
var methodOverride        = require("method-override");
var Campground            = require("./models/campground");
var Comment               = require("./models/comment");
var User                  = require("./models/user");

var campgroundRoutes      = require("./routes/campgrounds");
var commentRoutes         = require("./routes/comments");
var indexRoutes           = require("./routes/index");

var seedDB                = require("./seeds");
var sessionSecret         = require("./secret.js");

// CONFIG APP
app = express();
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride("_method"));

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
  next();
});

// DB CONFIG
mongoose.connect(
  "mongodb://localhost:27017/yelp_camp", 
  {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify: false}
);

// Reset Database
// seedDB();

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

// Start server
port = process.env.port || 3000;
app.listen(port, () => {
    console.log("YelpCamp server is running.")
});
