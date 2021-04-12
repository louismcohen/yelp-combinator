const router = require('express').Router();
const {YelpParsedCollectionController} = require('../controllers/yelp-collection-parser.controller');
let YelpParsedCollection = require('../models/yelp-parsed-collection.model');

router.route('/yelp-parsed-collections/scrape/id/:yelp_collection_id').post(YelpParsedCollectionController.byYelpCollectionId);

router.route('/yelp-parsed-collections/scrape/all').post(YelpParsedCollectionController.allCollections);

router.route('/yelp-parsed-collections').get((request, response) => {
  YelpParsedCollection.find()
    .then(collections => {
      response.json(collections);
    })
    .catch(error => response.status(400).json('Error: ' + error));
})

router.route('/yelp-parsed-collections/:biz_id').get((request, response) => {
  YelpParsedCollection.find()
    .then(collections => {
      response.json(collections.map(collection => collection.parsedCollection.filter(biz => biz.bizId == request.params.biz_id)));
    })
    .catch(error => response.status(400).json('Error: ' + error));
})

router.route('/yelp-parsed-collections/delete-all').delete((request, response) => {
  YelpParsedCollection.deleteMany({})
    .then(response => console.log(`deletedCount: ${response.deletedCount}`))
    .catch(error => response.status(400).json('Error: ' + error));
})

module.exports = router;