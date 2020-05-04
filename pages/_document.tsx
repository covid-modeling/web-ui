import Document, {Head, Html, Main, NextScript} from 'next/document'
import {catchUnhandledErrors} from '../lib/handle-error'

catchUnhandledErrors()

export default class WebDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
