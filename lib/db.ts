import {input, RunStatus} from '@covid-modeling/api'
import omit from 'lodash/omit'
import {DateTime} from 'luxon'
import {ServerlessMysql} from 'serverless-mysql'
import SQL from 'sql-template-strings'
import Models from '../lib/models'
import {CaseData} from '../types/case-data'
import {initSentry} from './sentry'
import {Session} from './session'
import {
  InterventionData,
  InterventionMap,
  ParameterAbbreviations
} from './simulation-types'

const {captureException} = initSentry()

export type Simulation = {
  id: number
  region_name: string
  status: RunStatus
  subregion_name: string | undefined
  region_id: string
  subregion_id: string | undefined
  github_user_id: number
  github_user_login: string
  configuration: input.ModelInput
  model_runs: ModelRun[]
  label: string
  created_at: string
  updated_at: string
}

export type ModelRun = {
  model_slug: string
  status: RunStatus
  results_data: string | null
  export_location: string | null
}

export type SimulationSummary = Omit<
  Simulation,
  'configuration' | 'model_runs'
> & {
  region: string
  status: RunStatus
  configurationSummary: string
}

// RowDataPacket is an un-exported type from the Node.js MySQL lib.
type RowDataPacket = {}

export async function getFatalityData(
  conn: ServerlessMysql,
  regionID: string,
  subregionID: string | undefined,
  t0: string,
  extent: [number, number]
): Promise<CaseData | null> {
  const t0Date = new Date(t0)
  const earliestDate = new Date(t0Date.getTime())
  earliestDate.setDate(t0Date.getDate() + extent[0])
  const latestDate = new Date(t0Date.getTime())
  latestDate.setDate(t0Date.getDate() + extent[1])

  const query = SQL`
      SELECT
        date, confirmed, deaths
      FROM case_data
      WHERE
        region_id = ${regionID} AND`

  if (subregionID) {
    query.append(SQL`\nsubregion_id = ${subregionID} AND`)
  }

  query.append(SQL`\ndate >= ${earliestDate} AND
        date <= ${latestDate}
      ORDER BY date ASC`)

  const rows = await conn.query<
    {date: string; confirmed: number; deaths: number}[]
  >(query)

  // Add one to account for t0 itself, I think...
  const deaths = new Array(extent[1] - extent[0] + 1).fill(null)
  const cumulativeDeaths = new Array(extent[1] - extent[0] + 1).fill(null)
  const confirmed = new Array(extent[1] - extent[0] + 1).fill(null)
  const cumulativeConfirmed = new Array(extent[1] - extent[0] + 1).fill(null)

  const msPerDay = 1000 * 60 * 60 * 24
  const numRows = rows.length

  for (let i = 0; i < numRows; i++) {
    const row = rows[i]
    const lastRow = rows[i - 1]

    const date = new Date(row.date)

    const diffFromStart = Math.floor(
      (date.getTime() - earliestDate.getTime()) / msPerDay
    )

    deaths[diffFromStart] = row.deaths - (lastRow?.deaths ?? 0)
    confirmed[diffFromStart] = row.confirmed - (lastRow?.confirmed ?? 0)
    cumulativeDeaths[diffFromStart] = row.deaths
    cumulativeConfirmed[diffFromStart] = row.confirmed
  }

  return {deaths, cumulativeDeaths, confirmed, cumulativeConfirmed}
}

export async function getInterventionData(
  conn: ServerlessMysql
): Promise<InterventionMap> {
  type Row = {
    region_id: string
    subregion_id: string
    policy: string
    notes?: string
    source?: string
    issue_date: string
    start_date?: string
    ease_date?: string
    expiration_date?: string
    end_date?: string
  }

  const rows = await conn.query<Row[]>(SQL`
    SELECT
      region_id, subregion_id, policy, issue_date,
      start_date, expiration_date, end_date
    FROM
      intervention_data;
  `)

  const result: any = {}
  for (const row of rows) {
    const region = row.region_id
    const subregion = row.subregion_id || '_self'
    const regionData = result[region] || (result[region] = {})
    const subregionData = regionData[subregion] || (regionData[subregion] = {})
    const policyData = (subregionData[row.policy] = {} as InterventionData)

    // To save bytes when serializing, don't add null values.
    if (row.issue_date) policyData.dateIssued = row.issue_date
    if (row.start_date) policyData.dateEnacted = row.start_date
    if (row.expiration_date) policyData.dateExpiry = row.expiration_date
    if (row.end_date) policyData.dateEnded = row.end_date
  }

  return result
}

