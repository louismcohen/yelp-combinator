const YelpBusiness = require('../models/yelp-business.model');
const axios = require('axios');
const {yelpAxiosOptions, YELP_BIZ_API_URI} = require('../config/yelp-connection.config');
const Bottleneck = require('bottleneck');

const limiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 500,
})

const getYelpBusinessInfo = async (alias) => {
  const info = await axios(`${YELP_BIZ_API_URI}${alias}`, yelpAxiosOptions);
  return info.data;
}

const populateBasicBusinessInfo = (collection) => {
  console.log('populateBusinessInfo', collection.title);
  collection.items.forEach((item, index) => {
      const url = item.querySelector('.biz-name').href;
      const alias = url.substring(url.lastIndexOf('/') + 1);
      const note = item.querySelector('.js-info-content').textContent;
      const addedIndex = collection.itemCount - index - 1;
      const yelpCollectionId = collection.yelpCollectionId;
      collection.businesses.push({
          alias,
          note,
          addedIndex,
          yelpCollectionId
      })
  })

  return collection;
}

const updateBusinessByAlias = async (alias) => {
  const data = await limiter.schedule(() => getYelpBusinessInfo(alias));

  const updatedBusiness = await YelpBusiness.findOneAndUpdate(
    {alias: alias},
    data,
    {new: true, upsert: true},
    (error, result) => {
      if (error) {
        console.log('Error: ', error.response.status);
      } else {
        console.log(`Successfully updated ${result.addedIndex}: ${data.name}`);
        return result;
      }
    }
  )

  return updatedBusiness;
}

const updateAllBusinesses = async () => {
  try {
    const businesses = await YelpBusiness.find();
    businesses.map(async business => {
      const updated = await updateBusinessByAlias(business.alias);
      business = updated.data;
    });
    return businesses;
  } catch {
    return {error: error};
  }
}

const updateIncompleteBusinesses = async () => {
  try {
    const businesses = await YelpBusiness.find();
    const incomplete = businesses.filter(business => !business.name);
    incomplete.map(async business => {
      const updated = await updateBusinessByAlias(business.alias);
      business = updated.data;
    })
    return incomplete;
  } catch {
    return {error: error};
  }
}

const getAllBusinesses = async () => {
  try {
    const businesses = await YelpBusiness.find();
    return businesses;
  } catch (error) {
    return {error: error};
  }
}

const getBusinessByAlias = async (alias) => {
  try {
    const business =  YelpBusiness.findOne({alias});
    return business;
  } catch {
    return {error: error};
  }
}

module.exports = {
  getAllBusinesses,
  getBusinessByAlias,
  getYelpBusinessInfo,
  populateBasicBusinessInfo,
  updateBusinessByAlias,
  updateAllBusinesses,
  updateIncompleteBusinesses,
}