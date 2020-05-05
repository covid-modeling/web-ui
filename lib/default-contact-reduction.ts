import {input} from '@covid-modeling/api'
import {InterventionPeriod, StrategyKey} from './new-simulation-state'

/**
 * This module calculates default contact reduction for a combination of
 * intervention strategies, represented as bits.
 *
 * Not all combinations have a default reduction value—particularly less likely
 * ones.
 */

// Bit values for interventions =
const interventionValues: Record<
  StrategyKey,
  Record<input.Intensity, number>
> = {
  schoolClosure: {
    [input.Intensity.Mild]: 1,
    [input.Intensity.Moderate]: 2,
    [input.Intensity.Aggressive]: 4
  },
  voluntaryHomeQuarantine: {
    [input.Intensity.Mild]: 8,
    [input.Intensity.Moderate]: 16,
    [input.Intensity.Aggressive]: 32
  },
  caseIsolation: {
    [input.Intensity.Mild]: 64,
    [input.Intensity.Moderate]: 128,
    [input.Intensity.Aggressive]: 256
  },
  socialDistancing: {
    [input.Intensity.Mild]: 512,
    [input.Intensity.Moderate]: 1024,
    [input.Intensity.Aggressive]: 2048
  }
}

// Map of intervention combinations to default contact reduction
const contactReductionTable = (() => {
  const iv = interventionValues
  const sc = 'schoolClosure'
  const hq = 'voluntaryHomeQuarantine'
  const ci = 'caseIsolation'
  const sd = 'socialDistancing'
  const Mi = input.Intensity.Mild
  const Mo = input.Intensity.Moderate
  const Ag = input.Intensity.Aggressive

  /**
   * Data provided by Neil Ferguson of Imperial College, roughly based on
   * https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.0050074
   *
   * This is a literal copy of the data from "default-contact-reduction.xlsx"
   * in the root of this repository.
   */

  return new Map([
    /*   SC   */ /*   HQ   */ /*   CI   */ /*   SD   */
    /* ---------|------------|------------|----------*/
    [0 /*    */ | 0 /*    */ | 0 /*    */ | 0 /*    */, 0],
    [0 /*    */ | 0 /*    */ | 0 /*    */ | iv[sd][Mi], 0.1],
    [0 /*    */ | 0 /*    */ | 0 /*    */ | iv[sd][Mo], 0.3],
    [0 /*    */ | 0 /*    */ | 0 /*    */ | iv[sd][Ag], 0.65],
    [0 /*    */ | 0 /*    */ | iv[ci][Ag] | 0 /*    */, 0.15],
    [0 /*    */ | 0 /*    */ | iv[ci][Ag] | iv[sd][Mi], 0.235],
    [0 /*    */ | 0 /*    */ | iv[ci][Ag] | iv[sd][Mo], 0.405],
    [0 /*    */ | 0 /*    */ | iv[ci][Ag] | iv[sd][Ag], 0.7025],
    [0 /*    */ | iv[hq][Ag] | iv[ci][Ag] | 0 /*    */, 0.25],
    [0 /*    */ | iv[hq][Ag] | iv[ci][Ag] | iv[sd][Mi], 0.325],
    [0 /*    */ | iv[hq][Ag] | iv[ci][Ag] | iv[sd][Mo], 0.475],
    [0 /*    */ | iv[hq][Ag] | iv[ci][Ag] | iv[sd][Ag], 0.7375],
    [iv[sc][Ag] | 0 /*    */ | 0 /*    */ | 0 /*    */, 0.175],
    [iv[sc][Ag] | 0 /*    */ | 0 /*    */ | iv[sd][Mi], 0.2575],
    [iv[sc][Ag] | 0 /*    */ | 0 /*    */ | iv[sd][Mo], 0.4225],
    [iv[sc][Ag] | 0 /*    */ | 0 /*    */ | iv[sd][Ag], 0.71125],
    [iv[sc][Ag] | 0 /*    */ | iv[ci][Ag] | 0 /*    */, 0.29875],
    [iv[sc][Ag] | 0 /*    */ | iv[ci][Ag] | iv[sd][Mi], 0.368875],
    [iv[sc][Ag] | 0 /*    */ | iv[ci][Ag] | iv[sd][Mo], 0.509125],
    [iv[sc][Ag] | 0 /*    */ | iv[ci][Ag] | iv[sd][Ag], 0.7545625],
    [iv[sc][Ag] | iv[hq][Ag] | iv[ci][Ag] | 0 /*    */, 0.38125],
    [iv[sc][Ag] | iv[hq][Ag] | iv[ci][Ag] | iv[sd][Mi], 0.443125],
    [iv[sc][Ag] | iv[hq][Ag] | iv[ci][Ag] | iv[sd][Mo], 0.566875],
    [iv[sc][Ag] | iv[hq][Ag] | iv[ci][Ag] | iv[sd][Ag], 0.7834375]
  ])
})()

export function getDefaultContactReduction(
  per: Pick<InterventionPeriod, StrategyKey>
): number | null {
  const sc = per.schoolClosure
    ? interventionValues.schoolClosure[per.schoolClosure]
    : 0
  const hq = per.voluntaryHomeQuarantine
    ? interventionValues.voluntaryHomeQuarantine[per.voluntaryHomeQuarantine]
    : 0
  const ci = per.caseIsolation
    ? interventionValues.caseIsolation[per.caseIsolation]
    : 0
  const sd = per.socialDistancing
    ? interventionValues.socialDistancing[per.socialDistancing]
    : 0

  const reduction = contactReductionTable.get(sc | hq | ci | sd)

  if (reduction != null) {
    return Math.round(reduction * 100)
  } else {
    return null
  }
}
