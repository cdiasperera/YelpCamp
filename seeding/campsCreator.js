const fs = require('fs')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

const htmlText = fs.readFileSync('./seeding/wikipediaCamps/index.html')
  .toString()

const document = new JSDOM(htmlText).window.document

// The second table is the table with all the data
const table = document.body.querySelectorAll('table')[1]

// The first row is simply the headers, so we can ignore those
const [header, ...data] = table.querySelectorAll('tr')

console.log(header)
const camps = []

data.forEach((row) => {
  const camp = {}
  // Grab a name. It's either in a header or data element
  // Note the first data element column, for later
  let firstTdCol = 0
  try {
    camp.name = row.querySelector('th a').textContent
  } catch (err) {
    camp.name = row.querySelector('td a').textContent
    firstTdCol = 1
  }

  // Set a random price
  camp.price = (Math.random() * 30).toFixed(2)

  // Grab the location
  const coords = row.querySelector('td .geo-dec').textContent
  const [lat, lng] = coords.match(/\d+\.\d+/g)
  camp.lat = lat
  camp.lng = lng

  // Grab the image
  const imageSrc = row
    .querySelectorAll('td')[firstTdCol]
    .querySelector('img')
    .src
  // Since we have only one image to work with (which is pulled externally), we
  // have to compromise on quality vs page load
  camp.image = imageSrc.replace('200px', '800px')

  // Set the description
  const dataRows = row.querySelectorAll('td')
  let desc = dataRows[dataRows.length - 1].textContent
  // Remove Biosphere Reserves and World Heritage Site tags from description.
  desc = desc.replace('(BR)', '')
  desc = desc.replace('(WHS)', '')
  // Removes wikipedia hyperlink footnotes
  camp.desc = desc.replace(/\[\d+\]/g, '')

  camps.push(camp)
})

module.exports = camps
