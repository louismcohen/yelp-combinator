import React from 'react'
import * as S from './styles/MapLoadingStyles'
import { Dimmer, Transition } from 'semantic-ui-react'

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
    <S.StyledSegment>
      <Transition visible={isActive} duration={200}>
        <Dimmer active={isActive}>
          <S.StyledLoader size='large' indeterminate={!businesses || !!loadError}>{`Loading ${loadingLabel}`}</S.StyledLoader>
        </Dimmer>
      </Transition>
    </S.StyledSegment>
    
  )
}

export default MapLoading;