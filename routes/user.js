const express = require('express')
const router = express.Router({ mergeParams: true })
const nodeMailer = require('nodemailer')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const moment = require('moment')

const Notification = require('../models/notif')

const usernameSchema = require('../models/username')
const passwordSchema = require('../models/password')

const helper = require('../helper')
const middleware = require('../middleware')
const isEmpty = require('lodash').isEmpty

router.get('/register', (req, res) => {
  res.render('users/register')
})

router.post('/', async (req, res) => {
  const password = req.body.password

  try {
    const usernameErrors = usernameSchema.validate(
      req.body.user.username,
      { list: true })
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
    req.login(user, (err) => {
      if (!err) {
        req.flash('success', 'Welcome Aboard!')
        res.redirect('/campgrounds')
      } else {
        throw err
      }
    })
  } catch (err) {
    helper.displayError(req, err)
    return res.redirect('/users/register')
  }
})

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (isEmpty(user)) {
      throw helper.customErrors.userMiss
    }

    if (!req.user || !user._id.equals(req.user.id)) {
      res.render('users/show', { user })
    } else {
      res.render('users/edit', { user })
    }
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('back')
  }
})

router.put('/:id', middleware.checkProfileStack, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body.user)
    if (isEmpty(updatedUser)) {
      throw helper.customErrors.userUpdate
    }

    console.log(updatedUser)
    req.flash('success', 'Your details are updated')
    res.redirect('/users/' + req.params.id)
  } catch (err) {
    helper.displayError(req, err)
    res.direct('back')
  }
})

router.post('/:id/follow', middleware.isLoggedIn, async (req, res) => {
  try {
    console.log(req.user.id)
    console.log(req.body.follower)
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
      user.followers.push(req.body.follower)

      const newFollowerNotifTemplate = {
        link: `/users/${follower._id}`,
        notifType: 'newFollower'
      }

      Notification.generateMessage(newFollowerNotifTemplate)
      newFollowerNotifTemplate.author.id = user._id
      const notif = await Notification.create(newFollowerNotifTemplate)

      user.notifs.push(notif)
      await user.save()
    } else if (req.body.action === 'unfollow' &&
      user.followers.includes(req.body.follower)) {
      // Remove follower from followers list
      user.followers = user.followers.filter((follower) => {
        return !follower.equals(req.body.follower)
      })

      await user.save()
    }
    res.redirect('back')
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('back')
  }
})

router.get('/:id/pReset', middleware.checkProfileStack, async (req, res) => {
  try {
    // Set up and verify email server connection
    const transporter = nodeMailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      }
    })
    // Send email
    const [user, ...rest] = await Promise.all([
      User.findById(req.params.id),
      transporter.verify
    ])

    console.log({ rest })

    const mail = require('../emails/resetPassword')

    // Generate token and send it to the user.
    const token = await crypto.randomBytes(32).toString('hex')

    const tokenLink = `${req.headers.host}/users/${user._id}/token/${token}`
    mail.addLink(tokenLink)

    // No need to await as nothing is depending on this executing
    transporter.sendMail({
      from: 'cdiasperera@gmail.com',
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
    res.redirect('/campgrounds')
  }
})

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
module.exports = router
