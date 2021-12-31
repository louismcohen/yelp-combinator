const router = require('express').Router();
// const {YelpCollectionController} = require('../controllers/yelp-collection-parser.controller');
const YelpCollectionController = require('../controllers/yelp-collection.controller'); 

// router.route('/yelp-collections/').post(YelpCollectionController.addNewCollection);

router.route('/yelp-collections/all').get(YelpCollectionController.getAll);
router.route('/yelp-collections/scrape').get(YelpCollectionController.scrapeCollectionById);
router.route('/yelp-collections/embed/:yelp_collection_id').get(YelpCollectionController.scrapeEmbeddedCollectionById);
router.route('/yelp-collections/id/:yelp_collection_id').get(YelpCollectionController.getCollectionById);

router.route('/yelp-collections/').put(YelpCollectionController.addOrUpdateCollectionById);
router.route('/yelp-collections/scrape').put(YelpCollectionController.scrapeAll);

router.route('/yelp-collections/all').delete(YelpCollectionController.deleteAll);

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