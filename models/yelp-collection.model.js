const mongoose = require('mongoose');

const yelpCollectionSchema = new mongoose.Schema({
  yelpCollectionId: {
    type: String,
    require: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const YelpCollection = mongoose.model('YelpCollection', yelpCollectionSchema);

module.exports = YelpCollection;

