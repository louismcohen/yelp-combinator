const YelpBusiness = require('../models/yelp-business.model');
const axios = require('axios');
const {yelpAxiosOptions, YELP_BIZ_API_URI} = require('./yelp-connection');
const Bottleneck = require('bottleneck');

const maxIndex = -1;
const delay = 1000;
const limiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 333
})

const updateAllBusinesses = async (request, response, next) => {
  const businesses = request.businesses;
  businesses.filter(x => !x.name).map(async business => {
    console.log(business);
    try {
      const data = await limiter.schedule(() => getYelpBusinessInfo(business.alias));
      YelpBusiness.findOneAndUpdate(
        {alias: business.alias},
        data,
        {new: true, upsert: true},
        (error, result) => {
          if (error) {
            console.log('Error: ', error.response.status);
          } else {
            console.log(`Successfully updated ${business.addedIndex}: ${data.name}`);
          }
        }
      )
    } catch(error) {
      console.log(`error for ${business.alias}`, error.response.status);
    }   
    
  });
  response.json('Updates successful');
}

const addOrUpdateBusiness = (request, response) => {
  const alias = request.body.alias;
  YelpBusiness.findOneAndUpdate(
    {alias: alias},
    request.body,
    {new: true, upsert: true},
    (error, result) => {
      if (error) {
        response.status(400).json('C01 error updating or adding business' + error);
      } else {
          response.json(`C02 business added/updated: ${result.name}`);
      }
    }
  )
}

const getAllBusinesses = (request, response, next) => {
  YelpBusiness.find()
    .then(businesses => {
      request.businesses = businesses;
      if (request.method == 'GET') response.json(businesses);
      next();
    })
    .catch(error => response.status(400).json('Error: ' + error));
}

const getBusinessById = (request, response) => {
  YelpBusiness.findOne({alias: request.params.alias})
    .then(business => response.json(business))
    .catch(error => response.status(400).json('Error: ' + error));
}

async function getYelpBusinessInfo(alias) {
  const info = await axios(`${YELP_BIZ_API_URI}${alias}`, yelpAxiosOptions);
  return info.data;
}

const YelpBusinessController = {
  addOrUpdateBusiness,
  updateAllBusinesses,
  getAllBusinesses,
  getBusinessById,
}



module.exports = YelpBusinessController;