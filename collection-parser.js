const GOOGLE_PLACES_API_URI = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const GOOGLE_API_KEY = 'AIzaSyAEoV6r3-BPVwnw8MvGep1Ok1oMsNMW9ZY';
const YELP_BIZ_API_URI = 'https://api.yelp.com/v3/businesses/';
const CORS_PROXY_URL = 'https://thingproxy.freeboard.io/fetch/';
const YELP_COLLECTION_ID = 'g6DLKiR2ReMs-N5hN6zDwg';
const black_star = String.fromCharCode(11088);
const parser = new DOMParser();
let collection = {};

const yelp_fetch_options = {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer CTpSZtfWaUcJtMZHpnNpq2PaJPs2V-2dbMtrS48ifvMy66V9oK7FnpGmkFQ2jj-5aVBN6OsRB1tjuYPBUKHai7Jn0hI_AlWxEs3ZUvtJStg2Lzfo2w27iaPpXNJKYHYx',
        'Access-Control-Allow-Origin': '*'
    }
    // referrerPolicy: 'no-referrer',
}

function getCollectionItems(collection_doc) {
    const collection_items = collection_doc.querySelectorAll('.collection-item');
    return collection_items; 
}

function parseCollectionItems(collection_items, parsed_collection = []) {
    let max_counter = 0;

    for (const item of collection_items) {
        const biz_info = item.querySelector('.biz-name');
        const url = biz_info.href;
        const biz_id = url.substring(url.lastIndexOf('/') + 1);
        const name = biz_info.querySelector('span').textContent;
        const note = item.querySelector('.js-info-content').textContent;
        const rating_int = parseInt(item.getElementsByTagName('meta')[0].content.trim());
        const rating_sym = black_star.repeat(rating_int);

        const categories_list = item.querySelector('.category-str-list').querySelectorAll('a');
        const num_of_categories = categories_list.length;
        let categories = '';
        for (let i = 0; i < num_of_categories; i++) {
            categories += categories_list[i].textContent;
            if (i < num_of_categories - 1) categories += ', ';
        }

        const parsed_item = {
            biz_id: biz_id,
            name: name,
            note: note,
            rating_int: rating_int,
            rating_sym: rating_sym,
            categories: categories
        }

        parsed_collection.push(parsed_item);
        max_counter++;
        // if (max_counter > 5) break;
    }

    return parsed_collection;
}

async function loadCollectionPage() {
    const response = await fetch(`${CORS_PROXY_URL}https://www.yelp.com/collection/${YELP_COLLECTION_ID}`, yelp_fetch_options);
    const text = await response.text();

    collection.doc = parser.parseFromString(text, 'text/html');
    collection.item_count = Number(collection.doc.querySelector(".ylist").getAttribute("data-item-count"));
    collection.last_updated = new Date(collection.doc.getElementsByTagName("time")[0].dateTime);
    collection.title = collection.doc.querySelector('meta[property="og:title"]').content;

    const collection_items = getCollectionItems(collection.doc);
    

    console.log('collection item count: ', collection.item_count);
    console.log('collection_items: ', collection_items);
    // collection.parsed = parseCollectionItems(collection_items);
    console.log('last updated: ', collection.last_updated);
}

async function populateRenderedCollection() {
    let rendered_offset = 0; // 0, 30, 60, 90 ...
    const offset_step = 30;
    const max_offset = collection.item_count - 1; // 218

    while (max_offset - rendered_offset > 0) {
        const response = await fetch(`${CORS_PROXY_URL}https://www.yelp.com/collection/user/rendered_items?collection_id=${YELP_COLLECTION_ID}&offset=${rendered_offset}&sort_by=date`, yelp_fetch_options);
        const json_data = await response.json();

        collection.doc = parser.parseFromString(json_data.list_markup, 'text/html');
        collection.items = getCollectionItems(collection.doc);
        collection.parsed = parseCollectionItems(collection.items, collection.parsed);

        console.log(`parsed collection (offset ${rendered_offset})`, collection.parsed);

        rendered_offset += offset_step;
    }
}

function saveData() {
    const data_save = {
        parsed_collection: collection.parsed,
        last_updated: collection.last_updated,
        title: collection.title,
        item_count: collection.item_count
    }
    
    console.log(`saving data (${YELP_COLLECTION_ID}): `, data_save);

    localStorage.setItem(YELP_COLLECTION_ID, JSON.stringify(data_save));
}

function loadData(stored_data) {
    collection = {
        parsed: stored_data.parsed_collection,
        last_updated: stored_data.last_updated,
        title: stored_data.title,
        item_count: stored_data.item_count
    }
}

window.onload = () => {
    loadCollectionPage().then(() => {
        let stored_data = JSON.parse(localStorage.getItem(YELP_COLLECTION_ID));
        if (stored_data) {
            stored_data.last_updated = new Date(stored_data.last_updated);
            if (+stored_data.last_updated < +collection.last_updated) {
                console.log('loading updated data');
                populateRenderedCollection().then(() => {
                    saveData();
                })
            } else {
                console.log('showing previously-stored data');
                loadData(stored_data);
            }
        } else {
            console.log('loading new data');
            populateRenderedCollection().then(() => {
                saveData();
            })
        }
        
        
        
    });

    
    
        
        
        

    // const collection_items = collection.doc.querySelectorAll('.collection-item');

    // console.log(collection_items);

    // for (const item of collection_items) {
    //     const biz_info = item.querySelector('.biz-name');
    //     const url = biz_info.href;
    //     const biz_id = url.substring(url.lastIndexOf('/') + 1);
    //     const name = biz_info.querySelector('span').textContent;
    //     const note = item.querySelector('.js-info-content').textContent;
    //     const rating_int = parseInt(item.getElementsByTagName('meta')[0].content.trim());
    //     const rating_sym = black_star.repeat(rating_int);

    //     const categories_list = item.querySelector('.category-str-list').querySelectorAll('a');
    //     const num_of_categories = categories_list.length;
    //     let categories = '';
    //     for (let i = 0; i < num_of_categories; i++) {
    //         categories += categories_list[i].textContent;
    //         if (i < num_of_categories - 1) categories += ', ';
    //     }

    //     console.log(name, '\n', url, '\n', note, '\n', rating_sym, '\n', categories);

        

    //     console.log('fetch url:', `${CORS_PROXY_URL}${YELP_BIZ_API_URI}${biz_id}`, yelp_fetch_options)

    //     fetch(`${CORS_PROXY_URL}${YELP_BIZ_API_URI}${biz_id}`, yelp_fetch_options)
    //         .then(response => {
    //             response.json().then(jsonData => {
    //                 console.log(jsonData);
    //             })
    //         })
    //         .catch(error => {
    //             console.log(error);
    //         });

    //     break;
    // }

    // let google_http_request;

    // google_http_request = new XMLHttpRequest;
    // google_http_request.setRequestHeader('key', 'AIzaSyAEoV6r3-BPVwnw8MvGep1Ok1oMsNMW9ZY');



}

