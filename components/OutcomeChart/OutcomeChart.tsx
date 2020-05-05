import {input, output} from '@covid-modeling/api'
import classNames from 'classnames'
import * as d3 from 'd3'
import {ScaleLinear, ScaleLogarithmic, ScaleTime} from 'd3'
import {DateTime} from 'luxon'
import {FunctionComponent, useMemo} from 'react'
import useSafeDimensions from '../../hooks/use-safe-dimensions'
import {maxIndex} from '../../lib/arrayMath'
import {StrategyDescriptions, StrategyKey} from '../../lib/new-simulation-state'
import Pushpin from '../../svg/Pushpin.svg'
import {CaseData} from '../../types/case-data'
import {ChartColors, ChartColorsType} from './chartColors'
import Interventions from './Interventions'
import OutcomeChartActual from './OutcomeChartActual'
import OutcomeChartFlag from './OutcomeChartFlag'
import OutcomeChartHover from './OutcomeChartHover'
import OutcomeChartLegendBlock from './OutcomeChartLegendBlock'
import OutcomeChartLine from './OutcomeChartLine'
import OutcomeChartXAxis from './OutcomeChartXAxis'
import OutcomeChartYAxis from './OutcomeChartYAxis'
import SVGLinePattern from './SVGLinePattern'

type KeyOrMetricsAccessor = string | ((m: output.SeverityMetrics) => number[])
type KeyOrCaseDataAccessor = string | ((m: CaseData) => number[])
export type ScaleYType = 'linear' | 'logarithmic'
export type ScaleXDomainMonths = number | null

export type OutcomeChartConfiguration = {
  title: string
  color: ChartColorsType
  projected: {
    values: KeyOrMetricsAccessor
    cumulative: KeyOrMetricsAccessor
    variance?: KeyOrMetricsAccessor
    incidence?: KeyOrMetricsAccessor
  }
  actual?: {
    values: KeyOrCaseDataAccessor
    cumulative: KeyOrCaseDataAccessor
    name?: string
  }
  capacity?: number
}

export type PreparedMetricsSeries = {
  title: string
  color: ChartColorsType
  projectedPeak: DateTime
  projected: {
    values: Datum[]
    cumulative: Datum[]
    variance?: Datum[]
    incidence?: Datum[]
  }
  actual?: {
    values: Datum[]
    cumulative: Datum[]
    name?: string
  }
  capacity?: number
  y: number
}

type OutcomeChartProps = {
  result: output.ModelOutput
  caseData?: CaseData
  title?: string
  config: OutcomeChartConfiguration[][]
  hoverX: number | null
  hoverInterventionIdx: number | null
  pinnedInterventionIdx: number | null
  scaleYType: ScaleYType
  cumulative: boolean
  scaleXDomainMonths: ScaleXDomainMonths
  scaleXAnimatedMax: number
  onHoverX: (x: number | null) => void
  onHoverIntervention: (idx: number | null) => void
  onPinIntervention: (idx: number | null) => void
}

export type Intervention = {
  title: string
  ranges: {
    start: DateTime
    end: DateTime
    degree: input.Intensity
  }[]
}

export type Datum = {
  x: number
  y: number | null
}

const interventionTrackHeight = 25
const seriesHeight = 128

