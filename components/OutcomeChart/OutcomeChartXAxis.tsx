import {ScaleTime, TimeInterval, timeMonth} from 'd3'
import {DateTime} from 'luxon'
import React, {FunctionComponent} from 'react'

type OutcomeChartXAxisProps = {
  scaleX: ScaleTime<number, number>
}

const OutcomeChartXAxis: FunctionComponent<OutcomeChartXAxisProps> = ({
  scaleX
}) => {
  const xTicksRaw = scaleX.ticks(timeMonth.every(1) as TimeInterval)
  const xTicks = xTicksRaw.map((t, i) => {
    const x = scaleX(t)
    const dt = DateTime.fromJSDate(t)
    let year
    if (i === 0 || dt.year !== DateTime.fromJSDate(xTicksRaw[i - 1]).year) {
      // if it's the first tick
      // or the previous tick is from another year
      // display the year on this tick
      year = (
        <text
          x={x}
          y={35}
          textAnchor="middle"
          style={{
            fill: 'black',
            opacity: 0.8,
            fontSize: '0.75em'
          }}
        >
          {dt.year}
        </text>
      )
    }
    return (
      <g key={t.toISOString()}>
        <line
          x1={x}
          x2={x}
          y1={0}
          y2={8}
          style={{stroke: 'black', opacity: 0.2}}
        />
        <text
          x={x}
          y={20}
          textAnchor="middle"
          style={{
            fill: 'black',
            opacity: 0.5,
            fontSize: '0.75em'
          }}
        >
          {DateTime.fromJSDate(t).toFormat('LLL')}
        </text>
        {year}
      </g>
    )
  })
  const height = 40
  return (
    <div
      style={{height, overflowX: 'visible'}}
      className="border-t border-black"
    >
      <svg width="100%" height={height} overflow="visible">
        {xTicks}
      </svg>
    </div>
  )
}

export default React.memo(OutcomeChartXAxis)
