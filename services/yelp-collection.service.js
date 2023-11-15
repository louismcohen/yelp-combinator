const _ = require('lodash');
const YelpCollection = require('../models/yelp-collection.model');
const {
  populateBasicBusinessInfo,
  updateBusinessByAlias,
  updateBusinessBasicInfo,
} = require('./yelp-business.service');
const jsdom = require('jsdom');
const axios = require('axios');
const {yelpAxiosOptions, YELP_RENDERED_ITEMS_URI, YELP_COLLECTION_URI} = require('../config/yelp-connection.config');
const moment = require('moment-timezone');
const { collection } = require('../models/yelp-collection.model');

const Sentry = require("@sentry/node");

const initializeCollection = () => {
  return {items: [], businesses: []}; 
}

const parseRequestForId = (request) => {
  if (request.query.url || request.query.id) {
    if (request.query.url) {
        const inputUrl = request.query.url;
        const yelpCollectionId = inputUrl.substring(inputUrl.lastIndexOf('/') + 1);
        return yelpCollectionId;
    } else if (request.query.id) {
      const yelpCollectionId = request.query.id;
      return yelpCollectionId;
    } 
  }
  else {
    return false;
  }
}

const getCollectionItems = (collection) => {
  const collectionItems = collection.doc.querySelectorAll('.collection-item');
  return collectionItems; 
}

const findCollection = async (yelpCollectionId) => {
  try {
    const collection = await YelpCollection.find({yelpCollectionId: yelpCollectionId});
    return collection;
  } catch {
    error => {throw `Error looking up collection ${yelpCollectionId}: ${error}`};
  }
}

const loadCollectionPage = async (yelpCollectionId) => {
  const yelpTimeZone = 'America/Los_Angeles';
  let collection = initializeCollection();
  collection.yelpCollectionId = yelpCollectionId;

  try {
    const response = await axios.get(`${YELP_COLLECTION_URI}${collection.yelpCollectionId}`, yelpAxiosOptions);
    const dom = new jsdom.JSDOM(response.data);

    collection.doc = dom.window.document;
    collection.itemCount = Number(collection.doc.querySelector(".ylist").getAttribute("data-item-count"));
    collection.lastUpdated = moment.tz(collection.doc.getElementsByTagName("time")[0].dateTime, yelpTimeZone);
    collection.title = collection.doc.querySelector('meta[property="og:title"]').content;
    
    console.log(`loadCollectionPage ${collection.title} ${collection.yelpCollectionId}: ${collection.itemCount} items, last updated on Yelp ${collection.lastUpdated.utc()}`);

    return collection;
  } catch (error) {
    // console.log('loadCollectionPage error', error);
    return {error: error};
  }
}

const populateRenderedItems = async (collection) => {
  console.log('populateRenderedItems', collection.title);
  let renderedOffset = 0; // ex: 0, 30, 60, 90 ...
  const offsetStep = 30; // Yelp render limit
  const maxOffset = collection.itemCount - 1; // ex: 218

  while (maxOffset - renderedOffset > 0) {
      const response = await axios(`${YELP_RENDERED_ITEMS_URI}?collection_id=${collection.yelpCollectionId}&offset=${renderedOffset}&sort_by=date`, yelpAxiosOptions);
      const dom = new jsdom.JSDOM(response.data.list_markup);

      collection.doc = dom.window.document;
      collection.items = [...collection.items, ...getCollectionItems(collection)];
      console.log(`${collection.title}: offset ${renderedOffset}, items count`, collection.items.length);

      renderedOffset += offsetStep;
  }

  return collection;
}

const scrapeCollection = async (yelpCollectionId) => {
  const loadedResult = await loadCollectionPage(yelpCollectionId);
  const populatedItemsResult = await populateRenderedItems(loadedResult);
  const populatedBusinessesResult = populateBasicBusinessInfo(populatedItemsResult);
  console.log(JSON.stringify(populatedBusinessesResult));
  const updatedBasicBusinessInfo = Promise.all(
    populatedBusinessesResult.businesses.map(async business => await updateBusinessBasicInfo(business))
  )
  return populatedBusinessesResult;
}

const scrapeAllCollections = async () => {
  try {
    const collections = await getAllCollections();
    const scrapedCollections = Promise.all(
      collections.map(async collection => {
        const scrapedCollection = await scrapeCollection(collection.yelpCollectionId);
        console.log(`scraped collection ${scrapedCollection.title}`);
        return scrapedCollection;
      })
    ) 
    return scrapedCollections;
  } catch (error) {
    return {error: error};
  }
  
}

const scrapeEmbeddedCollection = async (yelpCollectionId) => {
  try {
    const output = await axios.get(`${YELP_COLLECTION_URI}${yelpCollectionId}/embed?container=collection-container-77412aaf&sort_by=date&limit=500`);
    console.log({output});
    return output.data;
  } catch (error) {
    return {error};
  }
}

