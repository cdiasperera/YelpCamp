'use strict'
// IMPORTS

require('dotenv').config({ silent: process.env.NODE_ENV === 'production' })
const sessionSecret = process.env.SESS_SECRET

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
const favicon = require('serve-favicon')
const scrape = require('website-scraper')

const User = require('./models/user')

const campgroundRoutes = require('./routes/campgrounds')
const commentRoutes = require('./routes/comments')
const indexRoutes = require('./routes/index')
const notifRoutes = require('./routes/notifs')
const userRoutes = require('./routes/user')
const helper = require('./helper')
const middleware = require('./middleware')

// CONFIG APP
const app = express()
app.use(express.static(path.join(__dirname, '/public')))
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(flash())

app.use(favicon(path.join(__dirname, 'public', 'imgs', 'favicon.ico')))

// DB CONFIG
const mongoURI = helper.makeMongoURI()

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
app.use(middleware.locals)

// Reset Database
if (helper.producSeeding) {
  if (process.env.NODE_ENV === 'production') {
    require('./seeding/seedProduction')()
  }
}

if (helper.devSeeding) {
  // Not in production, so we can run seedDB, if needed.
  if (process.env.NODE_ENV === 'development') {
    require('./seeding/seeds')()
  }
}
app.use('/', indexRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/comments', commentRoutes)
app.use('/notifs', notifRoutes)
app.use('/users', userRoutes)
// Start server
const port = process.env.PORT || 3000

app.get('/:apiKey/scraper', async (req, res) => {
  if (req.params.apiKey !== process.env.SCRAPER_KEY) {
    res.redirect('/campgrounds/')
  } else {
    const options = {
      urls: ['https://en.wikipedia.org/wiki/List_of_national_parks_of_the_United_States'],
      directory: './seeding/wikipediaCamps',
      sources: []
    }
    try {
      console.log('scraping')
      await scrape(options)
      console.log('scraped')
      res.redirect('/campgrounds/')
    } catch (err) {
      console.log(err)
    }
  }
})

app.listen(port, () => {
  console.log('YelpCamp server is running.')
})
