const mongoose = require('mongoose');

const yelpParsedCollectionSchema = new mongoose.Schema({
  yelpCollectionId: {
    type: String,
    require: true,
    unique: false,
    trim: true
  },
  parsedCollection: {
    type: String
  },
  lastUpdated: {
    type: String
  },
  title: {
    type: String
  },
  itemCount: {
    type: Number
  }, 
  items: {
    type: String
  },
  businesses: {
    type: String
  }
}, {
  timestamps: true
});

const YelpParsedCollection = mongoose.model('YelpParsedCollection', yelpParsedCollectionSchema);

module.exports = YelpParsedCollection;

