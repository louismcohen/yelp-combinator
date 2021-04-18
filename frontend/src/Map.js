import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow
} from "@react-google-maps/api";
import mapStyles from './mapStyles';
import BusinessInfoWindow from './BusinessInfoWindow'

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

// businesses.filter(biz => biz.categories.map(category => category.alias).some(alias => alias == 'noodles'))

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

const parseHours = (business) => {
  const now = new Date();
  const nowTimeFormatted = `${now.getHours()}${now.getMinutes()}`
  const dayOfWeek = now.getDay();
  let result = {};
  
  const currentOpeningBlock = business.hours.open.filter(x => x.day === dayOfWeek && x.start < nowTimeFormatted && x.end > nowTimeFormatted)[0];
  if (currentOpeningBlock) {
    let openUntilFormatted = new Date();
    openUntilFormatted.setHours(currentOpeningBlock.end.substring(0,2));
    openUntilFormatted.setMinutes(currentOpeningBlock.end.substring(2,4));
    openUntilFormatted.setSeconds(0);
    openUntilFormatted = openUntilFormatted.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
    const isOpen = currentOpeningBlock ? true : false;
    result = {
      isOpen,
      currentOpeningBlock,
      openUntilFormatted,
    }
  } else {
    const nextOpeningBlock = business.hours.open.filter(x => x.day === dayOfWeek + 1);
  }


  

  console.log(result);
  return result;
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
        biz.position = {lat: biz.coordinates.latitude, lng: biz.coordinates.longitude}, //easier position parsing 
        biz.hours = biz.hours[0] //easier hours parsing
      ));
      setBusinesses(response.data);
      console.log(response.data);
    }
    
    getAllBusinesses();
  }, []);

  const [selected, setSelected] = useState(null);
  const onSelect = item => {
    console.log(item);
    setSelected(item);
  }

  const [currentPosition, setCurrentPosition ] = useState({center});
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position, error) => {
      console.warn(error);
      setCurrentPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
      console.log({position});
    });
  }, [])

  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
     mapRef.current = map;
  }, [])

  const formatCategories = (categories) => {
    const formattedString = categories.map(x => x.title).join(', ');
    return formattedString;
  }

  if (loadError) return 'Error loading maps';
  if (!isLoaded) return 'Loading maps';

  // const parsedHoursInfo = selected.alias ? parseHours(selected) : {};

  return (
  <div>
    <h1>Yelp Combinator</h1>

    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={defaultZoom} center={center} options={options} onLoad={onMapLoad}>
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
      {/* {
        selected ? (
          <InfoWindow position={selected.position} clickable={true} onCloseClick={() => setSelected(null)}>
            <div>
              <h2>{selected.name}</h2>
              <div class="categories">{formatCategories(selected.categories)}</div>
              <img src={selected.image_url} alt={selected.name} style={{float: 'left', maxWidth: 90, height: 'auto'}}/>
            </div>
          </InfoWindow>
        ) : null
      } */}
      {selected ? 
        <BusinessInfoWindow business={selected} currentPosition={currentPosition}></BusinessInfoWindow> 
        : null
      }
      {
        currentPosition.lat && (
          <Marker position={currentPosition} />
        )
      }
    </GoogleMap>
  </div>
  )
}

export default Map;