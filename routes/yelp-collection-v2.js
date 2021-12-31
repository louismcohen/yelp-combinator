const router = require('express').Router();
const YelpCollectionController = require('../controllers/yelp-collection.controller'); 


router.route('/yelp-collections/scrape').get(YelpCollectionController.scrapeCollectionById);
router.route('/yelp-collections/embed/:yelp_collection_id').get(YelpCollectionController.scrapeEmbeddedCollectionById);
router.route('/yelp-collections/id/:yelp_collection_id').get(YelpCollectionController.getCollectionById);

router.route('/yelp-collections/').put(YelpCollectionController.addOrUpdateCollectionById);
router.route('/yelp-collections/scrape').put(YelpCollectionController.scrapeAll);

router.route('/yelp-collections/all').delete(YelpCollectionController.deleteAll);
