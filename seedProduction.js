'use strict'

const User = require('./models/user')
const moment = require('moment')
async function seedDB () {
  try {
    const allUsers = await User.find({})

    for (const user in allUsers) {
      user.lastLogin = moment('20111111', 'YYYYMMDD')
      await user.save()
    }
  } catch (err) {
    console.log(err)
  }
}

module.exports = seedDB
