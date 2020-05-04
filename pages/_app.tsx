import Axios from 'axios'
import App, {AppContext} from 'next/app'
import NextError from 'next/error'
import Head from 'next/head'
import {createContext} from 'react'
import 'react-day-picker/lib/style.css'
import 'react-virtualized/styles.css'
import {SWRConfig} from 'swr'
import '../css/app.css'
import {initSentry} from '../lib/sentry'

const {captureContextException, captureException, captureMessage} = initSentry()

export const SentryContext = createContext<{
  captureException: typeof captureException
  captureMessage: typeof captureMessage
}>({captureException, captureMessage})

const scriptPolicy =
  process.env.NODE_ENV === 'production'
    ? // In production builds, only allow JS from within the app.
      "'self'"
    : // In dev builds, allow JS within the app,
      // or the inline scripts bundled by Next.js/webpack in dev mode.
      "'self' 'unsafe-inline'"

const contentSecurityPolicy = [
  `default-src 'none'`,
  // Allow JS from within the application and its bundled scripts.
  `script-src ${scriptPolicy}`,
  // Allow stylesheets within the application or hosted by Google.
  // We use inline styles in the React components.
  `style-src 'self' https://fonts.googleapis.com 'unsafe-inline'`,
  // Allow fonts hosted by Google.
  `font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com`,
  // Allow fetch calls to the application's own API, and to Sentry for logging.
  `connect-src 'self' https://sentry.io`,
  // Allow favicon and other local images.
  `img-src 'self'`,
  // Prevent the site from being included in an iframe.
  `frame-ancestors 'none'`,
  // Allow prefetching resources within the application.
  `prefetch-src 'self'`
].join('; ')

/**
 * The main application frame.
 *
 * @param appProps Props provided by Next.js
 */
export default class WebApp extends App {
  state: {error?: Error & {statusCode?: number}} = {}

  static async getInitialProps(appContext: AppContext) {
    const {ctx} = appContext

    if (ctx.err) {
      captureContextException(ctx.err, ctx)
    }

    if (ctx.res) {
      ctx.res.setHeader('Content-Security-Policy', contentSecurityPolicy)
    }

    const pageProps = await App.getInitialProps(appContext)
    return {pageProps}
  }

  componentDidCatch(err: Error, errorInfo: Record<string, any>) {
    captureException(err, errorInfo)
    this.setState({error: err})
  }

  render() {
    const {Component, pageProps} = this.props

    if (this.state.error) {
      return <NextError statusCode={this.state.error?.statusCode ?? 500} />
    }

    return (
      <>
        <Head>
          <title>COVID Modeling</title>
          <meta
            name="Description"
            content={`A tool for understanding the impact of parameter changes on the results of COVID simulation runs`}
          />
          <link rel="icon" type="image/x-icon" href="/images/favicon.png" />
        </Head>

        <SentryContext.Provider value={{captureException, captureMessage}}>
          <SWRConfig
            value={{fetcher: key => Axios.get(key).then(resp => resp.data)}}
          >
            <Component {...pageProps} />
          </SWRConfig>
        </SentryContext.Provider>
      </>
    )
  }
}
