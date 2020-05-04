import {getSessionCookie, Session} from '../../../lib/session'
import {AsyncNextApiHandler} from '../types/async-next-api-handler'

export default function requireSession(
  cb: (session: Session) => AsyncNextApiHandler
): AsyncNextApiHandler {
  return async (req, res) => {
    const session = getSessionCookie(req, res)

    if (!session) {
      res.status(401).end('Unauthorized')
    } else {
      return cb(session)(req, res)
    }
  }
}
