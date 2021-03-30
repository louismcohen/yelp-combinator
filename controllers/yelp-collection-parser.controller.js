const YelpParsedCollection = require('../models/yelp-parsed-collection.model');
const YelpCollection = require('../models/yelp-collection.model');
const YelpBusiness = require('../models/yelp-business.model');
const jsdom = require('jsdom');
const axios = require('axios');
const {yelpAxiosOptions} = require('./yelp-connection');


// const CORS_PROXY_URL = 'https://thingproxy.freeboard.io/fetch/';
require('dotenv').config('../');
const blackStar = String.fromCharCode(11088);
let collection = {items: [], businesses: []};

function getCollectionItems(collectionDoc) {
    const collectionItems = collectionDoc.querySelectorAll('.collection-item');
    return collectionItems; 
}

function parseCollectionItems(collectionItems, parsedCollection = []) {
    let maxCounter = 0;

    for (const item of collectionItems) {
        const bizInfo = item.querySelector('.biz-name');
        const url = bizInfo.href;
        const bizId = url.substring(url.lastIndexOf('/') + 1);
        const name = bizInfo.querySelector('span').textContent;
        const note = item.querySelector('.js-info-content').textContent;
        const ratingInt = parseInt(item.getElementsByTagName('meta')[0].content.trim());
        const ratingSym = blackStar.repeat(ratingInt);

        const categoriesList = item.querySelector('.category-str-list').querySelectorAll('a');
        const numCategories = categoriesList.length;
        let categories = '';
        for (let i = 0; i < numCategories; i++) {
            categories += categoriesList[i].textContent;
            if (i < numCategories - 1) categories += ', ';
        }

        const parsedItem = {
            bizId: bizId,
            name: name,
            note: note,
            ratingInt: ratingInt,
            ratingSym: ratingSym,
            categories: categories
        }

        parsedCollection.push(parsedItem);
        maxCounter++;
        // if (maxCounter > 5) break;
    }

    return parsedCollection;
}

async function loadCollectionPage(yelpCollectionId) {
    const response = await axios.get(`https://www.yelp.com/collection/${yelpCollectionId}`, yelpAxiosOptions);
    const dom = new jsdom.JSDOM(response.data);

    collection.doc = dom.window.document;
    collection.itemCount = Number(collection.doc.querySelector(".ylist").getAttribute("data-item-count"));
    collection.lastUpdated = new Date(collection.doc.getElementsByTagName("time")[0].dateTime);
    collection.title = collection.doc.querySelector('meta[property="og:title"]').content;
    
    console.log('collection title: ', collection.title);
    console.log('collection item count: ', collection.itemCount);
    console.log('last updated: ', collection.lastUpdated);
}

async function populateRenderedCollection(yelpCollectionId) {
    let renderedOffset = 0; // 0, 30, 60, 90 ...
    const offsetStep = 30;
    const maxOffset = collection.itemCount - 1; // 218

    while (maxOffset - renderedOffset > 0) {
        const response = await axios(`https://www.yelp.com/collection/user/rendered_items?collection_id=${yelpCollectionId}&offset=${renderedOffset}&sort_by=date`, yelpAxiosOptions);
        const dom = new jsdom.JSDOM(response.data.list_markup);

        collection.doc = dom.window.document;
        collection.items = [...collection.items, ...getCollectionItems(collection.doc)];
        console.log(`offset ${renderedOffset}, items count`, collection.items.length);
        collection.parsed = parseCollectionItems(getCollectionItems(collection.doc), collection.parsed);

        renderedOffset += offsetStep;
    }
}

function populateBusinessInfo(yelpCollectionId) {
    collection.items.forEach((item, index) => {
        const url = item.querySelector('.biz-name').href;
        const alias = url.substring(url.lastIndexOf('/') + 1);
        const note = item.querySelector('.js-info-content').textContent;
        const addedIndex = collection.itemCount - index - 1;
        collection.businesses.push({
            alias,
            note,
            addedIndex,
            yelpCollectionId
        })
    })
}

function addToBusinessDatabase(request, response) {
    Promise.all(collection.businesses.map(async business => {
        console.log(`${business.addedIndex}: ${business.alias}`);
        await YelpBusiness.findOneAndUpdate(
            {alias: business.alias},
            business,
            {new: true, upsert: true},
            (error, result) => {
                if (error) {
                    console.log(`error adding ${business.addedIndex}: ${business.alias}`, result, error);
                } else {
                    console.log(`successfully added ${business.addedIndex}: ${business.alias}`);
                }            
            }
        )
    }));    
}

const YelpCollectionController = {
    addNewCollection(request, response) {
        let yelpCollectionId;
        if (request.query.url || request.query.id) {
            if (request.query.url) {
                const inputUrl = request.query.url;
                yelpCollectionId = inputUrl.substring(inputUrl.lastIndexOf('/') + 1);
            } else if (request.query.id) {
                yelpCollectionId = request.query.id;
            }

            loadCollectionPage(yelpCollectionId).then(() => {
                YelpCollection.findOneAndUpdate(
                    {yelpCollectionId: yelpCollectionId},
                    {yelpCollectionId: yelpCollectionId, title: collection.title},
                    {new: true, upsert: true},  
                    (error, result) => {
                        if (error) {
                            response.status(400).json('A03 error updating or adding new collection' + error);
                        } else {
                            response.json(`A01 new collection added: ${collection.title}`);
                        }
                    }
                )
            })                           
        } else {
            response.status(400).send('A02 missing input parameters');
        }
    }
}

const YelpParsedCollectionController = {
    byYelpCollectionId(request, response) {
        const yelpCollectionId = request.params.yelp_collection_id;
        loadCollectionPage(yelpCollectionId).then(() => {
            populateRenderedCollection(yelpCollectionId).then(() => {
                const parsedCollection = collection.parsedCollection;
                const lastUpdated = collection.lastUpdated;
                const title = collection.title;
                const itemCount = Number(collection.itemCount);
              
                const newCollection = new YelpParsedCollection({
                  yelpCollectionId,
                  parsedCollection,
                  lastUpdated,
                  title,
                  itemCount
                });

                // newCollection.save()
                //     .then(() => response.json('B01 new parsed collection added'))
                //     .catch(err => response.status(400).json('error: ' + err));

                populateBusinessInfo(yelpCollectionId);
                addToBusinessDatabase(request, response);
            })
        })
    }
}

module.exports = {
    YelpCollectionController,
    YelpParsedCollectionController
}