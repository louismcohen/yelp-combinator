import * as IconSvgs from './svg';
import iconMapping from './iconMapping';
import ColorPalette from '../styles/ColorPalette';

const defaultTotalSize = 23;
const defaultSize = 16;
const defaultMargin = defaultTotalSize - defaultSize;
const defaultColor =  'yelpRed';

const defaultProps = {
  style: {
    margin: `${defaultMargin}px`, 
    display: 'block'
  }, 
  fill: '#ffffff',
  height: `${defaultSize}px`,
  width: `${defaultSize}px`,
  // viewBox: `0 0 ${defaultSize} ${defaultSize}`,
};

const defaultIcon = IconSvgs.Restaurant;

const generateIconFromCategoryAlias = (categoryAlias, props = defaultProps) => {
  const Icon = IconSvgs[iconMapping.find(category => category.alias === categoryAlias).icon] || defaultIcon;
  return Icon(props);
}

const generateHexColorFromCategoryAlias = (categoryAlias) => {
  const colorName = iconMapping.find(category => category.alias === categoryAlias).color;
  const colorHex = ColorPalette.getHexColorByName(colorName || defaultColor);
  return colorHex;
}

export {
  generateIconFromCategoryAlias,
  generateHexColorFromCategoryAlias,
}
