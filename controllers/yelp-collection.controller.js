const YelpCollection = require('../models/yelp-collection.model');
const {
  findCollection,
  scrapeCollection,
  initializeCollection,
  parseRequestForId,
  addOrUpdateCollection,
  getAllCollections,
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
    updatedCollection ?
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

const YelpCollectionController = {
  scrapeCollectionById,
  getCollectionById,
  getAllCollections,
  addOrUpdateCollectionById,
  getAll,
}

module.exports = YelpCollectionController;