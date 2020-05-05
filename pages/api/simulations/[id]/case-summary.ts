import {input, output} from '@covid-modeling/api'
import {DateTime} from 'luxon'
import {last} from '../../../../lib/arrayMath'
import * as db from '../../../../lib/db'
import {withDB} from '../../../../lib/mysql'
import {getBlob} from '../../util/blob-storage'
import dispatch from '../../util/dispatch'
import requireSession from '../../util/require-session'

export type CaseSummary = {
  cConf: number
  cHosp: number
  cDeaths: number
  peakDeath: input.ISODate
  peakDailyDeath: number
}

export default withDB(conn =>
  requireSession(ssn =>
    dispatch('GET', async (req, res) => {
      const id = parseInt(req.query.id as string)
      const sim = await db.getSimulation(conn, ssn.user, {id})

      if (!sim) {
        res.status(404).json({error: 'Not found'})
        return
      }
      const allResults = await fetchSimulationResults(sim)

      const summarizedResults = allResults.reduce<Record<string, CaseSummary>>(
        (sum, out) => {
          const metrics = out.aggregate.metrics

          // maxIndex finds the last peak value, we want the earliest occurrence (rounded)
          const peakDailyDeathIdx = metrics.incDeath.reduce(
            ([maxI, maxV], v, i) =>
              Math.round(v) > maxV ? [i, Math.round(v)] : [maxI, maxV],
            [0, 0]
          )[0]

          const peakDailyDeath = metrics.incDeath[peakDailyDeathIdx]
          const peakDailyDeathTs = out.time.timestamps[peakDailyDeathIdx]
          const peakDeath = DateTime.fromISO(out.time.t0).plus({
            days: peakDailyDeathTs
          })

          sum[out.metadata.model.slug] = {
            cConf: Math.round(getCumulativeConfirmed(metrics)),
            cHosp: Math.round(getCumulativeHospitalized(metrics)),
            cDeaths: Math.round(getCumulativeDeaths(metrics)),
            peakDeath: peakDeath.toISODate(),
            peakDailyDeath: Math.round(peakDailyDeath)
          }

          return sum
        },
        {}
      )

      res.status(200).json(summarizedResults)
    })
  )
)

async function fetchSimulationResults(
  sim: db.Simulation
): Promise<output.ModelOutput[]> {
  // Get all the raw results.
  const allRaw = await Promise.all(
    sim.model_runs.map(run =>
      run.results_data ? getBlob(run.results_data) : null
    )
  )

  // Parse all the raw results we found.
  return allRaw.filter(isResult).map(r => JSON.parse(r) as output.ModelOutput)
}

// Sum of all case types.
function getCumulativeConfirmed(met: output.SeverityMetrics): number {
  return (
    last(met.cumMild) +
    last(met.cumILI) +
    last(met.cumSARI) +
    last(met.cumCritical)
  )
}

// Sum of all deaths.
function getCumulativeDeaths(met: output.SeverityMetrics): number {
  return met.incDeath.reduce((s, m) => s + m, 0)
}

// Sum of normal and ICU hospital beds.
function getCumulativeHospitalized(met: output.SeverityMetrics): number {
  return last(met.cumSARI) + last(met.cumCritRecov) + last(met.cumCritical)
}

function isResult(r: unknown): r is string {
  // Type predicate helps the `filter/map`
  return r != null
}
