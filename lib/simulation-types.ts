export enum Virus {
  Covid19 = 'covid19'
}

export enum SimulationStatus {
  Complete = 'complete',
  InProgress = 'in-progress',
  Failed = 'failed',
  Pending = 'pending'
}

export interface ErrorSimulationData {
  error: string
  status: SimulationStatus.Failed
}

export function virusName(virus: Virus): string {
  switch (virus) {
    case Virus.Covid19:
      return 'COVID-19'
  }
}

type ISODate = string

export const ParameterAbbreviations: Record<string, string> = {
  caseIsolation: 'CI',
  schoolClosure: 'SC',
  socialDistancing: 'SD',
  voluntaryHomeQuarantine: 'VHQ'
}

export const InterventionNames = {
  schoolClosure: 'School Closures',
  socialDistancing: 'Social Distancing (Everyone)',
  caseIsolation: 'Case Isolation',
  voluntaryHomeQuarantine: 'Voluntary Home Quarantine'
}

export type InterventionName = keyof typeof InterventionNames

/**
 * This is one intervention entry for one state in our interventions data
 */
export interface InterventionData {
  dateIssued: ISODate
  dateEnacted: ISODate
  dateExpiry: ISODate
  dateEnded: ISODate
  notes: string
  source: string
}

/**
 * This is intervention data for an entire state
 */
export interface Interventions {
  // The two interventions that we use right now are SchoolClose and StayAtHome
  SchoolClose?: InterventionData
  StayAtHome?: InterventionData
  [key: string]: InterventionData | undefined
}

/**
 * This is all of our interventions data
 */
export interface InterventionMap {
  US: Record<string, Interventions>
}
