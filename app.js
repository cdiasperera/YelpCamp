// IMPORTS
const express               = require("express");
const bodyParser            = require("body-parser");
const mongoose              = require("mongoose");
const passport              = require("passport");
const LocalStrategy         = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const session               = require("express-session");
const methodOverride        = require("method-override");
const flash                 = require("connect-flash");

const Campground            = require("./models/campground");
const Comment               = require("./models/comment");
const User                  = require("./models/user");

const campgroundRoutes      = require("./routes/campgrounds");
const commentRoutes         = require("./routes/comments");
const indexRoutes           = require("./routes/index");

const seedDB                = require("./seeds");
// Load secret
try {
  const sessionSecret       = require("./secret");
} catch (err) {
  if (err instanceof Error && err.code === "MODULE_NOT_FOUND") {
    // Process Env in this case should be heroku
    const sessionSecret     = process.env.SECRET; 
  }
}

// CONFIG APP
app = express();
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride("_method"));
app.use(flash());

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
  res.locals.error       = req.flash("error");
  res.locals.success     = req.flash("success");
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