export async function createSimulation(
  conn: ServerlessMysql,
  props: {
    region_id: string
    subregion_id?: string
    status: RunStatus
    github_user_id: string
    github_user_login: string
    label: string
    configuration: Omit<input.ModelInput, 'model'>
  }
): Promise<{insertId: number}> {
  return conn.query(SQL`
    INSERT INTO simulation_runs (
      github_user_id,
      github_user_login,
      label,
      configuration,
      model_runs,
      region_id,
      subregion_id,
      created_at,
      updated_at
    ) VALUES (
      ${props.github_user_id},
      ${props.github_user_login},
      ${props.label},
      ${JSON.stringify(props.configuration)},
      ${JSON.stringify(
        Object.keys(Models).map<ModelRun>(slug => ({
          model_slug: slug,
          status: props.status,
          results_data: null,
          export_location: null
        }))
      )},
      ${props.region_id},
      ${props.subregion_id},
      ${new Date()},
      ${new Date()}
    )`)
}

export async function updateSimulation(
  conn: ServerlessMysql,
  id: string,
  status: RunStatus,
  model: string,
  resultsLocation: string,
  exportLocation: string,
  workflowRunID: string | undefined
): Promise<boolean> {
  console.log(
    `Updating simulation ${id}/${model} as ${status} at ${resultsLocation}`
  )

  await conn.query('START TRANSACTION')

  const simulationResult = await conn.query<
    {id: number; model_runs: ModelRun[]}[]
  >(
    SQL`SELECT id, model_runs FROM simulation_runs WHERE simulation_runs.id = ${id} FOR UPDATE`
  )

  let affectedRows

  try {
    if (simulationResult.length < 1) {
      return false
    }

    const simulation = simulationResult[0]

    const newModelRuns = simulation.model_runs.map(modelRun => {
      if (modelRun.model_slug === model) {
        return {
          ...modelRun,
          results_data: resultsLocation,
          export_location: exportLocation,
          status
        }
      }

      return modelRun
    })

    const query = SQL`UPDATE simulation_runs SET model_runs=${JSON.stringify(
      newModelRuns
    )}`

    if (workflowRunID) {
      query.append(SQL`, workflow_run_id=${workflowRunID}`)
    }

    query.append(SQL` WHERE id=${id}`)

    const updateResult = await conn.query<{affectedRows: number}>(query)
    affectedRows = updateResult.affectedRows

    await conn.query('COMMIT')
  } catch (err) {
    await conn.query('ROLLBACK')
    throw err
  }

  return Boolean(affectedRows)
}

export async function listSimulationSummaries(
  conn: ServerlessMysql,
  githubUserID: string,
  queryOpts?: {region?: string; limit?: number}
): Promise<SimulationSummary[]> {
  const select = SQL`SELECT
      simulation_runs.id,
      simulation_runs.github_user_id,
      simulation_runs.github_user_login,
      regions.name AS region_name,
      subregions.name AS subregion_name,
      regions.id AS region_id,
      subregions.id AS subregion_id,
      simulation_runs.configuration,
      simulation_runs.model_runs,
      simulation_runs.label,
      DATE_FORMAT(simulation_runs.created_at, "%Y-%m-%dT%TZ") AS created_at,
      DATE_FORMAT(simulation_runs.updated_at, "%Y-%m-%dT%TZ") AS updated_at
    FROM simulation_runs
    INNER JOIN regions AS regions
      ON regions.id = simulation_runs.region_id
    LEFT JOIN regions AS subregions
      ON subregions.id = simulation_runs.subregion_id
    WHERE`

  if (queryOpts?.region) {
    select.append(SQL` simulation_runs.region_id = ${queryOpts.region} AND`)
  }

  select.append(
    SQL` simulation_runs.github_user_id = ${githubUserID} ORDER BY updated_at DESC`
  )

  if (queryOpts?.limit != null) {
    select.append(SQL` LIMIT ${queryOpts.limit}`)
  }

  const results = await conn.query<RowDataPacket[]>(select)
  return (results as Simulation[]).map(summarizeStrategies)
}

function summarizeStrategies(simulation: Simulation): SimulationSummary {
  const summary = omit(simulation, 'configuration') as SimulationSummary
  summary.status = getRunStatus(simulation)

  try {
    if (!simulation.configuration) {
      summary.configurationSummary = ''
    } else {
      const input = simulation.configuration as input.ModelInput
      summary.configurationSummary = Object.keys(input.parameters)
        .map(key => ParameterAbbreviations[key] || '')
        .filter(val => val)
        .join(' ')
    }
  } catch (err) {
    captureException(err)
    console.error(simulation.configuration)
    console.error(err)
    summary.configurationSummary = 'Invalid parameters'
  }
  return summary
}

