/**
 * Time series case data
 *
 * These arrays contain `null` values where case data does not exist for the
 * given time.
 */
export type CaseData = {
  deaths: (number | null)[]
  cumulativeDeaths: (number | null)[]
  confirmed: (number | null)[]
  cumulativeConfirmed: (number | null)[]
}
