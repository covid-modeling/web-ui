const isProduction = process.env.APP_ENVIRONMENT === 'production'

const models: ModelMap = require('../models.yml')

Object.keys(models).forEach(modelId => {
  if (isProduction && !models[modelId].isProductionReady) {
    delete models[modelId]
  }
})

export default models

export type ModelSpec = {
  name: string
  origin: string
  imageURL: string
  metaURLs?: {
    code?: string
    paper?: string
    website?: string
  }
  description: string
  supportedParameters: SupportedParameter[]
  isProductionReady: boolean

  // A missing supportedRegions field means that it is unknown which regions
  // this model supports.
  // An entry here indicates that the model supports the region as a whole as well as any of the listed subregions.
  supportedRegions?: Record<string, SupportedRegion>
}

export type MinimalModelSpec = {
  metaURLs?: {
    code?: string
    paper?: string
    website?: string
  }
}

export type ModelMap = {[key: string]: ModelSpec}

export enum SupportedParameter {
  ContactReduction = 'contactReduction',
  InterventionStrategies = 'interventionStrategies',
  R0 = 'r0'
}

export function supportedParameterDesc(supportedParameter: SupportedParameter) {
  switch (supportedParameter) {
    case SupportedParameter.ContactReduction:
      return 'Contact reduction is used by'
    case SupportedParameter.InterventionStrategies:
      return 'Intervention strategies are used by'
    case SupportedParameter.R0:
      return 'Customizable R0 is used by'
    default:
      throw new Error('Missing case')
  }
}

type SupportedRegion = SupportedSubregion[]
type SupportedSubregion = string
