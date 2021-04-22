const YelpParsedCollection = require('../models/yelp-parsed-collection.model');
const YelpCollection = require('../models/yelp-collection.model');
const YelpBusiness = require('../models/yelp-business.model');
const jsdom = require('jsdom');
const axios = require('axios');
const {yelpAxiosOptions} = require('../config/yelp-connection.config');


// const CORS_PROXY_URL = 'https://thingproxy.freeboard.io/fetch/';
require('dotenv').config('../');
const blackStar = String.fromCharCode(11088);
// let collection = {items: [], businesses: []};

const initializeCollection = () => {
    return {items: [], businesses: []}; 
}

function getCollectionItems(collectionDoc) {
    const collectionItems = collectionDoc.querySelectorAll('.collection-item');
    return collectionItems; 
}

function parseCollectionItems(collectionItems, parsedCollection = []) {
    let maxCounter = 0;

    for (const item of collectionItems) {
        const bizInfo = item.querySelector('.biz-name');
        const url = bizInfo.href;
        const alias = url.substring(url.lastIndexOf('/') + 1);
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
            alias: alias,
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

async function loadCollectionPage(collection, yelpCollectionId) {
    const response = await axios.get(`https://www.yelp.com/collection/${yelpCollectionId}`, yelpAxiosOptions);
    const dom = new jsdom.JSDOM(response.data);

    collection.doc = dom.window.document;
    collection.itemCount = Number(collection.doc.querySelector(".ylist").getAttribute("data-item-count"));
    collection.lastUpdated = new Date(collection.doc.getElementsByTagName("time")[0].dateTime);
    collection.title = collection.doc.querySelector('meta[property="og:title"]').content;
    
    console.log('collection title: ', collection.title);
    console.log('collection item count: ', collection.itemCount);
    console.log('last updated on Yelp: ', collection.lastUpdated);
}

async function populateRenderedCollection(collection, yelpCollectionId) {
    console.log('populateRenderedCollection', collection.title);
    let renderedOffset = 0; // 0, 30, 60, 90 ...
    const offsetStep = 30;
    const maxOffset = collection.itemCount - 1; // 218

    while (maxOffset - renderedOffset > 0) {
        const response = await axios(`https://www.yelp.com/collection/user/rendered_items?collection_id=${yelpCollectionId}&offset=${renderedOffset}&sort_by=date`, yelpAxiosOptions);
        const dom = new jsdom.JSDOM(response.data.list_markup);

        collection.doc = dom.window.document;
        collection.items = [...collection.items, ...getCollectionItems(collection.doc)];
        console.log(`offset ${renderedOffset}, items count`, collection.items.length);
        // collection.parsed = parseCollectionItems(getCollectionItems(collection.doc), collection.parsed);

        renderedOffset += offsetStep;
    }
}

function populateBusinessInfo(collection, yelpCollectionId) {
    console.log('populateBusinessInfo', collection.title);
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

function addToBusinessDatabase(collection, request, response) {
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

const addNewCollection = (request, response) => {
    let collection = initializeCollection();
    let yelpCollectionId;
    if (request.query.url || request.query.id) {
        if (request.query.url) {
            const inputUrl = request.query.url;
            yelpCollectionId = inputUrl.substring(inputUrl.lastIndexOf('/') + 1);
        } else if (request.query.id) {
            yelpCollectionId = request.query.id;
        }

        loadCollectionPage(collection, yelpCollectionId).then(() => {
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

const YelpCollectionController = {
    addNewCollection,
}

// function loadSavedCollection

const allCollections = async (request, response) => {
    try {
        const collections = await YelpCollection.find();
        collections.map(async collection => {
            console.log('this collection:', collection);
            try {
                await byYelpCollectionId(request, response, collection.yelpCollectionId);
            } catch {
                error => response.status(400).json('Error scraping by collection: ' + error);
            }
        })
    } catch {
        error => response.status(400).json('Error looking up collection: ' + error);
    }
}

const byYelpCollectionId = (request, response, yelpCollectionId = request.params.yelp_collection_id) => {
    console.log('byYelpCollectionId', yelpCollectionId);
    let collection = initializeCollection();
    loadCollectionPage(collection, yelpCollectionId).then(async () => {
        try {
            const savedCollection = await YelpParsedCollection.findOne({yelpCollectionId: yelpCollectionId})
            if (savedCollection && savedCollection.lastUpdated == collection.lastUpdated) {
                collection = {
                    yelpCollectionId: savedCollection.yelpCollectionId,
                    businesses: JSON.parse(savedCollection.businesses),
                    lastUpdated: savedCollection.lastUpdated,
                    title: savedCollection.title,
                    itemCount: savedCollection.itemCount
                };
                response.json(collection);
            } else {
                populateRenderedCollection(collection, yelpCollectionId).then(async() => {
                    populateBusinessInfo(collection, yelpCollectionId);
                    const items = JSON.stringify(collection.items);
                    console.log('collection items', collection.items);
                    console.log('items', items);
                    const businesses = JSON.stringify(collection.businesses);
                    const lastUpdated = collection.lastUpdated;
                    const title = collection.title;
                    const itemCount = Number(collection.itemCount);
                  
                    const newCollection = new YelpParsedCollection({
                      yelpCollectionId,
                      businesses,
                      lastUpdated,
                      title,
                      itemCount,
                    });
                    
                    await newCollection.save()
                        // .then(() => response.json('B01 new parsed collection added'))
                        // .catch(error => response.status(400).json('error: ' + error));
                    
                    addToBusinessDatabase(collection, request, response);
                })
            }
        } catch {
            error => response.status(400).json('Error looking up collection: ' + error)
        }
    })
}

const YelpParsedCollectionController = {
    byYelpCollectionId,
    allCollections
}

module.exports = {
    // YelpCollectionController,
    YelpParsedCollectionController
}