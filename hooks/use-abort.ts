import Debug from 'debug'
import {useEffect, useMemo} from 'react'

const debug = Debug('app:use-abort')

/**
 * A hook that ensures fetch requests using the provided signal are aborted
 * when a component is torn down or dependencies change.
 */
export default function useAbort(
  dependencies: string[] = []
): AbortSignal | undefined {
  const controller = useMemo(() => {
    if (process.browser) {
      return new AbortController()
    }
  }, [])

  useEffect(() => {
    return () => {
      debug('abort')
      controller?.abort()
    }
  }, dependencies) // eslint-disable-line

  return controller?.signal
}
