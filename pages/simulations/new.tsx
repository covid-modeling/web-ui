import AppFrame from '../../components/AppFrame'
import NewSimulationForm from '../../components/simulation-form/NewSimulationForm'
import * as db from '../../lib/db'
import handleError from '../../lib/handle-error'
import {withDB} from '../../lib/mysql'
import {ensureSession} from '../../lib/session'
import {InterventionMap} from '../../lib/simulation-types'
import {RegionMap} from '../../types/regions'

interface Props {
  regions: RegionMap
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

export const getServerSideProps = handleError(
  withDB(conn =>
    ensureSession(async () => {
      const regions = require('../../data/regions.json')

      // Cache intervention data for the life of the server process
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
