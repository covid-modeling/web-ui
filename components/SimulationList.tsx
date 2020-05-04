import {AxiosError} from 'axios'
import {DateTime} from 'luxon'
import Link from 'next/link'
import {useState} from 'react'
import useSWR from 'swr'
import {SimulationSummary} from '../lib/db'
import flagAndName from '../lib/regionEmoji'
import Clock from '../svg/Clock.svg'
import simListStyle from './SimulationList.module.css'

type Props = {
  activeSimulationID: number
  initialData: SimulationSummary[]
}

export default function SimulationList(props: Props) {
  const {data, error} = useSWR<SimulationSummary[], AxiosError>(
    '/api/simulations',
    {
      initialData: props.initialData,
      shouldRetryOnError: true,
      refreshInterval: 30_000
    }
  )

  const [summaryCount, setSummaryCount] = useState(5)
  const hasMore = data && summaryCount < data.length

  if (error) {
    return <p className="text-red font-bold">Error loading simulation list.</p>
  }

  if (!data) {
    return <p>Loading simulation summaries...</p>
  }

  return (
    <ul className={simListStyle.list}>
      {data.slice(0, summaryCount).map(summary => (
        <li
          key={summary.id}
          className={`${simListStyle.listItem} ${
            summary.id === props.activeSimulationID ? simListStyle.active : ''
          }`}
        >
          <Link href="/simulations/[id]" as={`/simulations/${summary.id}`}>
            <a>
              <h3 className={simListStyle.customTitle}>
                {summary.label || 'Untitled Simulation'}
              </h3>
              <span className={simListStyle.region}>
                {flagAndName(summary.region_id, summary.region_name)}
                {summary.subregion_name ? ` / ${summary.subregion_name}` : null}
              </span>
              <time dateTime={summary.created_at}>
                <Clock />
                {getRelativeTime(summary.created_at)}
              </time>
            </a>
          </Link>
        </li>
      ))}

      {hasMore ? (
        <li
          className={`${simListStyle.listItem} ${simListStyle.showMore}`}
          onClick={() => setSummaryCount(summaryCount => summaryCount + 10)}
        >
          View older simulations
        </li>
      ) : null}
    </ul>
  )
}

function getRelativeTime(dateTime: string) {
  // https://github.com/moment/luxon/issues/478
  const dt = DateTime.fromISO(dateTime).toRelative()
  return dt === 'in 0 seconds' ? 'Just now' : dt
}
