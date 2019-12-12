'use strict'
const express = require('express')
const router = express.Router({ mergeParams: true })
const lodash = require('lodash')
const Nodegeocoder = require('node-geocoder')
const Campground = require('../models/campground')
const Comment = require('../models/comment')
const User = require('../models/user')
const Notification = require('../models/notif')

const middleware = require('../middleware')
const helper = require('../helper')

const isEmpty = lodash.isEmpty

const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.MAPS_SERVER_API_KEY,
  formatter: null
}

const geocoder = Nodegeocoder(options)

/**
 * Redirect to the first page of camps
 */
router.get('/', (req, res) => {
  let searchQuery = ''
  if (req.query.search) {
    searchQuery = '?search=' + req.query.search
  }
  res.redirect('/campgrounds/page/1' + searchQuery)
})

/**
 * If no page number was given, go to the first page
 */
router.get('/page/', (req, res) => {
  res.redirect('/campgrounds/page/1')
})

/**
 * Index page of camps
 */
router.get('/page/:page', async (req, res) => {
  const [search, dbSearchParams] = getDBSearchParams(req)

  try {
    const PER_PAGE = 6
    // The index, in the sorted array of camps, of the first camp to display
    const firstCampIndex = (req.params.page - 1) * PER_PAGE
    const foundCamps = await (
      Campground.find(dbSearchParams)
        .sort('-averageRating')
        .skip(firstCampIndex)
        .limit(PER_PAGE)
    )

    // Page Information for pagiantion
    const pageInfo = {
      currentPage: parseInt(req.params.page),
      numPages: parseInt(
        Math.ceil(
          await Campground.find(dbSearchParams).countDocuments() / PER_PAGE
        )
      )
    }

    const locals = { camps: foundCamps, search: search, pageInfo: pageInfo }
    res.render('campgrounds/index', locals)
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('/')
  }
})

/**
 * Create a new camp
 */
router.post('/', middleware.isLoggedIn, async (req, res) => {
  // The template for the new camp to be added
  let newCamp = createCampTemplate(
    req.user.id,
    req.user.username,
    req.body.camp
  )

  try {
    const locationData = await setCampLocationData(req.body.camp.location)
    newCamp = { ...newCamp, ...locationData }

    const queries = []
    // Step 1: Create Campground
    queries.push(Campground.create(newCamp))
    queries.push(User.findById(req.user._id))

    const [camp, user] = await Promise.all(queries)
    if (isEmpty(camp)) {
      throw helper.customErrors.campsCreate
    }

    // Step 2: Notify Followers
    // Generate the notification
    const notifTemp = {
      link: `/campgrounds/${camp.id}`,
      notifType: 'newCamp',
      info: { creator: user.username },
      author: {
        id: user._id
      }
    }
    const notif = await Notification.createNotification(notifTemp)

    await Notification.sendNotifications(user.followers, notif)

    req.flash('success', 'Campground was created!')
    res.redirect('/campgrounds')
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('/campgrounds')
  }
})

/**
 * Route for the page to create a new camp.
 */
router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('campgrounds/new')
})

/**
 * Route to show a specific camp.
 */
router.get('/:id', async (req, res) => {
  try {
    const foundCamp = await Campground.findById(req.params.id)
      .populate('comments')

    // Get users, so we can give avatars to the comments
    const queries = []
    for (const comment of foundCamp.comments) {
      queries.push(User.findById(comment.author.id))
    }

    // Give the comment the author avatar & username
    const users = await Promise.all(queries)
    foundCamp.comments.forEach((comment, index) => {
      comment.author.avatar = users[index].avatar
      comment.author.username = users[index].username
    })

    const locals = {
      camp: foundCamp,
      key: process.env.MAPS_WEBSITE_API_KEY,
      userComment: undefined
    }

    // If the user has already made a comment, send that comment as a local
    // variable to the client, for its client-side logic
    if (req.user && req.user.campsRated.includes(foundCamp._id)) {
      for (const comment of foundCamp.comments) {
        if (comment.author.id.equals(req.user.id)) {
          locals.userComment = comment
          break
        }
      }
    }

    res.render('campgrounds/show', locals)
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('/campgrounds')
  }
})

/**
 * Route to page to edit a specific camp.
 */
router.get('/:id/edit', middleware.checkCampStack, async (req, res) => {
  try {
    const foundCamp = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { camp: foundCamp })
  } catch (err) {
    // Handled in middleware.checkCampStack
  }
})

/**
 * Route to update a camp with submitted information.
 */
router.put('/:id', middleware.checkCampStack, async (req, res) => {
  let updateCamp = createCampTemplate(
    req.user.id,
    req.user.username,
    req.body.camp
  )
  try {
    const locationData = await setCampLocationData(req.body.camp.location)
    updateCamp = { ...updateCamp, ...locationData }

    const camp = await Campground.findByIdAndUpdate(req.params.id,
      updateCamp)
    if (isEmpty(camp)) {
      throw helper.customErrors.campUpdate
    }

    req.flash('success', 'Campground Updated!')
    res.redirect('/campgrounds/' + req.params.id)
  } catch (err) {
    helper.displayError(req, err)
    res.redirect('/campgrounds')
  }
})

/**
 * Route to delete a specific camp.
 */
router.delete('/:id', middleware.checkCampStack, async (req, res) => {
  try {
    const removedCamp = await Campground.findByIdAndRemove(req.params.id)
    await Comment.deleteMany(
      { _id: { $in: removedCamp.comments } }
    )

    req.flash('success', 'Campground Deleted!')
    res.redirect('/campgrounds')
  } catch (err) {
    console.log(err)
    helper.displayError(req, err)
    res.redirect('back')
  }
})

/**
 * Makes the paramter for searching for camps, for the index page.
 */
function getDBSearchParams (req) {
  // Request could come from a campground search or directly.
  if (req.query.search) {
    // If there was a search, find camps with names that contain the search term
    const regexSearch = { $regex: new RegExp(req.query.search, 'i') }
    return [req.query.search, { name: regexSearch }]
  } else {
    // If there was no search, return '' (as req.query.search is undefined)
    // And search for all camps
    return ['', {}]
  }
}

function createCampTemplate (authorId, authorUsername, currentCamp) {
  const newCamp = currentCamp
  if (!/^http.*/.test(newCamp.image)) {
    /**
     * The image is trying to access an image outside the internet. Thus, it
     * will ping the server. We must set the image to be no-image.jpg
    */
    newCamp.image = '/imgs/no-image.jpg'
  }
  newCamp.author = { id: authorId, username: authorUsername }

  return newCamp
}

/**
 * Returned geocoded data, given a location string
 */
async function setCampLocationData (location) {
  const locationData = {}
  const geoLocation = location
  if (location) {
    const geoData = await geocoder.geocode(geoLocation)
    const location = geoData[0]
    if (!isEmpty(location)) {
      locationData.lat = location.latitude
      locationData.lng = location.longitude

      locationData.location = location.formattedAddress
    } else {
      throw helper.customErrors.locationInvalid
    }
  }

  return locationData
}

module.exports = router
