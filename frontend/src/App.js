import logo from './logo.svg';
import './App.css';
import React from 'react';
// import GoogleMapReact from 'google-map-react';

require('dotenv').config();

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

// const location = {
//   address: '10601 Washington Blvd, Culver City, CA 90232',
//   lat: 34.01747899558564,
//   lng: -118.40530146733245,
// }

// const Map = ({location, zoomLevel}) => (
//   <div className="map">
//     <h2 className="map-h2">Google Map</h2>

//     <div className="google-map">
//       <GoogleMapReact bootstrapURLKeys = {{key: process.env.GOOGLE_API_KEY}} defaultCenter = {location} defaultZoom = {zoomLevel}>
//         {/* <LocationPin lat = {location.lat} lng = {location.lng} text = {location.address} /> */}
//       </GoogleMapReact>
//     </div>
//   </div>
// )

export default App;