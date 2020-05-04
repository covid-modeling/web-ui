import classNames from 'classnames'
import {ScaleLinear, ScaleLogarithmic, ScaleTime} from 'd3'
import numbro from 'numbro'
import React, {FunctionComponent, useMemo} from 'react'
import LegendSparkline from './LegendSparkline'
import {PreparedMetricsSeries} from './OutcomeChart'

type OutcomeChartLegendBlockProps = {
  series: PreparedMetricsSeries
  selector: 'cumulative' | 'values'
  hoverIdx: number
  scaleX: ScaleTime<number, number>
  scaleY:
    | ScaleLinear<number | null, number>
    | ScaleLogarithmic<number | null, number>
  tMax: number
}

const OutcomeChartLegendBlock: FunctionComponent<OutcomeChartLegendBlockProps> = ({
  series,
  selector,
  hoverIdx,
  scaleX,
  scaleY,
  tMax
}) => {
  const cumulative = selector === 'cumulative'
  const [projectionExcess, projectedText] = useMemo(() => {
    const projection = series.projected[selector][hoverIdx].y
    let projectionExcess
    if (
      !!projection &&
      !!series.capacity &&
      !cumulative &&
      projection > series.capacity
    ) {
      projectionExcess = numbro(projection - series.capacity).format({
        average: true,
        totalLength: 3
      })
    }
    const projectedText =
      projection !== null
        ? numbro(projection).format({
            thousandSeparated: true,
            trimMantissa: true,
            mantissa: 0
          })
        : 'No Data'
    return [projectionExcess, projectedText]
  }, [series, hoverIdx, cumulative, selector])

  const [actualValueText, actualExcess] = useMemo(() => {
    let actualValueText, actualExcess
    if (series.actual) {
      const actual = series.actual[selector][hoverIdx].y
      if (actual !== undefined && actual !== null) {
        actualValueText = numbro(actual).format({
          thousandSeparated: true,
          trimMantissa: true,
          mantissa: 0
        })
        if (!!series.capacity && !cumulative && actual > series.capacity)
          actualExcess = numbro(actual - series.capacity).format({
            average: true,
            totalLength: 3
          })
      }
    }
    return [actualValueText, actualExcess]
  }, [series, hoverIdx, cumulative, selector])

  return (
    <div className="flex flex-row items-stretch py-1 h-full">
      <div className={`w-2 flex-none bg-${series.color}`}>{'\u00A0'}</div>
      <div className="px-2 flex-col items-stretch flex-1 max-w-full overflow-hidden">
        <div>{series.title}</div>
        <div className="my-2 w-full min-w-full max-w-full">
          <LegendSparkline
            data={
              cumulative ? series.projected.cumulative : series.projected.values
            }
            color={series.color}
            {...{scaleX, scaleY, tMax, hoverIdx}}
          />
        </div>
        <div className="flex flex-row items-baseline py-1 h-6">
          <div className="text-xs text-gray-light w-20 pr-3 flex-none">
            Projected
          </div>
          <div className="text-sm font-semibold flex-1">{projectedText}</div>
          {projectionExcess && (
            <div className="bg-black rounded-sm text-white font-bold text-xxs uppercase px-1 ml-2 self-center mt-1">
              {projectionExcess} over
            </div>
          )}
        </div>
        {series.actual && (
          <div className="flex flex-row items-baseline py-1 h-6">
            <div className="text-xs text-gray-light w-20 pr-3 flex-none">
              {series.actual.name || 'Actual'}
            </div>
            <div
              className={classNames('text-sm flex-1', {
                'font-semibold': actualValueText,
                'font-normal text-gray-light': !actualValueText
              })}
            >
              {actualValueText || 'No Data'}
            </div>
            {actualExcess && (
              <div className="bg-black rounded-sm text-white font-bold text-xxs uppercase px-1 ml-2 self-center mt-1">
                {actualExcess} over
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(OutcomeChartLegendBlock)
