import React, { useEffect, useState, useRef, useCallback, forwardRef } from 'react';
import { MarkerF, OverlayViewF } from '@react-google-maps/api';
import styled from 'styled-components';
import ColorPalette from './styles/ColorPalette';

import * as IconGenerator from './icons/IconGenerator';

const IconMarkerContainer = styled.div`
  position: absolute;
  background: ${props => props.visited ? props.baseColor || ColorPalette.getHexColorByName('yelpRed') : `#fff`};
  opacity: 0.97;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.33), inset 0px 0px 0px ${props => props.visited ? `1px rgba(0, 0, 0, 0.33)` : `2px ${props.baseColor || ColorPalette.getHexColorByName('yelpRed')}`};
`

const defaultTotalSize = 23;
const defaultSize = 16;
const defaultMargin = defaultTotalSize - defaultSize;
const iconFillVisited = `#fff`;
const iconFillNotVisited = `#333`;

const defaultIconProps = {
  style: {
    margin: `${defaultMargin}px`, 
    display: 'block'
  }, 
  height: `${defaultSize}px`,
  width: `${defaultSize}px`,
};

const IconMarker = (props) => {
  const primaryCategoryAlias = props.business.categories[0].alias;

  const getPixelPositionOffset = (width, height) => {
    // console.log({width, height})
    return {
      x: -15,
      y: -20
    }
  }

  const iconHexColor = IconGenerator.generateHexColorFromCategoryAlias(primaryCategoryAlias);

  const iconFillColor = props.business.visited 
    ? {fill: iconFillVisited}
    : {fill: iconHexColor}

  const IconGenerated = () => {
    const Icon = IconGenerator.generateIconFromCategoryAlias(primaryCategoryAlias, {...defaultIconProps, ...iconFillColor});
    return Icon;
  }

  const onIconMarkerClick = (event) => {
    props.onIconMarkerClick();
  }

  return (
    <MarkerF 
      mapPaneName={OverlayViewF.OVERLAY_MOUSE_TARGET}
      position={props.business.position}
      getPixelPositionOffset={getPixelPositionOffset}
      clusterer={props.clusterer}
      >
      <IconMarkerContainer onClick={onIconMarkerClick} baseColor={iconHexColor} visited={props.business.visited}>
        <IconGenerated />
      </IconMarkerContainer>
    </MarkerF>
  )
}

export default React.memo(IconMarker);
