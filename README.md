# [Yelp Combinator](http://yelp-combinator.louiscohen.me)
A fusion of Yelp and Google Maps to fill in a number of feature gaps to display, search, and filter your Yelp bookmarks using a combination of page scraping, the Yelp Fusion API, and the Google Maps Platform API to collect and display the necessary data.

### Missing features and shortcomings in existing products
Yelp | Google My Maps
---- | --------------
Cannot search collection bookmarks | Limitation to only 10 layers
No way to find a saved business by name, category, personal note | Search feature is clunky
No filtering for businesses by opening hours (now or at a different time/day) | No ability to filter saved businesses by properties (e.g. opening hours), as with Yelp
No way to mark a business as visited and to filter by visited/not visited | 
Saved businesses only load 30 at a time in the web browser list view, and the user needs to scroll down to load the next 30 | 
No customization of pin icons

### Available and upcoming features in Yelp Combinator
- [x] Search saved business by name, category, added note
- [x] Filter businesses by open/not open now
- [x] Filter businesses by visited/not yet visited
- [x] Mark business as visited/not yet visited
- [x] Get travel distance and time estimate from current location to selected business
- [X] Unique map marker icons, rendered to reflect the business' category
- [ ] Filter businesses open at a certain time / day
- [ ] User account support
- [ ] Ability to add/remove Yelp collections
- [ ] Fully responsive UI for mobile devices

### Known issues
* WebKit styling support is incomplete compared to Chromium
* Performance needs optimization, especially on mobile
