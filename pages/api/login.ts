import * as crypto from 'crypto'
import JWT from 'jsonwebtoken'
import * as qs from 'querystring'
import {assertEnv} from '../../lib/assertions'
import dispatch from './util/dispatch'

const GITHUB_CLIENT_ID = assertEnv('GITHUB_CLIENT_ID')
const OAUTH_SECRET = assertEnv('OAUTH_SECRET')

export default dispatch('GET', async (req, res) => {
  const state = JWT.sign(
    {nonce: crypto.randomBytes(32).toString('hex')},
    OAUTH_SECRET,
    {algorithm: 'HS256', expiresIn: '10m'}
  )

  const params = qs.encode({
    client_id: GITHUB_CLIENT_ID,
    state
  })

  const location = `https://github.com/login/oauth/authorize?${params}`
  res.writeHead(307, {location}).end('Temporary redirect')
})
