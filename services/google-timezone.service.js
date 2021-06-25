const axios = require('axios');

const getTimeZoneForLocation = async (lat, lng, epochMilliseconds) => {
  const timeZoneSearchUri = 'https://maps.googleapis.com/maps/api/timezone/json';
  const epochSeconds = epochMilliseconds / 1000;
  const params = {
    location: `${lat},${lng}`,
    timestamp: epochSeconds,
    key: process.env.GOOGLE_API_KEY,
  }

  try {
    const result = await axios.get(timeZoneSearchUri, {params});
    return result.data;
  } catch (error) {
    return {error};
  }
}

const GoogleTimeZoneService = {
  getTimeZoneForLocation,
}

module.exports = GoogleTimeZoneService;