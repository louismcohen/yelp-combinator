const YelpCollectionService = require('../services/yelp-collection.service');
const YelpBusinessService = require('../services/yelp-business.service');
const YelpBusiness = require('../models/yelp-business.model');

const initialLoad = async (request, response) => {
  try {
    const savedCollections = await YelpCollectionService.getAllCollections();
    const collectionsToUpdate = await YelpCollectionService.compareSavedToLoadedCollections(savedCollections);
    const updatedCollections = await YelpCollectionService.updateManyLoadedCollections(collectionsToUpdate);
    
    if (updatedCollections.length > 0) {
      const updatedBusinesses = await YelpBusiness.checkAndUpdateIncompleteBusinesses(updatedCollections);
    }
    
    const allBusinesses = await YelpBusinessService.getAllBusinesses();
    response.json(allBusinesses);

  } catch (error) {
    response.status(400).json(error);
  }
}

const YelpController = {
  initialLoad,
}

module.exports = YelpController;
