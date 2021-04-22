import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  GoogleMap,
  useLoadScript,
  Marker,
} from "@react-google-maps/api";
import mapStyles from './mapStyles';
import BusinessInfoWindow from './BusinessInfoWindow'
import MapLoading from './MapLoading'

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

// businesses.filter(business => business.categories.map(category => category.alias).some(alias => alias == 'noodles'))

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
      response.data = response.data.filter(business => !!business.name);
      response.data.map(business => (
        business.position = {lat: business.coordinates.latitude, lng: business.coordinates.longitude}, //easier position parsing 
        business.hours = business.hours[0] //easier hours parsing
      ));
      setBusinesses(response.data);
      console.log(response.data);
    }
    
    getAllBusinesses();
  }, []);

  const [selected, setSelected] = useState(null);
  const onSelect = item => {
    console.log('selected', item);
    setSelected(item);
  }

  const [currentPosition, setCurrentPosition ] = useState({center});
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position, error) => {
      if (error) console.warn(error);
      setCurrentPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
      console.log({position});
    });
  }, [])

  const setVisited = async (business) => {
    business.visited = !business.visited;
    const params = {
      action: 'updateSaved',
    }
    try {
      const updatedResponse = await axios.put('http://localhost:3001/yelp-business', business, {params});
      console.log({updatedResponse});
    } catch (error) {
      console.log({error});
    }
  } 

  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
     mapRef.current = map;
  }, [])

  const formatCategories = (categories) => {
    const formattedString = categories.map(x => x.title).join(', ');
    return formattedString;
  }

  const handleClick = (event) => {
    console.log('clicked');
    console.log(event);
  }

  if (loadError) return 'Error loading maps';
  if (!isLoaded) return (
    <MapLoading />
  );

  // const parsedHoursInfo = selected.alias ? parseHours(selected) : {};

  return (
  <div>
    <h1>Yelp Combinator</h1>

    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={defaultZoom} center={center} options={options} onLoad={onMapLoad}>
      {businesses.filter(business => !!business.coordinates).map(business => {
        return (
          <Marker 
            key={business.alias} 
            position={business.position} 
            animation={Animation.DROP} 
            onClick={() => onSelect(business)}  
          />
        )
      })}
      {selected ? 
        <BusinessInfoWindow business={selected} currentPosition={currentPosition} onVisited={() => setVisited(selected)} onClose={() => setSelected(null)} /> 
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