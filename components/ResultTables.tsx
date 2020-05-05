import {output} from '@covid-modeling/api'
import {DateTime} from 'luxon'
import {cumsum, elementSum, last, maxIndex} from '../lib/arrayMath'
import ResultTable from './ResultTable'

type Props = {
  result: output.ModelOutput
}

export default function ResultTables(props: Props) {
  const {result} = props
  const t0 = DateTime.fromISO(result.time.t0, {zone: 'utc'})

  const peakDate = (arr: number[]) =>
    t0
      .plus({
        days: result.time.timestamps[maxIndex(arr)]
      })
      .toFormat('LLL d, yyyy')

  const estimates = [
    {
      label: 'Infected',
      value: [
        result.aggregate.metrics.cumMild,
        result.aggregate.metrics.cumILI,
        result.aggregate.metrics.cumSARI,
        result.aggregate.metrics.cumCritical
      ]
        .map(last)
        .reduce((m, v) => m + v, 0)
    },
    {
      label: 'Hospitalized',
      value: [
        result.aggregate.metrics.cumSARI,
        result.aggregate.metrics.cumCritical
      ]
        .map(last)
        .reduce((m, i) => m + i)
    },
    {
      label: 'Require Intensive Care',
      value: last(result.aggregate.metrics.cumCritical)
    },
    {
      label: 'Require Ventilator',
      value: Math.ceil(last(result.aggregate.metrics.cumCritical) / 2)
    },
    {
      label: 'Deaths',
      value: last(cumsum(result.aggregate.metrics.incDeath))
    }
  ]

  const peaks = [
    {
      label: 'Peak Hospital Bed Demand',
      value: peakDate(
        elementSum([
          result.aggregate.metrics.SARI,
          result.aggregate.metrics.Critical,
          result.aggregate.metrics.CritRecov
        ])
      )
    },
    {
      label: 'Peak Intensive Care Demand',
      value: peakDate(result.aggregate.metrics.Critical)
    },
    {
      // vent usage is 50% of total ICU usage according to Silvana (teams chat),
      // so just return the same value here.
      label: 'Peak Ventilator Demand',
      value: peakDate(result.aggregate.metrics.Critical)
    },
    {
      label: 'Peak Daily Deaths',
      value: peakDate(result.aggregate.metrics.incDeath)
    }
  ]

  return (
    <div className="mt-4">
      <div className="mb-4">
        <ResultTable title="Estimates" rows={estimates} />
      </div>
      <ResultTable title="Peak" rows={peaks} />
    </div>
  )
}
