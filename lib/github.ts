import axios, {AxiosInstance} from 'axios'
import {assertEnv} from './assertions'

type APIAccessToken = {access_token: string}
type APIUser = {id: string; login: string}
type APITeamMembership = {
  url: string
  role: string
  state: 'active' | 'pending'
}

const CLIENT_OPTS = {
  baseURL: 'https://api.github.com',
  timeout: 5_000,
  headers: {
    accept: 'application/json',
    'content-type': 'application/json'
  }
}

const api = axios.create(CLIENT_OPTS)

/**
 * Create a new GitHub API client.
 */
export function createClient(opts: {token: string}): AxiosInstance {
  return axios.create({
    ...CLIENT_OPTS,
    headers: {
      ...CLIENT_OPTS.headers,
      authorization: `Bearer ${opts.token}`
    }
  })
}

export function deleteAccessToken(opts: {token: string}): Promise<void> {
  return axios.delete(`/applications/${assertEnv('GITHUB_CLIENT_ID')}/token`, {
    ...CLIENT_OPTS,
    auth: {
      username: assertEnv('GITHUB_CLIENT_ID'),
      password: assertEnv('GITHUB_CLIENT_SECRET')
    },
    data: {
      access_token: opts.token
    }
  })
}

/**
 * Exchange an OAuth code for an API access token.
 */
export async function exchangeCode(
  code: string
): Promise<[AxiosInstance, string]> {
  const accessTokenResp = await api.post<APIAccessToken>(
    '/login/oauth/access_token',
    {
      client_id: assertEnv('GITHUB_CLIENT_ID'),
      client_secret: assertEnv('GITHUB_CLIENT_SECRET'),
      code
    },
    {baseURL: 'https://github.com'}
  )

  const token = accessTokenResp.data.access_token

  return [createClient({token}), token]
}

/**
 * Get the authenticated user.
 */
export async function getUser(client: AxiosInstance): Promise<APIUser> {
  const resp = await client.get<APIUser>('/user')
  return resp.data
}

/**
 * Create a repository dispatch event.
 */
export async function repositoryDispatch(
  client: AxiosInstance,
  repoOwner: string,
  repoName: string,
  type: string,
  payload: any
): Promise<void> {
  await client.post(`/repos/${repoOwner}/${repoName}/dispatches`, {
    event_type: type,
    client_payload: payload
  })
}
