import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  OverlayView
} from "@react-google-maps/api";
import styled from 'styled-components';
import axios from 'axios';

const arrowSize = '1em';
const boxShadow = '0 0.25em 0.8em 0 rgba(0, 0, 0, 0.15)';

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

  &::after {
    position: absolute;
    left: 50%;
    top: calc(100% - 1px);
    content: "";
    border: 10px solid;
    border-color: #fff transparent transparent;
    margin-left: -10px;
  }
`;

const Content = styled.div`
  grid-column-start: 2;
  grid-column-end: 2;
  padding: 10px 0;
`
const Name = styled.h2`
  font-size: 1.5em;
  margin: 0;
  margin-bottom: 0.2em;
  padding: 0 0.85em;
`

const Categories = styled.p`
  font-size: 1.1em;
  line-height: 1.1em;
  margin: 0.5em 0;
  padding: 0 15px;
`

const Note = styled.p`
  font-size: 1.1em;
  font-style: italic;
  margin: 1em 0;
  padding: 0.5em 15px;
  background-color: #eee;
`

const TravelTime = styled.p`
  font-size: 1.1em;
  margin: 0.5em 0;
  padding: 0 15px;
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
  object-fit: cover;
  object-position: center;

  & > img {
    width: 100%;
    height: 100%;
  }
`

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
    origin: `${center.lat},${center.lng}`,
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
  console.log({props});
  const name = props.business.name;
  const categories = formatCategories(props.business.categories)

  const [travelTime, setTravelTime] = useState(null);
  useEffect(() => { 
    const fetchData = async () => {
      const result = await getTravelTime(props.currentPosition, props.business.position);
      setTravelTime({
        distance: result.data.rows[0].elements[0].distance.text,
        duration: result.data.rows[0].elements[0].duration.text,
      });
    }
    
    fetchData();
  }, [props.currentPosition, props.business.position]);
  

  return (
    <OverlayView 
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} 
      position={props.business.position}
      // getPixelPositionOffset={getPixelPositionOffset}
      >
      <InfoWindow>
        <InfoWindowContainer>
          <Image><img src={props.business.image_url} alt={props.business.alias} /></Image>
          <Content>
            <Name>{name}</Name>
            <Categories>{categories}</Categories>
            <TravelTime><strong>{travelTime.duration}</strong> | {travelTime.distance} away</TravelTime>
            <Note>{props.business.note}</Note>
          </Content>
        </InfoWindowContainer>
      </InfoWindow>
    </OverlayView>
  )
}

export default BusinessInfoWindow;