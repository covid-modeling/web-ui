import AppFrame from '../components/AppFrame'
import Table from '../components/Table'
import {withDB} from '../lib/mysql'
import {ensureSession} from '../lib/session'
import {GetServerSideProps} from 'next'
import * as db from '../lib/db'
import handleError from '../lib/handle-error'
import styles from './stats.module.css'

interface Props {
  usageByUserPerDayStats: any
  usageByUserStats: any
}

export default function StatsPage(props: Props) {
  return (
    <AppFrame loggedIn={true}>
      <div className={styles.StatsPage}>
        <h1>Users</h1>

        <Table>
          <thead>
            <tr>
              <td>GitHub ID</td>
              <td>Count</td>
            </tr>
          </thead>
          <tbody>
            {props.usageByUserStats.map((row: any, i: number) => (
              <tr key={i}>
                <td>{row.id}</td>
                <td>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <h1>Users per region per day</h1>
        <Table>
          <thead>
            <tr>
              <td>Region</td>
              <td>Sub Region</td>
              <td>Day</td>
              <td>Count</td>
            </tr>
          </thead>
          <tbody>
            {props.usageByUserPerDayStats.map((row: any, i: number) => (
              <tr key={i}>
                <td>{row.region_id}</td>
                <td>{row.subregion_id || '-'}</td>
                <td>{row.day}</td>
                <td>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </AppFrame>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = handleError(
  withDB(conn =>
    ensureSession(async (ctx, session) => {
      return {
        props: {
          usageByUserPerDayStats: await db.getUsageByUserPerDayStats(
            conn,
            session.user
          ),
          usageByUserStats: await db.getUsageByUserStats(conn, session.user)
        }
      }
    })
  )
)
