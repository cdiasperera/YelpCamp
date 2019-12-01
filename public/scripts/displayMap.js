'use strict'
/* globals google, lat, lng, name */
function initMap () {
  const center = { lat: parseFloat(lat), lng: parseFloat(lng) }

  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: center,
    scrollwheel: false
  })

  const contentString = `<strong>${name}</strong>`

  const infoWindow = new google.maps.InfoWindow({
    content: contentString
  })

  const marker = new google.maps.Marker({
    position: center,
    map: map
  })

  marker.addListener('click', function () {
    infoWindow.open(map, marker)
  })
}
