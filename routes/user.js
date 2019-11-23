const express = require('express')
const router = express.Router({ mergeParams: true })

const User = require('../models/user')
const usernameSchema = require('../models/username')
const passwordSchema = require('../models/password')

const helper = require('../helper')
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

    await User.register(userTemplate, password)

    req.flash('success', 'Welcome Aboard!')
    res.redirect('/campgrounds')
  } catch (err) {
    helper.displayError(req, err)
    return res.redirect('/register')
  }
})

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (isEmpty(user)) {
      throw helper.customErrors.userMiss
    }
    res.render('users/edit', { user })
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('back')
  }
})

router.put('/:id', async (req, res) => {
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
module.exports = router
