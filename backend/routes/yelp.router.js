const router = require('express').Router();
const YelpController = require('../controllers/yelp.controller');
const businesses = require('../businesses.json');

router.route('/').all(YelpController.initialLoad);
// router.route('/').get((request, response) => {
//   response.json(businesses);
// })

module.exports = router;