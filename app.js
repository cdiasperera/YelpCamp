'use strict'
// IMPORTS
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const methodOverride = require('method-override')
const flash = require('connect-flash')
const path = require('path')
const User = require('./models/user')

const campgroundRoutes = require('./routes/campgrounds')
const commentRoutes = require('./routes/comments')
const indexRoutes = require('./routes/index')
const notifRoutes = require('./routes/notifs')

const seedDB = require('./seeds')
const seedProduction = require('./seedProduction')
const helperObj = require('./helper')

require('dotenv').config({ silent: process.env.NODE_ENV === 'production' })
const sessionSecret = process.env.SESS_SECRET

// CONFIG APP
const app = express()
app.use(express.static(path.join(__dirname, '/public')))
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(flash())

// DB CONFIG
const mongoURI = helperObj.makeMongoURI()

mongoose.connect(
  mongoURI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }
).then(() => {
  console.log('Connected to MongoDB')
}
).catch((err) => {
  console.log('Connection Issue')
  console.log(err)
})

// MOMENT CONFIG
app.locals.moment = require('moment')
// PASSPORT CONFIG
app.use(session({
  secret: sessionSecret,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Pass in the user information to all pages
app.use(async (req, res, next) => {
  res.locals.currentUser = req.user
  if (typeof req.user !== 'undefined') {
    try {
      const user = await User.findById(req.user.id)
        .populate('notifs')
        .exec()

      // Only send notifications that aren't read
      res.locals.notifs = user.notifs.filter((notif) => {
        return !notif.isRead
      })
    } catch (err) {
      helperObj.displayError(req, err)
      res.redirect('back')
    }
  }
  res.locals.error = req.flash('error')
  res.locals.success = req.flash('success')
  next()
})

// Reset Database
// Safety check to only run code in dev, not production.
const seeding = false
if (seeding) {
  if (process.env.NODE_ENV === 'production') {
    seedProduction()
  } else {
    // Not in production, so we can run seedDB, if needed.
    seedDB()
  }
}
app.use('/', indexRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/comments', commentRoutes)
app.use('/notifs', notifRoutes)

// Start server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log('YelpCamp server is running.')
})
