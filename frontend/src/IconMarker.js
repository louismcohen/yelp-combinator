import React, { useEffect, useState, useRef, useCallback, forwardRef } from 'react';
import {
  OverlayView,
  Marker
} from '@react-google-maps/api';
import styled from 'styled-components';
import ColorPalette from './styles/ColorPalette';

import * as IconGenerator from './icons/IconGenerator';

const IconMarkerContainer = styled.div`
  position: absolute;
  background: ${props => props.baseColor || ColorPalette.getHexColorByName('yelpRed')};
  opacity: 0.97;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.33), inset 0px 0px 0px 1px rgba(0, 0, 0, 0.33);
`

const StyledMarker = styled(Marker)`
  background: rgba(0, 0, 0, 0.98);
  border-radius: 50%;
`

const IconMarker = (props) => {
  const primaryCategory = props.business.categories[0].alias;

  const getPixelPositionOffset = (width, height) => {
    return {
      x: -15,
      y: -20
    }
  }

  const IconGenerated = () => {
    const Icon = IconGenerator.generateIconFromCategoryAlias(primaryCategory);
    return Icon;
  }

  const iconHexColor = IconGenerator.generateHexColorFromCategoryAlias(primaryCategory);

  const onIconMarkerClick = (event) => {
    console.log(`${props.business.alias} IconMarker clicked`);
    props.onIconMarkerClick();
  }

  return (
    <OverlayView 
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      position={props.business.position}
      getPixelPositionOffset={getPixelPositionOffset}
      >
      <IconMarkerContainer onClick={onIconMarkerClick} baseColor={iconHexColor}>
        <IconGenerated />
      </IconMarkerContainer>
    </OverlayView>
  )
}

export default IconMarker;
