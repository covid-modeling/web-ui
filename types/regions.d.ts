/**
 * A mapping of ISO 3166 codes to region specifiers
 *
 * The length of the code determines alpha-2 vs alpha-3, but we prefer the more
 * common alpha-2.
 *
 * A special subregion ID called "_self" represents the entirety of the region.
 *
 * https://en.wikipedia.org/wiki/ISO_3166
 */
export type RegionMap = Record<string, TopLevelRegion>

/**
 * A top-level region, which must have subregions.
 */
export type TopLevelRegion = Region & {
  regions: RegionMap
}

/**
 * A region identified by an ISO 3166
 */
export type Region = {
  /**
   * The human-readable name of the region
   */
  name: string

  /**
   * The ISO 3166 code for the region
   *
   * This may be a 3166-1 or 3166-2 (subregion) dependeing on what level we're
   * at.
   */
  id: string

  /**
   * The subregions of this region
   */
  regions?: RegionMap
}
