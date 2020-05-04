import {ServerResponse} from 'http'

/**
 * Redirect the response to another location.
 *
 * @param res The response to redirect
 * @param location The path to redirect to
 * @param statusCode The HTTP status code
 */
export default function redirect(
  res: ServerResponse,
  location: string,
  statusCode: number = 302
) {
  res.setHeader('location', location)
  res.statusCode = statusCode
  res.end('found')
}
