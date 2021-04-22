const yelpAxiosOptions = {
  method: 'get',
  headers: {
      'Authorization': `Bearer ${process.env.YELP_API_ID}`,
      'Access-Control-Allow-Origin': '*'
  }
  // referrerPolicy: 'no-referrer',
}

const YELP_BIZ_API_URI = 'https://api.yelp.com/v3/businesses/';
const YELP_COLLECTION_URI = 'https://www.yelp.com/collection/';
const YELP_RENDERED_ITEMS_URI = 'https://www.yelp.com/collection/user/rendered_items';

module.exports = {
  yelpAxiosOptions,
  YELP_BIZ_API_URI,
  YELP_COLLECTION_URI,
  YELP_RENDERED_ITEMS_URI,
};