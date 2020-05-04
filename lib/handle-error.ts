import {GetServerSideProps} from 'next'
import {initSentry} from './sentry'

const {captureException} = initSentry()

let didAttachHandlers = false
export function catchUnhandledErrors() {
  if (didAttachHandlers) return
  didAttachHandlers = true

  process.on('unhandledRejection', err => {
    captureException(err as Error)
  })

  process.on('uncaughtException', err => {
    captureException(err)
  })
}

export default function handleError<P>(
  cb: GetServerSideProps<P>
): GetServerSideProps<P> {
  return async ctx => {
    try {
      const result = await cb(ctx)
      return result
    } catch (err) {
      captureException(err)
      throw err
    }
  }
}
