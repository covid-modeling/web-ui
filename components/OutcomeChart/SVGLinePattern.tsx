import React, {FunctionComponent} from 'react'

type SVGLinePatternProps = {
  id: string
  spacingPx: number
  rotationDeg: number
  lineWidth?: number
  color?: string
}

const SVGLinePattern: FunctionComponent<SVGLinePatternProps> = props => {
  const s = props.spacingPx + 0.5
  return (
    <pattern
      id={props.id}
      patternUnits="userSpaceOnUse"
      width={s}
      height={s}
      patternTransform={`rotate(${props.rotationDeg})`}
    >
      <line
        x1="0"
        y="0"
        x2="0"
        y2={s}
        stroke={props.color}
        strokeWidth={props.lineWidth}
      />
    </pattern>
  )
}

SVGLinePattern.defaultProps = {
  lineWidth: 1,
  color: '#000'
}

export default React.memo(SVGLinePattern)
