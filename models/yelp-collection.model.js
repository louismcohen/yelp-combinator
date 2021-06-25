const mongoose = require('mongoose');

const yelpCollectionSchema = new mongoose.Schema({
  yelpCollectionId: {
    type: String,
    require: true,
    unique: false,
    trim: true
  },
  lastUpdated: Number,
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

