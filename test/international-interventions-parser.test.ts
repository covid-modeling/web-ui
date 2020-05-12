import {
  parseCsv,
  translateDate
} from '../lib/international-interventions-parser'

// These are 3 rows taken from real data, but modified to include subthreshold levels and backing off of restrictions
const data = `,,01jan2020,02jan2020,03jan2020,04jan2020,05jan2020,06jan2020,07jan2020,08jan2020,09jan2020,10jan2020,11jan2020
Aruba,ABW,0,1,2,3,3,2,1,0,,,,
Afghanistan,AFG,,0,0,1,2,3,3,,2,1,0`

const invalidCountryData = `,,01jan2020,02jan2020,03jan2020,04jan2020,05jan2020,06jan2020,07jan2020,08jan2020,09jan2020,10jan2020,11jan2020
Aruba,XXX,0,1,2,3,3,2,1,0,,,,`

const kosovoData = `,,01jan2020,02jan2020,03jan2020,04jan2020,05jan2020,06jan2020,07jan2020,08jan2020,09jan2020,10jan2020,11jan2020
Aruba,RKS,0,1,2,3,3,2,1,0,,,,`

describe('international-interventions-parser', () => {
  it('should parse csv for level 1', () => {
    expect(parseCsv(data, 'SchoolClose', 1)).toEqual([
      {
        easeDate: null,
        endDate: '2020-01-08',
        expirationDate: null,
        issueDate: null,
        notes: null,
        policy: 'SchoolClose',
        regionId: 'AW',
        source: null,
        startDate: '2020-01-02',
        subregionId: null
      },
      {
        easeDate: null,
        endDate: '2020-01-11',
        expirationDate: null,
        issueDate: null,
        notes: null,
        policy: 'SchoolClose',
        regionId: 'AF',
        source: null,
        startDate: '2020-01-04',
        subregionId: null
      }
    ])
  })

  it('should parse csv for level 2', () => {
    expect(parseCsv(data, 'SchoolClose', 2)).toEqual([
      {
        easeDate: null,
        endDate: '2020-01-07',
        expirationDate: null,
        issueDate: null,
        notes: null,
        policy: 'SchoolClose',
        regionId: 'AW',
        source: null,
        startDate: '2020-01-03',
        subregionId: null
      },
      {
        easeDate: null,
        endDate: '2020-01-10',
        expirationDate: null,
        issueDate: null,
        notes: null,
        policy: 'SchoolClose',
        regionId: 'AF',
        source: null,
        startDate: '2020-01-05',
        subregionId: null
      }
    ])
  })

  it('should parse csv for level 3', () => {
    expect(parseCsv(data, 'SchoolClose', 3)).toEqual([
      {
        easeDate: null,
        endDate: '2020-01-06',
        expirationDate: null,
        issueDate: null,
        notes: null,
        policy: 'SchoolClose',
        regionId: 'AW',
        source: null,
        startDate: '2020-01-04',
        subregionId: null
      },
      {
        easeDate: null,
        endDate: '2020-01-09',
        expirationDate: null,
        issueDate: null,
        notes: null,
        policy: 'SchoolClose',
        regionId: 'AF',
        source: null,
        startDate: '2020-01-06',
        subregionId: null
      }
    ])
  })

  it('should ignore invalid countries', () => {
    expect(parseCsv(invalidCountryData, 'hucairz', 3)).toEqual([])
  })

  it('should handle Kosovo', () => {
    expect(parseCsv(kosovoData, 'SchoolClose', 3)).toEqual([
      {
        easeDate: null,
        endDate: '2020-01-06',
        expirationDate: null,
        issueDate: null,
        notes: null,
        policy: 'SchoolClose',
        regionId: 'XK',
        source: null,
        startDate: '2020-01-04',
        subregionId: null
      }
    ])
  })

  it('should parse translate dates', () => {
    expect(translateDate('21jan1999')).toBe('1999-01-21')
    expect(translateDate('21feb1999')).toBe('1999-02-21')
    expect(translateDate('21mar1999')).toBe('1999-03-21')
    expect(translateDate('21apr1999')).toBe('1999-04-21')
    expect(translateDate('21may1999')).toBe('1999-05-21')
    expect(translateDate('21jun1999')).toBe('1999-06-21')
    expect(translateDate('21jul1999')).toBe('1999-07-21')
    expect(translateDate('21aug1999')).toBe('1999-08-21')
    expect(translateDate('21sep1999')).toBe('1999-09-21')
    expect(translateDate('21oct1999')).toBe('1999-10-21')
    expect(translateDate('21nov1999')).toBe('1999-11-21')
    expect(translateDate('21dec1999')).toBe('1999-12-21')

    expect(translateDate('21xxx1999')).toBe(null)
  })
})
