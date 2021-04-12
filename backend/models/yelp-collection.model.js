const mongoose = require('mongoose');
const YelpBusiness = require('./yelp-business.model');

const yelpCollectionSchema = new mongoose.Schema({
  yelpCollectionId: {
    type: String,
    require: true,
    unique: false,
    trim: true
  },
  lastUpdated: String,
  title: String,
  itemCount: Number, 
  items: [String],
  businesses: [{
    alias: String,
    note: String,
    addedIndex: Number,
    yelpCollectionId: String
  }],
}, {
  timestamps: true
});

const YelpCollection = mongoose.model('YelpCollection', yelpCollectionSchema);

module.exports = YelpCollection;

