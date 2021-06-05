import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as U from './utils/utils'
import axios from 'axios';
import {
  useLoadScript,
  Marker,
} from "@react-google-maps/api";
import moment from 'moment';

import BusinessInfoWindow from './BusinessInfoWindow';
import MapLoading from './MapLoading';

import 'semantic-ui-css/semantic.min.css'
import './styles/Map.css'
import * as S from './styles/MapStyles';
import GoogleMapStyles from './styles/GoogleMapStyles';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare, faDoorOpen, faDoorClosed, faTimesCircle, faUserCircle, faEllipsisV, faCircle } from '@fortawesome/free-solid-svg-icons/';
import { faCheckSquare as faCheckSquareRegular } from '@fortawesome/free-regular-svg-icons';


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
  styles: GoogleMapStyles.appleMapsEsquePlus,
  disableDefaultUI: true,
  zoomControl: true
}

const parseHours = (business) => {
  const daysOfTheWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const nextDayToCheck = (dayOfWeek) => {
    return dayOfWeek < 6 ? dayOfWeek + 1 : 0;
  }

  // console.log({parseHours: business});
  const now = moment();
  const nowTimeFormatted = `${now.format('HHmm')}`
  let openingMessage = '';


  const openingHours = business.hours.open;  
  const findOpeningBlock = (dayOfWeek) => {
    const openHoursThisDay = openingHours.filter(x => x.day === dayOfWeek);
    if (openHoursThisDay.length > 0) {
      if (openHoursThisDay.filter(open => open.day === now.day() && open.start < nowTimeFormatted && open.end > nowTimeFormatted).length > 0) { // open right now
        
        // console.log(`${business.name} is open right now`);
        const currentOpeningBlock = openHoursThisDay
          .filter(open => open.day === now.day() && open.start < nowTimeFormatted && open.end > nowTimeFormatted)[0];

        openingMessage = `Open until ${moment(currentOpeningBlock.end, 'HHmm').format('h:mm A')}`;
        business.hours.is_open_now = true;
        business.hours.open_info = {
          time: moment(currentOpeningBlock.end, 'HHmm').format('h:mm A'),
        }
  
        // openHoursThisDay.map(open => console.log({start: open.start, end: open.end}));
      } else if (openHoursThisDay.filter(open => open.day === now.day() && open.start > nowTimeFormatted).length > 0) { // open later today
        
        // console.log(`${business.name} is open later today`);
        
        const currentOpeningBlock = openHoursThisDay
          .filter(open => open.day === now.day() && open.start > nowTimeFormatted)
          .sort((a, b) => a.start - b.start)[0];

        openingMessage = `Opens at ${moment(currentOpeningBlock.start, 'HHmm').format('h:mm A')}`;
        business.hours.is_open_now = false;
        business.hours.open_info = {
          time: moment(currentOpeningBlock.start, 'HHmm').format('h:mm A'),
        }
  
        // openHoursThisDay.map(open => console.log({start: open.start, end: open.end}));
      } else if (openHoursThisDay.filter(open => open.day === now.day() && open.end < nowTimeFormatted).length > 0 && !(openingHours.length === 1)) { // was open today, now closed
        
        // console.log(`${business.name} was open today but is now closed, will look on ${daysOfTheWeek[nextDayToCheck(dayOfWeek)]}`);

        // openHoursThisDay.map(open => console.log({start: open.start, end: open.end}));
        findOpeningBlock(nextDayToCheck(dayOfWeek));
      } else if (openHoursThisDay.filter(open => open.day === dayOfWeek) || openingHours.length === 1) { // open on another day
        
        // console.log(`${business.name} is not open today, but next open on ${daysOfTheWeek[dayOfWeek]}`);

        const currentOpeningBlock = openHoursThisDay
          .filter(open => open.day === dayOfWeek)
          .sort((a, b) => a.start - b.start)[0];
        
        const tomorrow = dayOfWeek === nextDayToCheck(now.day());
        openingMessage = `Opens ${tomorrow ? 'tomorrow' : daysOfTheWeek[dayOfWeek]} at ${moment(currentOpeningBlock.start, 'HHmm').format('h:mm A')}`;
        business.hours.is_open_now = false;
        business.hours.open_info = {
          day: tomorrow ? 'tomorrow' : daysOfTheWeek[dayOfWeek],
          time: moment(currentOpeningBlock.start, 'HHmm').format('h:mm A'),
        }

        // openHoursThisDay.map(open => console.log({start: open.start, end: open.end}));
      } else { // not open on this day, look for next day
        // console.log(`${business.name} is not open on ${daysOfTheWeek[dayOfWeek]}, will continue looking`);
        findOpeningBlock(nextDayToCheck(dayOfWeek));
      }
    } else { // not open on this day, look for next day
      // console.log(`${business.name} is not open on ${daysOfTheWeek[dayOfWeek]}, will continue looking`);
      findOpeningBlock(nextDayToCheck(dayOfWeek));
    }
  }
  
  findOpeningBlock(now.day());  
  // console.log({openingMessage});
  return openingMessage;
}

