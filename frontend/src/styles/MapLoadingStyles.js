import styled from 'styled-components';
import { Loader, Segment } from 'semantic-ui-react'

export const StyledSegment = styled(Segment)`
  position: absolute !important;
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  border: none !important;
  border-radius: 0 !important;
`

export const StyledLoader = styled(Loader)`
  ${'' /* font: inherit; */}
`