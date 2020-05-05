import {input, RunStatus} from '@covid-modeling/api'
import {captureException} from '@sentry/node'
import {ServerlessMysql} from 'serverless-mysql'
import 'source-map-support/register'
import SQL from 'sql-template-strings'
import {assertEnv} from '../../../lib/assertions'
import {toYYYYMMDD} from '../../../lib/dateFunctions'
import {
  createSimulation,
  getRegionCaseData,
  listSimulationSummaries,
  updateSimulation
} from '../../../lib/db'
import {createClient, repositoryDispatch} from '../../../lib/github'
import {catchUnhandledErrors} from '../../../lib/handle-error'
import models from '../../../lib/models'
import {withDB} from '../../../lib/mysql'
import {
  NewSimulationConfig,
  validateSchema
} from '../../../lib/new-simulation-state'
import {Session} from '../../../lib/session'
import dispatch from '../util/dispatch'
import requireSession from '../util/require-session'

catchUnhandledErrors()

const CONTROL_REPO_NWO = assertEnv('CONTROL_REPO_NWO', true)
const GITHUB_API_TOKEN = assertEnv('GITHUB_API_TOKEN', true)
const RUNNER_CALLBACK_URL = assertEnv('RUNNER_CALLBACK_URL', true)
const CONTROL_REPO_EVENT_TYPE = assertEnv('CONTROL_REPO_EVENT_TYPE', true)

export default withDB(conn =>
  requireSession((session: Session) =>
    dispatch({
      get: async (_req, res) => {
        const summaries = await listSimulationSummaries(conn, session.user.id)
        res.status(200).json(summaries)
      },
      post: async (req, res) => {
        const config: NewSimulationConfig = JSON.parse(req.body)

        const error = validateSchema(config)
        if (error) {
          res.status(422).json(error)
          return
        }

        try {
          const insertId = await createAndDispatchSimulation(
            conn,
            session.user,
            config
          )
          res.status(200).json({id: insertId})
        } catch (err) {
          console.error(err)
          captureException(err)
          res.status(500).json({error: 'Error queueing simulation run'})
        }
      }
    })
  )
)

async function createAndDispatchSimulation(
  conn: ServerlessMysql,
  user: Session['user'],
  config: NewSimulationConfig
): Promise<number> {
  await conn.query(SQL`START TRANSACTION`)

  // TODO should we be failing the run of there is no case data?
  const {endDate, deaths, confirmed} = await getRegionCaseData(
    conn,
    config.regionID,
    config.subregionID
  )

  const modelInput: Omit<input.ModelInput, 'model'> = {
    region: config.regionID,
    subregion: config.subregionID,
    parameters: {
      r0: typeof config.r0 == 'number' ? config.r0 : null,
      calibrationCaseCount: confirmed || 0,
      calibrationDeathCount: deaths || 0,
      calibrationDate: endDate || toYYYYMMDD(),
      interventionPeriods: config.interventionPeriods
    }
  }

  const {insertId} = await createSimulation(conn, {
    region_id: config.regionID,
    subregion_id: config.subregionID,
    status: RunStatus.Pending,
    github_user_id: user.id,
    github_user_login: user.login,
    label: config.label,
    configuration: modelInput
  })

  if (process.env.LOCAL_MODE) {
    for (const slug in models) {
      await updateSimulation(
        conn,
        insertId.toString(),
        RunStatus.Complete,
        slug,
        `file://${process.cwd()}/data/result-stub.json`,
        '',
        undefined
      )
    }
  } else {
    const [owner, name] = CONTROL_REPO_NWO.split('/')
    const client = createClient({token: GITHUB_API_TOKEN})

    try {
      await repositoryDispatch(client, owner, name, CONTROL_REPO_EVENT_TYPE, {
        id: insertId,
        models: Object.entries(models).map(([slug, spec]) => ({
          slug,
          imageURL: spec.imageURL
        })),
        configuration: modelInput,
        callbackURL: RUNNER_CALLBACK_URL
      })
    } catch (err) {
      await conn.query('ROLLBACK')
      throw err
    }
  }

  await conn.query('COMMIT')

  return insertId
}
