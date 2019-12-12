'use strict'
const express = require('express')
const router = express.Router({ mergeParams: true })

const User = require('../models/user')
const Notification = require('../models/notif')

const middleware = require('../middleware')
const helper = require('../helper')

router.get('/', middleware.isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('notifs').exec()

    const allNotifs = user.notifs
    res.render('notifs/index', { allNotifs })
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('back')
  }
})

router.get('/:id', middleware.checkNotificationStack, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id)

    notif.isRead = true
    await notif.save()

    res.redirect(notif.link)
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('back')
  }
})

module.exports = router
