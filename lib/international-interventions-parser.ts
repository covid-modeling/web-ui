// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as csvjson from 'csvjson'
import * as iso from 'i18n-iso-countries'
import {input} from '@covid-modeling/api'
import {DateTime} from 'luxon'
import serverlessMysql from 'serverless-mysql'

interface PolicyRow {
  regionId: string
  subregionId: string | null
  policy: string | null
  notes: string | null
  source: string | null
  issueDate: input.ISODate | null
  startDate: input.ISODate | null
  easeDate: input.ISODate | null
  expirationDate: input.ISODate | null
  endDate: input.ISODate | null
}

const dateFormat = 'ddMMMyyyy'

export function parseCsv(
  csv: string,
  policyName: string,
  threshold: number
): PolicyRow[] {
  const arr = csvjson.toObject(csv) as []

  // each array element is a country
  // find the earliest date where the threshold is reached and that is the start
  // continue to find any date where it ends and that is the end
  return arr
    .map((countryRow: Record<string, string>) => {
      const isoCode = getIsoCode(countryRow[''])

      // note that dates are pre-sorted
      const startIndex = Object.values(countryRow).findIndex(
        level =>
          Number.isFinite(Number.parseInt(level)) &&
          Number.parseInt(level) >= threshold
      )
      const startDate = Object.keys(countryRow)[startIndex]

      const endIndex = Object.values(countryRow).findIndex(
        (level, i) =>
          i >= startIndex &&
          Number.isFinite(Number.parseInt(level)) &&
          Number.parseInt(level) < threshold
      )
      const endDate = Object.keys(countryRow)[endIndex]

      return {
        regionId: isoCode,
        subregionId: null,
        policy: policyName,
        notes: null,
        source: null,
        issueDate: null,
        startDate:
          startDate === null || startDate === undefined
            ? null
            : DateTime.fromFormat(startDate, dateFormat).toISODate(),
        easeDate: null,
        expirationDate: null,
        endDate:
          endDate === null || endDate === undefined
            ? null
            : DateTime.fromFormat(endDate, dateFormat).toISODate()
      }
    })
    .filter(row => row.regionId)
}

function getIsoCode(alpha3: string): string {
  const isoCode = iso.alpha3ToAlpha2(alpha3)
  if (isoCode) {
    return isoCode
  }
  if (alpha3 === 'RKS') {
    // special case for Kosovo. Its ISO code is not official yet
    // see: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#cite_ref-26
    return 'XK'
  }
  return ''
}

/**
 * Validates that the new table is not smaller than the old table.
 * The assumption is that our fetch data size will never shrink.
 *
 * @db the database to run the queries on
 * @param origTable The original table to check
 * @param newTable The new table to replace the original table
 * @param ignore If true, ignore this check
 *
 * @throws Error if the new table is smaller than the old table.
 */
export async function validateTableLength(
  db: serverlessMysql.ServerlessMysql,
  origTable: string,
  newTable: string,
  ignore: boolean
) {
  if (ignore) {
    return
  }

  const origCount: number = ((await db.query(
    `SELECT count(*) as count from ${origTable}`
  )) as any)[0].count
  const newCount: number = ((await db.query(
    `SELECT count(*) as count from ${newTable}`
  )) as any)[0].count

  if (newCount < origCount) {
    throw new Error(
      `New table ${newTable} has fewer rows than original table ${origTable}. ${newCount} rows and ${origCount} rows respectively`
    )
  }
}
