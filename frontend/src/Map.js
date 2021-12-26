import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as U from './utils/utils'
import axios from 'axios';
import {
  useLoadScript,
  Marker,
} from "@react-google-maps/api";

import YelpBusinessService from './api/yelp-business.service';

import BusinessInfoWindow from './BusinessInfoWindow';
import MapLoading from './MapLoading';
import IconMarker from './IconMarker';


import './styles/Map.css';
import * as S from './styles/MapStyles';
import GoogleMapStyles from './styles/GoogleMapStyles';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare, faDoorOpen, faDoorClosed, faTimesCircle, faUserCircle, faEllipsisV, faCircle } from '@fortawesome/free-solid-svg-icons/';
import { faCheckSquare as faCheckSquareRegular } from '@fortawesome/free-regular-svg-icons';
import GeolocationService from './api/geolocation.service';

console.log({IconMarker});

const libraries = ['places'];
const mapContainerStyle = {
  width: '100vw',
  height: '100vh'
};
const defaultZoom = 12;
const defaultCenter = {
  lat: 34.01747899558564,
  lng: -118.40530146733245,
}
const options = {
  styles: GoogleMapStyles.appleMapsEsquePlus,
  disableDefaultUI: true,
  zoomControl: true
}

const Map = () => {
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries
  });

  const [businesses, setBusinesses] = useState([]);
  const [markers, setMarkers] = useState([]);
  useEffect(() => {
    const getAllBusinesses = async () => {
      // console.log('api', 'process.env.REACT_APP_BACKEND_URL');
      let response = await axios.get('/api');
      // const businessesJson = await axios.get('./businesses.json');
      // console.log({businessesJson});
      // let response = {};
      // response.data = businessesJson;
      response.data = response.data.filter(business => !!business.name && !!business.coordinates);
      // response.data.map(business => (
      //   business.position = {lat: business.coordinates.latitude, lng: business.coordinates.longitude}, //easier position parsing 
      //   business.hours = business.hours[0] //easier hours parsing
      // ));
      response.data.map(YelpBusinessService.applyExtraBusinessInfo);
      // const businessesData = applyExtraBusinessInfo(response.data);
      setBusinesses(response.data);
      console.log('useEffect getAllBusinesses', response.data);
      console.log({businesses});
    }
    
    getAllBusinesses();
  }, []);

  useEffect(() => {
    setMarkers(businesses.filter(filterBusinesses));
    YelpBusinessService.getAllUniqueCategories(businesses);
  }, [businesses]);

  const [selected, setSelected] = useState(null);
  const onSelect = (item) => {
    // console.log(mapRef.current);
    // mapRef.current.panTo(item.position)
    console.log('selected', item);
    setSelected(item);
  }

  const onMarkerMouseover = (business) => {
    // console.log(markerRefs.current.filter(marker => marker._reactInternals.key === business.alias)[0])
  }

  const [currentPosition, setCurrentPosition] = useState({defaultCenter});
  useEffect(() => {
    const getCurrentPosition = (options = {}) => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      })
    }

    const loadLocation = async () => {
      try {
        const position = await getCurrentPosition();
        setCurrentPosition({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
      } catch (error) {
        console.log({error});
        const approximatePositionInfo = await GeolocationService.getTimeZoneByCoordinates();
        console.log({approximatePositionInfo});
        setCurrentPosition({
          lat: parseFloat(approximatePositionInfo.geo.latitude),
          lng: parseFloat(approximatePositionInfo.geo.longitude),
        })
      }

    }

    loadLocation();
    console.log({currentPosition});

    // const position = (position) => {
    //   console.log({position});
    // }
    // const error = (error) => {
    //   console.warn({error});
    // }
    
    // const navigatorResult = navigator.geolocation.getCurrentPosition(position, error);
    // console.log({navigatorResult});
    // navigator.geolocation.getCurrentPosition((position, error) => {
      
    //   console.log(`getCurrentPosition:`, position, error);
    //   if (error) console.warn(error);
    //   setCurrentPosition({
    //     lat: position.coords.latitude,
    //     lng: position.coords.longitude
    //   })
    //   console.log({position});
    // });

    // const getGeolocationPermissions = async () => {
    //   const permissions = await navigator.permissions.query({name: 'geolocation'});
    //   console.log({permissions});
    // }

    // getGeolocationPermissions();
  }, [])

  const setVisited = async (business) => {
    business.visited = !business.visited;
    saveBusinessInfo(business);
  } 

  const saveBusinessInfo = async (business) => {
    const updatedBusinesses = await YelpBusinessService.saveBusinessInfo(business, businesses);
    setBusinesses(updatedBusinesses);
  }

  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
     mapRef.current = map;
  }, [])

  const CloseButton = () => {
    return (
      <S.StyledCloseButton onClick={() => setSearchTerm('')}>
        <FontAwesomeIcon icon={faTimesCircle} />
      </S.StyledCloseButton>
    )
  }

  const [[searchTerm, debouncedSearchTerm], setSearchTerm] = U.useDebouncedState('');
  const [showOpen, setShowOpen] = useState(0);
  const [showVisited, setShowVisited] = useState(0);

  const filterBusinesses = (business) => {
    if (!debouncedSearchTerm) {
      // console.log('no debouncedSearchTerm');
      // return business;
    }

    const textFilteredResult = (
      business.name.toLowerCase().includes(debouncedSearchTerm) // name
      || business.categories.map(category => category.title).some(title => U.removeSpaces(title).toLowerCase().includes(U.removeSpaces(debouncedSearchTerm))) // categories
      || (!!business.note && business.note.toLowerCase().includes(debouncedSearchTerm)) // note
    )
    
    const visitedFilteredResult = 
    showVisited === 1 
      ? business.visited : 
      showVisited === 2 
        ? !business.visited 
        : business
    
    const openFilteredResult = 
    showOpen === 1 && business.hours
      ? business.hours.is_open_now :
      showOpen === 2 && business.hours
        ? !business.hours.is_open_now
        : business.hours
          ? business
          : null
    
    const attributeFilters = visitedFilteredResult && openFilteredResult;
    
    const finalFilteredResult = searchTerm && searchTerm !== '' ? textFilteredResult && attributeFilters : attributeFilters;
    return finalFilteredResult;
  }

  const nextFilterButtonState = (button, setButton) => {
    // 0 = disabled, 1 = on, 2 = off
    button < 2 ? setButton(button + 1) : setButton(0);
  }

  const OpenFilterButton = () => {
    let iconColor, icon;
    switch (showOpen) {
      case 1:
        iconColor = '#7a0ebd';
        icon = faDoorOpen;
        break;
      case 2:
        iconColor = '#7a0ebd';
        icon = faDoorClosed;
        break;
      case 0:
      default:
        icon = faDoorOpen;
        break;
    }

    const [openFilterValue, setOpenFilterValue] = useState('');

    return (
      <S.FilterButton borderColor={'#7a0ebd'} iconColor={iconColor} onClick={() => nextFilterButtonState(showOpen, setShowOpen)}>
        <FontAwesomeIcon icon={icon} />
        {/* {showOpen === 0 ?
            null
          : showOpen === 1 ?
          <S.FilterButtonText>Open now</S.FilterButtonText>
          : <S.FilterButtonText>Open at</S.FilterButtonText>
            
        }
        <Combobox>
              <S.FilterButtonInput onClick={(e) => e.stopPropagation()}></S.FilterButtonInput>
            </Combobox> */}
        
      </S.FilterButton>
    )
  }
  
  const VisitedFilterButton = () => {
    let borderColor, iconColor, icon;
    switch (showVisited) {
      case 1:
        borderColor = S.visitedGreen;
        iconColor = S.visitedGreen;
        icon = faCheckSquare;
        break;
      case 2:
        borderColor = '#aaa';
        iconColor = S.visitedGreen;
        icon = faCheckSquareRegular;
        break;
      case 0:
      default:
        borderColor = S.visitedGreen;
        icon = faCheckSquare;
        break;
    }
    
    return (
      <S.FilterButton borderColor={S.visitedGreen} iconColor={iconColor} onClick={() => nextFilterButtonState(showVisited, setShowVisited)}>
        <FontAwesomeIcon icon={icon} />
      </S.FilterButton>
    )
  }

  useEffect(() => {
    setMarkers(businesses.filter(filterBusinesses));
  }, [debouncedSearchTerm, showVisited, showOpen])

  const inputFilter = useRef(null);
  const businessInfoWindowMounted = useRef(null);
  useEffect(() => {
    console.log({businessInfoWindowMounted});
  }, [businessInfoWindowMounted])

  const onMapClick = (event) => {
    if (businessInfoWindowMounted.current) {
      setSelected(null);
    }
  }

  const markerRefs = useRef([]);

  const iconMarkerRef = useRef(null);

  const MarkerTooltip = (business) => {
    return (
      <S.StyledMarkerTooltip>
        {business.name}
      </S.StyledMarkerTooltip>
    )
  }

  const [mouseState, setMouseState] = useState({position: {x: 0, y: 0}});
  const parseMouseState = (event) => {
    console.log({mouseState})
    const positionPrev = !!mouseState.position;
    const position = {
      x: event.clientX, 
      y: event.clientY
    };
    console.log({position});

    if (event.type === 'mousedown') {
      setMouseState({state: event.type, position, click: null});
    } else if (event.type === 'mouseup') {
      const click = positionPrev === position;
      console.log({click});
      setMouseState({state: event.type, position, click});
    }
  }

  if (!isLoaded || !!loadError) {
    return (
    <MapLoading loadError={loadError} isLoaded={isLoaded} businesses={businesses} />
    )
  };

  const handleKeyPress = (event) => {
    console.log({event});
    if (event.keyCode === 27) { // 'esc' pressed
      inputFilter.current.blur();
      setSelected(null);
    } else if (event.keyCode === 191) { // '/' pressed
      inputFilter.current.focus(); 
      event.preventDefault();
    } else if (event.keyCode === 79) { // 'o' pressed
      
    } else if (event.keyCode === 13) { //'enter' pressed}
      event.preventDefault();
    }
  } 

  return (
  <div autoFocus onKeyDown={handleKeyPress}>
    <MapLoading loadError={loadError} isLoaded={isLoaded} businesses={businesses} />
    
    {/* <StyledMaterialIcon icon='search' /> */}
    <S.ComboboxContainer>
    <h1>Yelp Combinator</h1>
      <S.StyledCombobox>
        <S.StyledComboboxInput 
          disabled={businesses.length === 0}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value.toLowerCase())}
          onSelect={(event) => setSearchTerm(event.target.value.toLowerCase())}
          placeholder='Filter businesses'
          spellCheck='false'
          ref={inputFilter}
        />
        <CloseButton />
        {/* <ComboboxPopover>
          {businesses.filter(filterBusinesses).map(business => (
            <ComboboxOption key={business.alias} value={business.name} />
          ))}
        </ComboboxPopover> */}
      </S.StyledCombobox>
      <VisitedFilterButton />
      <OpenFilterButton />
    </S.ComboboxContainer>
    <S.StyledGoogleMap 
      mapContainerClassName={'map-container'} 
      mapContainerStyle={mapContainerStyle} 
      zoom={defaultZoom} 
      center={defaultCenter} 
      options={options} 
      clickableIcons={false}
      onLoad={onMapLoad} 
      onClick={onMapClick} 
      >
      {/* {markers.map(business => {
        return (
          <Marker 
            ref={(marker) => markerRefs.current.push(marker)}
            key={business.alias} 
            cursor={'pointer'}
            position={business.position} 
            // animation={window.google.maps.Animation.DROP} 
            onClick={() => onSelect(business)}  
            onMouseOver={() => onMarkerMouseover(business)}
            // icon={RamenDiningIcon}
            title={business.name}
          />
        )
      })} */}
      {markers.map(business => {
        return (
          <IconMarker 
            key={business.alias} 
            business={business} 
            // animation={window.google.maps.Animation.DROP} 
            onIconMarkerClick={() => onSelect(business)}  
            onMouseOver={() => onMarkerMouseover(business)}
            // icon={RamenDiningIcon}
            title={business.name}
          />
        )
      })}
      {/* {businesses.length > 0 && process.env.NODE_ENV !== 'production' ? 
        <IconMarker onIconMarkerClick={() => setSelected(businesses.find(biz => biz.alias === 'homestate-los-angeles-8'))} business={businesses.find(biz => biz.alias === 'homestate-los-angeles-8')} />
        : null} */}
      {selected ? 
        <BusinessInfoWindow ref={businessInfoWindowMounted} business={selected} currentPosition={currentPosition} onGetWebsite={() => saveBusinessInfo(selected)} onVisited={() => setVisited(selected)} onClose={() => setSelected(null)} /> 
        : null
      }
      {
        currentPosition.lat && (
          <S.StyledCurrentLocationMarker key={'currentPosition'} position={currentPosition} icon={S.currentPositionIcon} />
        )
      }
    </S.StyledGoogleMap>
  </div>
  )
}

export default Map;