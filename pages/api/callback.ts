import {Severity} from '@sentry/node'
import JWT from 'jsonwebtoken'
import {NextApiRequest, NextApiResponse} from 'next'
import 'source-map-support/register'
import {assertEnv} from '../../lib/assertions'
import {isAuthorizedUser} from '../../lib/db'
import {deleteAccessToken, exchangeCode, getUser} from '../../lib/github'
import {catchUnhandledErrors} from '../../lib/handle-error'
import {withDB} from '../../lib/mysql'
import redirect from '../../lib/redirect'
import {initSentry} from '../../lib/sentry'
import {setSessionCookie} from '../../lib/session'

catchUnhandledErrors()

const {captureMessage} = initSentry()
const OAUTH_SECRET = assertEnv('OAUTH_SECRET')

/**
 * Handle a GitHub OAuth callback redirect.
 */
export default withDB(
  conn => async (req: NextApiRequest, res: NextApiResponse) => {
    const code = req.query.code as string
    const state = req.query.state as string

    try {
      JWT.verify(state, OAUTH_SECRET, {algorithms: ['HS256']})
    } catch (err) {
      console.error('OAuth state verification error', err)
      captureMessage(`Invalid OAuth state: "${err.message}"`, Severity.Warning)
      res.status(400).json({error: 'OAuth state invalid'})
      return
    }

    try {
      const [client, token] = await exchangeCode(code)
      const user = await getUser(client)

      try {
        await deleteAccessToken({token})
      } catch (err) {
        console.error('Unable to delete OAuth access token')
        captureMessage('Unable to delete OAuth access token', Severity.Warning)
      }

      if (await isAuthorizedUser(conn, user.login.toLowerCase())) {
        setSessionCookie(req, res, {user: {id: user.id, login: user.login}})
        redirect(res, '/simulations')
      } else {
        redirect(res, '/unauthorized')
      }
    } catch (err) {
      if (err.response) {
        console.error(
          'OAuth non-2xx response:',
          err.response.status,
          err.response.data
        )
      } else if (err.request) {
        console.error('OAuth request error:', err.message)
      } else {
        console.error('OAuth error', err)
      }

      res.status(500).end('Internal server error')
    }
  }
)
