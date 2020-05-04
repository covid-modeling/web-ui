import Cookies from 'cookies'
import {IncomingMessage, ServerResponse} from 'http'
import {GetServerSideProps} from 'next'
import {assertEnv} from './assertions'
import redirect from './redirect'

const isProd = process.env.NODE_ENV === 'production'

const SET_OPTS: Cookies.SetOption = {
  maxAge: 60 * 60 * 24 * 7 * 1000, // 1 week
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  secure: isProd,
  signed: isProd
}

const GET_OPTS: Cookies.GetOption = {
  signed: isProd
}

const SESSION_SECRET = assertEnv('SESSION_SECRET')

export type Session = {user: {id: string; login: string}}

/**
 * Get the session cookie value from the given request.
 *
 * @param req The session request
 */
export function getSessionCookie(
  req: IncomingMessage,
  res: ServerResponse
): Session | null {
  const sessionValue = getCookieJar(req, res).get('session', GET_OPTS)

  if (!sessionValue) {
    return null
  }

  try {
    const session = JSON.parse(sessionValue)
    return session
  } catch (err) {
    console.error('Error parsing session cookie')
    return null
  }
}

/**
 * Set a session on the given response.
 *
 * @param res The response to set the cookie on
 * @param value The value of the session
 */
export function setSessionCookie(
  req: IncomingMessage,
  res: ServerResponse,
  value: Session
) {
  getCookieJar(req, res).set('session', JSON.stringify(value), SET_OPTS)
}

/**
 * Clear the session from the response.
 *
 * @param res The response to clear the session from
 */
export function clearSessionCookie(req: IncomingMessage, res: ServerResponse) {
  getCookieJar(req, res).set('session', '', {...SET_OPTS, maxAge: 1})
}

function getCookieJar(req: IncomingMessage, res: ServerResponse): Cookies {
  return new Cookies(req, res, {
    secure: isProd,
    keys: [SESSION_SECRET]
  })
}

/**
 * Ensure a session is present before calling the given callback.
 */
export function ensureSession<P>(
  cb?: (
    ctx: Parameters<GetServerSideProps<P>>[0],
    session: Session
  ) => ReturnType<GetServerSideProps<P>>
): GetServerSideProps<P> {
  return async ctx => {
    const session = getSessionCookie(ctx.req, ctx.res)

    if (!session) {
      redirect(ctx.res, '/')
      return {props: {} as any}
    }

    if (cb) {
      return cb(ctx, session)
    } else {
      return {props: {}}
    }
  }
}

/**
 * Ensure a session is not present before calling the given callback.
 */
export function refuteSession<P>(
  cb?: GetServerSideProps<P>
): GetServerSideProps<P> {
  return async ctx => {
    const session = getSessionCookie(ctx.req, ctx.res)

    if (session) {
      redirect(ctx.res, '/simulations')
      return {props: {} as any}
    }

    if (cb) {
      return cb(ctx)
    } else {
      return {props: {}}
    }
  }
}
