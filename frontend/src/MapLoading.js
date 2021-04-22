import React from 'react'
import styled from 'styled-components'

const SplashScreen = styled.div`
  width: 100%;
  height: 100%;
  background: #ccc;
  color: #000;
  text-align: center;
  vertical-align: middle;
  font-weight: bold;
`

const MapLoading = () => {
  return (
    <SplashScreen>Loading Map...</SplashScreen>
  )
}

export default MapLoading;