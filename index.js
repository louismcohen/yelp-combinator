const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const app = express();

const yelpParsedCollectionsRouter = require('./routes/yelp-parsed-collections');
const yelpCollectionsRouter = require('./routes/yelp-collections');
const yelpBusinessRouter = require('./routes/yelp-business');

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/', yelpParsedCollectionsRouter);
app.use('/', yelpCollectionsRouter);
app.use('/', yelpBusinessRouter);

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false});
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// app.get('/yelp-parsed-collections/scrape/g6DLKiR2ReMs-N5hN6zDwg', (request, response) => {
//   console.log('app response: ', response);
//   response.send('<h1>Hello World!</h1>');
// });