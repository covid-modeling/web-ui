import {DateTime} from 'luxon'
import React, {FunctionComponent} from 'react'
import useSafeDimensions from '../../hooks/use-safe-dimensions'

type OutcomeChartFlagProps = {
  scaleX: d3.ScaleTime<number, number>
  width: number
  hoverDate: DateTime
  today: DateTime
}

const OutcomeChartFlag: FunctionComponent<OutcomeChartFlagProps> = ({
  scaleX,
  width,
  hoverDate,
  today
}) => {
  const {ref, dimensions} = useSafeDimensions()
  const text = hoverDate.hasSame(today, 'day')
    ? 'Today'
    : hoverDate.toFormat('LLL d, yyyy')
  const x = scaleX(hoverDate.toMillis())
  const left = x >= width - dimensions.width - 10
  return (
    <div className="h-6 relative whitespace-no-wrap">
      <div
        className="h-6 leading-5 absolute bg-gray-light text-xxs text-white uppercase px-2 pt-px"
        style={{
          left: scaleX(today.toMillis())
        }}
      >
        Today
      </div>
      <div
        className="h-6 leading-5 absolute bg-black text-xxs text-white uppercase px-2 pt-px"
        ref={ref}
        style={{
          left: left ? x - dimensions.width + 2 : x
        }}
      >
        {text}
      </div>
    </div>
  )
}

export default React.memo(OutcomeChartFlag)
