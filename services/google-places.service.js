const axios = require('axios');

const getPlaceId = async (placeSearchInput) => {
  const placeSearchUri = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';
  const params = {
    key: process.env.GOOGLE_API_KEY,
    input: placeSearchInput,
    inputtype: 'textquery',
  }
  try {
    const result = await axios.get(placeSearchUri, {params});
    return result.data;
  } catch (error) {
    return {error};
  }
}

const getPlaceDetails = async (placeId, fields = '') => {
  const placeDetailsUri = 'https://maps.googleapis.com/maps/api/place/details/json';
  const params = {
    key: process.env.GOOGLE_API_KEY,
    place_id: placeId,
    fields: fields,
  }
  try {
    const result = await axios.get(placeDetailsUri, {params});
    return result.data;
  } catch (error) {
    return {error};
  }
}

const GooglePlacesService = {
  getPlaceId,
  getPlaceDetails,
}

module.exports = GooglePlacesService;