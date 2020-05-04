import {NextApiRequest, NextApiResponse} from 'next'
import {AsyncNextApiHandler} from '../types/async-next-api-handler'

export default function dispatch(
  method: string,
  handler: AsyncNextApiHandler
): AsyncNextApiHandler

export default function dispatch(
  handlers: Record<string, AsyncNextApiHandler>
): AsyncNextApiHandler

export default function dispatch(
  methodOrHandlers: string | Record<string, AsyncNextApiHandler>,
  handler?: AsyncNextApiHandler
) {
  return (req: NextApiRequest, res: NextApiResponse) => {
    if (typeof methodOrHandlers === 'string') {
      return dispatchMethod(methodOrHandlers, handler!)(req, res)
    } else {
      return dispatchMap(methodOrHandlers)(req, res)
    }
  }
}

function dispatchMethod(
  method: string,
  handler: AsyncNextApiHandler
): AsyncNextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (method.toLowerCase() !== req.method!.toLowerCase()) {
      notFound(res)
      return
    }

    return handler(req, res)
  }
}

function dispatchMap(
  handlers: Record<string, AsyncNextApiHandler>
): AsyncNextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const handler = handlers[req.method!.toLowerCase()]

    if (!handler) {
      notFound(res)
      return
    }

    return handler(req, res)
  }
}

function notFound(res: NextApiResponse) {
  res.status(404).end('Not found')
}
