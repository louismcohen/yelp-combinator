import styled from 'styled-components'

import {
  GoogleMap,
  MarkerF,
} from "@react-google-maps/api";

import {
  Combobox,
  ComboboxInput,
} from "@reach/combobox";
import "@reach/combobox/styles.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare, faDoorOpen, faDoorClosed, faTimesCircle, faUserCircle, faEllipsisV, faCircle } from '@fortawesome/free-solid-svg-icons';
import { faCheckSquare as faCheckSquareRegular } from '@fortawesome/free-regular-svg-icons';

// import MaterialIcon from '@material/react-material-icon';

import ColorPalette from './ColorPalette';

export const yelpRed = ColorPalette.getHexColorByName('yelpRed');
export const visitedGreen = ColorPalette.getHexColorByName('kellyGreen');

// export const StyledMaterialIcon = styled(MaterialIcon)`
//   position: absolute;
//   z-index: 100;
// `

export const ControlsContainer = styled.div`
  display: block;
  width: 350px;
  margin: 0 auto;
`

export const ComboboxContainer = styled.div`
  width: 100%;
  top: 1rem;
  display: flex;
  justify-content: flex-start;
  position: absolute;
  z-index: 100;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
`

export const StyledCombobox = styled(Combobox)`
  position: relative;
`

export const StyledComboboxInput = styled(ComboboxInput)`
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
  ${'' /* -webkit-box-shadow: 0 0.25em 0.25em rgba(0, 0, 0, 0.33); */}
  filter: drop-shadow(rgba(0, 0, 0, 0.33) 0 0.25em 0.25em);
  transition: border-color 0.1s ease-in-out, filter 0.1s ease-in-out, background 0.1s ease-in-out;
   
  &::after {
    content: "after";
    border-radius: 8px;
    position: absolute;
    z-index: 50;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    -webkit-box-shadow: 0 0.25em 0.25em rgba(0, 0, 0, 0.5);
    opacity: 0;
    -webkit-transition: opacity 0.1s ease-in-out;
    transition: opacity 0.1s ease-in-out;
  }

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

    &::after {
      opacity: 1;
    }
  }
`


export const StyledCloseButton = styled.div`
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
export const FilterButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 10px;
`

export const FilterButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.5em;
  min-width: 2.5em;
  ${'' /* margin-left: 0.5em; */}
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

export const FilterButtonText = styled.div`
  font-size: 1em;
  color: #000;
  margin-left: calc((2.5em - 1.2em) / 2);
`

export const FilterButtonInput = styled(ComboboxInput)`
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

export const StyledMarkerTooltip = styled.div`
  position: relative;
  background: rgba(0, 0, 0, 0.33);
`

export const currentPositionIcon = {
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

export const StyledGoogleMap = styled(GoogleMap)`
  &:hover {
    cursor: default;
  }
`

export const StyledMarker = styled(MarkerF)`
  &:hover {
    cursor: pointer;
  }
`
export const StyledCurrentLocationMarker = styled(StyledMarker)`
  box-shadow: 0 0.25em 0.25em rgba(0, 0, 0, 0.7);
`