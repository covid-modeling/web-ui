import {DateTime} from 'luxon'
import React, {FunctionComponent, useMemo} from 'react'
import {Intervention} from './OutcomeChart'

type InterventionsProps = {
  interventions: Intervention[]
  trackHeight: number
  scaleX: d3.ScaleTime<number, number>
  hoverDate: DateTime
  pinnedInterventionIdx: number | null
  hoverInterventionIdx: number | null
  height: number
  width: number
  chartsHeight: number
}

const Interventions: FunctionComponent<InterventionsProps> = ({
  interventions,
  trackHeight,
  scaleX,
  hoverDate,
  pinnedInterventionIdx,
  hoverInterventionIdx,
  height,
  width,
  chartsHeight
}) => {
  const separators = useMemo(
    () => (
      <g>
        {interventions.map((i, idx) => {
          const y = chartsHeight + idx * trackHeight
          return (
            <line
              key={`separator-${idx}`}
              x1={0}
              x2={width}
              y1={y}
              y2={y}
              className="text-gray-200 stroke-current"
              strokeWidth={1}
              shapeRendering="crispEdges"
            />
          )
        })}
      </g>
    ),
    [interventions, width, chartsHeight, trackHeight]
  )

  const hoverLine = useMemo(() => {
    const hoverDateX = scaleX(hoverDate)
    return (
      <line
        y1={chartsHeight}
        y2={height}
        x1={hoverDateX}
        x2={hoverDateX}
        style={{
          stroke: 'black',
          strokeWidth: 2,
          shapeRendering: 'crispEdges'
        }}
        pointerEvents="none"
      />
    )
  }, [scaleX, hoverDate, chartsHeight, height])

  const [hoverSpans, hoverSpines] = useMemo(() => {
    let spans: JSX.Element[] = []
    let spines: JSX.Element[] = []
    for (let iIdx = 0; iIdx < interventions.length; iIdx++) {
      const intervention = interventions[iIdx]
      const hovering = iIdx === hoverInterventionIdx
      const pinned = iIdx === pinnedInterventionIdx
      const display = pinned || (hovering && pinnedInterventionIdx === null)
      const y = chartsHeight + iIdx * trackHeight

      spans = spans.concat(
        intervention.ranges.map((r, rIdx) => {
          const startX = scaleX(r.start.toMillis())
          const endX = scaleX(r.end.toMillis())
          return (
            <rect
              key={
                'hoverSpan_' +
                iIdx +
                rIdx +
                r.start.toISODate() +
                r.end.toISODate()
              }
              x={startX}
              y={display ? 0 : y}
              height={display ? height : trackHeight}
              width={endX - startX}
              className="text-gray-100 fill-current"
              style={{
                fillOpacity: display ? 0.75 : 0,
                transition: 'all 0.5s cubic-bezier(0, 1, 0, 1)',
                transitionProperty: 'y, height, fill-opacity'
              }}
            />
          )
        })
      )
      spines = spines.concat(
        intervention.ranges.map((r, rIdx) => {
          const startX = scaleX(r.start.toMillis())
          return (
            <rect
              key={
                'hoverSpine_' +
                iIdx +
                rIdx +
                r.start.toISODate() +
                r.end.toISODate()
              }
              x={startX}
              y={display ? 0 : y}
              height={display ? height : trackHeight}
              width={2}
              className={`text-severityhover-${r.degree} fill-current`}
              style={{
                fillOpacity: display ? 1 : 0,
                transition: 'all 0.5s cubic-bezier(0, 1, 0, 1)',
                transitionProperty: 'y, height, fill-opacity'
              }}
            />
          )
        })
      )
    }
    return [spans, spines]
  }, [
    chartsHeight,
    height,
    hoverInterventionIdx,
    interventions,
    pinnedInterventionIdx,
    scaleX,
    trackHeight
  ])

  const [interventionSpans, interventionSpines] = useMemo(() => {
    let spans: JSX.Element[] = []
    let spines: JSX.Element[] = []
    for (let iIdx = 0; iIdx < interventions.length; iIdx++) {
      const intervention = interventions[iIdx]
      const y = chartsHeight + iIdx * trackHeight
      const deemphasized =
        (hoverInterventionIdx ?? pinnedInterventionIdx) !== null &&
        iIdx !== hoverInterventionIdx &&
        iIdx !== pinnedInterventionIdx
      spans = spans.concat(
        intervention.ranges.map((r, rIdx) => {
          const startX = scaleX(r.start.toMillis())
          const endX = scaleX(r.end.toMillis())
          return (
            <rect
              key={
                'interventionSpan_' +
                iIdx +
                rIdx +
                r.start.toISODate() +
                r.end.toISODate()
              }
              x={startX}
              y={y}
              height={trackHeight - 1}
              width={endX - startX}
              className="text-gray-100 fill-current"
              opacity={deemphasized ? 0.25 : 1}
            />
          )
        })
      )
      spines = spines.concat(
        intervention.ranges.map((r, rIdx) => {
          const startX = scaleX(r.start.toMillis())
          return (
            <rect
              key={
                'interventionSpine_' +
                iIdx +
                rIdx +
                r.start.toISODate() +
                r.end.toISODate()
              }
              x={startX}
              y={y}
              height={trackHeight - 1}
              width={2}
              className={`text-severityhover-${r.degree} fill-current`}
              opacity={deemphasized ? 0.25 : 1}
            />
          )
        })
      )
    }
    return [spans, spines]
  }, [
    chartsHeight,
    hoverInterventionIdx,
    interventions,
    pinnedInterventionIdx,
    scaleX,
    trackHeight
  ])

  const label = useMemo(() => {
    const idx = pinnedInterventionIdx ?? hoverInterventionIdx
    if (idx === null) {
      return
    }
    const intervention = interventions[idx]
    const y = chartsHeight + idx * trackHeight
    return intervention.ranges.map((range, i) => {
      const startX = scaleX(range.start.toMillis())
      if (hoverDate >= range.start && hoverDate < range.end)
        return (
          <text
            x={startX}
            key={i}
            dx={4}
            y={y + trackHeight - 1}
            dy="-6px"
            className="text-gray-500 fill-current uppercase text-xxs font-normal"
          >
            {range.start.toFormat('d LLL')}
          </text>
        )
    })
  }, [
    chartsHeight,
    hoverDate,
    hoverInterventionIdx,
    interventions,
    pinnedInterventionIdx,
    scaleX,
    trackHeight
  ])

  return (
    <g>
      {/* render separators between tracks */}
      {separators}

      {/* render bg hover spans */}
      {hoverSpans}

      {/* render intervention spans */}
      {interventionSpans}

      {/* render spines and hover spines */}
      {interventionSpines}
      {hoverSpines}

      {/* render label */}
      {label}

      {/* render hover line */}
      {hoverLine}
    </g>
  )
}

export default React.memo(Interventions)
