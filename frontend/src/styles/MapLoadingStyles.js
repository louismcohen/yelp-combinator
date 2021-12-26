import styled from 'styled-components';
import { Backdrop, CircularProgress } from '@mui/material'
import { styled as muistyled } from '@mui/material/styles'

export const StyledBackdrop = muistyled(Backdrop)((props) => ({
  color: '#ffffff',
  zIndex: 500,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
}))

export const StyledLoader = muistyled(CircularProgress)((props) => ({
  color: props.theme.palette.grey[200],
  animationDuration: props.errorFound ? '2s' : '1s',
  animationDirection: props.errorFound ? 'reverse' : 'normal'
  // animation: 'animation 1.4s linear infinite reverse'
}));

export const StyledProgressLabel = styled.div`
  color: '#ffffff';
  margin-top: 10px;
  font-size: 18px;
  z-index: 1000;
  background: transparent;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  border: none !important;
  border-radius: 0 !important;  
`
