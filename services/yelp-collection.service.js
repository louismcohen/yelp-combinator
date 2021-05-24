const YelpCollection = require('../models/yelp-collection.model');
const {
  populateBasicBusinessInfo,
  updateBusinessByAlias,
  updateBusinessBasicInfo,
} = require('./yelp-business.service');
const jsdom = require('jsdom');
const axios = require('axios');
const {yelpAxiosOptions, YELP_RENDERED_ITEMS_URI, YELP_COLLECTION_URI} = require('../config/yelp-connection.config');
const { response } = require('express');

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
  let collection = initializeCollection();
  collection.yelpCollectionId = yelpCollectionId;

  try {
    const response = await axios.get(`${YELP_COLLECTION_URI}${collection.yelpCollectionId}`, yelpAxiosOptions);
    const dom = new jsdom.JSDOM(response.data);

    collection.doc = dom.window.document;
    collection.itemCount = Number(collection.doc.querySelector(".ylist").getAttribute("data-item-count"));
    collection.lastUpdated = new Date(collection.doc.getElementsByTagName("time")[0].dateTime);
    collection.title = collection.doc.querySelector('meta[property="og:title"]').content;
    
    console.log(`loadCollectionPage ${collection.title} ${collection.yelpCollectionId}: ${collection.itemCount} items, last updated on Yelp ${collection.lastUpdated}`);

    return collection;
  } catch (error) {
    console.log('loadCollectionPage error', error);
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
  // console.log(JSON.stringify(populatedBusinessesResult));
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

const getAllCollections = async () => {
  try {
    const collections = await YelpCollection.find();
    return collections;
  } catch (error) {
    return {error: error};
  }
}

const addOrUpdateCollection = async (collection) => {
  console.log('in addorupdate', collection.title);
  const result = await YelpCollection.findOneAndUpdate(
    {yelpCollectionId: collection.yelpCollectionId},
    { 
      yelpCollectionId: collection.yelpCollectionId, 
      title: collection.title, 
      itemCount: collection.itemCount,
      lastUpdated: collection.lastUpdated,
      businesses: collection.businesses,
    },
    {new: true, upsert: true},  
    (error, result) => {
      if (error) {
          console.log('addorupdate error', error);
          return false;
      } else {
          console.log('addorupdate result', result);
          return result;
      }
    }
  )

  return result;
}

const compareSavedToLoadedCollections = async (savedCollections) => { 
  const collectionsToUpdate = await Promise.all(
    savedCollections.map(async savedCollection => {
      try {
        const loadedCollection = await loadCollectionPage(savedCollection.yelpCollectionId);
        console.log({
          savedCollection,
          loadedCollection,
        });
        console.log({
          savedDate: Date.parse(savedCollection.lastUpdated),
          loadedDate: Date.parse(loadedCollection.lastUpdated),
        });
        if (Date.parse(savedCollection.lastUpdated) !== Date.parse(loadedCollection.lastUpdated) || !savedCollection.lastUpdated) {
          return loadedCollection;
        }
      } catch (error) {
        return {error: error};
      }
      return null;
    })
  );

  return collectionsToUpdate.filter(collection => !!collection);
}

const updateManyLoadedCollections = async (loadedCollections) => {
  // DEV
  // loadedCollections = [loadedCollections[0]];
  // DEV
  const updatedCollections = await Promise.all(
    loadedCollections.map(async loadedCollection => {
      const populatedItemsResult = await populateRenderedItems(loadedCollection);
      const populatedBusinessesResult = populateBasicBusinessInfo(populatedItemsResult);
      const updatedResult = await addOrUpdateCollection(populatedBusinessesResult);
      return updatedResult;
    })
  )
  
  return updatedCollections;
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
}