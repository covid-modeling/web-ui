import {addDays, isValidDate, maxDate, toYYYYMMDD} from '../lib/dateFunctions'

describe('dateFunctions', () => {
  describe('toYYYYMMDD', () => {
    for (let i = -11; i <= 12; i++) {
      // no matter what time zone we're in, we should return the same date
      const mockTzOffset = i * 60
      it(`should handle no arguments (using tz offset ${mockTzOffset})`, () => {
        const expectedDate = new Date()
        expectedDate.setMinutes(expectedDate.getMinutes() - mockTzOffset)
        spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(mockTzOffset)
        expect(toYYYYMMDD()).toBe(expectedDate.toISOString().substring(0, 10))
      })

      it(`should handle invalid arguments (using tz offset ${mockTzOffset})`, () => {
        const expectedDate = new Date()
        expectedDate.setMinutes(expectedDate.getMinutes() - mockTzOffset)
        spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(mockTzOffset)
        expect(toYYYYMMDD(new Date('hucairz'))).toBe(
          expectedDate.toISOString().substring(0, 10)
        )
      })

      it(`should handle an argument (using tz offset ${mockTzOffset})`, () => {
        const expectedDate = new Date(0)
        const actualDate = toYYYYMMDD(expectedDate)
        expect(actualDate).toBe(expectedDate.toISOString().substring(0, 10))
      })
    }
  })

  describe('addDays', () => {
    it('should add days to a date', () => {
      let date = '2020-02-28'
      expect(addDays(date, 1)).toEqual('2020-02-29')
      date = '2020-02-29'
      expect(addDays(date, 2)).toEqual('2020-03-02')
    })
  })

  describe('isValidDate', () => {
    it('should check for a valid dae', () => {
      expect(isValidDate('hucairz')).toBe(false)
      expect(isValidDate((undefined as unknown) as string)).toBe(false)
      expect(isValidDate((null as unknown) as string)).toBe(false)
      expect(isValidDate('1234-56-78')).toBe(false)

      expect(isValidDate('2001-09-11')).toBe(true)
    })
  })

  describe('maxDate', () => {
    it('should handle empty', () => {
      expect(maxDate()).toBe('')
      expect(maxDate('')).toBe('')
      expect(maxDate('', '')).toBe('')
    })
    it('should handle an array of dates', () => {
      expect(maxDate('2020-03-01')).toBe('2020-03-01')
      expect(maxDate('2020-03-01', '2020-04-01')).toBe('2020-04-01')
      expect(maxDate('2020-04-01', '2020-03-01')).toBe('2020-04-01')
      expect(maxDate('2020-04-01', '2020-03-01', '2020-03-30')).toBe(
        '2020-04-01'
      )
      expect(
        maxDate('', '2020-04-01', '2020-03-01', '', '2020-03-30', '')
      ).toBe('2020-04-01')
    })
  })
})

// Avoid tsc from complaining about this file not being a module
export {}
