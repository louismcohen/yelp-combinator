const axios = require('axios');
const ipGeolocationTimeZoneUri = 'https://api.ipgeolocation.io/timezone'; 

const getTimeZoneByCoordinates = async (lat, long) => { // if no coordinates provided, will return approximate location given IP address
  const params = {
    apiKey: process.env.REACT_APP_IPGEOLOCATION_API_KEY,
    lat,
    long,
  }

  console.log({params});

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

export default GeolocationService;