const GoogleTimeZoneService = require('../services/google-timezone.service');

const getTimeZoneForLocation = async (request, response) => { 
  const lat = request.query.lat;
  const lng = request.query.lng;
  const timestamp = request.query.timestamp;

  try {
    const result = await GoogleTimeZoneService.getTimeZoneForLocation(lat, lng, timestamp.getTime());
    if (result.status === 'OK') {
      response.json(result);
    } else {
      response.status(400).send(`Error getting time zone for location ${lng}, ${lat} at ${timestamp}`);
    }
  } catch {
    error => response.status(400).send({error});
  }
}

const GoogleTimeZoneController = {
  getTimeZoneForLocation,
}

module.exports = GoogleTimeZoneController;