'use strict'
const express = require('express')
const router = express.Router({ mergeParams: true })

const User = require('../models/user')
const helper = require('../helper')
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('notifs').exec()
    console.log(user)
    res.render('notifs/show', { notifs: user.notifs })
  } catch (err) {
    console.log(err)
    helper.displayError(req, err)
    res.redirect('back')
  }
})

module.exports = router
