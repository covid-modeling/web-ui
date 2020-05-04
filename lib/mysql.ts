import {captureException, captureMessage, Severity} from '@sentry/node'
import fs from 'fs'
import {ConnectionConfig} from 'mysql'
import mysql, {ServerlessMysql} from 'serverless-mysql'

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore: Ensure we aren't using WebPack's version of "path".
const path = __non_webpack_require__('path')

// Cert URL: https://www.digicert.com/CACerts/BaltimoreCyberTrustRoot.crt.pem

const host = process.env.DB_HOST
const user = process.env.DB_USERNAME
const password = process.env.DB_PASSWORD
const database = process.env.DB_DATABASE
const config: ConnectionConfig = {
  host,
  user,
  password,
  database,
  dateStrings: true,
  typeCast: (field, next) => {
    switch (field.type) {
      case 'JSON':
        return JSON.parse(field.string())
      default:
        return next()
    }
  }
}

if (process.env.NODE_ENV === 'production') {
  config.ssl = {
    ca: fs
      .readFileSync(
        path.join(process.cwd(), 'lib/BaltimoreCyberTrustRoot.crt.pem')
      )
      .toString()
  }
}

const db = mysql({
  config,
  maxRetries: 5,
  onConnectError: (err: Error) => captureException(err),
  onError: (err: Error) => captureException(err),
  onKillError: (err: Error) => captureException(err)
})

type Callback<P extends Array<unknown>, R> = (...args: P) => Promise<R>

export const withDB = <P extends Array<unknown>, R>(
  cb: (conn: ServerlessMysql) => Callback<P, R>
): Callback<P, R> => {
  return async (...args: P) => {
    try {
      const result = await cb(db)(...args)
      return result
    } finally {
      try {
        await db.end()
      } catch (err) {
        captureMessage(
          `Error closing DB connection ${err.message}`,
          Severity.Warning
        )
      }
    }
  }
}
