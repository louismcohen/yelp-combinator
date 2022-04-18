const mongoose = require('mongoose');

const yelpBusinessSchema = new mongoose.Schema({
  alias: {
    type: String,
    unique: true,
  },
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
    display_address: [String],
    timezone: String
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
  addedIndex: Number,
  hours: [{
    open: [{
      is_overnight: Boolean,
      start: String,
      end: String,
      day: Number
    }],
    hours_type: String,
    is_open_now: Boolean
  }],
  special_hours: [{
    date: String,
    is_closed: Boolean,
    start: String,
    end: String,
    is_overnight: Boolean
  }],
  visited: Boolean,
  website: String,
  is_claimed: Boolean,
  is_closed: Boolean
}, {
  timestamps: true
});

const YelpBusiness = mongoose.model('YelpBusiness', yelpBusinessSchema);

module.exports = YelpBusiness;

