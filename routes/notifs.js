'use strict'
const express = require('express')
const router = express.Router({ mergeParams: true })

const User = require('../models/user')
const Notification = require('../models/notif')

const helper = require('../helper')

router.get('/', async (req, res) => {
  try {
    await User.findById(req.user.id).populate('notifs').exec()
    res.render('notifs/index')
  } catch (err) {
    console.log(err)
    helper.displayError(req, err)
    res.redirect('back')
  }
})

router.get('/:id', async (req, res) => {
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
