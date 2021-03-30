const YelpParsedCollection = require('../models/yelp-parsed-collection.model');
const YelpCollection = require('../models/yelp-collection.model');
const jsdom = require('jsdom');
const axios = require('axios');

const YELP_BIZ_API_URI = 'https://api.yelp.com/v3/businesses/';
// const CORS_PROXY_URL = 'https://thingproxy.freeboard.io/fetch/';
require('dotenv').config('../');
const blackStar = String.fromCharCode(11088);
let collection = {};

const yelpAxiosOptions = {
    method: 'get',
    headers: {
        'Authorization': `Bearer ${process.env.YELP_API_ID}`,
        'Access-Control-Allow-Origin': '*'
    }
    // referrerPolicy: 'no-referrer',
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

    // console.log('axios response', response);
    collection.doc = dom.window.document;
    collection.itemCount = Number(collection.doc.querySelector(".ylist").getAttribute("data-item-count"));
    collection.lastUpdated = new Date(collection.doc.getElementsByTagName("time")[0].dateTime);
    collection.title = collection.doc.querySelector('meta[property="og:title"]').content;

    // const collectionItems = getCollectionItems(collection.doc);
    
    console.log('collection title: ', collection.title);
    console.log('collection item count: ', collection.itemCount);
    // console.log('collectionItems: ', collectionItems);
    // collection.parsed = parseCollectionItems(collectionItems);
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
        collection.items = getCollectionItems(collection.doc);
        collection.parsed = parseCollectionItems(collection.items, collection.parsed);

        // console.log(`parsed collection (offset ${renderedOffset})`, collection.parsed);

        renderedOffset += offsetStep;
    }
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
                    (err, result) => {
                        if (err) {
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
                response.status(200).json(collection);
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

                newCollection.save()
                    .then(() => response.json('B01 new parsed collection added'))
                    .catch(err => response.status(400).json('error: ' + err));
            })
        })
    }
}


// window.onload = () => {
//     loadCollectionPage().then(() => {
//         let stored_data = JSON.parse(localStorage.getItem(yelpCollectionId));
//         if (stored_data) {
//             stored_data.lastUpdated = new Date(stored_data.lastUpdated);
//             if (+stored_data.lastUpdated < +collection.lastUpdated) {
//                 console.log('loading updated data');
//                 populateRenderedCollection().then(() => {
//                     saveData();
//                 })
//             } else {
//                 console.log('showing previously-stored data');
//                 loadData(stored_data);
//             }
//         } else {
//             console.log('loading new data');
//             populateRenderedCollection().then(() => {
//                 saveData();
//             })
//         }
        
        
        
//     });

    
    
        
        
        

//     // const collectionItems = collection.doc.querySelectorAll('.collection-item');

//     // console.log(collectionItems);

//     // for (const item of collectionItems) {
//     //     const bizInfo = item.querySelector('.biz-name');
//     //     const url = bizInfo.href;
//     //     const bizId = url.substring(url.lastIndexOf('/') + 1);
//     //     const name = bizInfo.querySelector('span').textContent;
//     //     const note = item.querySelector('.js-info-content').textContent;
//     //     const ratingInt = parseInt(item.getElementsByTagName('meta')[0].content.trim());
//     //     const ratingSym = blackStar.repeat(ratingInt);

//     //     const categoriesList = item.querySelector('.category-str-list').querySelectorAll('a');
//     //     const numCategories = categoriesList.length;
//     //     let categories = '';
//     //     for (let i = 0; i < numCategories; i++) {
//     //         categories += categoriesList[i].textContent;
//     //         if (i < numCategories - 1) categories += ', ';
//     //     }

//     //     console.log(name, '\n', url, '\n', note, '\n', ratingSym, '\n', categories);

        

//     //     console.log('fetch url:', `${CORS_PROXY_URL}${YELP_BIZ_API_URI}${bizId}`, yelpAxiosOptions)

//     //     fetch(`${CORS_PROXY_URL}${YELP_BIZ_API_URI}${bizId}`, yelpAxiosOptions)
//     //         .then(response => {
//     //             response.json().then(jsonData => {
//     //                 console.log(jsonData);
//     //             })
//     //         })
//     //         .catch(error => {
//     //             console.log(error);
//     //         });

//     //     break;
//     // }

//     // let google_http_request;

//     // google_http_request = new XMLHttpRequest;
//     // google_http_request.setRequestHeader('key', 'AIzaSyAEoV6r3-BPVwnw8MvGep1Ok1oMsNMW9ZY');



// }

module.exports = {
    YelpCollectionController,
    YelpParsedCollectionController
}