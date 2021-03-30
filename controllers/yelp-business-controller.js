const YelpBusiness = require('../models/yelp-business.model');

const YelpBusinessController = {
  addOrUpdateBusiness(request, response) {
    const alias = request.body.alias;
    YelpBusiness.findOneAndUpdate(
      {alias: alias},
      request.body,
      {new: true, upsert: true},
      (error, result) => {
        if (error) {
          response.status(400).json('C01 error updating or adding business' + error);
        } else {
            response.json(`C02 business added/updated: ${result.name}`);
        }
      }
    )
  },

  getAllBusinesses(request, response) {
    YelpBusiness.find()
      .then(businesses => response.json(businesses))
      .catch(error => response.status(400).json('Error: ' + error));
  },

  getBusinessById(request, response) {
    YelpBusiness.findOne({alias: request.params.alias})
      .then(business => response.json(business))
      .catch(error => response.status(400).json('Error: ' + error));
  }
}

module.exports = YelpBusinessController;