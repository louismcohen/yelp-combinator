import * as React from 'react';
import * as IconSvgs from './svg';
import iconMapping from './iconMapping';
import ColorPalette from '../styles/ColorPalette';
import { convertToKebabCase } from '../utils';

const defaultTotalSize = 23;
const defaultSize = 16;
const defaultMargin = defaultTotalSize - defaultSize;
const defaultColor =  'yelpRed';

let iconPngs = {};
const iconFiles = require.context('./png', true, /\.png$/);
iconFiles.keys().map(path => {
  const name = path.match(/(?<=\.\/).*?(?=\.png$)/)[0];
  iconPngs[name] = iconFiles(path);
})

// console.log({iconPngs});

const defaultProps = {
  style: {
    margin: `${defaultMargin}px`, 
    display: 'block'
  }, 
  fill: '#ffffff',
  // filter: `${{CssFilterConverter.hexToFilter('#fffffff').color}}`,
  height: `${defaultSize}px`,
  width: `${defaultSize}px`,
};

const defaultIcon = 'Restaurant';

const generateIconPngFromCategoryAlias = (categoryAlias, props = defaultProps) => {
  const category = iconMapping.find(category => category.alias === categoryAlias);
  const iconName = category
    ? convertToKebabCase(category.icon)
    : convertToKebabCase(defaultIcon);
  const icon = iconPngs[iconName];
  
  return (
    <img 
      src={icon}
      alt={icon}
      {...props}
    />
  )
}

const generateIconFromCategoryAlias = (categoryAlias, props = defaultProps) => {
  const category = iconMapping.find(category => category.alias === categoryAlias);
  const Icon = category
    ? IconSvgs[category.icon || defaultIcon]
    : IconSvgs[defaultIcon];
  const IconWithProps = Icon(props);
  return IconWithProps;
}

const generateHexColorFromCategoryAlias = (categoryAlias) => {
  const category = iconMapping.find(category => category.alias === categoryAlias);
  const colorHex = ColorPalette.getHexColorByName(
    category 
      ? (category.color || defaultColor) 
      : defaultColor
    );
  return colorHex;
}

export {
  generateIconFromCategoryAlias,
  generateIconPngFromCategoryAlias,
  generateHexColorFromCategoryAlias,
}
