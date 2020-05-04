import {NextApiHandler} from 'next'

export type AsyncNextApiHandler<T = any> = (
  ...args: Parameters<NextApiHandler<T>>
) => Promise<ReturnType<NextApiHandler<T>>>
