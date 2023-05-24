const YelpController = require('./controllers/yelp.controller');
const router = require('express');
const axios = require('axios');

// const data = async () => {
//   const result = await YelpController.initialLoad();

//   return result;
// } 

const runController = async () => {
  await axios.get('http://localhost:3001/api/')
}

const data = runController();

console.log({data});