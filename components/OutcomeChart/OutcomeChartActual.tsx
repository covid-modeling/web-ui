import * as d3 from 'd3'
import {curveMonotoneX, ScaleLinear, ScaleLogarithmic, ScaleTime} from 'd3'
import React, {FunctionComponent} from 'react'
import {ChartColorsType} from './chartColors'
import {Datum} from './OutcomeChart'

type OutcomeChartActualProps = {
  data: Datum[]
  scaleX: ScaleTime<number, number>
  scaleY:
    | ScaleLinear<number | null, number>
    | ScaleLogarithmic<number | null, number>
  height: number
  color?: ChartColorsType
}

const OutcomeChartActual: FunctionComponent<OutcomeChartActualProps> = ({
  data,
  scaleX,
  scaleY,
  height,
  color = 'purple'
}) => {
  const area = d3
    .area<Datum>()
    .curve(curveMonotoneX)
    // Typescript seems to think that Number.isFinite(null) is wrong
    // But actually Typescript is wrong and should feel wrong.
    .defined(d => Number.isFinite(d.y as number))
    .x(d => scaleX(d.x))
    .y0(height)
    // Well, the type definitions for line.y are simply wrong
    // D3 has a built-in notion of undefined handling, see .defined
    // but .y()'s typedef signature expects an fn that returns a number
    .y1(d => scaleY(d.y as number))
  return (
    <g>
      <path
        d={area(data) || ''}
        className={`text-${color} fill-current`}
        style={{fillOpacity: 0.15}}
      />
    </g>
  )
}

export default React.memo(OutcomeChartActual)
