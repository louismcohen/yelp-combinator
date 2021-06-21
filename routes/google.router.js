const router = require('express').Router();
const axios = require('axios');
const GooglePlacesController = require('../controllers/google-places.controller');

router.route('/distancematrix').get(async (request, response) => {
  const distanceMatrixUri = 'https://maps.googleapis.com/maps/api/distancematrix/json';
  const params = {
    origins: request.query.origin,
    destinations: request.query.destination,
    key: process.env.GOOGLE_API_KEY,
    units: 'imperial',
  }
  try {
    const result = await axios.get(distanceMatrixUri, {params});
    response.json(result.data);
  } catch(error) {
    response.status(400).json(error);
  }  
})

router.route('/placesearch').get(async (request, response) => {
  const placeSearchUri = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';
  const params = {
    key: process.env.GOOGLE_API_KEY,
    input: request.query.placeSearchInput,
    inputtype: 'textquery',
  }
  try {
    const result = await axios.get(placeSearchUri, {params});
    response.json(result.data);
  } catch(error) {
    response.status(400).json(error);
  }
})

router.route('/places').all(GooglePlacesController);

module.exports = router;