const yelpAxiosOptions = {
  method: 'get',
  headers: {
      'Authorization': `Bearer ${process.env.YELP_API_ID}`,
      'Access-Control-Allow-Origin': '*'
  }
  // referrerPolicy: 'no-referrer',
}

const YELP_BIZ_API_URI = 'https://api.yelp.com/v3/businesses/';

module.exports = {
  yelpAxiosOptions,
  YELP_BIZ_API_URI
};