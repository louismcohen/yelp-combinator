import React, { useEffect, useState, useRef, useCallback } from 'react';
import InfoPane from './InfoPane';
import Map from './Map';
import styled from 'styled-components';

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row-reverse;
  gap: var(--s1);

  > * {
    &:last-child {
      flex-basis: 25%;
      flex-grow: 1;
      min-width: 200px
    }

    &:first-child {
      flex-basis: 0;
      flex-grow: 999;
      min-inline-size: 75%;
    }
  }
`

const Container = () => {
  return (
    <StyledContainer>
      
      <Map />
      {/* <InfoPane /> */}
      
    </StyledContainer>
    
  )
}

export default Container;