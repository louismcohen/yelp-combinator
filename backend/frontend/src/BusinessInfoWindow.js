import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  OverlayView
} from "@react-google-maps/api";
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faDirections, faCheckSquare as faCheckSquareSolid } from '@fortawesome/free-solid-svg-icons'; 
import { faCheckSquare } from '@fortawesome/free-regular-svg-icons';
import { faYelp } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';

const arrowSize = '1em';
const boxShadow = '0 0.25em 0.8em 0 rgba(0, 0, 0, 0.15)';
const visitedColor = '#49bd0e'; //idle
const visitedColorHover = '#56de11'; //brighter green
const visitedColorActiveHover = '#41a90c'; //darker green
const actionColorDefault = '#666';

const yelpBizUrl = 'https://www.yelp.com/biz/';
const googleMapsDirectionsUrl = 'https://www.google.com/maps/dir/?api=1';

const InfoWindow = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  position: relative;
  left: -50%;
  top: 100%;
  transform: translate(0%, -180%);
  z-index: 100;
  display: block;
  margin-bottom: 0.5em;
  width: 300px;
  background: #fff;
  border-radius: 0.5em;
  overflow: hidden;
  filter: drop-shadow(rgba(0, 0, 0, 0.33) 0 0.25em 0.8em);
  cursor: grab;

  &::after {
    position: absolute;
    left: 50%;
    top: calc(100% - 1px);
    content: "";
    border: 10px solid;
    border-color: #fff transparent transparent;
    margin-left: -10px;
  }
`

const InfoWindowContainer = styled.div`
  display: grid;
  position: relative;
  grid-column-gap: 0;
  grid-template-columns: 30% 70%;
`

const Image = styled.div`
  grid-column-start: 1;
  grid-column-end: 1; 
  width: 100%;
  height: auto;
  background: url(${props => props.url});
  background-size: cover;

  & > img {
    width: auto;
    height: 100%;
  }
`

const Content = styled.div`
  grid-column-start: 2;
  grid-column-end: 2;
  padding: 10px 0;
`

const Name = styled.h2`
  font-size: 1.5em;
  margin: 0;
  margin-bottom: 0.2em;
  padding: 0 2em 0 0.85em;
`

const Categories = styled.p`
  font-size: 1.1em;
  line-height: 1.1em;
  margin: 0.5em 0;
  padding: 0 15px;
  font-style: italic;
`

const Note = styled.p`
  font-size: 1.1em;
  margin: 0;
  padding: 0.5em 15px;
  background-color: #eee;
`

const TravelTime = styled.p`
  font-size: 1.1em;
  margin: 0.5em 0;
  padding: 0 15px;
`

const StyledCloseButton = styled.div`
  position: absolute;
  top: 0.5em;
  right: 0.5em;
  font-size: 1.5em;
  line-height: 1.5em;
  text-align: center;
  width: 1.5em;

  &:hover {
    cursor: pointer;
    background: #aaa;
    border-radius: 3px;
    color: #fff;
  }

  &:active {
    background: #888;
  }
`

const CloseButton = () => {
  return (
    <div>
      <FontAwesomeIcon icon={faTimes} />
    </div>
    
  )
}

const ActionRow = () => {
  return (
    <div>
      <FontAwesomeIcon icon={faYelp} />
    </div>
  )
}

const StyledActionRow = styled.div`
  font-size: 2em;
  margin: 0.5em 0 0 0;
  padding: 0 15px;
  display: flex;
  color: #666;
  justify-content: space-between;

`

const Action = ({icon}) => (
  <FontAwesomeIcon icon={icon} />
)



const StyledAction = styled(Action)`
  color: #aaa;
  font-size: 2em;

  &:hover {
    color: ${props => props.hoverColor};
  }
`

const StyledIcon = styled(FontAwesomeIcon)`
  color: ${props => props.color ? props.color : actionColorDefault};

  &:hover {
    cursor: pointer;
    color: ${props => props.visited ? visitedColorActiveHover : props.hovercolor};
  }

  &:active {
    color: ${props => props.visited ? visitedColorActiveHover : props.hovercolor};
  }
