const YelpCollectionService = require('../services/yelp-collection.service');
const YelpBusinessService = require('../services/yelp-business.service');

const initialLoad = async(request, response) => {
    try {
        const savedCollections = await YelpCollectionService.getAllCollections();
        console.log(`savedCollections: ${savedCollections.length}`);
        const collectionsToUpdate = await YelpCollectionService.compareSavedToLoadedCollections(savedCollections);
        console.log(`collectionsToUpdate: ${collectionsToUpdate.length}`);
        const updatedCollections = await YelpCollectionService.updateManyLoadedCollections(collectionsToUpdate, savedCollections);
        console.log(`updatedCollections: ${updatedCollections.length}`);

        if (updatedCollections.length > 0) {
            console.log('updatedCollections.length > 0');
            const updatedBusinesses = await YelpBusinessService.checkAndUpdateIncompleteBusinesses(updatedCollections);
            console.log(`updatedBusinesses: ${updatedBusinesses.length}`);
            if (updatedBusinesses) {
                const allBusinesses = await YelpBusinessService.getAllBusinesses();
                console.log(`allBusinesses: ${allBusinesses.length}`);
                response.json(allBusinesses);
            }
        } else if (collectionsToUpdate.length > 0 && updatedCollections.length === 0) {
            console.log(`there are collections to update:`);
            console.log({ collectionsToUpdate });
            const updatedCollections = await Promise.all(collectionsToUpdate.map(async collection => {
                const updatedCollection = await YelpCollectionService.addOrUpdateCollection(collection);
                return updatedCollection;
            }))
            if (updatedCollections) {
                console.log(`updatedCollections array is valid, now load allBusinesses and return`)
                const allBusinesses = await YelpBusinessService.getAllBusinesses();
                console.log(`allBusinesses: ${allBusinesses.length}`);
                response.json(allBusinesses);
            }
        } else {
            console.log('no businesses to update');
            const allBusinesses = await YelpBusinessService.getAllBusinesses();
            console.log(`allBusinesses: ${allBusinesses.length}`);
            response.json(allBusinesses);
        }

    } catch (error) {
        response.status(400).json(error);
    }
}

const expressLoad = async(request, response) => {
    try {
        const allBusinesses = await YelpBusinessService.getAllBusinesses();
        response.json(allBusinesses);
    } catch (error) {
        response.status(400).json(error);
    }
}

const YelpController = {
    initialLoad,
    expressLoad,
}

module.exports = YelpController;