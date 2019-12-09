const faker = require('faker')

const NUM_USERS = 10

const users = []

for (let i = 0; i < NUM_USERS; i++) {
  const user = {}
  user.firstName = faker.name.firstName()
  user.lastName = faker.name.lastName()
  user.activated = true
  user.username = user.firstName + user.lastName
  // Generate two random base 36 strings, of 11 characters, and join them
  user.password =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)

  // Use photos from thispersondoesntexist.com
  user.avatar = '/seedUserImgs/person' + i + '.jpeg'
  users.push(user)
}
module.exports = users
