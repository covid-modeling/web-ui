import {input} from '@covid-modeling/api'
import {DateTime} from 'luxon'

export function toYYYYMMDD(date?: Date) {
  // ensure UTC date is the same as date in current TZ
  if (!date || Number.isNaN(date.getTime())) {
    date = new Date()
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  }
  return date.toISOString().substring(0, 10)
}

export function isValidDate(d: string): boolean {
  return !!(d && d.length === 10 && new Date(d).getTime())
}

export function addDays(d: input.ISODate, days: number): input.ISODate {
  return DateTime.fromISO(d)
    .plus({days})
    .toISODate()
}

/**
 * Finds the maximum date of an array of ISO dates.
 *
 * @param dates ISO Date strings to find the max for
 */
export function maxDate(...dates: input.ISODate[]): input.ISODate {
  return dates.reduce((greatestDate, date) => {
    if (!greatestDate) {
      return date
    }

    if (!date) {
      return greatestDate
    }

    return greatestDate.localeCompare(date) > 0 ? greatestDate : date
  }, '')
}

/**
 *
 * @param subject
 * @param object
 * @return true if subject is greater than object
 */
export function isGreater(
  thisDate: input.ISODate,
  other: input.ISODate
): boolean {
  return thisDate.localeCompare(other) > 0
}
