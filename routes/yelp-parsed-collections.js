const router = require('express').Router();
const {YelpParsedCollectionController} = require('../controllers/yelp-collection-parser.controller');
let YelpParsedCollection = require('../models/yelp-parsed-collection.model');

router.route('/yelp-parsed-collections/scrape/:yelp_collection_id').post(YelpParsedCollectionController.byYelpCollectionId);

router.route('/yelp-parsed-collections').get((request, response) => {
  YelpParsedCollection.find()
    .then(collections => {
      response.json(collections);
    })
    .catch(error => response.status(400).json('Error: ' + err));
})

router.route('/yelp-parsed-collections/:biz_id').get((request, response) => {
  YelpParsedCollection.find()
    .then(collections => {
      response.json(collections.map(collection => collection.parsedCollection.filter(biz => biz.bizId == request.params.biz_id)));
    })
    .catch(error => response.status(400).json('Error: ' + err));
})

router.route('/yelp-parsed-collections/add').post((request, response) => {
  const yelpCollectionId = request.body.yelpCollectionId;
  const parsedCollection = request.body.parsedCollection;
  const lastUpdated = request.body.lastUpdated;
  const title = request.body.title;
  const itemCount = Number(request.body.itemCount);

  const newCollection = new YelpParsedCollection({
    yelpCollectionId,  
    parsedCollection,
    lastUpdated,
    title,
    itemCount
  });

  newCollection.save()
    .then(() => response.json('collection added'))
    .catch(err => response.status(400).json('error: ' + err));
})

module.exports = router;