import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import debounce from 'lodash.debounce';
import axios from 'axios';
import {
  GoogleMap,
  useLoadScript,
  Marker,
} from "@react-google-maps/api";
import moment from 'moment';
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
} from "@reach/combobox";
import "@reach/combobox/styles.css";
import {
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuPopover,
  MenuLink,
} from "@reach/menu-button";
import "@reach/menu-button/styles.css";
import {
  Listbox,
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxList,
  ListboxOption,
} from "@reach/listbox";
import "@reach/listbox/styles.css";
import { Transition } from 'semantic-ui-react'

import styled from 'styled-components';
import mapStyles from './mapStyles';
import BusinessInfoWindow from './BusinessInfoWindow';
import MapLoading from './MapLoading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare, faDoorOpen, faDoorClosed, faTimesCircle, faUserCircle, faEllipsisV, faCircle } from '@fortawesome/free-solid-svg-icons/';
import { faCheckSquare as faCheckSquareRegular } from '@fortawesome/free-regular-svg-icons';

import 'semantic-ui-css/semantic.min.css'
import './Map.css'
import MaterialIcon from '@material/react-material-icon';
import RamenDiningSvg from './icons/ramen_dining.svg';
import { map } from 'lodash';

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

/**
 * The same thing as useState, except it will return an instantly
 * updated value and a value that is debounced by a delay.
 */