const OutcomeChart: FunctionComponent<OutcomeChartProps> = ({
  result,
  config,
  hoverX,
  hoverInterventionIdx,
  pinnedInterventionIdx,
  scaleYType,
  cumulative,
  scaleXAnimatedMax,
  onHoverX,
  onHoverIntervention,
  onPinIntervention,
  caseData
}) => {
  const {ref, dimensions} = useSafeDimensions()

  // We want to use naïve dates everywhere
  // So actually using UTC dates
  // "Today" is whatever today's date is for the user
  // But we need the same 'wall calendar' date in UTC
  // so convert to string and reparse :facepalm:
  const today = DateTime.fromISO(
    DateTime.local()
      .startOf('day')
      .toISODate(),
    {zone: 'utc'}
  )

  const t0 = useMemo(() => DateTime.fromISO(result.time.t0, {zone: 'utc'}), [
    result.time.t0
  ])

  const tEnd = useMemo(() => t0.plus({days: result.time.extent[1]}), [
    t0,
    result.time.extent
  ])

  // Prepare interventions
  const interventions: Intervention[] = useMemo(() => {
    const interventionPeriods = result.metadata.parameters.interventionPeriods
    const interventions: Record<StrategyKey, Intervention> = {
      schoolClosure: {title: 'School Closures', ranges: []},
      socialDistancing: {title: 'Social Distancing', ranges: []},
      caseIsolation: {title: 'Case Isolation', ranges: []},
      voluntaryHomeQuarantine: {
        title: 'Voluntary Home Quarantine',
        ranges: []
      }
    }
    for (let i = 0; i < interventionPeriods.length; i++) {
      const period = interventionPeriods[i]
      const end =
        i + 1 === interventionPeriods.length
          ? tEnd
          : DateTime.fromISO(interventionPeriods[i + 1].startDate, {
              zone: 'utc'
            })
      const start = DateTime.fromISO(period.startDate, {
        zone: 'utc'
      })

      Object.keys(StrategyDescriptions).forEach(k => {
        const degree = period[k as StrategyKey]
        if (degree) {
          interventions[k as StrategyKey].ranges.push({
            start,
            end,
            degree
          })
        }
      })
    }
    return Object.values(interventions)
  }, [result, tEnd])

  // intervention rows are each interventionTrackHeight pixels tall
  const chartsHeight =
    dimensions.height === 0
      ? 0
      : dimensions.height - interventions.length * interventionTrackHeight

  // converts a numeric array into date/value tuples
  // Configs are an array of groups. Each group will render a chart.
  // Each group can contain one or more series. Each series will render a line.
  const prepared: PreparedMetricsSeries[][] = useMemo(() => {
    // Map()able fn to convert a number[] into datum[]
    const datumize = (d: number | null, i: number) => ({
      x: t0.plus({days: result.time.timestamps[i]}).toMillis(),
      // guard against negative numbers here
      // They sometimes happen in fatality data from JHU
      y: typeof d === 'number' ? (!(d < 0) ? d : 0) : d
    })

    // Locate the peak date for a given series
    const peakDate = (arr: (number | null)[]) =>
      t0.plus({
        days: result.time.timestamps[maxIndex(arr)]
      })

    const prepareProjected = (k: KeyOrMetricsAccessor): Datum[] => {
      // if it's a key name, pluck that metric and datumize
      // if we were handed an accessor, use that to fetch the series to datumize
      switch (typeof k) {
        case 'string':
          return result.aggregate.metrics[
            k as keyof output.SeverityMetrics
          ].map(datumize)

        case 'function':
          return k(result.aggregate.metrics).map(datumize)
      }
    }

    const prepareActual = (k: KeyOrCaseDataAccessor): Datum[] => {
      if (!caseData)
        throw 'Tried to prepare actual casedata but it was not available.'
      switch (typeof k) {
        case 'string':
          return caseData[k as keyof CaseData].map(datumize)
        case 'function':
          return k(caseData).map(datumize)
      }
    }

    // a memo for the y offset of each series
    // because there are G groups each containing S series
    // calculating the top offset of each series requires doing
    // seriesHeight * total number of previous series in previous groups
    // this is super side-effect-y but practical ¯\_(ツ)_/¯
    let y = 0
    return config.map(group =>
      group.map(series => {
        const projected = {
          values: prepareProjected(series.projected.values),
          cumulative: prepareProjected(series.projected.cumulative),
          variance: series.projected.variance
            ? prepareProjected(series.projected.variance)
            : undefined,
          incidence: series.projected.incidence
            ? prepareProjected(series.projected.incidence)
            : undefined
        }
        let actual
        if (series.actual) {
          actual = {
            values: prepareActual(series.actual.values),
            cumulative: prepareActual(series.actual.cumulative),
            name: series.actual.name
          }
        }

        const preparedSeries: PreparedMetricsSeries = {
          title: series.title,
          color: series.color,
          capacity: series.capacity,
          projectedPeak: peakDate(projected.values.map(d => d.y)),
          projected,
          actual,
          y
        }
        y += seriesHeight
        return preparedSeries
      })
    )
  }, [config, caseData, result.aggregate.metrics, result.time.timestamps, t0])

  // compute the extent of the values across all series in a group
  // assumes that there's some data
  const extents = useMemo(
    () =>
      prepared.map(group =>
        d3.extent(
          group
            .map(series =>
              cumulative
                ? [series.projected.cumulative, series?.actual?.cumulative]
                : [series.projected.values, series?.actual?.values]
            )
            .flat(2)
            .filter(d => d !== undefined),
          d => d.y
        )
      ),
    [prepared, cumulative]
  ) as [[number, number]]

  // prepare scales
  // X is shared across everything
  const scaleX: ScaleTime<number, number> = useMemo(
    () =>
      d3
        .scaleUtc()
        .domain([
          t0.plus({days: result.time.extent[0]}).toMillis(),
          scaleXAnimatedMax
        ])
        .range([0, dimensions.width]),
    [t0, result, dimensions, scaleXAnimatedMax]
  )

  // Y is shared within a group
  const scalesY:
    | ScaleLinear<number | null, number>[]
    | ScaleLogarithmic<number | null, number>[] = useMemo(
    () =>
      extents.map(e => {
        switch (scaleYType) {
          case 'linear':
            return d3
              .scaleLinear()
              .domain(e)
              .range([seriesHeight, 0])
              .nice()
          case 'logarithmic':
            return (
              d3
                .scaleLog()
                // log10(0) = -infinity
                // that sucks from a rendering perspective
                // and our lower extent is almost always 0
                // so force it to be 1, and clamp all input values
                // e.g. force scaleY(v) to be scaleY(1) for v < 1
                .domain([e[0] === 0 ? 1 : e[0], e[1]])
                .range([seriesHeight, 0])
                .clamp(true)
                .nice()
            )
        }
      }),
    [extents, scaleYType]
  )

  // compute X hover index and date
  // hoverIdx is the index into the array of metrics
  // hoverDate is the date computed using the index and the array of
  // timestamp offsets
  const [hoverIdx, hoverDate] = useMemo(() => {
    // We are using "UTC Dates" as a kind of zoneless date everywhere
    // lalala I can't see no timezones can't hear you
    // d3 scaleTime.invert returns a JS Date, which we don't want
    // but the millis since epoch is correct since that's UTC
    // use them to index into our array of timestamps
    // and then use that index to generate the appropriate UTC Date
    const hoverDate = hoverX ? +scaleX.invert(hoverX) : today.toMillis()
    const i = d3.bisectLeft(
      prepared[0][0].projected.values.map(d => d.x),
      hoverDate
    )
    // we deal in round dates
    // coerce hoverdates to the start of the relevant day
    return [i, t0.plus({days: result.time.timestamps[i]}).startOf('day')]
  }, [hoverX, scaleX, prepared, today, result.time.timestamps, t0])

  const todayX = useMemo(() => scaleX(today.toMillis()), [today, scaleX])

  const whichIntervention = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const localY = e.clientY - rect.y
    return localY > chartsHeight
      ? Math.floor((localY - chartsHeight) / interventionTrackHeight)
      : null
  }

  const handleMouseX = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    switch (e.type) {
      case 'mouseleave':
        onHoverX(null)
        break

      default:
        onHoverX(e.clientX - e.currentTarget.getBoundingClientRect().x)
        break
    }
  }

  const handleMouseXY = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    switch (e.type) {
      case 'mouseleave':
        onHoverX(null)
        onHoverIntervention(null)
        break

      default:
        const rect = e.currentTarget.getBoundingClientRect()
        onHoverX(e.clientX - rect.x)
        onHoverIntervention(whichIntervention(e))
        break
    }
  }

  const handleMouseClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const intervention = whichIntervention(e)
    if (intervention !== null) {
      // unpin if clicked, otherwise pin the one that's clicked.
      onPinIntervention(
        intervention === pinnedInterventionIdx ? null : intervention
      )
    }
  }

  return (
    <div className="flex flex-col shadow-sm">
      <div className="bg-white flex flex-row w-full items-stretch border border-gray-400 rounded-md pb-1">
        <div className="w-64 flex-none flex flex-col">
          <div className="h-6 leading-6 text-xxs uppercase text-gray-light pl-2">
            {!hoverX && (
              <div>
                <span className="font-semibold pr-2">Today</span>
                <span>{hoverDate.toFormat('LLL d, yyyy')}</span>
              </div>
            )}
            &nbsp;
          </div>
          {prepared.map((group, i) =>
            group.map(series => (
              <div
                key={series.title}
                style={{height: seriesHeight}}
                className="border-t border-r border-gray-light pl-2"
              >
                <OutcomeChartLegendBlock
                  series={series}
                  selector={cumulative ? 'cumulative' : 'values'}
                  hoverIdx={hoverIdx}
                  scaleX={scaleX}
                  scaleY={scalesY[i]}
                  // the "everything" time max, not the current-visible time max
                  tMax={t0.plus({days: result.time.extent[1]}).toMillis()}
                />
              </div>
            ))
          )}

          <div
            className="border-r border-gray-light"
            style={{
              borderBottom: '1px solid black'
            }}
          >
            {interventions.map((i, idx) => {
              const hovering = idx === hoverInterventionIdx
              const pinned = idx == pinnedInterventionIdx
              return (
                <div
                  key={`${i.title}_${idx}`}
                  style={{
                    height: interventionTrackHeight
                  }}
                  className={classNames(
                    'uppercase text-xs border-t border-gray-100 transition flex flex-row items-center cursor-pointer pl-2',
                    hovering || pinned
                      ? 'black font-semibold'
                      : 'text-light-gray'
                  )}
                  onMouseEnter={() => onHoverIntervention(idx)}
                  onMouseLeave={() => onHoverIntervention(null)}
                  onClick={() => onPinIntervention(pinned ? null : idx)}
                >
                  <div className="flex-1">{i.title}</div>
                  <div
                    className={classNames(
                      'bg-gray-light self-stretch justify-end flex flex-row items-center overflow-hidden',
                      {
                        'opacity-100': pinned,
                        'opacity-50': hovering && !pinned,
                        'opacity-0': !(hovering || pinned)
                      },
                      hovering || pinned ? 'w-6 px-1' : 'w-0'
                    )}
                    style={{
                      transition: 'width 0.5s cubic-bezier(0,1,0,1)'
                    }}
                  >
                    <Pushpin
                      className={classNames(
                        'transition fill-current text-white opacity-50',
                        (hovering || pinned) && 'opacity-100'
                      )}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex-auto">
          <OutcomeChartFlag
            width={dimensions.width}
            {...{scaleX, hoverDate, today}}
          />

          <div
            ref={ref}
            className="relative border-t border-gray-light overflow-hidden cursor-default"
            style={{
              height:
                seriesHeight * prepared.flat(Infinity).length +
                interventionTrackHeight * interventions.length
            }}
            onMouseEnter={handleMouseXY}
            onMouseMove={handleMouseXY}
            onMouseLeave={handleMouseXY}
            onClick={handleMouseClick}
          >
            <svg
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              preserveAspectRatio="none"
              width="100%"
              overflow="visible"
            >
              <defs>
                <SVGLinePattern
                  id="diagonal-stripe-black"
                  spacingPx={4}
                  rotationDeg={45}
                />
                <SVGLinePattern
                  id="diagonal-stripe-white"
                  spacingPx={6}
                  rotationDeg={45}
                  lineWidth={6}
                  color="#fff"
                />
              </defs>

              {/*
              Draw interventions part of the chart
              They're at the bottom (Y) of the chart,
              but we want them to render behind everything else
              So we're rendering them earlier in the SVG.
              */}
              <Interventions
                {...{
                  interventions,
                  trackHeight: interventionTrackHeight,
                  scaleX,
                  hoverDate,
                  pinnedInterventionIdx,
                  hoverInterventionIdx,
                  height: dimensions.height,
                  width: dimensions.width,
                  chartsHeight
                }}
              />

              {/* Render the today line and line shading of the past */}
              <rect
                x={0}
                y={0}
                width={scaleX(today.toMillis())}
                height={dimensions.height}
                fill="url(#diagonal-stripe-black)"
                opacity={0.075}
              />
              <line
                x1={todayX}
                x2={todayX}
                y1={0}
                y2={dimensions.height}
                className="text-gray-light stroke-current opacity-50"
                strokeDasharray="4,4"
                strokeWidth={1}
                shapeRendering="crispEdges"
              />

              {/*
              Draw each chart group
              For ease of math, draw in a <g> that is translated to the right y coord
              so each chart can pretend it is drawing from 0,0

              But actually...
              Do this three times so we draw all the different layers
              SVG doesn't respect z-index, only drawn order (later = above)

              So, draw:
              - All the separator lines & Y axes
              - All the data lines
              - All the hovers
              */}

              {/* Separator lines & Y axes */}
              {prepared.map((group, groupIdx) =>
                group.map(series => {
                  const capacityY =
                    !cumulative && series.capacity
                      ? scalesY[groupIdx](series.capacity)
                      : undefined
                  return (
                    <g
                      key={`bg-${series.title}`}
                      transform={`translate(0,${series.y})`}
                    >
                      <line
                        x1={0}
                        x2={dimensions.width}
                        y1={0}
                        y2={0}
                        className="text-gray-light stroke-current stroke-1"
                        shapeRendering="crispEdges"
                      />
                      <OutcomeChartYAxis
                        scaleY={scalesY[groupIdx]}
                        width={dimensions.width}
                        type={scaleYType}
                      />
                      {!!capacityY &&
                        capacityY > 0 &&
                        capacityY < seriesHeight && (
                          <g>
                            <line
                              x1={0}
                              x2={dimensions.width}
                              y1={capacityY}
                              y2={capacityY}
                              style={{
                                shapeRendering: 'crispEdges',
                                strokeWidth: 1,
                                stroke: ChartColors[series.color],
                                strokeOpacity: 0.5,
                                strokeDasharray: '2,2'
                              }}
                            />
                            <text
                              x={dimensions.width}
                              textAnchor="end"
                              y={capacityY}
                              dx="-3px"
                              dy="-3px"
                              className="text-xxs font-semibold uppercase"
                              fill={ChartColors[series.color]}
                              opacity={0.5}
                            >
                              Capacity
                            </text>
                          </g>
                        )}
                    </g>
                  )
                })
              )}

              {/* Draw series projected + actuals data */}
              {prepared.map((group, groupIdx) =>
                group.map(series => (
                  <g
                    key={`data-${series.title}`}
                    transform={`translate(0,${series.y})`}
                  >
                    return (
                    <g key={`data-${series.title}`}>
                      {series.actual && (
                        <OutcomeChartActual
                          color={series.color}
                          data={
                            cumulative
                              ? series.actual.cumulative
                              : series.actual.values
                          }
                          {...{
                            scaleX,
                            scaleY: scalesY[groupIdx],
                            height: seriesHeight
                          }}
                        />
                      )}
                      <OutcomeChartLine
                        color={series.color}
                        data={
                          cumulative
                            ? series.projected.cumulative
                            : series.projected.values
                        }
                        cumulative={cumulative}
                        capacity={series.capacity}
                        {...{scaleX, scaleY: scalesY[groupIdx]}}
                      />
                    </g>
                    )
                  </g>
                ))
              )}

              {/* Draw hovers */}
              {prepared
                .map((group, groupIdx) =>
                  group
                    .map((series, seriesIdx) => (
                      <g
                        key={`hovers-${series.title}`}
                        transform={`translate(0,${series.y})`}
                      >
                        <OutcomeChartHover
                          height={seriesHeight}
                          scaleX={scaleX}
                          scaleY={scalesY[groupIdx]}
                          metrics={prepared[groupIdx][seriesIdx]}
                          selector={cumulative ? 'cumulative' : 'values'}
                          hoverIdx={hoverIdx}
                        />
                      </g>
                    ))
                    .reverse()
                )
                .reverse()}
            </svg>
          </div>
          <div
            onMouseEnter={handleMouseX}
            onMouseMove={handleMouseX}
            onMouseLeave={handleMouseX}
          >
            <OutcomeChartXAxis scaleX={scaleX} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default OutcomeChart
