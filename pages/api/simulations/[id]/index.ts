import assert from 'assert'
import {NextApiRequest} from 'next'
import 'source-map-support/register'
import {assertEnv} from '../../../../lib/assertions'
import {updateSimulation} from '../../../../lib/db'
import {catchUnhandledErrors} from '../../../../lib/handle-error'
import {withDB} from '../../../../lib/mysql'
import {SimulationStatus} from '../../../../lib/simulation-types'
import dispatch from '../../util/dispatch'

catchUnhandledErrors()

const RUNNER_SHARED_SECRET = assertEnv('RUNNER_SHARED_SECRET', true)

export default withDB(conn =>
  dispatch('POST', async (req, res) => {
    if (!validateRequest(req)) {
      res.status(401).json({error: 'Unauthorized'})
      return
    }

    try {
      verifyStatus(req.body.status)

      const updated = await updateSimulation(
        conn,
        req.query.id as string,
        req.body.status,
        req.body.modelSlug,
        req.body.resultsLocation,
        req.body.exportLocation,
        req.body.workflowRunID
      )

      if (updated) {
        res.status(204).end()
      } else {
        res.status(404).end('Not found')
      }
    } catch (e) {
      res.status(400).json({error: `Could not process message: ${e.message}`})
    }
  })
)

function verifyStatus(status: SimulationStatus) {
  assert(
    Object.values(SimulationStatus).includes(status),
    new Error(`Invalid status: ${status}`)
  )
  return status
}

function validateRequest(req: NextApiRequest) {
  const auth = req.headers.authorization
  const authToken =
    auth?.startsWith('Bearer ') && auth.slice('Bearer '.length).trim()
  return authToken === RUNNER_SHARED_SECRET
}
