import {AxiosError} from 'axios'
import useSWR from 'swr'
import models from '../lib/models'
import {CaseSummary as CaseSummaryType} from '../pages/api/simulations/[id]/case-summary'
import LocalDate from './LocalDate'
import StatusBlock from './StatusBlock'
import Table from './Table'

type Props = {
  simulationID: number
}

export default function CaseSummary(props: Props) {
  const {data, error} = useSWR<Record<string, CaseSummaryType>, AxiosError>(
    `/api/simulations/${props.simulationID}/case-summary`,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  if (error) {
    return (
      <div className="mt-4">
        <StatusBlock statusKey="failed">
          <p className="text-gray-800">
            Error loading simulation case summary.
          </p>
        </StatusBlock>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mt-4">
        <StatusBlock statusKey="in-progress">
          <p className="text-gray-800">Loading simulation case summary...</p>
        </StatusBlock>
      </div>
    )
  }

  return (
    <Table fixed className="mt-4">
      <thead>
        <tr>
          <th>Summary</th>
          {Object.keys(data).map(modelSlug => (
            <th key={modelSlug}>{models[modelSlug].name}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        <tr>
          <td className="max-w-sm">Cumulative confirmed cases</td>
          {Object.entries(data).map(([slug, summary]) => (
            <td key={slug}>{summary.cConf.toLocaleString()}</td>
          ))}
        </tr>

        <tr>
          <td>Cumulative hospitalizations</td>
          {Object.entries(data).map(([slug, summary]) => (
            <td key={slug}>{summary.cHosp.toLocaleString()}</td>
          ))}
        </tr>

        <tr>
          <td>Cumulative deaths</td>
          {Object.entries(data).map(([slug, summary]) => (
            <td key={slug}>{summary.cDeaths.toLocaleString()}</td>
          ))}
        </tr>

        <tr>
          <td>Peak deaths date</td>
          {Object.entries(data).map(([slug, summary]) => (
            <td key={slug}>
              <LocalDate isoDate={summary.peakDeath} />
            </td>
          ))}
        </tr>

        <tr>
          <td>Peak daily deaths</td>
          {Object.entries(data).map(([slug, summary]) => (
            <td key={slug}>{summary.peakDailyDeath.toLocaleString()}</td>
          ))}
        </tr>
      </tbody>
    </Table>
  )
}
