const colorPalette = [
  {
    name: 'yelpRed', 
    hex: '#da2007'
  },
  {
    name: 'gambogeOrange',
    hex: '#ec9916'
  },
  {
    name: 'kellyGreen', // Visited Green
    hex: '#49bd0e'
  },
  {
    name: 'englishViolet',
    hex: '#442b48'
  },
  {
    name: 'nickel',
    hex: '#726e60'
  },

  {
    name: 'lightSlateGray',
    hex: '#7c9299'
  },
  {
    name: 'trypanBlue',
    hex: '#1f01b9'
  },
  {
    name: 'mango', // Google Maps Yellow
    hex: '#fbbc04'
  },
  {
    name: 'violetColorWheel', // Google Maps Yellow
    hex: '#7b04fb'
  },
  {
    name: 'blueMunsell',
    hex: '#2d93ad'
  },
  {
    name: 'grayWeb',
    hex: '#7d7c84'
  },
  {
    name: 'jet',
    hex: '#2f2de'
  },
  {
    name: 'oldBurgundy',
    hex: '#41292c'
  },
  {
    name: 'sealBrown',
    hex: '#63280b'
  },
  {
    name: 'greenRyb',
    hex: '#5eb319'
  },
];

const getHexColorByName = (nameInput) => {
  const defaultColor = colorPalette.find(color => color.name === 'jet');
  const identifiedColor = colorPalette.find(color => color.name === nameInput) 

  return identifiedColor
    ? identifiedColor.hex
    : defaultColor
}

const ColorPalette = {
  getHexColorByName
}

export default ColorPalette;