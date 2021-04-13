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

// businesses.filter(x => x.categories.map(y => y.alias).some(x => x == 'noodles'))

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
      let response = await axios.get('http://localhost:3001');
      response.data = response.data.filter(biz => !!biz.name);
      response.data.map(biz => (
        biz.position = {lat: biz.coordinates.latitude, lng: biz.coordinates.longitude}
      ));
      setBusinesses(response.data);
      console.log(businesses);
    }
    
    getAllBusinesses();
  }, []);


  const [selected, setSelected] = useState({});
  const onSelect = item => {
    console.log(item);
    setSelected(item);
  }

  if (loadError) return 'Error loading maps';
  if (!isLoaded) return 'Loading maps';

  return (
  <div>
    <h1>Yelp Combinator</h1>

    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={defaultZoom} center={center} options={options}>
      {businesses.filter(biz => !!biz.coordinates).map(biz => {
        return (
          <Marker 
            key={biz.alias} 
            position={biz.position} 
            animation={Animation.DROP} 
            onClick={() => onSelect(biz)}  
          />
        )
      })}
      {
        selected.alias && (
          <InfoWindow position={selected.position} clickable={true} onCloseClick={() => setSelected({})}>
            <div>
              <img src={selected.image_url} alt={selected.name} style={{float: 'left', maxWidth: 90, height: 'auto'}}/>
              <p>{selected.name}</p>
            </div>
          </InfoWindow>
        )
      }
    </GoogleMap>
  </div>
  )
}

export default Map;