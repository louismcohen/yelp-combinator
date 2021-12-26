import React from 'react'
import * as S from './styles/MapLoadingStyles'

const MapLoading = ({loadError, isLoaded, businesses}) => {
  const businessesLoaded = businesses && businesses.length > 0;
  const isActive = !(isLoaded && businessesLoaded) || !!loadError;
  const errorFound = !businesses || !!loadError;
  // cerrorFound = true;

  let loadingLabel;
  if (loadError) {
    loadingLabel = `error. Check Google API key or network connection.`;
  } else if (!isLoaded) {
    loadingLabel = 'map';
  } else {
    loadingLabel = 'businesses';
  }

  return (
      <S.StyledBackdrop open={isActive} transitionDuration={200}>
        <S.StyledLoader variant='indeterminate' size='50px' value={5} disableShrink={errorFound} errorFound={errorFound} />
          <S.StyledProgressLabel>{`Loading ${loadingLabel}`}</S.StyledProgressLabel>
      </S.StyledBackdrop>
      // {/* <S.StyledSegment>
      //   <Transition visible={isActive} duration={200}>
      //     <Dimmer active={isActive}>
            
      //     </Dimmer>
      //   </Transition>
      // </S.StyledSegment> */}
    
  )
}

export default MapLoading;