const router = require('express').Router();
const GeolocationService = require('../services/geolocation.service');

router.route('/geolocation/').get(async (request, response) => {
  const lat = request.query.lat;
  const lng = request.query.lng;
  const timeZone = await GeolocationService.getTimeZoneByCoordinates(lat, lng);
  if (timeZone.error) {
    response.status(400).send(timeZone);
  } else {
    response.json(timeZone);
  }
})

module.exports = router;