export function useDebouncedState(initialState, delay = 200) {
  const [actualState, setActualState] = useState(initialState);
  const [debouncedState, setDebouncedState] = useState(initialState);

  const debounceCommitState = useMemo(
    () =>
      debounce((value) => {
        setDebouncedState(value);
      }, delay),
    [delay],
  );

  const handleChangeState = useCallback(
    (value) => {
      setActualState(value);
      debounceCommitState(value);
    },
    [debounceCommitState],
  );

  return [[actualState, debouncedState], handleChangeState];
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

const yelpRed = '#da2007';

const removeSpaces = (str) => {
  return str.replace(/\s+/g, '');
}

const StyledMaterialIcon = styled(MaterialIcon)`
  position: absolute;
  z-index: 100;
`

const ComboboxContainer = styled.div`
  width: 100%;
  top: 1rem;
  display: flex;
  justify-content: center;
  position: absolute;
  z-index: 100;
`

const StyledCombobox = styled(Combobox)`
  position: relative;
`

const StyledComboboxInput = styled(ComboboxInput)`
  height: 2.5em;
  padding: 0.75em;
  ${'' /* font: inherit; */}
  font-family: inherit;
  font-size: 1.2em;
  width: 350px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #aaa;
  border-radius: 8px;
  box-sizing: border-box;
  filter: drop-shadow(rgba(0, 0, 0, 0.33) 0 0.25em 0.25em);
  transition: border-color 0.1s ease-in-out, filter 0.1s ease-in-out, background 0.1s ease-in-out;
   
  &:hover {
    border: 2px solid ${yelpRed};
    padding: calc(0.75em - 1px);
    
  }
  &:focus {
    background: rgba(255, 255, 255, 1);
    padding: calc(0.75em - 1px);
    border: 2px solid ${yelpRed};
    filter: drop-shadow(rgba(0, 0, 0, 0.5) 0 0.25em 0.25em);
    outline: none;
  }
`


const StyledCloseButton = styled.div`
  font-size: 1.5em;
  color: #aaa;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 100;
  line-height: 1.5em;
  padding: 0.25em 0.5em;
  transition: color 0.1s ease-in-out;

  &:hover {
    color: #888;
    cursor: pointer;
  }
`

const FilterButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.5em;
  min-width: 2.5em;
  margin-left: 0.5em;
  padding: 0.5em calc((2.5em - 1.2em) / 2);
  font-size: 1.2em;
  text-align: center;
  cursor: pointer;
  color: ${props => props.iconColor};
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #aaa;
  border-radius: 8px;
  box-sizing: border-box;
  filter: drop-shadow(rgba(0, 0, 0, 0.33) 0 0.25em 0.25em);
  transition: border-color 0.1s ease-in-out, filter 0.1s ease-in-out, background 0.1s ease-in-out, width 0.1s ease-in-out;

  &:hover {
    background: rgba(255, 255, 255, 1);
    border: 2px solid ${props => props.borderColor};
    outline: none;
    padding: calc(0.5em - 1px) calc(0.65em - 1px);
    filter: drop-shadow(rgba(0, 0, 0, 0.5) 0 0.25em 0.25em);
  }
`

const FilterButtonText = styled.div`
  font-size: 1em;
  color: #000;
  margin-left: calc((2.5em - 1.2em) / 2);
`

const FilterButtonInput = styled(ComboboxInput)`
  margin-left: calc((2.5em - 1.2em) / 2);
  font-size: 0.8em;
  font-family: inherit;
  padding: 0.25em;
`

FilterButton.defaultProps = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  iconColor: '#aaa',
  accentColor: '#666',
}

const currentPositionIcon = {
  path: faCircle.icon[4],
  scale: 0.05,
  fillColor: '#007aff',
  fillOpacity: 0.95,
  strokeWeight: 5,
  strokeColor: '#fff',
  // origin: window.google.maps.Point(500, 0),
  // url: './assets/user-circle-solid.svg'

  // path: window.google.maps.SymbolPath.CIRCLE,
  // scale: 0.08,
  // fillColor: 'blue',
  // fillOpacity: 0.95,
  // strokeWeight: 5,
  // strokeColor: '#fff',
}

console.log({RamenDiningSvg});
const RamenDiningIcon = {
  path: RamenDiningSvg.path,
  fillColor: '#000',
  fillOpacity: 1.0,
  strokeWeight: 0,
  rotation: 0,
  scale: 1,
}

const StyledGoogleMap = styled(GoogleMap)`
  &:hover {
    cursor: default;
  }
`

const StyledMarker = styled(Marker)`
  &:hover {
    cursor: pointer;
  }
`

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
      console.log('api', process.env.REACT_APP_BACKEND_URL);
      let response = await axios.get(process.env.REACT_APP_BACKEND_URL);
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
      <StyledCloseButton onClick={() => setSearchTerm('')}>
        <FontAwesomeIcon icon={faTimesCircle} />
      </StyledCloseButton>
    )
  }

  const [[searchTerm, debouncedSearchTerm], setSearchTerm] = useDebouncedState('');
  const [showOpen, setShowOpen] = useState(0);
  const [showVisited, setShowVisited] = useState(0);

  const filterBusinesses = (business) => {
    const textFilteredResult = 
      (business.name.toLowerCase().includes(debouncedSearchTerm) // name
      || business.categories.map(category => category.title).some(title => removeSpaces(title).toLowerCase().includes(removeSpaces(debouncedSearchTerm))) // categories
      || business.note.toLowerCase().includes(debouncedSearchTerm)) // note
    
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
      <FilterButton borderColor={'#7a0ebd'} iconColor={iconColor} onClick={() => nextFilterButtonState(showOpen, setShowOpen)}>
        <FontAwesomeIcon icon={icon} />
        {/* {showOpen === 0 ?
            null
          : showOpen === 1 ?
          <FilterButtonText>Open now</FilterButtonText>
          : <FilterButtonText>Open at</FilterButtonText>
            
        }
        <Combobox>
              <FilterButtonInput onClick={(e) => e.stopPropagation()}></FilterButtonInput>
            </Combobox> */}
        
      </FilterButton>
    )
  }
  
  const VisitedFilterButton = () => {
    let borderColor, iconColor, icon;
    switch (showVisited) {
      case 1:
        borderColor = '#49bd0e';
        iconColor = '#49bd0e';
        icon = faCheckSquare;
        break;
      case 2:
        borderColor = '#aaa';
        iconColor = '#49bd0e';
        icon = faCheckSquareRegular;
        break;
      case 0:
      default:
        borderColor = '#49bd0e';
        icon = faCheckSquare;
        break;
    }
    
    return (
      <FilterButton borderColor={'#49bd0e'} iconColor={iconColor} onClick={() => nextFilterButtonState(showVisited, setShowVisited)}>
        <FontAwesomeIcon icon={icon} />
      </FilterButton>
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
    if (businessInfoWindowMounted.current && !businessInfoWindowMounted.current.contains(event.target)) {
      // setSelected(null);
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
    <StyledMaterialIcon icon='search' />
    <ComboboxContainer>
      <StyledCombobox>
        <StyledComboboxInput 
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
      </StyledCombobox>
      <VisitedFilterButton />
      <OpenFilterButton />
    </ComboboxContainer>
    <StyledGoogleMap mapContainerClassName={'map-container'} mapContainerStyle={mapContainerStyle} zoom={defaultZoom} center={center} options={options} onLoad={onMapLoad} clickableIcons={false}>
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
          <StyledMarker key={'currentPosition'} position={currentPosition} icon={currentPositionIcon} />
        )
      }
    </StyledGoogleMap>
  </div>
  )
}

export default Map;