`

const Visited = (props) => {
  return (
    <FontAwesomeIcon icon={props.icon} />
  )
}

const StyledVisited = styled(Visited)`
  &:hover {
    color: ${props => props.hoverColor};
  }
`

const onInfoWindowClick = (event) => {
  event.stopPropagation();
}

const formatCategories = (categories) => {
  return categories.map(x => x.title).join(', ');
}

const getTravelTime = async (currentPosition, destination) => {
  const center = {
    lat: 34.01747899558564,
    lng: -118.40530146733245,
  }
  const distanceMatrixUri = 'http://localhost:3001/distancematrix';
  const params = {
    origin: `${currentPosition.lat},${currentPosition.lng}`,
    destination: `${destination.lat},${destination.lng}`,
  }
  try {
    const response = await axios.get(distanceMatrixUri, {params});
    console.log(response);
    return response;
  } catch(error) {
    console.log({error});
    return {error};
  }
  
}

const getPixelPositionOffset = (width, height) => ({
  x: -(width / 2),
  y: -(height * 1.5),
})

const BusinessInfoWindow = (props) => {
  const name = props.business.name;
  const categories = formatCategories(props.business.categories)
  const note = props.business.note;
  
  const [visited, setVisited] = useState(props.business.visited);
  useEffect(() => {
    setVisited(props.business.visited);
  }, [props.business.visited]);
  
  const [travelTime, setTravelTime] = useState(null);
  useEffect(() => { 
    const fetchData = async () => {
      setTravelTime(null);
      const result = await getTravelTime(props.currentPosition, props.business.position);
      setTravelTime({
        distance: result.data.rows[0].elements[0].distance.text,
        duration: result.data.rows[0].elements[0].duration.text,
      });
    }
    
    fetchData();
  }, [props.currentPosition, props.business.position]);

  const determineVisitedIcon = () => {
    const icon = props.business.visited ? faCheckSquareSolid : faCheckSquare;
    return icon;
  }

  const determineVisitedColor = () => {
    const color = props.business.visited ? visitedColor : actionColorDefault;
    return color;
  }

  const currentPositionString = `${props.currentPosition.lat}, ${props.currentPosition.lng}`;
  const destinationAddress = props.business.location.display_address.join(', ');
  const originEncoded = encodeURI(currentPositionString);
  const destinationEncoded = encodeURI(destinationAddress);

  return (
    <OverlayView 
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} 
      position={props.business.position}
      // getPixelPositionOffset={getPixelPositionOffset}
      >
      <InfoWindow onClick={onInfoWindowClick}>
        <InfoWindowContainer>
          <Image url={props.business.image_url}></Image>
          <Content>
            <Name>{name}</Name>
            <Categories>{categories}</Categories>
            <TravelTime>
              {travelTime ? 
                <div><strong>{travelTime.duration}</strong> | {travelTime.distance} away</div> 
                : 'Calculating travel time...'}
            </TravelTime>
            {(note ? <Note>{props.business.note}</Note> : null)}
            <StyledActionRow>
              <a href={`${yelpBizUrl}${props.business.alias}`} target='_blank' rel='noopener noreferrer'>
                <StyledIcon icon={faYelp} hovercolor={'#da200b'} />
              </a>
              <a href={`${googleMapsDirectionsUrl}&origin=${originEncoded}&destination=${destinationEncoded}`} target='_blank' rel='noopener noreferrer'>
                <StyledIcon icon={faDirections} hovercolor={'#c79d00'} />
              </a>
              <StyledIcon 
                icon={faCheckSquareSolid} 
                color={determineVisitedColor()}
                onClick={props.onVisited}
                hovercolor={visitedColor} 
                visited={visited}
                />
            </StyledActionRow>
          </Content>
          
          <StyledCloseButton onClick={props.onClose}><CloseButton /></StyledCloseButton>
        </InfoWindowContainer>
      </InfoWindow>
    </OverlayView>
  )
}

export default BusinessInfoWindow;