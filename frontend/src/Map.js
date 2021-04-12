import React from 'react';
import axios from 'axios';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow
} from "@react-google-maps/api";
import mapStyles from './mapStyles';

// const GetBookmarks = () => {
//   const [bookmarks, setBookmarks] = React.useState([]);

//   React.useEffect(() => {
//     async function fetchCollections() {

//     }
//   })
// }

async function fetchCollections() {
  axios.get('http://localhost:3001/yelp-parsed-collections/scrape/g6DLKiR2ReMs-N5hN6zDwg')
    .then(response => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    })
}

const libraries = ['places'];
const mapContainerStyle = {
  width: '100vw',
  height: '100vh'
};
const defaultZoom = 12;
const center = {
  lat: 34.01747899558564,
  lng: -118.40530146733245,
}
const options = {
  styles: mapStyles.appleMapsEsquePlus,
  disableDefaultUI: true,
  zoomControl: true
}

function Map() {
  // fetchCollections();
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries
  });

  const [markers, setMarkers] = React.useState([]);

  if (loadError) return 'Error loading maps';
  if (!isLoaded) return 'Loading maps';

  return (
  <div>
    <h1>Title goes here</h1>
    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={defaultZoom} center={center} options={options}>

    </GoogleMap>
  </div>
  )
}

export default Map;