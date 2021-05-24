import React from 'react'
import styled from 'styled-components'
import { Dimmer, Loader, Segment, Transition } from 'semantic-ui-react'

const StyledSegment = styled(Segment)`
  position: absolute !important;
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
`

const StyledLoader = styled(Loader)`
  ${'' /* font: inherit; */}
`

const MapLoading = ({loadError, isLoaded, businesses}) => {
  const businessesLoaded = businesses && businesses.length > 0;
  const isActive = !(isLoaded && businessesLoaded) || !!loadError;

  let loadingLabel;
  if (loadError) {
    loadingLabel = `error. Check Google API key or network connection.`;
  } else if (!isLoaded) {
    loadingLabel = 'map';
  } else {
    loadingLabel = 'businesses';
  }

  return (
    <StyledSegment>
      <Transition visible={isActive} duration={200}>
        <Dimmer active={isActive}>
          <StyledLoader size='large' indeterminate={!businesses || !!loadError}>{`Loading ${loadingLabel}`}</StyledLoader>
        </Dimmer>
      </Transition>
    </StyledSegment>
    
  )
}

export default MapLoading;