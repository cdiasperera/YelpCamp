'use strict'
const Campground = require('../models/campground')
const Comment = require('../models/comment')
const User = require('../models/user')

const seedCamps = require('./campsCreator')
const seedUsers = require('./usersCreator')
const seedCommets = require('./commentsCreator')

// Separate user's password from their template, as we do not pass the password
// to User.create when registering
const seedUserWrappers = []
seedUsers.forEach(seed => {
  const seedWrapper = {}
  seedWrapper.user = seed
  seedWrapper.password = seed.password.valueOf()

  delete seedWrapper.user.password

  seedUserWrappers.push(seedWrapper)
})
async function seedDB () {
  console.log('Seeding...')
  try {
    const campQueries = []
    const userQueries = []

    seedUserWrappers.forEach(wrapper => {
      userQueries.push(User.register(
        new User(wrapper.user),
        wrapper.password
      ))
    })

    seedCamps.forEach(camp => {
      campQueries.push(Campground.create(camp))
    })

    const camps = await Promise.all(campQueries)
    const users = await Promise.all(userQueries)

    const campSavePromises = []
    for (const camp of camps) {
      // Give each camp an author
      const campAuthorIndex = Math.floor(Math.random() * users.length)
      camp.author = {
        id: users[campAuthorIndex]._id,
        username: users[campAuthorIndex].username
      }
      /**
       * The math below works as such:
       * Random generates a number between 0 (inclusive) and 1 (non inclusive)
       * Multiply this bumber by x, and the uniform distribution still holds
       * But as 1 is non inclusive, x itself is not in this distribution
       * By taking the floor, we are them able get a uniform discrete integer
       * distribution between 0 <= n < x - 1
       */

      // Choose between 0 and 5 comments
      const numComments = Math.floor(Math.random() * 6)
      let averageRatingTotal = 0
      const commentQueries = []
      // To make sure users don't make mulitple comments, we keep track of
      // which users have commnted
      const commentedUsers = []
      for (let i = 0; i < numComments; i++) {
        // Choose a random index between 0 and the (number of seed comments) - 1
        const seedCommentIndex = Math.floor(
          Math.random() * seedCommets.length)
        const comment = seedCommets[seedCommentIndex]

        // Add a user to that comment.
        let userIndex
        do {
          userIndex = Math.floor(Math.random() * users.length)
        } while (commentedUsers.includes(userIndex))
        const user = users[userIndex]
        commentedUsers.push(userIndex)

        comment.author.id = user._id
        user.campsRated.push(camp._id)
        // Push comment template and update running rating total
        commentQueries.push(Comment.create(comment))
        averageRatingTotal += comment.rating
      }

      const comments = await Promise.all(commentQueries)

      // Associate comment to camp
      comments.forEach(comment => {
        camp.comments.push(comment)
      })

      if (comments.length > 0) {
        camp.numRatings = comments.length
        camp.averageRating = averageRatingTotal / camp.numRatings
      }

      campSavePromises.push(camp.save())
    }
    await Promise.all(campSavePromises)
  } catch (err) {
    console.log(err)
  }
}

module.exports = seedDB
