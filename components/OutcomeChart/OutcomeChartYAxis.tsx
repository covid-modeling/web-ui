import {ScaleLinear, ScaleLogarithmic} from 'd3'
import numbro from 'numbro'
import React, {FunctionComponent} from 'react'
import {ScaleYType} from './OutcomeChart'

type OutcomeChartYAxisProps = {
  width: number
  scaleY:
    | ScaleLinear<number | null, number>
    | ScaleLogarithmic<number | null, number>
  type: ScaleYType
}

const OutcomeChartYAxis: FunctionComponent<OutcomeChartYAxisProps> = ({
  width,
  scaleY,
  type
}) => {
  const yTicks = scaleY.ticks(5).map(t => {
    const y = scaleY(t)
    // for log scales, "round" ticks mean order-of-magnitude values
    // e.g. 10, 100, 1000
    // log10(t) % 1 will be zero for these
    // linear scale ticks will always be treated as "round" and rendered
    // log scale ticks get special treatment only if round
    const isRound = type === 'linear' ? true : !(Math.log10(t) % 1)
    // if y is 0, we're drawing a tick above the top of the chart
    // for 2nd chart groups and on, that bleeds into the chart above
    // don't do that
    if (y === 0) return
    return (
      <g key={t}>
        <line
          x1={0}
          x2={isRound ? width : 6}
          y1={y}
          y2={y}
          style={{
            stroke: 'black',
            strokeWidth: 1,
            strokeOpacity: 0.08,
            shapeRendering: 'crispEdges'
          }}
        />
        {isRound && (
          <text
            y={y}
            x={8}
            dy={-5}
            className="text-gray-light fill-current"
            style={{
              fontSize: '0.65em',
              opacity: 0.6
            }}
          >
            {numbro(t).format({thousandSeparated: true})}
          </text>
        )}
      </g>
    )
  })

  return <g>{yTicks}</g>
}

export default React.memo(OutcomeChartYAxis)
