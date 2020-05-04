/**
 * This data type is for data/hospitals/us.json
 */
export type HospitalData = {
  abbr: string
  population: number
  licensed_beds: number
  total_beds: number
  icu_beds: number
  utilization: number
  pct_icu: number
}
