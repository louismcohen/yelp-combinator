const router = require('express').Router();
const axios = require('axios');

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

module.exports = router;