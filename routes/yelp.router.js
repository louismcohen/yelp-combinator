const router = require('express').Router();
const YelpController = require('../controllers/yelp.controller');

router.route('/').all(YelpController.initialLoad);

module.exports = router;