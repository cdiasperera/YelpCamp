const express = require('express')
const router = express.Router({ mergeParams: true })
const nodeMailer = require('nodemailer')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const moment = require('moment')
const emails = require('../emails')

const Notification = require('../models/notif')

const usernameSchema = require('../models/username')
const passwordSchema = require('../models/password')
const emailValidator = require('email-validator')
const helper = require('../helper')
const middleware = require('../middleware')
const isEmpty = require('lodash').isEmpty

router.get('/register', (req, res) => {
  res.render('users/register')
})

/**
 * Add use to DB
 */
router.post('/', async (req, res) => {
  try {
    validateUserDetails({
      password: req.body.password,
      username: req.body.username,
      email: req.body.user.email,
      avatar: req.body.user.avatar
    })
    const userTemplate = await new User(req.body.user)

    const user = await User.register(userTemplate, req.body.password)

    // Configure Transporter
    const transporter = nodeMailer.createTransport(emails.transporConfig)
    await transporter.verify()

    const mail = emails.verifyEmail

    // Create verifying email token
    const token = await crypto.randomBytes(32).toString('hex')
    const tokenLink = `${req.headers.host}/users/${user._id}/activate/${token}`
    mail.addLink(tokenLink)

    transporter.sendMail({
      from: emails.serverEmail,
      to: user.email,
      subject: 'Account Activation - YelpCamp',
      html: mail.mailContent
    })

    user.activateToken = token
    await user.save()

    req.login(user, (err) => {
      if (!err) {
        req.flash('success',
          'Welcome Aboard! Check your email to verify your account!' +
          ' It might be in your spam!')
        res.redirect('/campgrounds')
      } else {
        throw err
      }
    })
  } catch (err) {
    console.log(err)
    helper.displayError(req, err)
    res.redirect('/users/register')
  }
})

/**
 * Gets a users 'show' page.
 * Alternatively, if the user is logged in, it shows their edit page.
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (isEmpty(user)) {
      throw helper.customErrors.userMiss
    }

    // Render 'show' page for user, for visitors to the users page
    if (!req.user || !user._id.equals(req.user.id)) {
      res.render('users/show', { user })
    } else {
      if (!user.activated) {
        throw helper.customErrors.unActivated
      }
      res.render('users/edit', { user })
    }
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('back')
  }
})

/**
 * Updates a users details
 */
router.put('/:id', middleware.checkProfileStack, async (req, res) => {
  try {
    validateUserDetails({
      username: req.body.username,
      email: req.body.user.email,
      avatar: req.body.user.avatar
    })
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body.user)
    if (isEmpty(updatedUser)) {
      throw helper.customErrors.userUpdate
    }

    req.flash('success', 'Your details are updated')
    res.redirect('/users/' + req.params.id)
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('back')
  }
})

/**
 * Route to follow/unfollow a user
 */
router.post('/:id/follow', middleware.isLoggedIn, async (req, res) => {
  try {
    if (req.user.id !== req.body.follower) {
      throw helper.customErrors.followerAuth
    }

    const queries = []
    queries.push(User.findById(req.params.id))
    queries.push(User.findById(req.body.follower))

    const [user, follower] = await Promise.all(queries)

    if (isEmpty(user) || isEmpty(follower)) {
      throw helper.customErrors.userMiss
    }

    if (req.body.action === 'follow' &&
      !user.followers.includes(req.body.follower)) {
      // If the follower is already not a follower and a follow action is sent
      user.followers.push(follower)

      const newFollowerNotifTemplate = {
        link: `/users/${follower._id}`,
        notifType: 'newFollower'
      }

      const notif = await Notification.createNotification(newFollowerNotifTemplate)

      await Notification.sendNotifications([user], notif)
    } else if (req.body.action === 'unfollow' &&
      user.followers.includes(req.body.follower)) {
      // Remove follower from followers list
      user.followers = user.followers.filter((follower) => {
        return !follower.equals(req.body.follower)
      })
    }
    await user.save()
    res.redirect('back')
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('back')
  }
})

