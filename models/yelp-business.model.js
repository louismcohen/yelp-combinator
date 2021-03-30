const mongoose = require('mongoose');

const yelpBusinessSchema = new mongoose.Schema({
  alias: String,
  name: String,
  image_url: String,
  phone: String,
  display_phone: String,
  review_count: Number,
  categories: [{
    alias: String,
    title: String
  }],
  rating: Number,
  location: {
    address1: String,
    address2: String,
    address3: String,
    city: String,
    zip_code: String,
    country: String,
    state: String,
    display_address: [String]
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  photos: [String],
  yelpCollectionId: {
    type: String,
    trim: true
  },
  note: String,
  addedIndex: Number
}, {
  timestamps: true
});

const YelpBusiness = mongoose.model('YelpBusiness', yelpBusinessSchema);

module.exports = YelpBusiness;

