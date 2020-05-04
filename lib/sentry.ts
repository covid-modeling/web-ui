import * as Sentry from '@sentry/node'
import {NextPageContext} from 'next'

export const initSentry = (release = process.env.SENTRY_RELEASE) => {
  const sentryOptions: Sentry.NodeOptions = {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.APP_ENVIRONMENT,
    release,
    maxBreadcrumbs: 50,
    attachStacktrace: true
  }

  if (process.env.NODE_ENV !== 'production') {
    sentryOptions.beforeSend = () => null
  }

  Sentry.init(sentryOptions)

  return {
    Sentry,

    captureMessage: (
      message: string,
      level?: Sentry.Severity,
      extra?: Record<string, any>
    ) => {
      Sentry.configureScope(scope => {
        if (process.browser) {
          scope.setTag('ssr', 'false')
        } else {
          scope.setTag('ssr', 'true')
        }

        if (extra) for (const k in extra) scope.setExtra(k, extra[k])
      })

      return Sentry.captureMessage(message, level)
    },

    captureException: (err: Error, errorInfo?: Record<string, any>) => {
      console.error(err)

      Sentry.configureScope(scope => {
        if (process.browser) {
          scope.setTag('ssr', 'false')
        } else {
          scope.setTag('ssr', 'true')
        }

        if (errorInfo) {
          for (const key in errorInfo) {
            scope.setExtra(key, errorInfo[key])
          }
        }
      })

      return Sentry.captureException(err)
    },

    captureContextException: (
      err: NonNullable<NextPageContext['err']>,
      ctx: NextPageContext
    ) => {
      console.error(err)

      Sentry.configureScope(scope => {
        if (err.message) {
          scope.setFingerprint([err.message])
        }

        if (err.statusCode) {
          scope.setExtra('statusCode', err.statusCode)
        }

        if (ctx) {
          const {req, res, query, pathname} = ctx

          if (res?.statusCode) {
            scope.setExtra('statusCode', res.statusCode)
          }

          if (process.browser) {
            scope.setTag('ssr', 'false')
            scope.setExtra('query', query)
            scope.setExtra('pathname', pathname)
          } else {
            scope.setTag('ssr', 'true')
            scope.setExtra('url', req?.url)
            scope.setExtra('method', req?.method)
          }
        }
      })

      return Sentry.captureException(err)
    }
  }
}
