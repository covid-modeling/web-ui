import AppFrame from '../../components/AppFrame'
import NewSimulationForm from '../../components/simulation-form/NewSimulationForm'
import * as db from '../../lib/db'
import handleError from '../../lib/handle-error'
import {withDB} from '../../lib/mysql'
import {ensureSession} from '../../lib/session'
import {InterventionMap} from '../../lib/simulation-types'
import {TopLevelRegionMap} from '../api/regions'

interface Props {
  regions: TopLevelRegionMap
  interventions: InterventionMap
}

export default function NewSimulationPage(props: Props) {
  return (
    <AppFrame loggedIn={true}>
      <NewSimulationForm {...props} />
    </AppFrame>
  )
}

let interventions: InterventionMap
let regions: TopLevelRegionMap

export const getServerSideProps = handleError(
  withDB(conn =>
    ensureSession(async () => {
      // Cache intervention and region data for the life of the server process

      if (!regions) {
        regions = await db.getRegions(conn)
      }

      if (!interventions) {
        interventions = await db.getInterventionData(conn)
      }

      return {
        props: {
          regions,
          interventions
        }
      }
    })
  )
)
