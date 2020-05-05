import {input} from '@covid-modeling/api'
import Joi from '@hapi/joi'
import {isGreater} from './dateFunctions'

export const interventionStrategySchema = Joi.object({
  startDate: Joi.string()
    .label('Start date')
    .required()
    .isoDate()
    .custom(validatePeriodsChronology),
  reductionPopulationContact: Joi.number()
    .label('Estimated population contact reduction')
    .required()
    .integer()
    .custom(validateReductionPerc),
  socialDistancing: Joi.string()
    .label('Social distancing')
    .valid(...Object.values(input.Intensity)),
  schoolClosure: Joi.string()
    .label('School closure')
    .valid(input.Intensity.Aggressive),
  caseIsolation: Joi.string()
    .label('Case isolation')
    .valid(input.Intensity.Aggressive),
  voluntaryHomeQuarantine: Joi.string()
    .label('Voluntary home quarantine')
    .valid(input.Intensity.Aggressive)
})

export const newSimulationSchema = Joi.object({
  regionID: Joi.string()
    .label('Region')
    .required()
    .min(2)
    .max(64),
  subregionID: Joi.string()
    .label('Subregion')
    .min(2)
    .max(64),
  label: Joi.string()
    .label('Name')
    .max(64)
    .allow(''),
  interventionPeriods: Joi.array()
    .label('Intervention periods')
    .required()
    .max(32)
    .items(interventionStrategySchema)
    .custom(validateMinimumOneInterventionStrategy),
  r0: Joi.number()
    .label('Estimated r0')
    .greater(0)
})

function validateReductionPerc(
  perc: number,
  helpers: Joi.CustomHelpers<number>
) {
  if (perc < 0 || perc > 100) {
    return helpers.error('reductionPopulationContact.bounds')
  }

  return perc
}

function validatePeriodsChronology(
  startDate: input.ISODate,
  helpers: Joi.CustomHelpers<input.InterventionPeriod>
) {
  // This is a little bit of a cheat because Joi doesn't tell us what index
  // we're at in the list.
  const path = helpers.state?.path ?? []
  const list = helpers.state.ancestors[1]
  const selfIndex = (path[1] as unknown) as number

  if (selfIndex > 0 && !isGreater(startDate, list[selfIndex - 1].startDate)) {
    return helpers.error('interventions.chronology')
  }

  return startDate
}

function validateMinimumOneInterventionStrategy(
  interventionPeriods: input.InterventionPeriod[],
  helpers: Joi.CustomHelpers
) {
  let hasAtLeastOneStrategy = false

  for (const period of interventionPeriods) {
    let hasStrategy = false
    if (period.socialDistancing != null) hasStrategy = true
    if (period.schoolClosure != null) hasStrategy = true
    if (period.caseIsolation != null) hasStrategy = true
    if (period.voluntaryHomeQuarantine != null) hasStrategy = true

    if (hasStrategy) {
      hasAtLeastOneStrategy = true
      break
    }
  }

  if (!hasAtLeastOneStrategy) {
    return helpers.error('interventions.strategyRequired')
  }
}
