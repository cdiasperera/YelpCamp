'use strict'
const Campground = require('./models/campground')
const Comment = require('./models/comment')
const User = require('./models/user')
const Notification = require('./models/notif')

const moment = require('moment')

// Data to reseed the "campground
const seedCamps = [
  {
    name: 'campOne',
    price: 10,
    image: 'https://images.unsplash.com/photo-1497900304864-273dfb3aae33?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1388&q=80',
    desc: 'A hella sick camp.'
  },
  {
    name: 'campTwo',
    price: 10,
    image: 'https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
    desc: 'A so, so camp.'
  },
  {
    name: 'campThree',
    price: 10,
    image: 'https://images.unsplash.com/photo-1515408320194-59643816c5b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
    desc: 'The worst of the worst.'
  },
  {
    name: 'campFour',
    price: 10,
    image: 'https://images.unsplash.com/photo-1515408320194-59643816c5b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
    desc: 'The worst of the worst.'
  },
  {
    name: 'campFive',
    price: 10,
    image: 'https://images.unsplash.com/photo-1515408320194-59643816c5b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
    desc: 'The worst of the worst.'
  },
  {
    name: 'campSix',
    price: 10,
    image: 'https://images.unsplash.com/photo-1515408320194-59643816c5b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
    desc: 'The worst of the worst.'
  },
  {
    name: 'campSeven',
    price: 10,
    image: 'https://images.unsplash.com/photo-1515408320194-59643816c5b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
    desc: 'The worst of the worst.'
  },
  {
    name: 'campEight',
    price: 10,
    image: 'https://images.unsplash.com/photo-1515408320194-59643816c5b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
    desc: 'The worst of the worst.'
  },
  {
    name: 'campNine',
    price: 10,
    image: 'https://images.unsplash.com/photo-1515408320194-59643816c5b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
    desc: 'The worst of the worst.'
  },
  {
    name: 'campTen',
    price: 10,
    image: 'https://images.unsplash.com/photo-1515408320194-59643816c5b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
    desc: 'The worst of the worst.'
  },
  {
    name: 'campEleven',
    price: 10,
    image: 'https://images.unsplash.com/photo-1515408320194-59643816c5b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
    desc: 'The worst of the worst.'
  }
]

const seedComment = {
  text: "This is test comment. I really hope this isn't in production",
  author: 'notARealUser'
}

const seedUser = {
  username: 'aa',
  password: 'a',
  firstName: 'Channa',
  lastName: 'Dias Perera',
  activated: true,
  lastLogin: moment('20111111', 'YYYYMMDD'),
  avatar: '/imgs/no-image.jpg'
}

const seedUser2 = {
  username: 'aaa',
  password: 'a',
  firstName: 'Channa',
  lastName: 'Bup',
  activated: true,
  lastLogin: moment('20111111', 'YYYYMMDD'),
  avatar: '/imgs/no-image.jpg'
}
async function seedDB () {
  console.log('Seeding...')
  try {
    // Clean up DB
    await Promise.all([
      Campground.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
      User.deleteMany({})
    ])

    // Create user using passport.
    const [user, user2, ...notifs] = await Promise.all([
      User.register(
        new User({
          username: seedUser.username,
          lastLogin: seedUser.lastLogin,
          email: seedUser.email,
          activated: seedUser.activated,
          avatar: seedUser.avatar
        }),
        seedUser.password
      ),
      User.register(
        new User({
          username: seedUser2.username,
          lastLogin: seedUser2.lastLogin,
          activated: seedUser2.activated,
          avatar: seedUser2.avatar
        }),
        seedUser2.password
      )
    ])

    for (const notif of notifs) {
      try {
        Notification.generateMessage(notif)
        notif.author.id = user._id
        await notif.save()

        await user.notifs.push(notif)
      } catch (err) {
        console.log(err)
      }
    }

    user.followers.push(user2._id)
    await user.save()

    seedCamps.forEach(async (seedCamp) => {
      try {
        const [camp, comment] = await Promise.all(
          [Campground.create(seedCamp),
            Comment.create(seedComment)]
        )

        comment.author.id = user._id
        comment.author.username = user.username
        comment.save()

        camp.author.id = user._id
        camp.author.username = user.username
        camp.comments.push(comment)
        camp.save()
      } catch (err) {
        console.log(err)
      }
    })
  } catch (err) {
    console.log(err)
  }
}

module.exports = seedDB
