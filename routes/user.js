const express = require('express')
const router = express.Router({ mergeParams: true })

const User = require('../models/user')
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
    const usernameErrors = usernameSchema.validate(req.body.user.username, { list: true })
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

router.put('/:id', middleware.checkProfileStrack, async (req, res) => {
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

router.post('/:id/follow', async (req, res) => {
  try {
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

module.exports = router
