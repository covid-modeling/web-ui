import * as d3 from 'd3'
import {curveMonotoneX, ScaleLinear, ScaleLogarithmic, ScaleTime} from 'd3'
import React, {FunctionComponent, useMemo} from 'react'
import useSafeDimensions from '../../hooks/use-safe-dimensions'
import {ChartColors, ChartColorsType} from './chartColors'
import {Datum} from './OutcomeChart'

type LegendSparklineProps = {
  data: Datum[]
  scaleX: ScaleTime<number, number>
  scaleY:
    | ScaleLinear<number | null, number>
    | ScaleLogarithmic<number | null, number>
  tMax: number
  color: ChartColorsType
  hoverIdx: number
}

const LegendSparkline: FunctionComponent<LegendSparklineProps> = props => {
  const {ref, dimensions} = useSafeDimensions()

  const [scaleX, tMaxX] = useMemo(() => {
    // get a copy of the scale but set the range (pixels)
    // for this component's dimensions
    const sx = props.scaleX.copy().range([0, dimensions.width])
    // We want to grab a copy of the domain
    // This sparkline will always display the full range of data
    // but right now the domain max is affected by the time selector.
    // The domain max is also animated over time when changing.
    // We can cache the value of it here.
    const visibleDomain = sx.domain()
    // Set the domain to include the entirety of the data
    sx.domain([visibleDomain[0], props.tMax])
    // return the scale with the new domain and the x coord of the
    // max visible timestamp from the full chart
    return [sx, sx(visibleDomain[1])]
  }, [props.scaleX, props.tMax, dimensions])

  const scaleY = useMemo(
    () => props.scaleY.copy().rangeRound([dimensions.height - 3, 1.5]),
    [props.scaleY, dimensions]
  )

  const line = useMemo(
    () =>
      d3
        .line<Datum>()
        .curve(curveMonotoneX)
        // Typescript seems to think that Number.isFinite(null) is wrong
        // But actually Typescript is wrong and should feel wrong.
        .defined(d => Number.isFinite(d.y as number))
        .x(d => scaleX(d.x))
        // Well, the type definitions for line.y are simply wrong
        // D3 has a built-in notion of undefined handling, see .defined
        // but .y()'s typedef signature expects an fn that returns a number
        .y(d => scaleY(d.y as number)),
    [scaleX, scaleY]
  )

  const hover = useMemo(() => {
    const hoverY = props.data[props.hoverIdx].y
    if (hoverY !== null) {
      return (
        <circle
          cx={scaleX(props.data[props.hoverIdx].x)}
          cy={scaleY(hoverY)}
          r={2}
          fill={ChartColors[props.color]}
        />
      )
    }
  }, [scaleX, scaleY, props.data, props.color, props.hoverIdx])

  const bg = useMemo(
    () => (
      <rect
        x={0}
        y={0}
        width={dimensions.width}
        height={dimensions.height}
        className="text-gray fill-current"
        strokeWidth={1}
        stroke="black"
        strokeOpacity={0.15}
        shapeRendering="crispEdges"
        rx={1}
      />
    ),
    [dimensions]
  )

  const visibleIndicator = useMemo(
    () => (
      <rect
        x={0}
        y={0}
        width={tMaxX}
        height={dimensions.height}
        fill="white"
        stroke="black"
        strokeOpacity={0.15}
        shapeRendering="crispEdges"
        rx={1}
      />
    ),
    [tMaxX, dimensions]
  )

  const path = useMemo(
    () => (
      <path
        d={line(props.data) || ''}
        style={{
          strokeWidth: 1,
          stroke: ChartColors[props.color],
          fill: 'transparent'
        }}
      />
    ),
    [line, props.data, props.color]
  )

  return (
    <div ref={ref} className="h-5">
      <svg
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        overflow="visible"
      >
        {bg}
        {visibleIndicator}
        {path}
        {hover}
      </svg>
    </div>
  )
}

export default React.memo(LegendSparkline)
