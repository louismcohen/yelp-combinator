const YelpCollection = require('../models/yelp-collection.model');
const {
  findCollection,
  scrapeCollection,
  initializeCollection,
  parseRequestForId,
  addOrUpdateCollection,
  getAllCollections,
  scrapeAllCollections,
  deleteAllCollections,
  scrapeEmbeddedCollection,
} = require('../services/yelp-collection.service');

const getAll = async (request, response) => {
  const collections = await getAllCollections();
  collections ? 
    response.json(collections) :
    response.status(400).json(`Error looking up all collections`);
}

const getCollectionById = async (request, response) => {
  yelpCollectionId = request.params.yelp_collection_id;
  try {
    const collection = await findCollection(yelpCollectionId);
    console.log(collection);
    response.json(collection); 
  } catch {
    error => response.status(400).json(`Error looking up collection ${yelpCollectionId}: ${error}`);
  }  
}

const addOrUpdateCollectionById = async (request, response) => {
  let collection = initializeCollection();

  if (collection.yelpCollectionId = parseRequestForId(request)) {
    const scrapedCollection = await scrapeCollection(collection.yelpCollectionId);
    
    const result = await addOrUpdateCollection(scrapedCollection);
    const action = result.updatedAt == result.createdAt ? 'added' : 'updated';
    result ?
      response.json(`F02 collection ${action}: ${scrapedCollection.title}`) :
      response.status(400).json(`F03 error updating or adding new collection ${scrapedCollection.title}`);
  } else {
    response.status(400).send('F01 missing input parameters');
  }
}

const scrapeCollectionById = async (request, response) => {
  let collection = initializeCollection();
  collection.yelpCollectionId = request.query.id;
  
  try {
    const scrapedCollection = await scrapeCollection(collection.yelpCollectionId);
    response.json(scrapedCollection);  
  } catch {
    error => response.status(400).json(`G01 error scraping collection ${collection.yelpCollectionId}: ${error}`);
  }
};

const scrapeEmbeddedCollectionById = async (request, response) => {
  yelpCollectionId = request.params.yelp_collection_id;
  try {
    const output = await scrapeEmbeddedCollection(yelpCollectionId);
    response.json(output);
  } catch (error) {
    return {error};
  }
}

const scrapeAll = async (request, response) => {
  try {
    const scrapedCollections = await scrapeAllCollections();
    response.json(scrapedCollections);
  } catch (error) {
    response.status(400).json(`Error scraping all collections ${error}`);
  }
}

const deleteAll = async (request, response) => {
  try {
    const result = await deleteAllCollections();
    response.json(result);
  } catch (error) {
    response.status(400).json(`Error deleting all collections ${error}`);
  }
}

const YelpCollectionController = {
  scrapeCollectionById,
  scrapeEmbeddedCollectionById,
  scrapeAll,
  getCollectionById,
  addOrUpdateCollectionById,
  getAll,
  deleteAll,
}

module.exports = YelpCollectionController;