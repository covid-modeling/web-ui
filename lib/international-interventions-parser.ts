// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as csvjson from 'csvjson'
import * as iso from 'i18n-iso-countries'
import {input} from '@covid-modeling/api'
import {ISODate} from '@covid-modeling/api/dist/src/model-input'

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
        startDate: translateDate(startDate),
        easeDate: null,
        expirationDate: null,
        endDate: translateDate(endDate)
      }
    })
    .filter(row => row.regionId)
}

const months = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12'
}

// exported for testing
export function translateDate(ddmmmyyyy: string): ISODate | null {
  if (!ddmmmyyyy) {
    return null
  }
  const month = (months as any)[ddmmmyyyy.slice(2, 5)]
  if (!month) {
    return null
  }
  return [ddmmmyyyy.slice(5), month, ddmmmyyyy.slice(0, 2)].join('-')
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