const getAllCollections = async () => {
  try {
    const collections = await YelpCollection.find();
    // console.log(collections.filter(collection => collection.yelpCollectionId == 'JUO2dgzoATA2UEBEWP1Mjw'));
    // collections.map(collection => collection.lastUpdated = moment(collection.lastUpdated)); // convert from epoch to Moment object
    return collections;
  } catch (error) {
    return {error: error};
  }
}

const addOrUpdateCollection = async (collection) => {
  console.log('in addorupdate', collection.title);
  try {
    const result = await YelpCollection.findOneAndUpdate(
      {yelpCollectionId: collection.yelpCollectionId},
      { 
        yelpCollectionId: collection.yelpCollectionId, 
        title: collection.title, 
        itemCount: collection.itemCount,
        lastUpdated: collection.lastUpdated.valueOf(),
        businesses: collection.businesses,
      },
      {new: true, upsert: true},  
      (error, result) => {
        if (error) {
          Sentry.captureException(error)
          console.log('addorupdate error', error);
          return false;
        } else {
          console.log('addorupdate result', result);
          // Sentry.captureEvent()
          return true;
        }
      }
    ).clone();

    console.log({result});
    return result;
  } catch(error) {
    Sentry.captureException(error);
  }
  

  
}

const compareSavedToLoadedCollections = async (savedCollections) => { 
  const collectionsToUpdate = await Promise.all(
    savedCollections.map(async savedCollection => {
      try {
        const loadedCollection = await loadCollectionPage(savedCollection.yelpCollectionId);

        if (loadedCollection.error) {
          const errorInfo = {
            code: loadedCollection.error.code,
            requestUrl: loadedCollection.error.config.url,
            status: loadedCollection.error.response.status,
            statusText: loadedCollection.error.response.statusText,
          };
          console.warn(`Error: Could not load Yelp Collection ID ${savedCollection.yelpCollectionId}`, errorInfo)
          return null;
        }

        const mongoSavedDate = moment(savedCollection.lastUpdated);
        const yelpLoadedDate = loadedCollection.lastUpdated;
        const upToDate = !(!yelpLoadedDate.isSame(mongoSavedDate) || !savedCollection.lastUpdated);
        console.log({
          mongoSavedDate: mongoSavedDate.format(),
          yelpLoadedDate: yelpLoadedDate.format(),
          upToDate,
        });
        if (!upToDate) {
          console.log('mongoSavedDate !== yelpLoadedDate');
          return loadedCollection;
        }
      } catch (error) {
        return {error: error};
      }
      return null;
    })
  );
  
  console.log({collectionsToUpdate});
  return collectionsToUpdate.filter(collection => !!collection);
}

const findNewBusinessesInCollection = (collectionToUpdate, savedCollections) => {
  const savedCollection = savedCollections.find(collection => collection.yelpCollectionId === collectionToUpdate.yelpCollectionId).toObject();
  const newBusinesses = savedCollection.businesses.filter(saved => !collectionToUpdate.businesses.some(update => saved.alias === update.alias));
  const comparison = _.isEqual(collectionToUpdate.businesses, savedCollections.businesses);
  return newBusinesses;
}

const findModifiedInfoInCollection = (collectionToUpdate, savedCollections) => {
  const savedCollection = savedCollections.find(collection => collection.yelpCollectionId === collectionToUpdate.yelpCollectionId).toObject();
  const updatedInfo = collectionToUpdate.businesses.filter(
    update => !savedCollection.businesses.some(
      saved => saved.alias === update.alias && saved.note === update.note
    )
  );
  return updatedInfo;
}

const updateManyLoadedCollections = async (loadedCollections, savedCollections) => {
  // DEV
  // loadedCollections = [loadedCollections[0]];
  // DEV
  const updatedCollections = await Promise.all(
    loadedCollections.map(async loadedCollection => {
      const populatedItemsResult = await populateRenderedItems(loadedCollection);
      const populatedBusinessesResult = populateBasicBusinessInfo(populatedItemsResult);    
      const updatedInfo = findModifiedInfoInCollection(populatedBusinessesResult, savedCollections);
      console.log({updatedInfo});
      if (updatedInfo.length > 0) {
        const updatedResult = await addOrUpdateCollection(populatedBusinessesResult)
        updatedResult.businesses = updatedResult.businesses.filter(saved => updatedInfo.some(update => update.alias === saved.alias));
        return updatedResult;
      } else {
        return null;
      }

    })
  )
  
  return updatedCollections.filter(x => !!x);
}

const deleteAllCollections = async () => {
  try {
    const response = await YelpCollection.deleteMany({});
    console.log(`Deleted all collections (${response.deletedCount})`);
    return response;
  } catch (error) {
    return {error: error};
  }
}

module.exports = {
  getCollectionItems,
  findCollection,
  loadCollectionPage,
  populateRenderedItems,
  scrapeCollection,
  scrapeAllCollections,
  initializeCollection,
  parseRequestForId,
  getAllCollections,
  addOrUpdateCollection,
  compareSavedToLoadedCollections,
  updateManyLoadedCollections,
  deleteAllCollections,
  scrapeEmbeddedCollection,
}