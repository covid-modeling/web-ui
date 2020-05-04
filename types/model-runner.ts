//
// Section - Outer request bodies
//

export interface RequestInput {
  id: string | number
  models: Model[]
  configuration: ModelInput
  callbackURL: string | null
}

export enum RunStatus {
  Pending = 'pending',
  InProgress = 'in-progress',
  Complete = 'complete',
  Failed = 'failed'
}

export interface RunOutput {
  modelSlug: ModelSlug
  status: RunStatus
  resultsLocation: string
  exportLocation: string
  workflowRunID?: string
}

// The name of an epidemiological model.
export enum ModelSlug {
  MRCIDECovidSim = 'mrc-ide-covid-sim',
  Basel = 'basel',
  COSMC = 'cosmc'
}

export interface Model {
  slug: ModelSlug
  imageURL: string
}

//
// Section - Model Inputs
//

/** A generalized description of the input to an epidemiological model. */
export interface ModelInput {
  model: Model
  region: string
  subregion?: string
  parameters: ModelParameters
}

export interface ModelParameters {
  // An ISO-8601 string encoding the date of the most recent death data in the region.
  calibrationDate: ISODate

  // The total number of confirmed cases in the region before the calibration date.
  calibrationCaseCount: number

  // The total number of deaths in the region before the calibration date.
  calibrationDeathCount: number

  // A list of time periods, each with a different set of interventions
  interventionPeriods: InterventionPeriod[]

  // r0 override for the virus. If undefined then use the model default
  r0: number | null
}

export interface InterventionPeriod {
  // ISO-8601 date when these interventions begin
  startDate: ISODate

  // Estimated reduction in population contact
  reductionPopulationContact: number

  socialDistancing?: Intensity
  schoolClosure?: Intensity
  caseIsolation?: Intensity
  voluntaryHomeQuarantine?: Intensity
}

export type ISODate = string

export enum Intensity {
  Mild = 'mild',
  Moderate = 'moderate',
  Aggressive = 'aggressive'
}

//
// Section - Model Outputs
//

export interface ModelOutput {
  metadata: ModelInput
  binaryHash?: string
  time: {
    /** The starting date within the model simulation. */
    t0: string
    /**
     * Timestamps for the series of reported metrics in `regions` and `aggregate`.
     * Each timestamp indicates the number of days after `t0`.
     */
    timestamps: number[]
    /**
     * The minimum and maximum timestamps for the series of reported metrics
     * in `regions` and `aggregate`.
     * Each timestamp indicates the number of days after `t0`.
     */
    extent: [number, number]
  }
  aggregate: {
    metrics: SeverityMetrics
  }
}

export type MetricType =
  | 'Mild'
  | 'ILI'
  | 'SARI'
  | 'Critical'
  | 'CritRecov'
  | 'Death'

export interface SeverityMetrics {
  /* Current number of mild cases on this day */
  Mild: number[]
  /** Current number of influenza-like illness cases on this day (assume represents GP demand) */
  ILI: number[]
  /** Current number of Severe Acute Respiratory Illness cases (assume represents hospital demand) */
  SARI: number[]
  /** Current number of critical cases (assume represents ICU demand) */
  Critical: number[]
  /** Current number of critical cases who are well enough to be out of ICU but still need a hospital bed */
  CritRecov: number[]

  /** Number of deaths occurring on this day */
  incDeath: number[]

  /** Total number of mild cases since the beginning of the epidemic */
  cumMild: number[]
  /** Total number of influence-like illnesses since the beginning of the epidemic */
  cumILI: number[]
  /** Total number of severe acute respiratory illnesses since the beginning of the epidemic */
  cumSARI: number[]
  /** Total number of critical cases since the beginning of the epidemic */
  cumCritical: number[]
  /** Total number of patients recovered from critical cases since the beginning of the epidemic */
  cumCritRecov: number[]
}
