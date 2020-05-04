import {useDimensions} from 'react-dimensions-hook'

export default function useSafeDimensions() {
  if (process.browser) {
    return useDimensions() // eslint-disable-line
  } else {
    return {
      ref: () => null,
      dimensions: {
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0
      }
    }
  }
}
