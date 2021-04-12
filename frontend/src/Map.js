import React, { useEffect, useState } from 'react';
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

// const getAllBusinesses = async () => {
//   try {
//     const response = await axios.get('http://localhost:3001');
//     console.log({response: response}, {data: response.data});
//     return response.data;
//   } catch (error) {
//     return {error: error};
//   }
// }

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

const Map = () => {
  // fetchCollections();
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries
  });

  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    const getAllBusinesses = async () => {
      const response = await axios.get('http://localhost:3001');
      setBusinesses(response.data);
    }
    
    getAllBusinesses();
  }, []);

  console.log(businesses);
  const [markers, setMarkers] = useState([]);

  if (loadError) return 'Error loading maps';
  if (!isLoaded) return 'Loading maps';

  return (
  <div>
    <h1>Yelp Combinator</h1>
    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={defaultZoom} center={center} options={options}>
    {businesses.filter(biz => !!biz.coordinates).map(biz => {
      const position = {lat: biz.coordinates.latitude, lng: biz.coordinates.longitude};
      return (
        <Marker key={biz.alias} position={position} />
      )
    })}
    </GoogleMap>
  </div>
  )
}

export default Map;