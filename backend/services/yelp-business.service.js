const YelpBusiness = require('../models/yelp-business.model');
const axios = require('axios');
const {yelpAxiosOptions, YELP_BIZ_API_URI} = require('../config/yelp-connection.config');
const Bottleneck = require('bottleneck');
const YelpCollection = require('../models/yelp-collection.model');

const limiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 500,
})

const getYelpBusinessInfo = async (alias) => {
  const info = await axios(`${YELP_BIZ_API_URI}${encodeURI(alias)}`, yelpAxiosOptions);
  return info.data;
}

const populateBasicBusinessInfo = (collection) => {
  console.log('populateBasicBusinessInfo', collection.title);
  collection.items.forEach((item, index) => {
    const url = item.querySelector('.biz-name').href;
    const alias = decodeURI(url.substring(url.lastIndexOf('/') + 1));
    const note = item.querySelector('.js-info-content').textContent;
    const addedIndex = collection.itemCount - index - 1;
    const yelpCollectionId = collection.yelpCollectionId;
    if (addedIndex < 0) {
      console.log('NEGATIVE ADDEDINDEX');
      console.log({alias, item, index, addedIndex, itemCount: collection.itemCount});
    }
    collection.businesses.push({
        alias,
        note,
        addedIndex,
        yelpCollectionId
    })
  })

  return collection;
}

const updateBusinessById = async (id) => {
  const data = await limiter.schedule(() => getYelpBusinessInfo(id));

  const updatedBusiness = await YelpBusiness.findOneAndUpdate(
    {id: id},
    data,
    {new: true, upsert: true},
    (error, result) => {
      if (error) {
        console.log('Error: ', error);
      } else {
        console.log(`Successfully updated ${result.addedIndex}: ${data.name} (${data.alias})`);
        return result;
      }
    }
  )

  return updatedBusiness;  
}

const updateBusinessByAlias = async (alias) => {
  const data = await limiter.schedule(() => getYelpBusinessInfo(alias));

  const updatedBusiness = await YelpBusiness.findOneAndUpdate(
    {alias: alias},
    data,
    {new: true, upsert: true},
    (error, result) => {
      if (error) {
        console.log('Error: ', error);
      } else {
        console.log(`Successfully updated ${result.addedIndex}: ${data.name} (${data.alias})`);
        return result;
      }
    }
  )

  return updatedBusiness;
}

const checkAndUpdateIncompleteBusinesses = async (collections) => {
  const allBusinesses = collections.map(collection => collection.businesses).reduce((a, b) => a.concat(b));
  const incompleteBusinesses = allBusinesses.filter(biz => !biz.name);
  const updatedBusinesses = await Promise.all(
    incompleteBusinesses.map(async business => {
      const updatedBusiness = await updateBusinessByAlias(business.alias);
      return updatedBusiness;
    })
  )

  return updatedBusinesses;
}

const updateAllBusinesses = async () => {
  try {
    const businesses = await YelpBusiness.find();
    const updatedBusinesses = Promise.all(
      businesses.map(async business => {
        const updated = await updateBusinessByAlias(business.alias);      
        business = updated.data;
      })
    )
    return updatedBusinesses;
  } catch {
    return {error: error};
  }
}

const updateBusinessBasicInfo = async (business) => {
  try {
    const updatedBusiness = await YelpBusiness.findOneAndUpdate(
      {alias: business.alias},
      {
        alias: business.alias,
        note: business.note,
        addedIndex: business.addedIndex,
        yelpCollectionId: business.yelpCollectionId
      },
      {new: true, upsert: true},
      (error, result) => {
        if (error) {
          console.log(`Error updating basic business info for ${business.alias}: `, error);
        } else {
          console.log(`Updated basic info for ${business.alias}: addedIndex ${business.addedIndex}`);
          return result;
        }
      }
    )

    return updatedBusiness;
  } catch (error) {
    return {error: error};
  }
}

const updateAllBusinessesBasicInfo = async () => {
  try {
    const collections = await YelpCollection.find();
    const businesses = collections.map(collection => collection.businesses).reduce((a, b) => a.concat(b));
    const updatedBusinesses = Promise.all(
      businesses.map(async business => {
        const updatedBusiness = updateBusinessBasicInfo(business);
        return updatedBusiness;
      })
    )

    return updatedBusinesses;
  } catch {
    return {error: error};
  }
}

const updateIncompleteBusinesses = async () => {
  try {
    const businesses = await YelpBusiness.find();
    const incomplete = businesses.filter(business => !business.name);
    incomplete.map(async business => {
      console.log(business);
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
    const business = YelpBusiness.findOne({alias});
    return business;
  } catch {
    return {error: error};
  }
}

const deleteAllBusinesses = async () => {
  try {
    const result = await YelpBusiness.deleteMany({});
    console.log(`Deleted all businesses (${result.deletedCount})`);
    return result;
  } catch (error) {
    return {error: error};
  }
}

module.exports = {
  getAllBusinesses,
  getBusinessByAlias,
  getYelpBusinessInfo,
  updateBusinessBasicInfo,
  updateAllBusinessesBasicInfo,
  updateBusinessByAlias,
  updateBusinessById,
  updateAllBusinesses,
  updateAllBusinessesBasicInfo,
  updateIncompleteBusinesses,
  checkAndUpdateIncompleteBusinesses,
  populateBasicBusinessInfo,
  deleteAllBusinesses,
}