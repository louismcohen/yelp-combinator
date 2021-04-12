const axios = require('axios');
const jsdom = require('jsdom');
const {yelpAxiosOptions, YELP_BIZ_API_URI, YELP_COLLECTION_URI} = require('../services/yelp-connection.service');
const Bottleneck = require('bottleneck');


async function getYelpBusinessInfo(alias) {
  const info = await axios(`${YELP_BIZ_API_URI}${alias}`, yelpAxiosOptions);
  return info.data;
}

module.exports = {
  getYelpBusinessInfo,
};