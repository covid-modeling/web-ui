import * as d3 from 'd3'
import {curveMonotoneX, ScaleLinear, ScaleLogarithmic, ScaleTime} from 'd3'
import React, {FunctionComponent, useMemo} from 'react'
import {ChartColors, ChartColorsType} from './chartColors'
import {Datum} from './OutcomeChart'

type OutcomeChartLineProps = {
  data: Datum[]
  scaleX: ScaleTime<number, number>
  scaleY:
    | ScaleLinear<number | null, number>
    | ScaleLogarithmic<number | null, number>
  color?: ChartColorsType
  capacity?: number
  cumulative: boolean
}

const OutcomeChartLine: FunctionComponent<OutcomeChartLineProps> = ({
  data,
  scaleX,
  scaleY,
  color = 'purple',
  capacity,
  cumulative
}) => {
  const line = useMemo(() => {
    return (
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
        .y(d => scaleY(d.y as number))
    )
  }, [scaleX, scaleY])

  const excess = useMemo(() => {
    if (capacity && !cumulative) {
      return d3
        .area<Datum>()
        .curve(curveMonotoneX)
        .defined(
          d => Number.isFinite(d.y as number) && (d.y as number) >= capacity
        )
        .x(d => scaleX(d.x))
        .y1(d => scaleY(d.y as number))
        .y0(scaleY(capacity))
    }
  }, [scaleX, scaleY, capacity, cumulative])

  return (
    <g>
      {excess && (
        <g>
          <path
            d={excess(data) || ''}
            style={{
              fill: ChartColors[color],
              fillOpacity: 0.1
            }}
          />
          <path
            d={excess(data) || ''}
            style={{
              fill: 'url(#diagonal-stripe-white)',
              fillOpacity: 0.25
            }}
          />
        </g>
      )}
      <path
        d={line(data) || ''}
        style={{
          strokeWidth: 2,
          stroke: ChartColors[color],
          fill: 'transparent'
        }}
      />
    </g>
  )
}

export default React.memo(OutcomeChartLine)
