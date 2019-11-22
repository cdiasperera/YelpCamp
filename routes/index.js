'use strict'
const express = require('express')
const router = express.Router()
const passport = require('passport')
const moment = require('moment')

const helper = require('../helper')

const passwordSchema = require('../models/password')
const usernameSchema = require('../models/username')
const User = require('../models/user')
const Notification = require('../models/notif')

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
router.get('/register', (req, res) => {
  res.render('register')
})

/**
 * Route which created a user.
 */

router.post('/register', async (req, res) => {
  const password = req.body.password

  try {
    const usernameErrors = usernameSchema.validate(req.body.username, { list: true })
    if (usernameErrors.length > 0) {
      throw passwordSchema.errorMessage(
        usernameErrors,
        usernameSchema.invalidPasswordMessages)
    }

    // Check if the password is a valid password
    const passwordErrors = passwordSchema.validate(password, { list: true })
    if (passwordErrors.length > 0) {
      throw passwordSchema.errorMessage(
        passwordErrors,
        passwordSchema.invalidPasswordMessages)
    }

    const userTemplate = await new User(req.body.user)

    const user = await User.register(userTemplate, password)

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
router.get('/login', (req, res) => {
  res.render('login')
})

/**
 * Route to login.
 */
router.post(
  '/login',
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
        const notif = await Notification.create({
          link: '/changelog',
          notifType: 'changelog'
        })

        Notification.generateMessage(notif)
        await notif.save()

        user.notifs.push(notif)
        await user.save()
      }

      // Reset lastLogin date
      user.lastLogin = moment()
      await user.save()
    } catch (err) {
      helper.displayError(req, err)
      res.redirect('/login')
    }

    // Return to the previous page, if previous page is know. Otherwise, go to the index.
    const returnTo = req.session.returnTo ? req.session.returnTo : '/campgrounds'
    delete req.session.returnTo
    res.redirect(returnTo)
  }
)

/**
 * Route to log out.
 */
router.get('/logout', (req, res) => {
  req.logout()

  req.flash('success', 'Logged out!')
  res.redirect('/campgrounds')
})

module.exports = router
