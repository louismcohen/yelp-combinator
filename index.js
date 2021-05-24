const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const app = express();
const path = require('path');

const yelpParsedCollectionsRouter = require('./routes/yelp-parsed-collections');
const yelpCollectionRouter = require('./routes/yelp-collection');
const yelpBusinessRouter = require('./routes/yelp-business');
const yelpRouter = require('./routes/yelp.router');
const googleRouter = require('./routes/google.router');

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api/', yelpParsedCollectionsRouter);
app.use('/api/', yelpCollectionRouter);
app.use('/api/', yelpBusinessRouter);
app.use('/api/', yelpRouter);
app.use('/api/', googleRouter);

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false});
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

if (process.env.NODE_ENV == 'production') {
  app.use(express.static(path.join(__dirname, 'frontend', 'build')));
  app.get('*', (request, response) => {
    response.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



// app.get('/yelp-parsed-collections/scrape/g6DLKiR2ReMs-N5hN6zDwg', (request, response) => {
//   console.log('app response: ', response);
//   response.send('<h1>Hello World!</h1>');
// });