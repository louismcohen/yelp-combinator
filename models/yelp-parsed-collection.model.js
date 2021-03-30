const mongoose = require('mongoose');

const yelpParsedCollectionSchema = new mongoose.Schema({
  yelpCollectionId: {
    type: String,
    require: true,
    unique: false,
    trim: true
  },
  parsedCollection: {
    type: Array
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
}, {
  timestamps: true
});

const YelpParsedCollection = mongoose.model('YelpParsedCollection', yelpParsedCollectionSchema);

module.exports = YelpParsedCollection;

