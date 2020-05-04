import {ScaleTime} from 'd3'
import React, {FunctionComponent} from 'react'

type OutcomeChartInterventionProps = {
  dates: {start: Date; end: Date}[]
  scaleX: ScaleTime<number, number>
  height: number
}

const OutcomeChartIntervention: FunctionComponent<OutcomeChartInterventionProps> = ({
  dates,
  scaleX,
  height
}) => {
  return (
    <g>
      {dates.map(d => {
        const x0 = scaleX(+d.start)
        const x1 = scaleX(+d.end)
        return (
          <rect
            key={d.start.toISOString() + d.end.toISOString()}
            x={x0}
            y={0}
            height={height}
            width={x1 - x0}
            style={{
              fill: '#2188FF',
              opacity: 0.1
            }}
          />
        )
      })}
    </g>
  )
}

export default React.memo(OutcomeChartIntervention)
