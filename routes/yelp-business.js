const router = require('express').Router();
// const {YelpCollectionController} = require('../controllers/yelp-collection-parser.controller');
// const YelpBusiness = require('../models/yelp-business.model');
const YelpBusinessController = require('../controllers/yelp-business-controller');

// router.route('/yelp-business/').get((request, response) => {
//   YelpBusiness.find()
//     .then(businesses => response.json(businesses))
//     .catch(error => response.status(400).json('Error: ' + error));
// });

router.route('/yelp-business').all(YelpBusinessController);

// router.route('/yelp-business/').get(YelpBusinessController.getAllBusinesses);
// router.route('/yelp-business/:alias').get(YelpBusinessController.getBusinessById);

// router.route('/yelp-business/').post(YelpBusinessController.addOrUpdateBusinessByAlias);
// router.route('/yelp-business/update-all').post(YelpBusinessController.getAllBusinesses, YelpBusinessController.updateAllBusinesses);




// router.route('/yelp-collections/').post(YelpCollectionController.addNewCollection);

// router.route('/yelp-collections').get((request, response) => {
//   YelpCollection.find()
//     .then(collections => {
//       response.json(collections);
//     })
//     .catch(error => response.status(400).json('Error: ' + err));
// });

// router.route('/yelp-collections/:yelp_collection_id').get((request, response) => {
//   YelpCollection.find({yelpCollectionId: request.params.yelp_collection_id})
//     .then(collection => {
//       response.json(collection);
//     })
//     .catch(error => response.status(400).json('error: ' + error));
// })

// router.route('/yelp-collections/add').post((request, response) => {
//   const yelpCollectionId = request.body.yelpCollectionId;
//   const lastUpdated = request.body.lastUpdated;
//   const title = request.body.title;
//   const itemCount = Number(request.body.itemCount);

//   const newCollection = new YelpCollection({
//     yelpCollectionId,
//     parsedCollection,
//     lastUpdated,
//     title,
//     itemCount
//   });

//   newCollection.save()
//     .then(() => response.json('collection added'))
//     .catch(err => response.status(400).json('error: ' + err));
// });

module.exports = router;