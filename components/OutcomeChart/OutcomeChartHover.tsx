import {ScaleLinear, ScaleLogarithmic, ScaleTime} from 'd3'
import React, {FunctionComponent} from 'react'
import {ChartColors} from './chartColors'
import {PreparedMetricsSeries} from './OutcomeChart'

type OutcomeChartHoverProps = {
  hoverIdx: number
  scaleX: ScaleTime<number, number>
  scaleY:
    | ScaleLinear<number | null, number>
    | ScaleLogarithmic<number | null, number>
  height: number
  selector: 'cumulative' | 'values'
  metrics: PreparedMetricsSeries
}

const OutcomeChartHover: FunctionComponent<OutcomeChartHoverProps> = ({
  hoverIdx,
  scaleX,
  scaleY,
  height,
  metrics,
  selector
}) => {
  const hoverX = scaleX(metrics.projected[selector][hoverIdx].x)

  const yProjected = metrics.projected[selector][hoverIdx].y
  const projectedMark =
    yProjected === null ? (
      undefined
    ) : (
      <g>
        <circle
          cx={hoverX}
          cy={scaleY(yProjected)}
          r={6}
          style={{
            fill: 'white',
            stroke: 'black',
            strokeWidth: 1
          }}
        />
        <circle
          cx={hoverX}
          cy={scaleY(yProjected)}
          r={4}
          fill={ChartColors[metrics.color]}
        />
      </g>
    )

  const yActual = metrics.actual?.[selector][hoverIdx].y
  const actualMark =
    typeof yActual === 'number' ? (
      <g>
        <rect
          x={hoverX - 4}
          y={scaleY(yActual) - 4}
          width={8}
          height={8}
          style={{
            fill: 'white',
            stroke: 'black',
            strokeWidth: 1
          }}
        />
        <rect
          x={hoverX - 2}
          y={scaleY(yActual) - 2}
          width={4}
          height={4}
          fill={ChartColors[metrics.color]}
        />
      </g>
    ) : (
      undefined
    )

  return (
    <g>
      <line
        x1={hoverX}
        x2={hoverX}
        y1={0}
        y2={height}
        style={{
          stroke: 'black',
          strokeWidth: 2,
          shapeRendering: 'crispEdges'
        }}
      />
      {actualMark}
      {projectedMark}
    </g>
  )
}

export default React.memo(OutcomeChartHover)
