type Value = Record<string, any> | undefined | null

/**
 * Log an object, recursively, expanding only the first level by default.
 *
 * Safari has insane behavior around nesting, so YMMV there (although the
 * logged data is correct).
 *
 * @param title The title of the group
 * @param value The object to log
 * @param level The current nesting level
 */
export function logValue(title: string, value: Value, level: number = 0) {
  if (!value) {
    return
  }

  group(
    title,
    () => {
      // Log all non-object values.
      table(
        {[title]: value},
        Object.keys(value).filter(key => typeof value[key] !== 'object')
      )

      Object.entries(value).forEach(([key, value]) => {
        if (typeof value !== 'object') return
        logValue(key, value, level + 1)
      })
    },
    level !== 1
  )
}

export function group(
  title: string,
  cb: () => void,
  collapsed: boolean = true
) {
  console[collapsed ? 'groupCollapsed' : 'group'](
    `%c${title}`,
    'color: blue; font-weight: bold'
  )
  cb()
  console.groupEnd()
}

export function table(...args: any[]) {
  if (typeof console.table === 'function') {
    console.table(...args)
  } else {
    console.log(...args)
  }
}
