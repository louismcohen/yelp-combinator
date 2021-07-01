const axios = require('axios');
const ipGeolocationTimeZoneUri = 'https://api.ipgeolocation.io/timezone'; 

const getTimeZoneByCoordinates = async (lat, long) => { // if no coordinates provided, will return approximate location given IP address
  const params = {
    apiKey: process.env.IPGEOLOCATION_API_KEY,
    lat,
    long,
  }

  try {
    const result = await axios.get(ipGeolocationTimeZoneUri, {params});
    return result.data;
  } catch (error) {
    return {error};
  }
}

const GeolocationService = {
  getTimeZoneByCoordinates,
}

module.exports = GeolocationService;