const Map = () => {
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries
  });

  const getAllUniqueCategories = () => {
    const allCategories = businesses.map(x => x.categories).flat().map(y => {return {alias: y.alias, title: y.title}});
    const uniqueCategories = allCategories.filter((value, index) => allCategories.findIndex(obj => obj.alias === value.alias) === index);
    const uniqueCategoriesSorted = uniqueCategories.sort((a, b) => (a.title > b.title) ? 1 : - 1);

    console.log({uniqueCategoriesSorted});
    return uniqueCategoriesSorted;
  }

  const applyExtraBusinessInfo = (business) => {
    business.position = {lat: business.coordinates.latitude, lng: business.coordinates.longitude}; //easier position parsing 
    business.hours = business.hours[0]; //easier hours parsing
    if (business.hours) parseHours(business);

    return business;
  }

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
      response.data.map(applyExtraBusinessInfo);
      // const businessesData = applyExtraBusinessInfo(response.data);
      setBusinesses(response.data);
      console.log('useEffect getAllBusinesses', response.data);
      console.log({businesses});
    }
    
    getAllBusinesses();
  }, []);

  useEffect(() => {
    setMarkers(businesses);
    getAllUniqueCategories();
  }, [businesses]);

  const [selected, setSelected] = useState(null);
  const onSelect = item => {
    // console.log(mapRef.current);
    // mapRef.current.panTo(item.position)
    console.log('selected', item);
    setSelected(item);
  }

  const [currentPosition, setCurrentPosition] = useState({center});
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
      console.log('selected before setVisited:', selected);
      const updatedResponse = await axios.put('http://localhost:3001/yelp-business', business, {params});
      console.log('updatedResponse.data:', updatedResponse.data);
      const businessData = applyExtraBusinessInfo(updatedResponse.data);
      setSelected(businessData);
    } catch (error) {
      console.log({error});
    }
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
    console.log(event.target);
    if (businessInfoWindowMounted.current && !businessInfoWindowMounted.current.contains(event.target)) {
      setSelected(null);
    }
  }

  const markerRef = useRef();

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
      
    }
  } 

    
  return (
  <div autoFocus onKeyDown={handleKeyPress} onClick={onMapClick}>
    <MapLoading loadError={loadError} isLoaded={isLoaded} businesses={businesses} />
    <h1>Yelp Combinator</h1>
    {/* <StyledMaterialIcon icon='search' /> */}
    <S.ComboboxContainer>
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
    <S.StyledGoogleMap mapContainerClassName={'map-container'} mapContainerStyle={mapContainerStyle} zoom={defaultZoom} center={center} options={options} onLoad={onMapLoad} clickableIcons={false}>
      {markers.map(business => {
        return (
          <Marker 
            ref={markerRef}
            key={business.alias} 
            position={business.position} 
            // animation={window.google.maps.Animation.DROP} 
            onClick={() => onSelect(business)}  
            onMouseOver={() => console.log(`mouseover ${business.name}`)}
            // icon={RamenDiningIcon}
          />
        )
      })}
      {selected ? 
        <BusinessInfoWindow ref={businessInfoWindowMounted} business={selected} currentPosition={currentPosition} onVisited={() => setVisited(selected)} onClose={() => setSelected(null)} /> 
        : null
      }
      {
        currentPosition.lat && (
          <S.StyledMarker key={'currentPosition'} position={currentPosition} icon={S.currentPositionIcon} />
        )
      }
    </S.StyledGoogleMap>
  </div>
  )
}

export default Map;