export async function getRegionCaseData(
  conn: ServerlessMysql,
  regionID: string,
  subregionID: string | undefined
): Promise<{
  deaths: number | null
  confirmed: number | null
  endDate: input.ISODate | null
}> {
  const subregionQuery = subregionID
    ? SQL`\nAND subregion_id = ${subregionID}`
    : '\n'

  // We want the death data for the week starting with the most recent data we have
  // This isn't the most efficient way of doing it and we could do this all in one
  // query.
  const endDateQuery = SQL`SELECT
        d.date, d.deaths, d.confirmed
      FROM case_data AS d
      WHERE
        d.region_id = ${regionID}`
    .append(subregionQuery)
    .append(SQL` ORDER BY d.date DESC LIMIT 1`)
  const endDateResult = await conn.query<
    {date: string; deaths: number; confirmed: number}[]
  >(endDateQuery)

  if (!endDateResult.length) {
    return {
      deaths: null,
      confirmed: null,
      endDate: null
    }
  }
  return {
    deaths: endDateResult[0].deaths,
    confirmed: endDateResult[0].confirmed,
    endDate: DateTime.fromSQL(endDateResult[0].date).toISODate()
  }
}

export async function getSimulation(
  conn: ServerlessMysql,
  githubUser: Session['user'],
  queryOpts: {id: number}
): Promise<Simulation | null> {
  const isAdmin = await isAdminUser(conn, githubUser.login)

  const query = SQL`SELECT
        simulation_runs.id,
        simulation_runs.github_user_id,
        simulation_runs.github_user_login,
        regions.name AS region_name,
        subregions.name AS subregion_name,
        regions.id AS region_id,
        subregions.id AS subregion_id,
        simulation_runs.configuration,
        simulation_runs.model_runs,
        simulation_runs.label,
        DATE_FORMAT(simulation_runs.created_at, "%Y-%m-%dT%TZ") AS created_at,
        DATE_FORMAT(simulation_runs.updated_at, "%Y-%m-%dT%TZ") AS updated_at
      FROM simulation_runs
      INNER JOIN regions AS regions
        ON regions.id = simulation_runs.region_id
      LEFT JOIN regions AS subregions
        ON subregions.id = simulation_runs.subregion_id
      WHERE
        simulation_runs.id = ${queryOpts.id}`

  if (!isAdmin) {
    query.append(SQL`\nAND simulation_runs.github_user_id = ${githubUser.id}`)
  }

  const results = await conn.query<RowDataPacket[]>(query)

  if (results.length < 1) {
    return null
  }

  if (results.length > 1) {
    throw new Error(`Multiple simulations found with same id ${queryOpts.id}.`)
  }

  return toSimulation(results[0])
}

export async function isAuthorizedUser(conn: ServerlessMysql, login: string) {
  const results = await conn.query<any[]>(
    SQL`SELECT 1 FROM authorized_users WHERE github_user_login = ${login} LIMIT 1`
  )

  return results.length > 0
}

export async function isAdminUser(conn: ServerlessMysql, login: string) {
  const results = await conn.query<any[]>(
    SQL`SELECT 1 FROM authorized_users WHERE github_user_login = ${login} AND admin = 1 LIMIT 1`
  )
  return results.length > 0
}

export type UserConfig = {
  hasAcceptedDisclaimer?: boolean
}

export async function getUserConfig(
  conn: ServerlessMysql,
  login: string
): Promise<UserConfig> {
  const results = await conn.query<{config: UserConfig}[]>(
    SQL`SELECT config FROM authorized_users WHERE github_user_login = ${login} LIMIT 1`
  )

  if (!results) {
    throw new Error('No such user found')
  }

  return results[0].config
}

export async function updateUserConfig(
  conn: ServerlessMysql,
  login: string,
  cb: (conf: UserConfig) => UserConfig
): Promise<UserConfig> {
  await conn.query('START TRANSACTION')

  let newConfig: UserConfig

  try {
    const results = await conn.query<{config: UserConfig}[]>(
      SQL`SELECT config FROM authorized_users WHERE github_user_login = ${login} LIMIT 1 FOR UPDATE`
    )

    if (!results) {
      throw new Error('No such user found')
    }

    const {config} = results[0]

    newConfig = cb(config)

    await conn.query(
      SQL`UPDATE authorized_users SET config = ${JSON.stringify(
        newConfig
      )} WHERE github_user_login = ${login}`
    )

    await conn.query('COMMIT')
  } catch (err) {
    await conn.query('ROLLBACK')
    throw err
  }

  return newConfig
}

function toSimulation(object: any): Simulation {
  const simulation = Object.assign({}, object)
  simulation.status = getRunStatus(object)
  return simulation
}

function getRunStatus(simulation: Simulation): RunStatus {
  const statuses = simulation.model_runs.map(run => run.status)

  // Fail fast—if any are failed, we are failed.
  if (statuses.some(status => status === RunStatus.Failed))
    return RunStatus.Failed

  // In progress if any are in progress.
  if (statuses.some(status => status === RunStatus.InProgress))
    return RunStatus.InProgress

  // Complete if all are complete.
  if (statuses.every(status => status === RunStatus.Complete))
    return RunStatus.Complete

  // Only pending if all are pending.
  if (statuses.every(status => status === RunStatus.Pending))
    return RunStatus.Pending

  // Otherwise, we must be in progress (this could happen when one has
  // completed, but all others are still pending).
  return RunStatus.InProgress
}
