const express = require('express')
const router = express.Router({ mergeParams: true })

const User = require('../models/user')
const usernameSchema = require('../models/username')
const passwordSchema = require('../models/password')

const helperObj = require('../helper')
router.get('/register', (req, res) => {
  res.render('users/register')
})

router.post('/', async (req, res) => {
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

    console.log(user)
    req.flash('success', 'Welcome Aboard!')
    res.redirect('/campgrounds')
  } catch (err) {
    helperObj.displayError(req, err)
    return res.redirect('/register')
  }
})
module.exports = router