/**
 * Route to send a password reset email to the requested uer
 */
router.get('/:id/pReset', async (req, res) => {
  try {
    // Set up transporter
    const transporter = nodeMailer.createTransport(emails.transporConfig)

    // Send email
    const resolvedPromises = await Promise.all([
      User.findById(req.params.id),
      transporter.verify()
    ])

    const user = resolvedPromises[0]

    const mail = emails.resetPassword

    // Generate token and send it to the user.
    const token = await crypto.randomBytes(32).toString('hex')
    const tokenLink = `${req.headers.host}/users/${user._id}/token/${token}`
    mail.addLink(tokenLink)

    // No need to await as nothing is depending on this executing
    transporter.sendMail({
      from: emails.serverEmail,
      to: user.email,
      subject: 'Password Reset - YelpCamp',
      html: mail.mailContent
    })

    const hashedToken = bcrypt.hashSync(token, 10)
    const expiry = moment().add(2, 'hours')
    user.resetTokenHash = hashedToken
    user.resetExpiry = expiry
    // While there is no need to wait for the data to save, practically,
    // by waiting we avoid any race conditions where the user clicks the link
    // and tries to reset before the hashes are saved
    await user.save()
    req.flash('success',
      'Password Reset Email was sent! Please check your email!' +
      ' Check your spam as well!')
    res.redirect('back')
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('/campgrounds')
  }
})

/**
 * Activates a users account
 */
router.get('/:id/activate/:token_id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (isEmpty(user)) {
      throw helper.customErrors.userMiss
    }

    if (req.params.token_id === user.activateToken) {
      user.activated = true
      await user.save()

      req.flash('success', 'Your account can now be accessed!')
      res.redirect('/campgrounds')
    } else {
      throw helper.customErrors.activateTokenInvalid
    }
  } catch (err) {

  }
})

/**
 * Processes a password reset request, through the use of a token.
 * If the token is valid, a reset form is sent
 */
router.get('/:id/token/:token_id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    // Check if there was a valid token
    if (isEmpty(user)) {
      throw helper.customErrors.resetUserMiss
    }

    // Check if the token has expired
    if (user.resetExpiry.getTime() > moment()) {
      if (await bcrypt.compare(req.params.token_id, user.resetTokenHash)) {
        const locals = { userId: req.params.id, tokenId: req.params.token_id }
        res.render('users/passReset', locals)
      } else {
        throw helper.customErrors.resetInvalid
      }
    } else {
      throw helper.customErrors.resetExpire
    }
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('back')
  }
})

/**
 * Process the actual password update
 */
router.post('/:id/token/:token_id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (isEmpty(user)) {
      throw helper.customErrors.resetUserMiss
    }

    if (user.resetExpiry.getTime() > moment()) {
      if (await bcrypt.compare(req.params.token_id, user.resetTokenHash)) {
        await user.setPassword(req.body.password)
        await user.save()

        req.flash('success', 'Password changed!')
        res.redirect('/campgrounds')
      } else {
        throw helper.customErrors.resetInvalid
      }
    } else {
      throw helper.customErrors.resetExpire
    }
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('/campgrounds')
  }
})

/**
 * Validates the password, username, email and avatar. Checking holds these values
 */
async function validateUserDetails (checking) {
  if (checking.username) {
    helper.validate(usernameSchema, checking.username, { list: true })
  }
  if (checking.password) {
    helper.validate(passwordSchema, checking.password, { list: true })
  }

  if (checking.email) {
    if (!emailValidator.validate(checking.email)) {
      throw helper.customErrors.emailInvalid
    } else {
      const emailUser = await User.findOne({ email: checking.email })
      if (!isEmpty(emailUser)) {
        throw helper.customErrors.emailUsed
      }
    }
  }

  if (checking.avatar) {
    checking.avatar = helper.setNoImage(checking.avatar)
  }
}

module.exports = router
