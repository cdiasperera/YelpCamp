'use strict'
const express = require('express')
const router = express.Router()
const passport = require('passport')
const moment = require('moment')

const passwordSchema = require('../models/password')
const usernameSchema = require('../models/username')
const User = require('../models/user')
const Notification = require('../models/notif')

const helper = require('../helper')
const middleware = require('../middleware')
const isEmpty = require('lodash').isEmpty

/**
 * Route to the landing page.
 */
router.get('/', (req, res) => {
  res.render('landing')
})

/**
 * Route to the about page of the website.
 */
router.get('/about', (req, res) => {
  res.render('about')
})

/**
 * Route to the changelog page of the website.
 */
router.get('/changelog', (req, res) => {
  res.render('changelog')
})
/**
 * Route to the register page.
 */
router.get('/register', middleware.isNotLoggedIn, (req, res) => {
  res.render('register')
})

/**
 * Route which created a user.
 */
router.post('/register', middleware.isNotLoggedIn, async (req, res) => {
  const password = req.body.password
  const username = req.body.username

  try {
    // Check if the username is valid
    helper.validate(usernameSchema, username, { list: true })
    // Check if the password is a valid password
    helper.validate(passwordSchema, password, { list: true })

    const userTemplate = await new User(req.body.user)

    await User.register(userTemplate, password)

    req.flash('success', 'Welcome Aboard!')
    res.redirect('/campgrounds')
  } catch (err) {
    helper.displayError(req, err)
    return res.redirect('/register')
  }
})

/**
 * Route to the login page.
 */
router.get('/login', middleware.isNotLoggedIn, (req, res) => {
  res.render('login')
})

/**
 * Route to login.
 */
router.post(
  '/login',
  middleware.isNotLoggedIn,
  passport.authenticate(
    'local',
    {
      failureRedirect: '/login',
      failureFlash: true
    }),
  async (req, res) => {
    // Track the login
    try {
      const user = await User.findById(req.user.id)

      // Create a moment object from the last login to compare moments
      const lastLoginMoment = moment(user.lastLogin)
      if (lastLoginMoment.isBefore(helper.mostRecentUpdate)) {
        const notifTemp = {
          link: '/changelog',
          notifType: 'changelog'
        }

        const notif = await Notification.createNotification(notifTemp)

        await Notification.sendNotifications([user], notif)
      }

      // Reset lastLogin date
      user.lastLogin = helper.mostRecentUpdate
      await user.save()
    } catch (err) {
      helper.displayError(req, err)
      res.redirect('/login')
    }

    // Return to the previous page, if previous page is know.
    // Otherwise, go to the index.
    const returnTo =
      req.session.returnTo ? req.session.returnTo : '/campgrounds'
    delete req.session.returnTo
    res.redirect(returnTo)
  }
)

/**
 * Route to log out.
 */
router.get('/logout', (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'You need to be logged in to log out!')
  } else {
    req.flash('success', 'Logged out!')
    req.logout()
  }
  res.redirect('/campgrounds')
})

router.get('/forgot', (req, res) => {
  res.render('forgot')
})

router.post('/forgot', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (isEmpty(user)) {
      throw helper.customErrors.userMiss
    }

    res.redirect(`/users/${user.id}/pReset`)
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('/forgot')
  }
})
module.exports = router
