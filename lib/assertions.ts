/**
 * Assert that a value is a string and return the string value.
 *
 * @param v A value to assert is a string
 * @param message A message for a thrown error if the value is not a string
 */
export function assertString(v: unknown, message?: string): string {
  if (typeof v !== 'string') {
    throw new Error(message ?? 'Expected value to be a string')
  }

  return v
}

/**
 * Assert that an enviornment variable exists, and fetch it.
 *
 * @param k The env var key to get
 * @param ignoreLocalMode Whether to ignore absence in local mode, and return an empty string if unset
 */
export function assertEnv(k: string, ignoreLocalMode: boolean = false): string {
  const value = process.env[k]

  if (value == null && ignoreLocalMode && process.env.LOCAL_MODE) {
    return ''
  }

  return assertString(value, `Missing env var "${k}"`)
}
