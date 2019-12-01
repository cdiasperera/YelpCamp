'use strict'

const User = require('./models/user')
async function seedDB () {
  try {
    const allUsers = await User.find({})

    for (const user of allUsers) {
      user.activated = true
      await user.save()
    }
  } catch (err) {
    console.log(err)
  }
}

module.exports = seedDB
