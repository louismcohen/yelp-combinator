const GooglePlacesService = require('../services/google-places.service');

const getPlaceId = async (request, response) => {
  const placeSearchQuery = request.query.placeSearchQuery;
  try {
    const result = await GooglePlacesService.getPlaceId(placeSearchQuery);
    if (result.status === 'OK') {
      response.json(result.candidates[0].place_id);
    } else {
      response.status(400).send({error: `Result error getting Google Place ID for ${placeSearchQuery}: ${result.status}`});
    }
  } catch {
    error => response.status(400).send({error});
  }
}

const getPlaceDetails = async (request, response) => {
  const placeId = request.query.placeId;
  try {
    const result = await GooglePlacesService.getPlaceDetails(placeId);
    console.log({result});
  } catch {
    error => response.status(400).send({error});
  }
}

// recommended placeSearchQuery is {businessname} {zip code}
const getPlaceWebsite = async (request, response) => {
  const placeSearchQuery = request.query.placeSearchQuery;
  try {
    const placeIdResult = await GooglePlacesService.getPlaceId(placeSearchQuery);
    if (placeIdResult.status === 'OK') {
      const placeId = placeIdResult.candidates[0].place_id;

      try {
        const placeWebsiteResult = await GooglePlacesService.getPlaceDetails(placeId, 'website');
        if (placeWebsiteResult.status === 'OK') {
          const placeWebsiteFull = placeWebsiteResult.result.website;
          const placeWebsiteNoQuery = placeWebsiteFull.split('?')[0];
          response.json(placeWebsiteNoQuery);
        } else {
          response.status(400).send({error: `Result error getting Google Place Website for ${placeId}: ${result.status}`});
        }
      } catch {
        error => response.status(400).send({error});
      }

    } else {
      response.status(400).send({error: `Result error getting Google Place ID for ${placeSearchQuery}: ${result.status}`});
    }
  } catch {
    error => response.status(400).send({error});
  }
}

const GooglePlacesController = async (request, response) => {
  const type = request.query.type;
  switch (type) {
    case 'placeId':
      getPlaceId(request, response);
      break;
    case 'placeDetails':
      getPlaceDetails(request, response);
      break;
    case 'placeWebsite':
      getPlaceWebsite(request, response);
      break;
    default:
      response.status(400).send({error: `Invalid request type: ${type}`});
  }
};

module.exports = GooglePlacesController;