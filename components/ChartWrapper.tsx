import {output, RunStatus} from '@covid-modeling/api'
import {DateTime} from 'luxon'
import {useMemo, useState} from 'react'
import {animated, useSpring} from 'react-spring'
import USCapacityData from '../data/hospitals/us.json'
import {cumsum, elementSum} from '../lib/arrayMath'
import {ModelRun, Simulation} from '../lib/db'
import {CaseData} from '../types/case-data'
import ModelSelect from './ModelSelect'
import OutcomeChart, {
  OutcomeChartConfiguration,
  ScaleXDomainMonths,
  ScaleYType
} from './OutcomeChart/OutcomeChart'
import ResultViewSettings from './ResultViewSettings'

const AnimatedOutcomeChart = animated(OutcomeChart)

export type ToggleGroupOption = {
  label: string
  value: number | string | null
  disabled?: boolean
}

interface Props {
  regionID: string
  regionName: string
  subregionID: string | undefined
  subregionName: string | undefined
  simulation: Simulation
  modelRun: ModelRun
  result: output.ModelOutput
  caseData: CaseData
  onChangeModel: (slug: string) => void
}

export default function ChartWrapper(props: Props) {
  const {result} = props

  // figure out what timerange options to offer
  const t0 = DateTime.fromISO(result.time.t0, {zone: 'utc'})
  const extentEnd = result.time.extent[1]

  // Figure out which time toggle options to offer
  // and which to choose by default
  const [timeToggleOptions, defaultTimeToggleValue]: [
    ToggleGroupOption[],
    number | null
  ] = useMemo(() => {
    const tMaxEverything = t0.plus({days: extentEnd})
    const tMaxDiff = tMaxEverything.diff(t0, 'months')
    const timeToggleOptions = [
      {
        label: '6 Months',
        value: 6,
        disabled: tMaxDiff.months < 6
      },
      {
        label: '12 Months',
        value: 12,
        disabled: tMaxDiff.months < 12
      },
      {
        label: 'Full Range',
        value: null,
        disabled: false
      }
    ]
    let defaultTimeToggleValue: number | null = null
    // default to the first not-disabled one
    for (const o of timeToggleOptions) {
      if (!o.disabled) {
        defaultTimeToggleValue = o.value as number | null
        break
      }
    }
    return [timeToggleOptions, defaultTimeToggleValue]
  }, [t0, extentEnd])

  const config: OutcomeChartConfiguration[][] = useMemo(() => {
    let normalBedsCapacity, icuBedsCapacity
    if (result.metadata.region === 'US' && result.metadata.subregion) {
      const stateAbbr = result.metadata.subregion.slice(-2)
      const state = USCapacityData.find(s => s.abbr === stateAbbr)
      if (state) {
        normalBedsCapacity = Math.floor(
          (state.total_beds - state.icu_beds) * (1 - state.utilization)
        )
        icuBedsCapacity = Math.floor(state.icu_beds * (1 - state.utilization))
      }
    }
    return [
      [
        {
          title: 'Deaths',
          color: 'black',
          projected: {
            values: 'incDeath',
            cumulative: (metrics: output.SeverityMetrics) =>
              cumsum(metrics.incDeath)
          },
          actual: {
            values: 'deaths',
            cumulative: 'cumulativeDeaths'
          }
        }
      ],
      [
        {
          title: 'Infections',
          color: 'blue',
          projected: {
            values: (metrics: output.SeverityMetrics) =>
              elementSum([
                metrics.Mild,
                metrics.ILI,
                metrics.SARI,
                metrics.Critical
              ]),
            cumulative: (metrics: output.SeverityMetrics) =>
              elementSum([
                metrics.cumMild,
                metrics.cumILI,
                metrics.cumSARI,
                metrics.cumCritical
              ])
          },
          actual: {
            values: 'confirmed',
            cumulative: 'cumulativeConfirmed',
            name: 'Confirmed'
          }
        }
      ],
      [
        {
          title: 'Normal Hospital Beds',
          color: 'purple',
          projected: {
            values: (metrics: output.SeverityMetrics) =>
              elementSum([metrics.SARI, metrics.CritRecov]),
            cumulative: (metrics: output.SeverityMetrics) =>
              elementSum([metrics.cumSARI, metrics.cumCritRecov])
          },
          capacity: normalBedsCapacity
        },
        {
          title: 'Intensive Care Beds',
          color: 'orange',
          projected: {
            values: 'Critical',
            cumulative: 'cumCritical'
          },
          capacity: icuBedsCapacity
        },
        {
          title: 'Ventilators Required',
          color: 'pink',
          projected: {
            values: (metrics: output.SeverityMetrics) =>
              metrics.Critical.map(m => m / 2),
            cumulative: (metrics: output.SeverityMetrics) =>
              metrics.cumCritical.map(m => m / 2)
          }
        }
      ]
    ]
  }, [result])

  // Shared chart state
  const [hoverX, setHoverX] = useState<number | null>(null)
  const [hoverInterventionIdx, setHoverIntervention] = useState<number | null>(
    null
  )
  const [pinnedInterventionIdx, setPinnedIntervention] = useState<
    number | null
  >(null)
  const [scaleYType, setScaleYType] = useState<ScaleYType>('linear')
  const [cumulative, setCumulative] = useState(false)
  const [scaleXDomainMonths, setScaleXDomainMonths] = useState<
    ScaleXDomainMonths
  >(defaultTimeToggleValue)

  const tMax = t0
    .plus(
      scaleXDomainMonths
        ? {months: scaleXDomainMonths}
        : {days: result.time.extent[1]}
    )
    .toMillis()
  const {tMaxMillis} = useSpring({
    tMaxMillis: tMax
  })

  const sharedHandlerState = {
    hoverX,
    onHoverX: setHoverX,
    hoverInterventionIdx,
    onHoverIntervention: setHoverIntervention,
    pinnedInterventionIdx,
    onPinIntervention: setPinnedIntervention,
    scaleYType,
    cumulative,
    scaleXDomainMonths
  }

  return (
    <div>
      <div className="my-4">
        <ModelSelect
          modelSlug={props.modelRun.model_slug}
          modelOpts={props.simulation.model_runs.map(r => r.model_slug)}
          onChange={props.onChangeModel}
        />

        <ResultViewSettings
          disabled={props.modelRun.status !== RunStatus.Complete}
          cumulative={cumulative}
          setCumulative={setCumulative}
          scaleYType={scaleYType}
          setScaleYType={setScaleYType}
          scaleXDomainMonths={scaleXDomainMonths}
          setScaleXDomainMonths={setScaleXDomainMonths}
          timeToggleOptions={timeToggleOptions}
        />
      </div>

      <AnimatedOutcomeChart
        result={result}
        caseData={props.caseData}
        config={config}
        scaleXAnimatedMax={tMaxMillis}
        {...sharedHandlerState}
      />
    </div>
  )
}
