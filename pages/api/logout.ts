import {NextApiRequest, NextApiResponse} from 'next'
import 'source-map-support/register'
import {catchUnhandledErrors} from '../../lib/handle-error'
import redirect from '../../lib/redirect'
import {clearSessionCookie} from '../../lib/session'

catchUnhandledErrors()

/**
 * Log the user out.
 */
export default function logout(req: NextApiRequest, res: NextApiResponse) {
  clearSessionCookie(req, res)
  redirect(res, '/')
}
