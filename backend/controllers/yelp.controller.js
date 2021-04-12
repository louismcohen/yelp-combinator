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

  




  // YelpCollectionService.getAllCollections().then(savedCollections => {
  //   console.log('savedCollections', savedCollections);
  //   if (savedCollections.error) {
  //     console.log('savedCollections.error', savedCollections.error);
  //     response.status(400).json(savedCollections.error);
  //   } else {
  //     YelpCollectionService.compareSavedToLoadedCollections(savedCollections).then(collectionsToUpdate => {
  //       console.log('collectionsToUpdate', collectionsToUpdate);
  //       if (collectionsToUpdate.error) {
  //         console.log('collectionsToUpdate.error', collectionsToUpdate.error);
  //         response.status(400).json(collectionsToUpdate.error);
  //       } else {
  //         YelpCollectionService.updateManyLoadedCollections(collectionsToUpdate).then(async updatedCollections => {
  //           console.log('updatedCollections', updatedCollections);
  //           if (updatedCollections.error) {
  //             console.log('updatedCollections.error', updatedCollections.error);
  //             response.status(400).json(updatedCollections.error);
  //           } else if (updatedCollections.length > 0) {
  //             const allBusinesses = updatedCollections.map(collection => collection.businesses).reduce((a, b) => a.concat(b));
  //             const incompleteBusinesses = allBusinesses.filter(biz => !biz.name);
  //             const updatedBusinesses = await Promise.all(
  //               incompleteBusinesses.map(async business => {
  //                 const updatedBusiness = await YelpBusinessService.updateBusinessByAlias(business.alias);
  //                 return updatedBusiness;
  //               })
  //             ).then(
  //               YelpCollectionService.getAllCollections().then(allCollections => {
  //                 console.log('allCollections', allCollections);
  //                 if (allCollections.error) {
  //                   console.log('allCollections.error', allCollections.error);
  //                   response.status(400).json(allCollections.error);
  //                 } else {
  //                   YelpBusinessService.getAllBusinesses().then(allBusinesses => {
  //                     if (allBusinesses.error) {
  //                       response.status(400).json(allBusinesses.error);
  //                     } else {
  //                       response.json(allBusinesses);
  //                     }
  //                   })
  //                 }
  //               })
  //             )
  //           } else {
  //             YelpBusinessService.getAllBusinesses().then(allBusinesses => {
  //               if (allBusinesses.error) {
  //                 response.status(400).json(allBusinesses.error);
  //               } else {
  //                 response.json(allBusinesses);
  //               }
  //             })
  //           }
  //         })  
  //       }
  //     })
  //   }
  // })

  // response.json(collections);
}

const YelpController = {
  initialLoad,
}

module.exports = YelpController;
