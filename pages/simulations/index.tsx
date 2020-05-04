import {GetServerSideProps} from 'next'
import Link from 'next/link'
import {useRouter} from 'next/router'
import AppFrame from '../../components/AppFrame'
import button from '../../components/styles/button.module.css'
import * as db from '../../lib/db'
import {SimulationSummary} from '../../lib/db'
import handleError from '../../lib/handle-error'
import {withDB} from '../../lib/mysql'
import {ensureSession} from '../../lib/session'
import styles from './index.module.css'

type Props = {
  lastSimulation: SimulationSummary | null
}

export default function SimulationsIndexPage(props: Props) {
  const router = useRouter()

  if (props.lastSimulation && process.browser) {
    router.push('/simulations/[id]', `/simulations/${props.lastSimulation.id}`)
    return null
  }

  return (
    <AppFrame loggedIn={true}>
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <h1 className="text-3.2xl font-bold">No simulations created yet</h1>

          <p className="w-102 mt-3">
            Get started by creating a new simulation for this region. After your
            first simulation is created, the results will be visible here.
          </p>

          <Link href="/simulations/new">
            <a className={`${button.button} mt-6 px-16 text-blue`}>
              + Create new simulation
            </a>
          </Link>
        </div>
      </div>
    </AppFrame>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = handleError(
  withDB(conn =>
    ensureSession(async (ctx, session) => {
      const lastSimulation =
        (
          await db.listSimulationSummaries(conn, session.user.id, {limit: 1})
        )[0] || null

      return {
        props: {
          lastSimulation
        }
      }
    })
  )
)
