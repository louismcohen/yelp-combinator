import * as IconSvgs from './svg';
import iconMapping from './iconMapping';
import ColorPalette from '../styles/ColorPalette';

const defaultTotalSize = 23;
const defaultSize = 16;
const defaultMargin = defaultTotalSize - defaultSize;
const defaultColor =  'yelpRed';

console.log({IconSvgs});

const defaultProps = {
  style: {
    margin: `${defaultMargin}px`, 
    display: 'block'
  }, 
  fill: '#ffffff',
  height: `${defaultSize}px`,
  width: `${defaultSize}px`,
};

const defaultIcon = 'Restaurant';

const getIconSvg = (iconName) => {
  const iconSvg = IconSvgs[iconName];
  console.log({iconSvg});
}

getIconSvg(defaultIcon);

const generateIconFromCategoryAlias = (categoryAlias, props = defaultProps) => {
  console.log({props});
  const category = iconMapping.find(category => category.alias === categoryAlias);
  const Icon = category
    ? IconSvgs[category.icon || defaultIcon]
    : IconSvgs[defaultIcon];
  const IconWithProps = Icon(props);
  // if (!IconWithProps.props.viewBox) {
  //   IconWithProps.props.viewBox = defaultViewBox;
  // }
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
  generateHexColorFromCategoryAlias,
}
