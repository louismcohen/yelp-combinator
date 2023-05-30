import React, { useEffect, useState, createRef, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MarkerClusterer } from "@googlemaps/markerclusterer";


import axios from 'axios';

import YelpBusinessService from './api/yelp-business.service';

const defaultZoom = 12;
const defaultCenter = {
  lat: 34.01747899558564,
  lng: -118.40530146733245,
};
const mapContainerStyle = {
  width: '100vw',
  height: '100vh'
};

const loader = new Loader({
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  version: 'weekly',
  libraries: ['places']
});

const mapOptions = {
  center: defaultCenter,
  zoom: defaultZoom,
  disableDefaultUI: true,
  zoomControl: true,
  mapId: '3613d307a42d54f5'
};

const markerClustererAlgorithmOptions = {
  maxZoom: 14,
}

const RenderedMap = () => {
  const mapRef = useRef(null);
  const methodsRef = useRef(null);
  const [map, setMap] = useState(null);
  const [methods, setMethods] = useState(null);
  useEffect(() => {
    const loadMap = async () => {
      try {
        const google = await loader.load();
        initMap(google);
      } catch (error) {
        console.error({error});
      }
    }

    const initMap = async (google) => {
      const { Map } = await google.maps.importLibrary('maps');
      const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
      const mapObject = new Map(mapRef.current, mapOptions)
      setMap(mapObject);
      setMethods({
        Map, 
        AdvancedMarkerElement
      });
    }

    loadMap(); 
  }, []);

  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  useEffect(() => {
    const getAllBusinesses = async () => {
      let response = await axios.get('/api');
      response.data = response.data.filter(business => !!business.name && !!business.coordinates);
      response.data.map(YelpBusinessService.applyExtraBusinessInfo);
      setBusinesses(response.data);
    }
    
    getAllBusinesses();
  }, []);

  const filterBusinesses = (business) => {
    return business;
  };

  useEffect(() => {
    setFilteredBusinesses(businesses.filter(filterBusinesses));
    YelpBusinessService.getAllUniqueCategories(businesses);
  }, [businesses]);

  const [markers, setMarkers] = useState(null);
  useEffect(() => {
    setMarkers(filteredBusinesses.map(business => {
      const marker = new methods.AdvancedMarkerElement({
        map,
        position: business.position
      })

      return marker;
    }));

  }, [map, methods?.AdvancedMarkerElement, filteredBusinesses])

  const [markerClusterer, setMarkerClusterer] = useState(null);
  useEffect(() => {
    console.log({map, markers});
    if (!map || !markers) return;
    const cluster = new MarkerClusterer({
      map,
      markers
    })

    setMarkerClusterer(cluster);
  }, [map, markers])

  return (
    <div ref={mapRef} style={mapContainerStyle}>

    </div>
  )
}

export default RenderedMap;